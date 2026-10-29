import type { Weekday } from './dates';
import type { Step } from './steps';
import type { PaceZones } from './vdot';

export type GoalDistance = '5k' | '10k' | 'hm' | 'fm' | 'fitness';
export type RaceDistance = Exclude<GoalDistance, 'fitness'>;
export type Level = 'beginner' | 'recreational';
export type Phase = 'base' | 'build' | 'peak' | 'taper' | 'return';
export type WorkoutType =
  'easy' | 'run_walk' | 'long' | 'tempo' | 'interval' | 'strides' | 'recovery' | 'rest';

export const DISTANCE_M: Record<RaceDistance, number> = { '5k': 5000, '10k': 10000, hm: 21097, fm: 42195 };

/** ID aturan registri (07 bagian 2). */
export type RuleId = `E-${string}`;
export type Rationale = { rule: RuleId; values: Record<string, number | string> };

export type GoalInput = {
  distance: GoalDistance;
  raceDate: string | null;
  baselineDistance: RaceDistance | null;
  baselineTimeS: number | null;
  level: Level | null;
  weeklyVolumeM: number;
  longestRunM: number;
};

export type PlanInput = {
  goal: GoalInput;
  /** Hari tersedia (3-6), 0 = Senin. */
  availableDays: Weekday[];
  /** Hari long run: 5 = Sabtu, 6 = Minggu. */
  longRunDay: Weekday;
  /** E-12: ada jawaban "Ya" di screening. */
  lightMode: boolean;
  /** Hari pertama plan (biasanya hari ini). */
  startDate: string;
  /** Override VDOT, mis. setelah time trial (E-20). */
  vdot?: number;
};

export type GeneratedWorkout = {
  date: string;
  weekIndex: number;
  phase: Phase;
  type: WorkoutType;
  steps: Step[];
  targetDistanceM: number;
  targetDurationS: number;
  rationale: Rationale[];
};

export type WeekSummary = {
  weekIndex: number;
  phase: Phase;
  startDate: string;
  volumeM: number;
  cutback: boolean;
};

export type Prediction = {
  distance: RaceDistance;
  /** Waktu Riegel / VDOT. */
  likelyS: number;
  minS: number;
  maxS: number;
  rough: boolean;
};

export type GeneratedPlan = {
  engineVersion: string;
  startDate: string;
  endDate: string;
  weeks: WeekSummary[];
  workouts: GeneratedWorkout[];
  vdot: number;
  zones: PaceZones;
  prediction: Prediction | null;
  runWalk: boolean;
  rationale: Rationale[];
  params: {
    available_days: Weekday[];
    long_run_day: Weekday;
    light_mode: boolean;
    engine_version: string;
    vdot: number;
    rationale: Rationale[];
  };
};
