import { addDays, diffDays } from './dates';
import type { ExerciseStep, Step } from './steps';
import { totalDuration } from './steps';
import type { GeneratedWorkout, Level, Phase, Rationale, WorkoutType } from './types';

// Strength + core bodyweight (F-21, TRD 4.2 E-23..E-26, PLANNING 4.7). Data statis tanpa tabel DB;
// nama + cue gerakan di i18n. `animation` = null: animasi menyusul (D8), UI menampilkan placeholder.

export type StrengthType = Extract<WorkoutType, 'strength' | 'core'>;
export const SUPPORT_TYPES: readonly WorkoutType[] = ['strength', 'core'];
export function isSupportType(type: WorkoutType): boolean {
  return type === 'strength' || type === 'core';
}

export type ExerciseCategory = 'leg' | 'core';
export type Exercise = { id: string; category: ExerciseCategory; animation: string | null };

/** Library gerakan fase 2 (tanpa alat). Urutan = urutan tampil di Panduan. */
export const EXERCISES: readonly Exercise[] = [
  { id: 'squat', category: 'leg', animation: null },
  { id: 'split_squat', category: 'leg', animation: null },
  { id: 'bulgarian_split_squat', category: 'leg', animation: null },
  { id: 'glute_bridge', category: 'leg', animation: null },
  { id: 'single_leg_glute_bridge', category: 'leg', animation: null },
  { id: 'single_leg_deadlift', category: 'leg', animation: null },
  { id: 'reverse_lunge', category: 'leg', animation: null },
  { id: 'step_up', category: 'leg', animation: null },
  { id: 'calf_raise', category: 'leg', animation: null },
  { id: 'single_leg_calf_raise', category: 'leg', animation: null },
  { id: 'plank', category: 'core', animation: null },
  { id: 'side_plank', category: 'core', animation: null },
  { id: 'dead_bug', category: 'core', animation: null },
  { id: 'bird_dog', category: 'core', animation: null },
  { id: 'copenhagen_plank', category: 'core', animation: null },
] as const;

export function isExerciseId(id: string): boolean {
  return EXERCISES.some((e) => e.id === id);
}

export type StrengthLevel = 1 | 2 | 3;
type Dose = Omit<ExerciseStep, 'kind' | 'rest_s'>;

const LEG_REST_S = 45;
const CORE_REST_S = 30;

/** Rantai progresi per slot (E-25): indeks 0..2 = level 1..3. */
const LEG_SLOTS: Dose[][] = [
  [
    { exercise_id: 'squat', sets: 2, reps: 10 },
    { exercise_id: 'split_squat', sets: 3, reps: 8, per_side: true },
    { exercise_id: 'bulgarian_split_squat', sets: 3, reps: 8, per_side: true },
  ],
  [
    { exercise_id: 'glute_bridge', sets: 2, reps: 12 },
    { exercise_id: 'single_leg_glute_bridge', sets: 3, reps: 10, per_side: true },
    { exercise_id: 'single_leg_deadlift', sets: 3, reps: 8, per_side: true },
  ],
  [
    { exercise_id: 'reverse_lunge', sets: 2, reps: 8, per_side: true },
    { exercise_id: 'step_up', sets: 3, reps: 10, per_side: true },
    { exercise_id: 'step_up', sets: 3, reps: 12, per_side: true },
  ],
  [
    { exercise_id: 'calf_raise', sets: 2, reps: 15 },
    { exercise_id: 'single_leg_calf_raise', sets: 3, reps: 12, per_side: true },
    { exercise_id: 'single_leg_calf_raise', sets: 3, reps: 15, per_side: true },
  ],
];

