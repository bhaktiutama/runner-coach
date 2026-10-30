import { adjacentWeekdays, diffDays, weekday } from './dates';
import { runningDistance, totalDuration, type Step } from './steps';
import type { Rationale, WorkoutType } from './types';
import { easyRun } from './workouts';
import type { PaceZones } from './vdot';
import { isSupportType } from './strength';

// Pindah dan gabung latihan (F-08, FL-5, layar 3.2). Pesan memakai template E-06, E-08, E-10.

export type MovableWorkout = {
  id: string;
  date: string;
  type: WorkoutType;
  steps: Step[];
  status: 'scheduled' | 'completed' | 'skipped' | 'missed';
};

export type MoveVerdict = 'origin' | 'safe' | 'after_hard' | 'occupied' | 'hard_adjacent' | 'before_key';

export type MoveCheck = { verdict: MoveVerdict; rationale: Rationale[]; mergeWith: string | null };

const HARD = new Set<WorkoutType>(['tempo', 'interval']);
export const isHard = (t: WorkoutType) => HARD.has(t);

/**
 * Cek memindah `moving` ke `toDate` (minggu yang sama). `week` = latihan lain di minggu itu.
 * `longest30M` = lari terjauh 30 hari terakhir (E-06).
 */
export function checkMove(
  moving: MovableWorkout,
  toDate: string,
  week: MovableWorkout[],
  longest30M: number,
): MoveCheck {
  const originDate = moving.date;
  if (toDate === originDate) return { verdict: 'origin', rationale: [], mergeWith: null };
  const all = week.filter((w) => w.id !== moving.id && w.status !== 'skipped');
  // Strength boleh di hari yang sama dengan lari (F-21); bentrok hanya dengan jenis yang sama.
  const support = isSupportType(moving.type);
  const others = all.filter((w) => isSupportType(w.type) === support);
  if (support) {
    if (others.some((w) => w.date === toDate)) return { verdict: 'occupied', rationale: [], mergeWith: null };
    const runs = all.filter((w) => !isSupportType(w.type));
    // E-24: tidak di hari long run atau sehari sebelum long run / interval.
    const bad = runs.some(
      (w) =>
        (w.date === toDate && w.type === 'long') ||
        ((w.type === 'long' || w.type === 'interval') && diffDays(toDate, w.date) === 1),
    );
    if (bad) return { verdict: 'before_key', mergeWith: null, rationale: [{ rule: 'E-24', values: {} }] };
    return { verdict: 'safe', mergeWith: null, rationale: [] };
  }
  const target = others.find((w) => w.date === toDate);
  if (target) {
    const merged = runningDistance(target.steps) + runningDistance(moving.steps);
    const cap = Math.floor(longest30M * 1.1);
    return {
      verdict: 'occupied',
      mergeWith: target.id,
      rationale: [{ rule: 'E-06', values: { distance_m: merged, longest_30d_m: longest30M, cap_m: cap } }],
    };
  }
  const wd = weekday(toDate);
  const hardNeighbours = others.filter((w) => isHard(w.type) && adjacentWeekdays(weekday(w.date), wd));
  if (isHard(moving.type) && hardNeighbours.length > 0) {
    return {
      verdict: 'hard_adjacent',
      mergeWith: null,
      rationale: [{ rule: 'E-10', values: { hard_per_week: 2 } }],
    };
  }
  const dayAfterHard = others.some(
    (w) => (isHard(w.type) || w.type === 'long') && diffDays(w.date, toDate) === 1,
  );
  if (dayAfterHard) {
    return {
      verdict: 'after_hard',
      mergeWith: null,
      rationale: [{ rule: 'E-10', values: { hard_per_week: 2 } }],
    };
  }
  return { verdict: 'safe', mergeWith: null, rationale: [] };
}

/**
 * Gabung 2 latihan jadi 1 (3.2). Sesi berat dipertahankan; jarak latihan lain ditambahkan
 * sebagai lari easy di akhir, dibatasi E-06. Hasil: steps baru untuk latihan tujuan.
 */
export function mergeWorkouts(
  target: MovableWorkout,
  moving: MovableWorkout,
  zones: PaceZones,
  longest30M: number,
): { type: WorkoutType; steps: Step[]; rationale: Rationale[] } {
  const cap = Math.floor(longest30M * 1.1);
  const [primary, secondary] =
    isHard(moving.type) && !isHard(target.type) ? [moving, target] : [target, moving];
  const baseM = runningDistance(primary.steps);
  const extraM = Math.max(0, Math.min(runningDistance(secondary.steps), cap - baseM));
  const type: WorkoutType = isHard(primary.type)
    ? primary.type
    : primary.type === 'long' || secondary.type === 'long'
      ? 'long'
      : primary.type;
  const extra: Step[] = extraM >= 1000 ? easyRun(extraM, zones) : [];
  const steps: Step[] = [...primary.steps, ...extra];
  const dist = runningDistance(steps);
  return {
    type,
    steps,
    rationale: [{ rule: 'E-06', values: { distance_m: dist, longest_30d_m: longest30M, cap_m: cap } }],
  };
}

/** "Ganti jadi easy" (2.2): durasi sama, tidak dihitung terlewat. */
export function convertToEasy(w: MovableWorkout, zones: PaceZones): { type: WorkoutType; steps: Step[] } {
  const durationS = Math.max(60, Math.floor(totalDuration(w.steps) / 60) * 60);
  return {
    type: 'easy',
    steps: [{ kind: 'work', duration_s: durationS, zone: 'easy', pace_s_per_km: zones.easy }],
  };
}
