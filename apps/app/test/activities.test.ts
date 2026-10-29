import { generatePlan } from '@run-coach/training-engine';
import { describe, expect, it } from 'vitest';
import { migrate } from '../src/db/migrate';
import {
  getActivity,
  listActivities,
  matchWorkout,
  saveActivity,
  weekFinished,
} from '../src/data/activities';
import { draftToPlanInput, type Draft } from '../src/data/onboarding';
import { getWorkout, getWorkouts, markMissed, savePlanFromOnboarding } from '../src/data/repo';
import {
  adherence,
  averagePace,
  easyPaceTrend,
  parseDuration,
  parseKm,
  rpeVerdict,
  weeklyVolume,
} from '../src/lib/progress';
import { isoAtLocal, localDateOf } from '../src/lib/today';
import { createNodeDb } from './node-db';

const draft: Draft = {
  step: 'preview',
  distance: '10k',
  raceDate: '2027-01-09',
  abilityMode: 'unknown',
  level: 'recreational',
  weeklyVolumeKm: 15,
  longestRunKm: 7,
  availableDays: [1, 3, 5, 6],
  longRunDay: 6,
};

async function setup() {
  const db = createNodeDb();
  await migrate(db);
  const input = draftToPlanInput(draft, '2026-11-02');
  const planId = await savePlanFromOnboarding(db, draft, input, generatePlan(input));
  return { db, planId };
}

describe('aktivitas + feedback (F-06, F-15)', () => {
  it('simpan dari timer: aktivitas + feedback, latihan jadi completed', async () => {
    const { db, planId } = await setup();
    const w = (await getWorkouts(db, planId))[0]!;
    const id = await saveActivity(db, {
      plannedWorkoutId: w.id,
      source: 'timer',
      startedAt: `${w.date}T05:30:00.000Z`,
      distanceM: 5200,
      durationS: 2325,
      segments: [{ index: 0, activeS: 600, skipped: false }],
      rpe: 6,
      tags: ['hot', 'pain'],
    });
    expect((await getWorkout(db, w.id))?.status).toBe('completed');
    const a = (await getActivity(db, id))!;
    expect(a.rpe).toBe(6);
    expect(a.tags).toEqual(['hot', 'pain']);
    expect(a.workout_type).toBe(w.type);
    expect((await listActivities(db)).length).toBe(1);
  });

  it('RPE di luar 1-10 dan durasi 0 ditolak, data lama utuh', async () => {
    const { db } = await setup();
    await expect(
      saveActivity(db, {
        plannedWorkoutId: null,
        source: 'manual',
        startedAt: '2026-11-03T05:00:00Z',
        distanceM: 1,
        durationS: 60,
        rpe: 11,
        tags: [],
      }),
    ).rejects.toThrow();
    await expect(
      saveActivity(db, {
        plannedWorkoutId: null,
        source: 'manual',
        startedAt: '2026-11-03T05:00:00Z',
        distanceM: 1,
        durationS: 0,
        rpe: 5,
        tags: [],
      }),
    ).rejects.toThrow();
    expect(await listActivities(db)).toEqual([]);
  });

  it('log manual dicocokkan ke latihan hari itu; missed bisa jadi completed (3.1)', async () => {
    const { db, planId } = await setup();
    const w = (await getWorkouts(db, planId))[0]!;
    expect((await matchWorkout(db, w.date))?.id).toBe(w.id);
    await markMissed(db, '2026-12-31');
    expect((await matchWorkout(db, w.date))?.status).toBe('missed');
    await saveActivity(db, {
      plannedWorkoutId: w.id,
      source: 'manual',
      startedAt: `${w.date}T06:00:00Z`,
      distanceM: 5000,
      durationS: 2400,
      rpe: 4,
      tags: [],
    });
    expect((await getWorkout(db, w.id))?.status).toBe('completed');
    expect(await matchWorkout(db, w.date)).toBeNull();
    expect(await matchWorkout(db, '2026-11-02')).toBeNull();
  });

  it('minggu selesai jika tidak ada latihan scheduled tersisa', async () => {
    const { db, planId } = await setup();
    const ws = await getWorkouts(db, planId, '2026-11-02', '2026-11-08');
    expect(await weekFinished(db, planId, '2026-11-02', '2026-11-08')).toBe(false);
    for (const w of ws) {
      await saveActivity(db, {
        plannedWorkoutId: w.id,
        source: 'manual',
        startedAt: `${w.date}T06:00:00Z`,
        distanceM: 4000,
        durationS: 1800,
        rpe: 4,
        tags: [],
      });
    }
    expect(await weekFinished(db, planId, '2026-11-02', '2026-11-08')).toBe(true);
  });
});

describe('statistik progres (F-07)', () => {
  const act = (date: string, m: number, s: number, type: string | null = 'easy') =>
    ({ date, distance_m: m, duration_s: s, workout_type: type }) as never;

  it('volume mingguan termasuk minggu ini', () => {
    const v = weeklyVolume(
      [act('2026-11-03', 5000, 1800), act('2026-11-05', 3000, 1100), act('2026-11-10', 4000, 1500)],
      '2026-11-02',
      '2026-11-11',
    );
    expect(v.map((x) => x.distanceM)).toEqual([8000, 4000]);
    expect(v[1]!.current).toBe(true);
  });
  it('tren pace easy per minggu, abaikan tempo', () => {
    const t = easyPaceTrend(
      [act('2026-11-03', 5000, 2400), act('2026-11-04', 5000, 1500, 'tempo'), act('2026-11-10', 5000, 2300)],
      '2026-11-01',
    );
    expect(t.map((x) => x.pace)).toEqual([480, 460]);
  });
  it('kepatuhan dari latihan yang sudah jatuh tempo', () => {
    const a = adherence(
      [
        { date: '2026-11-03', status: 'completed' },
        { date: '2026-11-05', status: 'missed' },
        { date: '2026-11-07', status: 'scheduled' },
        { date: '2026-11-08', status: 'completed' },
        { date: '2026-11-09', status: 'scheduled' },
      ],
      '2026-11-02',
      '2026-11-08',
    );
    expect(a).toEqual({ done: 2, total: 4, ratio: 0.5 });
  });
  it('tanggal lokal: lari 05:30 WIB tetap di tanggal lokal', () => {
    expect(localDateOf('2026-11-02T22:30:00.000Z', 'Asia/Jakarta')).toBe('2026-11-03');
    expect(isoAtLocal('2026-11-03', '05:30', 'Asia/Jakarta')).toBe('2026-11-02T22:30:00.000Z');
    expect(isoAtLocal('2026-11-03', '12:00', 'UTC')).toBe('2026-11-03T12:00:00.000Z');
  });
  it('parse input + pace + RPE', () => {
    expect(parseDuration('38:45')).toBe(2325);
    expect(parseDuration('1:05:30')).toBe(3930);
    expect(parseDuration('40')).toBe(2400);
    expect(parseDuration('12:75')).toBeNull();
    expect(parseDuration('abc')).toBeNull();
    expect(parseKm('5,2')).toBe(5200);
    expect(parseKm('0')).toBeNull();
    expect(averagePace(5000, 2400)).toBe(480);
    expect(averagePace(null, 2400)).toBeNull();
    expect(rpeVerdict(6, 'tempo')).toBe('within');
    expect(rpeVerdict(8, 'easy')).toBe('above');
    expect(rpeVerdict(2, 'interval')).toBe('below');
  });
});
