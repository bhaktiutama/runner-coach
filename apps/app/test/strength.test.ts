import { generatePlan, isSupportType, strengthSteps } from '@run-coach/training-engine';
import { describe, expect, it } from 'vitest';
import { matchWorkout, saveActivity } from '../src/data/activities';
import { draftToPlanInput, type Draft } from '../src/data/onboarding';
import { easeNextStrength, regenerateFromToday, setStrength, weeklyProposals } from '../src/data/planOps';
import { getActivePlan, getProfile, getWorkouts, savePlanFromOnboarding } from '../src/data/repo';
import { planParams } from '../src/data/rows';
import { migrate } from '../src/db/migrate';
import { entitlementFor, FREE_STRENGTH_WEEKS, isLocked } from '../src/lib/entitlement';
import { yearlySavingPct } from '../src/lib/pricing';
import { adherence } from '../src/lib/progress';
import { segmentRows } from '../src/lib/workoutView';
import { buildSegments, initialState, next, position, start, sync } from '../src/timer/machine';
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

async function setup(strength: boolean) {
  const db = createNodeDb();
  await migrate(db);
  const d = { ...draft, strength };
  const input = draftToPlanInput(d, '2026-11-02');
  const id = await savePlanFromOnboarding(db, d, input, generatePlan(input));
  return { db, id };
}

describe('F-21 strength: data lokal', () => {
  it('onboarding "Ya": profil + plan memuat strength, lari sama dengan tanpa strength', async () => {
    const a = await setup(true);
    const b = await setup(false);
    expect((await getProfile(a.db)).strength_opt_in).toBe(1);
    expect(planParams((await getActivePlan(a.db))!).strength).toBe(true);
    const wa = await getWorkouts(a.db, a.id);
    const wb = await getWorkouts(b.db, b.id);
    expect(wa.filter((w) => isSupportType(w.type)).length).toBeGreaterThan(0);
    const strip = (w: { date: string; type: string; steps: unknown }) => [w.date, w.type, w.steps];
    expect(wa.filter((w) => !isSupportType(w.type)).map(strip)).toEqual(wb.map(strip));
  });

  it('sakelar Profil: nyala menambah sesi mulai hari ini, mati menghapus yang terjadwal', async () => {
    const { db, id } = await setup(false);
    await setStrength(db, '2026-11-10', true);
    let ws = await getWorkouts(db, id);
    const sup = ws.filter((w) => isSupportType(w.type));
    expect(sup.length).toBeGreaterThan(0);
    expect(sup.every((w) => w.date >= '2026-11-10')).toBe(true);
    expect((await getProfile(db)).strength_opt_in).toBe(1);
    expect(planParams((await getActivePlan(db))!).strength).toBe(true);
    await setStrength(db, '2026-11-20', false);
    ws = await getWorkouts(db, id);
    expect(ws.filter((w) => isSupportType(w.type) && w.date >= '2026-11-20')).toHaveLength(0);
    expect(ws.filter((w) => isSupportType(w.type) && w.date < '2026-11-20').length).toBeGreaterThan(0);
  });

  it('atur ulang hari tetap mempertahankan strength', async () => {
    const { db, id } = await setup(true);
    await regenerateFromToday(db, '2026-11-09', [0, 2, 4, 6], 6);
    const ws = await getWorkouts(db, id, '2026-11-09');
    expect(ws.some((w) => isSupportType(w.type))).toBe(true);
  });

  it('log manual tidak dicocokkan ke sesi strength', async () => {
    const { db, id } = await setup(true);
    const ws = await getWorkouts(db, id);
    const s = ws.find(
      (w) => isSupportType(w.type) && !ws.some((r) => r.date === w.date && !isSupportType(r.type)),
    );
    if (s) expect(await matchWorkout(db, s.date)).toBeNull();
    const both = ws.find(
      (w) => isSupportType(w.type) && ws.some((r) => r.date === w.date && !isSupportType(r.type)),
    );
    if (both) expect(isSupportType((await matchWorkout(db, both.date))!.type)).toBe(false);
  });

  it('E-25: "terlalu berat" menurunkan level sesi strength berikutnya', async () => {
    const { db, id } = await setup(true);
    const sup = (await getWorkouts(db, id)).filter((w) => isSupportType(w.type));
    // Sesi di minggu ke-4+ sudah level 2; turunkan dari sesi sebelumnya.
    const target = sup.find(
      (w) => (w.rationale.find((r) => r.rule === 'E-25')?.values.level as number) >= 2,
    )!;
    const prev = sup[sup.indexOf(target) - 1]!;
    await saveActivity(db, {
      plannedWorkoutId: prev.id,
      source: 'timer',
      startedAt: `${prev.date}T07:00:00.000Z`,
      distanceM: null,
      durationS: 1200,
      rpe: 8,
      tags: [],
      loadFeel: 'too_hard',
    });
    const changed = await easeNextStrength(db, prev.id);
    expect(changed).toBe(target.id);
    const after = (await getWorkouts(db, id)).find((w) => w.id === target.id)!;
    const e25 = after.rationale.find((r) => r.rule === 'E-25')!;
    expect(e25.values).toMatchObject({ scope: 'down' });
    expect(e25.values.level).toBe(
      (target.rationale.find((r) => r.rule === 'E-25')!.values.level as number) - 1,
    );
    const fb = await db.getFirstAsync<{ load_feel: string }>('SELECT load_feel FROM workout_feedback');
    expect(fb?.load_feel).toBe('too_hard');
  });

  it('adaptasi: aktivitas strength tidak dihitung sebagai lari terakhir (E-13)', async () => {
    const { db, id } = await setup(true);
    const s = (await getWorkouts(db, id)).find((w) => isSupportType(w.type))!;
    await saveActivity(db, {
      plannedWorkoutId: s.id,
      source: 'timer',
      startedAt: `${s.date}T07:00:00.000Z`,
      distanceM: null,
      durationS: 1200,
      rpe: 5,
      tags: [],
    });
    const p = await weeklyProposals(db, '2026-11-30', '2026-11-23');
    expect(p.find((x) => x.rule === 'E-13')).toBeUndefined();
  });

  it('kepatuhan lari dan strength dihitung terpisah', () => {
    const ws = [
      { date: '2026-11-02', status: 'completed' as const, type: 'easy' },
      { date: '2026-11-02', status: 'missed' as const, type: 'strength' },
      { date: '2026-11-03', status: 'missed' as const, type: 'tempo' },
    ];
    expect(adherence(ws, '2026-11-01', '2026-11-05')).toMatchObject({ done: 1, total: 2 });
    expect(adherence(ws, '2026-11-01', '2026-11-05', 'support')).toMatchObject({ done: 0, total: 1 });
  });
});

