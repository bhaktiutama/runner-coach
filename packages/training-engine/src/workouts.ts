import { DRILLS } from './drills';
import type { Step } from './steps';
import { runningDistance, totalDuration } from './steps';
import type { PaceZones } from './vdot';

// Pembuat `steps` per tipe latihan (workout library, PLANNING 4.4). Semua nilai dalam meter/detik.

export const WARMUP_S = 600;
export const COOLDOWN_S = 600;
export const WALK_PACE_S_PER_KM = 600;
export const MIN_EASY_M = 2000;

const minutes = (s: number) => Math.max(60, Math.floor(s / 60) * 60);

export function easyPaceMid(z: PaceZones): number {
  return Math.round((z.easy.min + z.easy.max) / 2);
}

/** Durasi (detik, dibulatkan ke bawah per menit) untuk menempuh jarak pada pace easy. */
export function easySecondsFor(distanceM: number, z: PaceZones): number {
  // Pace tengah tanpa pembulatan, sama dengan runningDistance; versi dibulatkan bisa membuat
  // jarak aktual beberapa meter di atas batas E-06.
  return minutes((distanceM / 1000) * ((z.easy.min + z.easy.max) / 2));
}

export function easyRun(distanceM: number, z: PaceZones): Step[] {
  return [{ kind: 'work', duration_s: easySecondsFor(distanceM, z), zone: 'easy', pace_s_per_km: z.easy }];
}

export function longRun(distanceM: number, z: PaceZones): Step[] {
  return [{ kind: 'work', duration_s: easySecondsFor(distanceM, z), zone: 'long', pace_s_per_km: z.easy }];
}

/** Recovery run (E-21): sangat santai di batas lambat zona easy + 30 dtk/km, maks 30 menit. */
export const RECOVERY_MAX_S = 30 * 60;
export function recoveryRun(distanceM: number, z: PaceZones): Step[] {
  const pace = { min: z.easy.max, max: z.easy.max + 30 };
  const s = Math.min(RECOVERY_MAX_S, minutes((distanceM / 1000) * (pace.min + 15)));
  return [{ kind: 'work', duration_s: s, zone: 'recovery', pace_s_per_km: pace }];
}

/** Progression run (E-22): easy, lalu 10 menit terakhir naik ke pace maraton. */
export const PROGRESSION_FAST_S = 10 * 60;
export function progressionRun(distanceM: number, z: PaceZones): Step[] {
  // Jarak total tidak melebihi `distanceM` (batas E-06): segmen cepat diambil dari jatah jarak.
  const fastM = (PROGRESSION_FAST_S / ((z.marathon.min + z.marathon.max) / 2)) * 1000;
  // Margin 50 m: jarak per segmen dibulatkan sendiri-sendiri.
  const easyM = distanceM - fastM - 50;
  if (easyM < (600 / easyPaceMid(z)) * 1000) return easyRun(distanceM, z);
  return [
    { kind: 'work', duration_s: easySecondsFor(easyM, z), zone: 'easy', pace_s_per_km: z.easy },
    { kind: 'work', duration_s: PROGRESSION_FAST_S, zone: 'tempo', pace_s_per_km: z.marathon },
  ];
}

/** Easy run + 4 x 20 detik strides (pace repetisi) dengan jog 60 detik. */
export function stridesRun(distanceM: number, z: PaceZones): Step[] {
  const strideBlock = 4 * 80;
  const easyS = Math.max(600, easySecondsFor(distanceM, z) - strideBlock);
  return [
    { kind: 'work', duration_s: easyS, zone: 'easy', pace_s_per_km: z.easy },
    {
      kind: 'repeat',
      times: 4,
      steps: [
        { kind: 'work', duration_s: 20, zone: 'interval', pace_s_per_km: z.repetition },
        { kind: 'recovery', duration_s: 60, zone: 'easy', pace_s_per_km: z.easy },
      ],
    },
  ];
}

/** Segmen drill ABC (E-15): 5 gerakan x 2 set x 20 m, sekitar 10 menit. */
export function drillSteps(): Step[] {
  return DRILLS.map((d) => ({ kind: 'drill', exercise_id: d.id, sets: d.sets, distance_m: d.distance_m }));
}

export const DRILL_MINUTES = DRILLS.reduce((a, d) => a + d.sets, 0);

export function tempoRun(tempoS: number, z: PaceZones, withDrill: boolean): Step[] {
  return [
    { kind: 'warmup', duration_s: WARMUP_S, zone: 'easy', pace_s_per_km: z.easy },
    ...(withDrill ? drillSteps() : []),
    { kind: 'work', duration_s: minutes(tempoS), zone: 'tempo', pace_s_per_km: z.threshold },
    { kind: 'cooldown', duration_s: COOLDOWN_S, zone: 'easy', pace_s_per_km: z.easy },
  ];
}

export function intervalRun(reps: number, repM: number, z: PaceZones, withDrill: boolean): Step[] {
  return [
    { kind: 'warmup', duration_s: WARMUP_S, zone: 'easy', pace_s_per_km: z.easy },
    ...(withDrill ? drillSteps() : []),
    {
      kind: 'repeat',
      times: reps,
      steps: [
        { kind: 'work', distance_m: repM, zone: 'interval', pace_s_per_km: z.interval },
        { kind: 'recovery', duration_s: repM >= 800 ? 120 : 90, zone: 'recovery', pace_s_per_km: z.easy },
      ],
    },
    { kind: 'cooldown', duration_s: COOLDOWN_S, zone: 'easy', pace_s_per_km: z.easy },
  ];
}

/** Run-walk (E-14): pemanasan jalan 5 mnt, ulangi (lari r, jalan w), pendinginan jalan 5 mnt. */
export function runWalk(times: number, runS: number, walkS: number, z: PaceZones): Step[] {
  const walkPace = { min: WALK_PACE_S_PER_KM, max: WALK_PACE_S_PER_KM };
  return [
    { kind: 'warmup', duration_s: 300, zone: 'recovery', pace_s_per_km: walkPace, walk: true },
    {
      kind: 'repeat',
      times,
      steps: [
        { kind: 'work', duration_s: runS, zone: 'easy', pace_s_per_km: z.easy },
        { kind: 'recovery', duration_s: walkS, zone: 'recovery', pace_s_per_km: walkPace, walk: true },
      ],
    },
    { kind: 'cooldown', duration_s: 300, zone: 'recovery', pace_s_per_km: walkPace, walk: true },
  ];
}

export function stepsSummary(steps: Step[]): { distanceM: number; durationS: number } {
  return { distanceM: runningDistance(steps), durationS: totalDuration(steps) };
}
