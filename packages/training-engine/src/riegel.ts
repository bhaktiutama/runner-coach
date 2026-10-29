import { DISTANCE_M, type Prediction, type RaceDistance } from './types';

// E-01: Riegel T2 = T1 x (D2/D1)^1.06, ditampilkan sebagai rentang (07 E-O1).
export const RIEGEL_EXPONENT = 1.06;

export function riegel(timeS: number, fromM: number, toM: number): number {
  return timeS * Math.pow(toM / fromM, RIEGEL_EXPONENT);
}

export function predictRange(
  baseline: RaceDistance,
  baselineTimeS: number,
  target: RaceDistance,
): Prediction {
  const t = Math.round(riegel(baselineTimeS, DISTANCE_M[baseline], DISTANCE_M[target]));
  if (target === 'fm') {
    // FM: [T, T + 20 mnt], paling mungkin T + 10 mnt. Acuan 5K/10K = "perkiraan kasar".
    return {
      distance: target,
      likelyS: t + 600,
      minS: t,
      maxS: t + 1200,
      rough: baseline === '5k' || baseline === '10k',
    };
  }
  return {
    distance: target,
    likelyS: t,
    minS: Math.round(t * 0.97),
    maxS: Math.round(t * 1.03),
    rough: false,
  };
}