describe('timer mode gerakan (2.3s)', () => {
  const steps = strengthSteps('strength', 1);
  const segs = buildSegments(steps);
  const T0 = 1_700_000_000_000;

  it('1 gerakan = 1 grup; istirahat setelah tiap set kecuali set terakhir gerakan terakhir', () => {
    const exercises = steps.filter((x) => x.kind === 'exercise').length;
    expect(segs[segs.length - 1]!.group).toBe(exercises);
    expect(segs[segs.length - 1]!.kind).toBe('exercise');
    const sets = segs.filter((x) => x.kind === 'exercise').length;
    expect(segs.filter((x) => x.kind === 'rest').length).toBe(sets - 1);
  });

  it('repetisi = manual (Selesai set), plank = hitung mundur, istirahat otomatis berjalan', () => {
    const squat = segs[0]!;
    expect(squat.kind === 'exercise' && squat.timedS).toBeNull();
    const plank = segs.find((x) => x.kind === 'exercise' && x.exercise_id === 'plank')!;
    expect(plank.timedS).toBe(30);
    let st = start(initialState('w'), T0);
    st = next(st, segs, T0 + 30_000); // set 1 squat selesai
    expect(segs[st.index]!.kind).toBe('rest');
    const restS = segs[st.index]!.timedS!;
    st = sync(st, segs, T0 + 30_000 + restS * 1000 + 10);
    const pos = position(st, segs, T0 + 30_000 + restS * 1000 + 10);
    expect(pos.segment?.kind).toBe('exercise');
  });

  it('baris gerakan untuk 2.2s: nama + dosis per sisi', () => {
    const rows = segmentRows(strengthSteps('strength', 2), 'strength');
    expect(rows[0]!.zone).toBe('strength');
    expect(rows.find((r) => r.label === 'Split squat')!.detail).toBe('3 x 8x / sisi');
  });
});

describe('gerbang Premium (F-23)', () => {
  const w = (type: 'strength' | 'easy', week: number) => ({ type, week_index: week });
  it('paywall mati: tidak ada yang terkunci', () => {
    const e = entitlementFor(false, false);
    expect(isLocked(w('strength', 8), e)).toBe(false);
  });
  it('paywall nyala: strength terkunci setelah minggu gratis, lari tidak pernah', () => {
    const e = entitlementFor(true, false);
    expect(isLocked(w('strength', FREE_STRENGTH_WEEKS), e)).toBe(false);
    expect(isLocked(w('strength', FREE_STRENGTH_WEEKS + 1), e)).toBe(true);
    expect(isLocked(w('easy', 10), e)).toBe(false);
    expect(isLocked(w('strength', 10), entitlementFor(true, true))).toBe(false);
  });
  it('hemat paket tahunan', () => {
    expect(yearlySavingPct({ monthly: 5.99, yearly: 39.99 })).toBe(44);
  });
});
