import type { WorkoutType } from '@run-coach/training-engine';
import type { SpotIconName } from '@run-coach/ui';

// Murni (tanpa React), dipakai lib/spot.ts dan test.

/** Ikon per jenis latihan; warna ubin mengikuti skala panas zona (TYPE_ZONE). */
export const TYPE_SPOT: Record<WorkoutType, SpotIconName> = {
  easy: 'easy',
  run_walk: 'recovery',
  long: 'long',
  tempo: 'tempo',
  interval: 'interval',
  strides: 'drill',
  recovery: 'recovery',
  progression: 'easy',
  rest: 'rest-day',
  strength: 'strength',
  core: 'strength',
};

/** Wajah rasa dari RPE (batas yang sama dengan loadFeelFromRpe: 1-4, 5-7, 8-10). */
export function feelSpot(rpe: number): SpotIconName {
  return rpe <= 4 ? 'feel-easy' : rpe <= 7 ? 'feel-ok' : 'feel-hard';
}
