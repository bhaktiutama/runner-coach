import { describe, expect, it } from 'vitest';
import { isFlat } from '../src/timer/flat';
import { buildSegments, decodeResults, encodeResults, exerciseSummary } from '../src/timer/machine';
import { historyBars, planBars, rangeTotals } from '../src/lib/progress';
import type { Step } from '@run-coach/training-engine';

const act = (date: string, km: number, min = 30) => ({
  date,
  distance_m: km * 1000,
  duration_s: min * 60,
  workout_type: 'easy' as const,
});

describe('Progress: tiap rentang berbeda (F-07)', () => {
  const weeks = [1, 2, 3, 4].map((i) => ({
    weekIndex: i,
    phase: i < 3 ? 'base' : 'build',
    startDate: `2026-11-${String(2 + (i - 1) * 7).padStart(2, '0')}`,
    volumeM: 10000 * i,
    cutback: false,
  }));
  const acts = [act('2026-11-03', 5), act('2026-11-11', 6)];

  it('Plan: semua minggu plan, minggu lewat = nyata, minggu depan = target bergaris luar', () => {
    const bars = planBars(weeks, acts, '2026-11-12');
    expect(bars).toHaveLength(4);
    expect(bars[0]).toMatchObject({ distanceM: 5000, outline: false, phase: 'base', week: 1 });
    expect(bars[1]).toMatchObject({ distanceM: 6000, current: true, outline: false });
    expect(bars[2]).toMatchObject({ distanceM: 30000, outline: true, phase: 'build' });
  });

  it('Semua: per minggu jika pendek, per bulan jika lebih dari 16 minggu', () => {
    expect(historyBars(acts, '2026-11-02', '2026-11-12')).toHaveLength(2);
    const long = historyBars([act('2026-01-05', 4), ...acts], '2026-01-05', '2026-11-12');
    expect(long.map((b) => b.key)).toEqual([
      '2026-01',
      '2026-02',
      '2026-03',
      '2026-04',
      '2026-05',
      '2026-06',
      '2026-07',
      '2026-08',
      '2026-09',
      '2026-10',
      '2026-11',
    ]);
    expect(long[0]!.distanceM).toBe(4000);
    expect(long[10]).toMatchObject({ distanceM: 11000, current: true });
  });

  it('total rentang', () => {
    expect(rangeTotals(acts, '2026-11-05', '2026-11-12')).toEqual({
      distanceM: 6000,
      durationS: 1800,
      count: 1,
    });
  });
});

describe('U6 ringkasan per gerakan + format hasil timer', () => {
  const steps: Step[] = [
    { kind: 'exercise', exercise_id: 'squat', sets: 2, reps: 10, rest_s: 60 },
    { kind: 'exercise', exercise_id: 'plank', sets: 2, duration_s: 30, rest_s: 0 },
  ];
  const segs = buildSegments(steps);

  it('set selesai, waktu kerja nyata vs rencana, dilewati', () => {
    const ex = segs.map((s, i) => ({ s, i })).filter((x) => x.s.kind === 'exercise');
    const results = [
      { index: ex[0]!.i, activeS: 40, skipped: false },
      { index: ex[1]!.i, activeS: 35, skipped: false },
      { index: ex[2]!.i, activeS: 30, skipped: false },
      { index: ex[3]!.i, activeS: 2, skipped: true },
    ];
    expect(exerciseSummary(segs, results)).toEqual([
      { exerciseId: 'squat', sets: 2, setsDone: 2, activeS: 75, plannedS: 60, skipped: false },
      { exerciseId: 'plank', sets: 2, setsDone: 1, activeS: 30, plannedS: 60, skipped: true },
    ]);
  });

  it('hasil lama (array, sebelum Siap-siap) dibaca tanpa segmen prep', () => {
    expect(decodeResults(JSON.stringify([{ index: 0, activeS: 5, skipped: false }]))).toEqual({
      results: [{ index: 0, activeS: 5, skipped: false }],
      prep: false,
    });
    const enc = JSON.stringify(encodeResults([]));
    expect(decodeResults(enc)).toEqual({ results: [], prep: true });
    // Tanpa prep, indeks gerakan pertama = 0 (sama dengan format lama).
    expect(buildSegments(steps, { prep: false })[0]!.kind).toBe('exercise');
    expect(buildSegments(steps)[0]!.kind).toBe('rest');
  });
});

describe('U3 HP datar', () => {
  it('datar menghadap ke atas hanya jika miring < ~20 derajat di kedua sumbu', () => {
    expect(isFlat(0.05, -0.1)).toBe(true);
    expect(isFlat(0.6, 0)).toBe(false);
    expect(isFlat(0, 1.4)).toBe(false);
    expect(isFlat(Math.PI, 0)).toBe(false); // menghadap ke bawah
  });
});
