// Daftar ABC drill MVP (F-17, E-15). Data statis, tanpa tabel DB. Nama + cue di i18n/id.ts.
// ID sama dengan prototipe docs/prototypes/exercise-animations.html.

export type DrillExercise = { id: string; sets: number; distance_m: number };

export const DRILLS: readonly DrillExercise[] = [
  { id: 'askip', sets: 2, distance_m: 20 },
  { id: 'bskip', sets: 2, distance_m: 20 },
  { id: 'cskip', sets: 2, distance_m: 20 },
  { id: 'highknees', sets: 2, distance_m: 20 },
  { id: 'carioca', sets: 2, distance_m: 20 },
] as const;

export function isDrillId(id: string): boolean {
  return DRILLS.some((d) => d.id === id);
}
