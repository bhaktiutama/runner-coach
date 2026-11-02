// Rumus Daniels & Gilbert (Oxygen Power, 1979) dan Riegel (1981), ditulis ulang dari TRD 4.1,
// engine-review E-01/E-02 dan 07 E-O1. Dipakai validator sebagai pembanding independen.

const vo2 = (v: number) => -4.6 + 0.182258 * v + 0.000104 * v * v;
const fraction = (tMin: number) =>
  0.8 + 0.1894393 * Math.exp(-0.012778 * tMin) + 0.2989558 * Math.exp(-0.1932605 * tMin);

export const vdotOf = (distanceM: number, timeS: number) => {
  const t = timeS / 60;
  return vo2(distanceM / t) / fraction(t);
};

const velocityAt = (o: number) => {
  const a = 0.000104;
  const b = 0.182258;
  const c = -4.6 - o;
  return (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a);
};

/** Pace (dtk/km) pada persentase VO2max dari VDOT. */
export const paceAt = (vdot: number, f: number) => 60_000 / velocityAt(vdot * f);

export function raceTime(vdot: number, distanceM: number): number {
  let lo = 60;
  let hi = 36_000;
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    if (vdotOf(distanceM, mid) > vdot) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** Persentase VO2max per zona (engine-review E-02). */
export const ZONE_FRACTION = {
  easy: [0.59, 0.74],
  threshold: [0.86, 0.88],
  interval: [0.975, 1.0],
  repetition: [1.05, 1.1],
} as const;

export type Range = { min: number; max: number };

export function expectedZones(
  vdot: number,
): Record<'easy' | 'threshold' | 'interval' | 'repetition' | 'marathon', Range> {
  const r = ([lo, hi]: readonly [number, number]) => ({ min: paceAt(vdot, hi), max: paceAt(vdot, lo) });
  const m = raceTime(vdot, 42_195) / 42.195;
  return {
    easy: r(ZONE_FRACTION.easy),
    threshold: r(ZONE_FRACTION.threshold),
    interval: r(ZONE_FRACTION.interval),
    repetition: r(ZONE_FRACTION.repetition),
    marathon: { min: m - 5, max: m + 5 },
  };
}

export const DIST_M = { '5k': 5000, '10k': 10000, hm: 21097, fm: 42195 } as const;
export type RaceCode = keyof typeof DIST_M;

/** VDOT tanpa waktu acuan (engine-review E-02): pemula 26, rekreasional 33. */
export const LEVEL_VDOT = { beginner: 26, recreational: 33 } as const;

/** E-01: Riegel, 5K-HM +-3%, FM [T, T + 20 mnt] paling mungkin T + 10 mnt (07 E-O1). */
export function expectedPrediction(fromCode: RaceCode, timeS: number, to: RaceCode) {
  const t = timeS * Math.pow(DIST_M[to] / DIST_M[fromCode], 1.06);
  if (to === 'fm') return { likely: t + 600, min: t, max: t + 1200 };
  return { likely: t, min: t * 0.97, max: t * 1.03 };
}
