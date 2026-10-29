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
  return minutes((distanceM / 1000) * easyPaceMid(z));
}

export function easyRun(distanceM: number, z: PaceZones): Step[] {
  return [{ kind: 'work', duration_s: easySecondsFor(distanceM, z), zone: 'easy', pace_s_per_km: z.easy }];
}

export function longRun(distanceM: number, z: PaceZones): Step[] {
  return [{ kind: 'work', duration_s: easySecondsFor(distanceM, z), zone: 'long', pace_s_per_km: z.easy }];
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
