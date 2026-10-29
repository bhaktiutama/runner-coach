import { diffDays, mondayOf } from './dates';
import { DEFAULT_WEEKS, MIN_WEEKS } from './generator';
import type { GoalDistance, Level } from './types';

// Penilaian target di onboarding (FL-1 layar 1.3 dan 1.5).

/** Syarat minimum lari terjauh sebelum mulai (PLANNING 4.3, heuristik tingkat D). */
export const MIN_LONGEST_M: Record<GoalDistance, number> = {
  '5k': 0,
  '10k': 3000,
  hm: 8000,
  fm: 14000,
  fitness: 0,
};

const SHORTER: Record<GoalDistance, GoalDistance | null> = {
  '5k': null,
  '10k': '5k',
  hm: '10k',
  fm: 'hm',
  fitness: null,
};

export type RaceFit = 'ok' | 'compressed' | 'too_short';

export type GoalAssessment = {
  weeksUntilRace: number | null;
  defaultWeeks: number;
  minWeeks: number;
  /** ok = cukup waktu; compressed = bisa dengan plan dipadatkan; too_short = tolak. */
  fit: RaceFit;
  belowMinimum: boolean;
  shorterTarget: GoalDistance | null;
};

export function assessGoal(a: {
  distance: GoalDistance;
  raceDate: string | null;
  startDate: string;
  longestRunM: number;
  level?: Level | null;
}): GoalAssessment {
  const defaultWeeks = DEFAULT_WEEKS[a.distance];
  const minWeeks = MIN_WEEKS[a.distance];
  let weeksUntilRace: number | null = null;
  let fit: RaceFit = 'ok';
  if (a.raceDate && a.distance !== 'fitness') {
    weeksUntilRace =
      a.raceDate <= a.startDate ? 0 : diffDays(mondayOf(a.startDate), mondayOf(a.raceDate)) / 7 + 1;
    fit = weeksUntilRace >= defaultWeeks ? 'ok' : weeksUntilRace >= minWeeks ? 'compressed' : 'too_short';
  }
  const belowMinimum = a.longestRunM < MIN_LONGEST_M[a.distance];
  return {
    weeksUntilRace,
    defaultWeeks,
    minWeeks,
    fit,
    belowMinimum,
    shorterTarget: fit !== 'ok' || belowMinimum ? SHORTER[a.distance] : null,
  };
}
