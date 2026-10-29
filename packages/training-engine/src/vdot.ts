// Zona pace kerangka Daniels / VDOT (E-02). Rumus Daniels & Gilbert (1979):
//   VO2(v)  = -4.60 + 0.182258 v + 0.000104 v^2   (v dalam m/menit)
//   %max(t) = 0.8 + 0.1894393 e^(-0.012778 t) + 0.2989558 e^(-0.1932605 t)   (t dalam menit)
//   VDOT    = VO2(v) / %max(t)
// Koefisien dari sumber sekunder; cek ke Daniels' Running Formula edisi 4 masih terbuka (07 E-O4).

export type PaceZoneKey = 'easy' | 'marathon' | 'threshold' | 'interval' | 'repetition';
export type PaceRange = { min: number; max: number };
export type PaceZones = Record<PaceZoneKey, PaceRange>;

export function vo2AtVelocity(v: number): number {
  return -4.6 + 0.182258 * v + 0.000104 * v * v;
}

export function fractionAtDuration(tMin: number): number {
  return 0.8 + 0.1894393 * Math.exp(-0.012778 * tMin) + 0.2989558 * Math.exp(-0.1932605 * tMin);
}

export function vdotFromRace(distanceM: number, timeS: number): number {
  const tMin = timeS / 60;
  const v = distanceM / tMin;
  return vo2AtVelocity(v) / fractionAtDuration(tMin);
}

/** Kecepatan (m/menit) pada VO2 tertentu: invers kuadrat VO2(v). */
export function velocityAtVo2(vo2: number): number {
  const a = 0.000104;
  const b = 0.182258;
  const c = -4.6 - vo2;
  return (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a);
}

/** Pace (detik/km) pada persentase VDOT. */
export function paceAtFraction(vdot: number, fraction: number): number {
  return Math.round(60_000 / velocityAtVo2(vdot * fraction));
}

/** Waktu race (detik) yang diprediksi VDOT, dicari dengan bisection. */
export function raceTimeFromVdot(vdot: number, distanceM: number): number {
  let lo = 60;
  let hi = 60 * 60 * 10;
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    if (vdotFromRace(distanceM, mid) > vdot) lo = mid;
    else hi = mid;
  }
  return Math.round((lo + hi) / 2);
}

// Persentase VO2max per zona (kerangka Daniels). Easy dan Threshold berupa rentang;
// Marathon dari prediksi waktu maraton VDOT itu sendiri.
const FRACTION = {
  easy: [0.59, 0.74],
  threshold: [0.86, 0.88],
  interval: [0.975, 1.0],
  repetition: [1.05, 1.1],
} as const;

export function paceZones(vdot: number): PaceZones {
  const range = ([lo, hi]: readonly [number, number]): PaceRange => ({
    min: paceAtFraction(vdot, hi),
    max: paceAtFraction(vdot, lo),
  });
  const mPace = Math.round(raceTimeFromVdot(vdot, 42_195) / 42.195);
  return {
    easy: range(FRACTION.easy),
    marathon: { min: mPace - 5, max: mPace + 5 },
    threshold: range(FRACTION.threshold),
    interval: range(FRACTION.interval),
    repetition: range(FRACTION.repetition),
  };
}

/**
 * VDOT awal jika pengguna memilih "Saya tidak tahu" (1.4). Heuristik tingkat D:
 * pemula ~ 5K 35 menit, rekreasional ~ 5K 28 menit. Diganti saat ada waktu race / time trial (E-20).
 */
export const LEVEL_VDOT = { beginner: 26, recreational: 33 } as const;