const CORE_SLOTS: Dose[][] = [
  [
    { exercise_id: 'plank', sets: 2, duration_s: 30 },
    { exercise_id: 'plank', sets: 3, duration_s: 40 },
    { exercise_id: 'plank', sets: 3, duration_s: 45 },
  ],
  [
    { exercise_id: 'dead_bug', sets: 2, reps: 8, per_side: true },
    { exercise_id: 'dead_bug', sets: 3, reps: 10, per_side: true },
    { exercise_id: 'dead_bug', sets: 3, reps: 12, per_side: true },
  ],
];

/** Sesi core saja: ringan, untuk mode ringan (E-12) dan minggu taper sebelum minggu race (E-26). */
const CORE_ONLY: Dose[][] = [
  ...CORE_SLOTS,
  [
    { exercise_id: 'side_plank', sets: 2, duration_s: 20, per_side: true },
    { exercise_id: 'side_plank', sets: 2, duration_s: 30, per_side: true },
    { exercise_id: 'copenhagen_plank', sets: 2, duration_s: 20, per_side: true },
  ],
  [
    { exercise_id: 'bird_dog', sets: 2, reps: 8, per_side: true },
    { exercise_id: 'bird_dog', sets: 2, reps: 10, per_side: true },
    { exercise_id: 'bird_dog', sets: 2, reps: 12, per_side: true },
  ],
];

/** Steps sesi strength/core. `reduced` = cutback/Peak: maks 2 set per gerakan (volume turun, level tetap). */
export function strengthSteps(type: StrengthType, level: StrengthLevel, reduced = false): Step[] {
  const pick = (slots: Dose[][], rest: number): Step[] =>
    slots.map((chain) => {
      const d = chain[level - 1]!;
      return { kind: 'exercise', ...d, sets: reduced ? Math.min(2, d.sets) : d.sets, rest_s: rest };
    });
  if (type === 'core') return pick(CORE_ONLY, CORE_REST_S);
  return [...pick(LEG_SLOTS, LEG_REST_S), ...pick(CORE_SLOTS, CORE_REST_S)];
}

// ---- Aturan E-23..E-26. Angka heuristik (tingkat D), wajib direview pelatih/fisioterapis (D6). ----

/** E-23: sesi strength per minggu per fase. Taper/return ditangani E-26. */
export const STRENGTH_PER_WEEK: Record<Phase, number> = { base: 2, build: 2, peak: 1, taper: 0, return: 0 };
/** E-25: naik 1 level tiap 3 minggu. */
export const STRENGTH_LEVEL_WEEKS = 3;
/** E-25: pemula berhenti di level 2 (tanpa Bulgarian split squat / single-leg deadlift). */
export const BEGINNER_MAX_LEVEL: StrengthLevel = 2;

export function strengthLevel(weekIndex: number, level: Level): StrengthLevel {
  const l = 1 + Math.floor((weekIndex - 1) / STRENGTH_LEVEL_WEEKS);
  return Math.min(l, level === 'beginner' ? BEGINNER_MAX_LEVEL : 3) as StrengthLevel;
}

/** Sesi kunci yang dilindungi E-24: tidak ada strength sehari/dua hari sebelumnya. */
const KEY_TYPES = new Set<WorkoutType>(['long', 'interval']);
/** E-24: strength boleh setelah lari di hari yang sama; urutan preferensi hari. */
const DAY_SCORE: Partial<Record<WorkoutType, number>> = {
  easy: 0,
  strides: 0,
  run_walk: 0,
  progression: 1,
  tempo: 1,
  interval: 1,
  recovery: 3,
};
const REST_DAY_SCORE = 1;
const NEAR_KEY_PENALTY = 10;

export type StrengthOptions = {
  level: Level;
  lightMode: boolean;
  startDate: string;
  /** Hari race (tanpa latihan pada/sesudahnya). */
  raceDate: string | null;
  weeks: { weekIndex: number; phase: Phase; startDate: string; cutback: boolean }[];
};

/**
 * Tambah sesi strength/core ke plan lari (dipanggil generator jika pengguna memilih strength).
 * Lari tidak diubah. Hasil: workout baru (bisa di tanggal yang sama dengan lari).
 */
