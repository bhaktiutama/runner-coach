import type { WorkoutType } from '@run-coach/training-engine';
import type { SpotIconName } from '@run-coach/ui';

// Murni (tanpa React), dipakai lib/spot.ts dan test.

/** Ikon per jenis latihan; warna ubin mengikuti skala panas zona (TYPE_ZONE). */
export const TYPE_SPOT: Record<WorkoutType, SpotIconName> = {
  easy: 'easy',
  run_walk: 'run-walk',
  long: 'long',
  tempo: 'tempo',
  interval: 'interval',
  strides: 'strides',
  recovery: 'recovery',
  progression: 'progression',
  rest: 'rest-day',
  strength: 'strength',
  core: 'core',
};

/** Wajah rasa dari RPE (batas yang sama dengan loadFeelFromRpe: 1-4, 5-7, 8-10). */
export function feelSpot(rpe: number): SpotIconName {
  return rpe <= 4 ? 'feel-easy' : rpe <= 7 ? 'feel-ok' : 'feel-hard';
}

/** Ikon target (1.2, baris Target di Profil 4.1). */
export const GOAL_SPOT = {
  '5k': 'goal-5k',
  '10k': 'goal-10k',
  hm: 'goal-hm',
  fm: 'goal-fm',
  fitness: 'goal-fitness',
} as const satisfies Record<string, SpotIconName>;

/** Ikon fase plan (3.1, 1.8, 2.5). */
export const PHASE_SPOT = {
  base: 'phase-base',
  build: 'phase-build',
  peak: 'phase-peak',
  taper: 'phase-taper',
  return: 'recovery',
} as const satisfies Record<string, SpotIconName>;

/** Ikon tag catatan (2.4, 2.6, 3.4). "Ada nyeri" memakai ikon cedera. */
export const TAG_SPOT = {
  hot: 'tag-hot',
  poor_sleep: 'tag-sleep',
  sore_legs: 'tag-sore',
  pain: 'injury',
} as const satisfies Record<string, SpotIconName>;

/** Ikon alasan jeda plan (4.3). */
export const PAUSE_SPOT = {
  injury: 'injury',
  sick: 'pause-sick',
  busy: 'pause-busy',
} as const satisfies Record<string, SpotIconName>;
