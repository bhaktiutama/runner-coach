import type { WorkoutType } from '@run-coach/training-engine';

/** Kunci gambar app (UI/UX 12). Berkasnya dipetakan di imagery.ts. */
export type ImageKey =
  | 'roadSunriseM'
  | 'roadSunriseF'
  | 'riversideCityF'
  | 'riversideCityM'
  | 'trackBack'
  | 'trackSide'
  | 'trackOverhead'
  | 'trackAerial'
  | 'shoeSole'
  | 'povFeet'
  | 'promoScience'
  | 'promoPrivacy'
  | 'promoCompanion';

/** Gambar header kartu 2.1 per jenis latihan; strength/core tanpa gambar (belum ada, UI/UX 12). */
const BY_TYPE: Record<WorkoutType, ImageKey | readonly [ImageKey, ImageKey] | null> = {
  easy: ['riversideCityF', 'riversideCityM'],
  recovery: ['riversideCityF', 'riversideCityM'],
  run_walk: ['riversideCityF', 'riversideCityM'],
  strides: 'trackOverhead',
  progression: 'trackBack',
  tempo: 'trackBack',
  interval: 'trackSide',
  long: ['roadSunriseF', 'roadSunriseM'],
  rest: 'trackAerial',
  strength: null,
  core: null,
};

/** Kunci gambar untuk jenis latihan; pasangan f/m bergantian per tanggal (YYYY-MM-DD). */
export function workoutImageKey(type: WorkoutType, date: string): ImageKey | null {
  const v = BY_TYPE[type];
  if (v === null || typeof v === 'string') return v;
  return Number(date.slice(8, 10)) % 2 === 0 ? v[0] : v[1];
}
