import { generatePlan } from '@run-coach/training-engine';
import { describe, expect, it } from 'vitest';
import { saveActivity } from '../src/data/activities';
import { draftToPlanInput, type Draft } from '../src/data/onboarding';
import {
  decideProposal,
  pausePlan,
  regenerateFromToday,
  resumePlan,
  weeklyProposals,
} from '../src/data/planOps';
import { getActivePlan, getWorkouts, savePlanFromOnboarding } from '../src/data/repo';
import { planParams } from '../src/data/rows';
import { migrate } from '../src/db/migrate';
import { createNodeDb } from './node-db';

const draft: Draft = {
  step: 'preview',
  distance: '10k',
  raceDate: '2027-01-30',
  abilityMode: 'unknown',
  level: 'recreational',
  weeklyVolumeKm: 18,
  longestRunKm: 8,
  availableDays: [1, 3, 5, 6],
  longRunDay: 6,
};

async function setup() {
  const db = createNodeDb();
  await migrate(db);
  const input = draftToPlanInput(draft, '2026-11-02');
  const id = await savePlanFromOnboarding(db, draft, input, generatePlan(input));
  return { db, id };
}

describe('jeda plan (F-09) + Return to run (E-13)', () => {
  it('jeda lalu lanjut: status aktif lagi, minggu return easy tanpa sesi berat, plan digeser', async () => {
    const { db, id } = await setup();
    const before = await getWorkouts(db, id);
    const lastBefore = before.filter((w) => w.date >= '2026-11-11').map((w) => w.date);
    // pausedAt manual (hari Rabu minggu 2)
    await pausePlan(db, 'injury', 7);
    await db.runAsync("UPDATE plans SET paused_at = '2026-11-11T00:00:00.000Z'");
    expect((await getActivePlan(db))?.status).toBe('paused');
    await resumePlan(db, '2026-11-16');
    const p = (await getActivePlan(db))!;
    expect(p.status).toBe('active');
    expect(p.pause_reason).toBeNull();
    const after = await getWorkouts(db, id, '2026-11-16', '2026-11-22');
    expect(after.length).toBeGreaterThan(0);
    expect(after.every((w) => w.phase === 'return' && w.type === 'easy')).toBe(true);
    expect(after[0]!.rationale[0]!.rule).toBe('E-13');
    // tidak ada latihan setelah race
    const all = await getWorkouts(db, id);
    expect(all.every((w) => w.date < '2027-01-30')).toBe(true);
    expect(lastBefore.length).toBeGreaterThan(0);
  });
});

describe('adaptasi (F-11)', () => {
  it('E-17 diusulkan, diterapkan: volume turun + 1 sesi berat jadi easy; ditolak tidak muncul lagi', async () => {
    const { db, id } = await setup();
    // Minggu 6 (2026-12-07) agar minggu depan punya sesi berat.
    const wk = await getWorkouts(db, id, '2026-12-07', '2026-12-13');
    for (const w of wk.filter((x) => x.type === 'easy' || x.type === 'long').slice(0, 2)) {
      await saveActivity(db, {
        plannedWorkoutId: w.id,
        source: 'manual',
        startedAt: `${w.date}T06:00:00Z`,
        distanceM: 5000,
        durationS: 1800,
        rpe: 9,
        tags: [],
      });
    }
    const props = await weeklyProposals(db, '2026-12-13', '2026-12-07');
    const e17 = props.find((p) => p.rule === 'E-17');
    expect(e17).toBeDefined();
    const nextBefore = await getWorkouts(db, id, '2026-12-14', '2026-12-20');
    await decideProposal(db, '2026-12-07', e17!, true, '2026-12-13');
    const nextAfter = await getWorkouts(db, id, '2026-12-14', '2026-12-20');
    const hard = (ws: typeof nextAfter) =>
      ws.filter((w) => w.type === 'tempo' || w.type === 'interval').length;
    if (hard(nextBefore) > 0) expect(hard(nextAfter)).toBe(hard(nextBefore) - 1);
    expect((await getActivePlan(db))!.version).toBe(2);
    const again = await weeklyProposals(db, '2026-12-13', '2026-12-07');
    expect(again.find((p) => p.rule === 'E-17')).toBeUndefined();
  });

  it('E-19 >= 2 terlewat: ulangi minggu', async () => {
    const { db, id } = await setup();
    await db.runAsync(
      "UPDATE planned_workouts SET status = 'missed' WHERE date >= '2026-11-09' AND date <= '2026-11-12'",
    );
    const props = await weeklyProposals(db, '2026-11-15', '2026-11-09');
    const e19 = props.find((p) => p.rule === 'E-19')!;
    expect(e19).toBeDefined();
    const thisWeek = await getWorkouts(db, id, '2026-11-09', '2026-11-15');
    await decideProposal(db, '2026-11-09', e19, true, '2026-11-15');
    const next = await getWorkouts(db, id, '2026-11-16', '2026-11-22');
    expect(next.map((w) => w.type)).toEqual(thisWeek.map((w) => w.type));
  });
});

describe('atur ulang hari (4.1)', () => {
  it('latihan mulai hari ini dibuat ulang di hari baru; riwayat tetap', async () => {
    const { db, id } = await setup();
    const first = (await getWorkouts(db, id))[0]!;
    await saveActivity(db, {
      plannedWorkoutId: first.id,
      source: 'manual',
      startedAt: `${first.date}T06:00:00Z`,
      distanceM: 5000,
      durationS: 1800,
      rpe: 4,
      tags: [],
    });
    await regenerateFromToday(db, '2026-11-09', [0, 2, 4, 5], 5);
    const ws = await getWorkouts(db, id);
    expect(ws.find((w) => w.id === first.id)?.status).toBe('completed');
    const future = ws.filter((w) => w.date >= '2026-11-09');
    const wd = (d: string) => (new Date(`${d}T12:00:00Z`).getUTCDay() + 6) % 7;
    expect(future.every((w) => [0, 2, 4, 5].includes(wd(w.date)))).toBe(true);
    expect(planParams((await getActivePlan(db))!).long_run_day).toBe(5);
  });
});