export function planStrength(runs: GeneratedWorkout[], o: StrengthOptions): GeneratedWorkout[] {
  const byDate = new Map<string, GeneratedWorkout>();
  for (const w of runs) byDate.set(w.date, w);
  const out: GeneratedWorkout[] = [];
  const raceWeekStart = o.raceDate
    ? o.weeks.find((w) => diffDays(w.startDate, o.raceDate!) < 7)?.startDate
    : null;

  for (const wk of o.weeks) {
    const raceWeek = wk.startDate === raceWeekStart;
    // E-26: tanpa strength di minggu race dan minggu return; taper lain = 1 sesi core ringan.
    let count = STRENGTH_PER_WEEK[wk.phase];
    let type: StrengthType = o.lightMode ? 'core' : 'strength';
    if (wk.phase === 'taper' && !raceWeek) {
      count = 1;
      type = 'core';
    }
    if (raceWeek || count === 0) continue;

    const days = Array.from({ length: 7 }, (_, i) => addDays(wk.startDate, i)).filter(
      (d) => d >= o.startDate && (!o.raceDate || d < o.raceDate),
    );
    const score = (d: string): number | null => {
      const run = byDate.get(d);
      if (run && run.type === 'long') return null;
      // Sehari sebelum long run / interval: dilarang. Dua hari sebelum: dihindari (48 jam).
      const k1 = byDate.get(addDays(d, 1));
      if (k1 && KEY_TYPES.has(k1.type)) return null;
      if (o.raceDate && diffDays(d, o.raceDate) <= 2) return null;
      const k2 = byDate.get(addDays(d, 2));
      const near = k2 && KEY_TYPES.has(k2.type) ? NEAR_KEY_PENALTY : 0;
      return (run ? (DAY_SCORE[run.type] ?? 2) : REST_DAY_SCORE) + near;
    };
    const ranked = days
      .map((d) => ({ d, s: score(d) }))
      .filter((x): x is { d: string; s: number } => x.s != null)
      .sort((a, b) => a.s - b.s || a.d.localeCompare(b.d));
    const chosen: string[] = [];
    for (const c of ranked) {
      if (chosen.length >= count) break;
      // Minimal 1 hari jeda antar sesi strength (termasuk sesi minggu lalu).
      const prev = [...out.map((w) => w.date), ...chosen];
      if (prev.some((p) => Math.abs(diffDays(p, c.d)) < 2)) continue;
      chosen.push(c.d);
    }

    const lvl = strengthLevel(wk.weekIndex, o.level);
    const reduced = wk.cutback || wk.phase === 'peak';
    for (const d of chosen.sort()) {
      const steps = strengthSteps(type, lvl, reduced);
      const run = byDate.get(d);
      const rationale: Rationale[] = [
        { rule: 'E-23', values: { per_week: count } },
        { rule: 'E-24', values: run ? { scope: 'after_run' } : {} },
        { rule: 'E-25', values: { level: lvl, weeks: STRENGTH_LEVEL_WEEKS } },
      ];
      if (wk.phase === 'taper') rationale.push({ rule: 'E-26', values: {} });
      out.push({
        date: d,
        weekIndex: wk.weekIndex,
        phase: wk.phase,
        type,
        steps,
        targetDistanceM: 0,
        targetDurationS: totalDuration(steps),
        rationale,
      });
    }
  }
  return out;
}

/** E-25 adaptasi: sesi terasa terlalu berat -> sesi strength berikutnya turun 1 level. */
export function easierStrength(
  type: StrengthType,
  currentLevel: StrengthLevel,
): { steps: Step[]; level: StrengthLevel; rationale: Rationale } {
  const level = Math.max(1, currentLevel - 1) as StrengthLevel;
  return {
    steps: strengthSteps(type, level),
    level,
    rationale: { rule: 'E-25', values: { level, scope: 'down' } },
  };
}
