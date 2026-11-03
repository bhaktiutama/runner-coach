import { addDays, diffDays, weekday, type Weekday } from './dates';
import { intensitySplit, runningDistance, type Step } from './steps';
import type { GeneratedWorkout, WeekSummary, WorkoutType } from './types';
import type { PaceZones } from './vdot';
import {
  COOLDOWN_S,
  easyRun,
  longRun,
  MIN_EASY_M,
  progressionRun,
  recoveryRun,
  stepsSummary,
  stridesRun,
} from './workouts';

// E-11 berbasis tanggal race (v0.4). Taper dihitung per jendela 7 hari yang berakhir sehari
// sebelum race, bukan per minggu kalender: race Rabu berarti jendela Kamis-Selasa. Generator
// tetap menyusun minggu kalender; fungsi ini lalu menyetel jarak sesi easy/long di tiap jendela
// supaya volume jendela k = fraksi E-11 dari volume puncak. Sesi berat tidak diubah
// (intensitas dan jumlah sesi kualitas dipertahankan).

const FLEX = new Set<WorkoutType>(['easy', 'recovery', 'strides', 'progression', 'long', 'run_walk']);
const HARD = new Set<WorkoutType>(['tempo', 'interval']);
const isRun = (t: WorkoutType) => t !== 'strength' && t !== 'core';
const TOLERANCE = 0.02; // fraksi volume puncak

export type TaperArgs = {
  raceDate: string;
  startDate: string;
  peakVolumeM: number;
  /** Fraksi volume puncak per jendela, urut dari yang terjauh dari race (TAPER_FRACTIONS). */
  fractions: number[];
  zones: PaceZones;
  longestStartM: number;
  longShare: number;
  sessionCap: number;
  windowDays: number;
  availableDays: Weekday[];
  longTimeCapM: number;
};

function rebuild(w: GeneratedWorkout, distM: number, z: PaceZones): void {
  let steps: Step[];
  if (w.type === 'run_walk') {
    steps = scaleRepeats(w.steps, distM / Math.max(1, runningDistance(w.steps)), 1);
  } else if (w.type === 'long') steps = longRun(distM, z);
  else if (w.type === 'recovery') steps = recoveryRun(distM, z);
  else if (w.type === 'strides') steps = stridesRun(distM, z);
  else if (w.type === 'progression') {
    steps = progressionRun(distM, z);
    if (steps.length === 1) {
      w.type = 'easy';
      w.rationale = w.rationale.filter((r) => r.rule !== 'E-22');
    }
  } else steps = easyRun(distM, z);
  const s = stepsSummary(steps);
  w.steps = steps;
  w.targetDistanceM = s.distanceM;
  w.targetDurationS = s.durationS;
}

const dist = (w: GeneratedWorkout) => runningDistance(w.steps);

/** Ulangan blok `repeat` dikali f (min `minTimes`); pendinginan lebih dari 10 mnt dikembalikan ke 10 mnt. */
function scaleRepeats(steps: Step[], f: number, minTimes: number): Step[] {
  return steps.map((st) => {
    if (st.kind === 'repeat')
      return { ...st, times: Math.max(minTimes, Math.min(st.times, Math.round(st.times * f))) };
    return st;
  });
}

/** Batas bawah sesi fleksibel: run-walk 1 ulangan, lainnya 2 km. */
function minOf(w: GeneratedWorkout): number {
  if (w.type === 'run_walk') return runningDistance(scaleRepeats(w.steps, 0, 1));
  return Math.min(dist(w), MIN_EASY_M);
}

/** Sesi berat dipendekkan (intensitas sama): ulangan interval / menit tempo dikali f, pendinginan 10 mnt. */
function trimHard(w: GeneratedWorkout, f: number): void {
  let steps = scaleRepeats(w.steps, f, 3);
  steps = steps.map((st) => {
    if (st.kind === 'cooldown' && 'duration_s' in st && st.duration_s != null)
      return { ...st, duration_s: Math.min(st.duration_s, COOLDOWN_S) };
    if (w.type === 'tempo' && st.kind === 'work' && 'duration_s' in st && st.duration_s != null)
      return { ...st, duration_s: Math.max(8 * 60, Math.floor((st.duration_s * f) / 60) * 60) };
    return st;
  });
  const s = stepsSummary(steps);
  w.steps = steps;
  w.targetDistanceM = s.distanceM;
  w.targetDurationS = s.durationS;
}

/** Isi sesi fleksibel sampai total `want`, proporsional dengan batas bawah per sesi. */
function fillFlex(flex: GeneratedWorkout[], want: number, touched: Set<number>, z: PaceZones): void {
  const ds = flex.map(dist);
  const mins = flex.map(minOf);
  const fill = (f: number) => ds.reduce((x, d, i) => x + Math.min(d, Math.max(mins[i]!, d * f)), 0);
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2;
    if (fill(mid) > want) hi = mid;
    else lo = mid;
  }
  flex.forEach((w, i) => {
    const nd = Math.min(ds[i]!, Math.max(mins[i]!, ds[i]! * lo));
    if (nd < ds[i]! - 50) {
      rebuild(w, nd, z);
      touched.add(w.weekIndex);
    }
  });
}

/**
 * Turunkan volume jendela ke `target`. Urutan: (1) sesi easy/long dipendekkan proporsional sampai
 * batas bawahnya, (2) sesi berat dipendekkan (ulangan/menit, intensitas sama), (3) bila masih lebih,
 * sesi fleksibel paling awal dihapus. Frekuensi dan sesi kualitas dipertahankan selama mungkin.
 */
function reduceWindow(
  win: () => GeneratedWorkout[],
  target: number,
  tol: number,
  workouts: GeneratedWorkout[],
  touched: Set<number>,
  z: PaceZones,
): void {
  const sum = () => win().reduce((x, w) => x + dist(w), 0);
  const hardSum = () =>
    win()
      .filter((w) => HARD.has(w.type))
      .reduce((x, w) => x + dist(w), 0);
  const flex = () => win().filter((w) => FLEX.has(w.type));
  const flexMin = () => flex().reduce((x, w) => x + minOf(w), 0);
  // (2) dulu dihitung: berapa yang harus dipotong dari sesi berat bila easy/long sudah di batas bawah.
  const over = hardSum() + flexMin() - (target + tol);
  if (over > 0 && hardSum() > 0) {
    const f = Math.max(0, (hardSum() - over) / hardSum());
    for (const w of win().filter((x) => HARD.has(x.type))) {
      trimHard(w, f);
      touched.add(w.weekIndex);
    }
  }
  // (3) hapus sesi fleksibel paling awal selama batas bawah pun masih terlalu banyak.
  while (hardSum() + flexMin() > target + tol) {
    // Long run terakhir dipertahankan selama masih ada sesi easy yang bisa dihapus.
    const byDate = flex().sort((x, y) => x.date.localeCompare(y.date));
    const first = byDate.find((w) => w.type !== 'long') ?? byDate[0];
    if (!first || (flex().length <= 1 && hardSum() === 0)) break;
    // Berhenti bila menghapus justru menjauhkan volume dari target (volume kecil, sesi min 2 km).
    const now = hardSum() + flexMin();
    if (Math.abs(now - minOf(first) - target) >= Math.abs(now - target)) break;
    workouts.splice(workouts.indexOf(first), 1);
    touched.add(first.weekIndex);
  }
  // (1) setel sesi fleksibel.
  if (sum() > target + tol) fillFlex(flex(), Math.max(0, target - hardSum()), touched, z);
}

/** Lari terjauh 30 hari sebelum `date` dari daftar akhir (E-06). */
function longest30(date: string, runs: GeneratedWorkout[], a: TaperArgs): number {
  let longest = diffDays(a.startDate, date) <= a.windowDays ? a.longestStartM : 0;
  for (const w of runs) {
    if (w.date < a.startDate) continue;
    const d = diffDays(w.date, date);
    if (d > 0 && d <= a.windowDays) longest = Math.max(longest, runningDistance(w.steps));
  }
  return longest;
}

/** Setel volume jendela taper. Mengubah `workouts` dan `summaries` di tempat. Hasil: % turun 7 hari terakhir. */
export function applyRaceTaper(workouts: GeneratedWorkout[], summaries: WeekSummary[], a: TaperArgs): number {
  const T = a.fractions.length;
  const peak = a.peakVolumeM;
  const touched = new Set<number>();
  let lastDrop = 50;
  // Jendela terjauh dulu, supaya batas E-06 jendela berikutnya memakai jarak yang sudah final.
  for (let k = T; k >= 1; k--) {
    const frac = a.fractions[T - k]!;
    const target = peak * frac;
    const inWin = (w: GeneratedWorkout) => {
      const d = diffDays(w.date, a.raceDate);
      return isRun(w.type) && w.date >= a.startDate && d >= 7 * (k - 1) + 1 && d <= 7 * k;
    };
    const win = () => workouts.filter(inWin);
    const sum = () => win().reduce((x, w) => x + runningDistance(w.steps), 0);
    const total = sum();
    if (total > target + TOLERANCE * peak) {
      reduceWindow(win, target, TOLERANCE * peak, workouts, touched, a.zones);
    } else if (total < target - TOLERANCE * peak) {
      let deficit = target - total;
      const capAt = (date: string) => Math.floor(longest30(date, workouts, a) * a.sessionCap);
      // (a) Hari tersedia yang kosong di jendela (>= 2 hari sebelum race, tidak sehari sesudah sesi
      //     berat/long run) diisi easy run, mulai dari yang paling dekat race.
      const runWalkPlan = workouts.some((w) => w.type === 'run_walk');
      for (let d = 7 * (k - 1) + 2; d <= 7 * k && deficit >= MIN_EASY_M && !runWalkPlan; d++) {
        const date = addDays(a.raceDate, -d);
        if (date < a.startDate || !a.availableDays.includes(weekday(date))) continue;
        if (workouts.some((w) => isRun(w.type) && w.date === date)) continue;
        const prev = addDays(date, -1);
        if (workouts.some((w) => w.date === prev && (HARD.has(w.type) || w.type === 'long'))) continue;
        const wk = summaries.find((s) => s.startDate <= date && addDays(s.startDate, 6) >= date);
        if (!wk) continue;
        const m = Math.min(deficit, capAt(date));
        if (m < MIN_EASY_M) continue;
        const steps = easyRun(m, a.zones);
        const sum0 = stepsSummary(steps);
        workouts.push({
          date,
          weekIndex: wk.weekIndex,
          phase: wk.phase,
          type: 'easy',
          steps,
          targetDistanceM: sum0.distanceM,
          targetDurationS: sum0.durationS,
          rationale: [
            { rule: 'E-09', values: { easy_pct: 0 } },
            { rule: 'E-06', values: { distance_m: sum0.distanceM, longest_30d_m: 0, cap_m: 0 } },
            { rule: 'E-11', values: { pct: 0, weeks: a.fractions.length } },
          ],
        });
        deficit -= sum0.distanceM;
        touched.add(wk.weekIndex);
      }
      // (b) Perpanjang sesi easy, lalu long run, dalam batas E-06 (long run: juga batas waktu E-08).
      const grow = win()
        .filter((w) => FLEX.has(w.type) && w.type !== 'run_walk')
        .sort((x, y) => Number(x.type === 'long') - Number(y.type === 'long'));
      for (const w of grow) {
        if (deficit < 100) break;
        const d = dist(w);
        const limit = w.type === 'long' ? Math.min(capAt(w.date), a.longTimeCapM) : capAt(w.date);
        const add = Math.min(deficit, Math.max(0, limit - d - 50));
        if (add < 100) continue;
        rebuild(w, d + add, a.zones);
        deficit -= dist(w) - d;
        touched.add(w.weekIndex);
      }
    }
    const drop = Math.round((1 - sum() / Math.max(1, peak)) * 100);
    if (k === 1) lastDrop = drop;
    for (const w of win()) {
      w.rationale = w.rationale.map((r) =>
        r.rule === 'E-11' ? { rule: 'E-11', values: { ...r.values, pct: drop } } : r,
      );
    }
  }

  // E-06 pada jarak final: batas bisa turun karena sesi sebelumnya dipendekkan.
  for (const w of workouts) {
    if (!touched.has(w.weekIndex) || !isRun(w.type) || w.date < a.startDate) continue;
    const l30 = longest30(w.date, workouts, a);
    const cap = Math.floor(l30 * a.sessionCap);
    if (FLEX.has(w.type) && runningDistance(w.steps) > cap) rebuild(w, cap, a.zones);
    w.rationale = w.rationale.map((r) =>
      r.rule === 'E-06'
        ? {
            rule: 'E-06',
            values: { ...r.values, distance_m: runningDistance(w.steps), longest_30d_m: l30, cap_m: cap },
          }
        : r,
    );
  }

  // Volume minggu, E-08 (porsi long run) dan E-09 untuk minggu yang berubah.
  for (const s of summaries) {
    if (!touched.has(s.weekIndex)) continue;
    const ws = workouts.filter((w) => w.weekIndex === s.weekIndex && isRun(w.type));
    let volume = ws.reduce((x, w) => x + w.targetDistanceM, 0);
    const long = ws.find((w) => w.type === 'long');
    if (long && long.targetDistanceM > volume * a.longShare && long.targetDistanceM > MIN_EASY_M) {
      const others = volume - long.targetDistanceM;
      rebuild(long, Math.max(MIN_EASY_M, Math.floor((others * a.longShare) / (1 - a.longShare))), a.zones);
      volume = others + long.targetDistanceM;
    }
    if (long) {
      long.rationale = long.rationale.map((r) =>
        r.rule === 'E-08'
          ? {
              rule: 'E-08',
              values: {
                ...r.values,
                distance_m: long.targetDistanceM,
                week_volume_m: volume,
                share_pct: Math.round((long.targetDistanceM / Math.max(1, volume)) * 100),
              },
            }
          : r.rule === 'E-06'
            ? { rule: 'E-06', values: { ...r.values, distance_m: long.targetDistanceM } }
            : r,
      );
    }
    const split = ws.reduce(
      (acc, w) => {
        const x = intensitySplit(w.steps);
        return { e: acc.e + x.easy_s, h: acc.h + x.hard_s };
      },
      { e: 0, h: 0 },
    );
    const easyPct = Math.round((split.e / Math.max(1, split.e + split.h)) * 100);
    for (const w of ws) {
      w.rationale = w.rationale.map((r) =>
        r.rule === 'E-09' ? { rule: 'E-09', values: { easy_pct: easyPct } } : r,
      );
    }
    s.volumeM = volume;
  }
  workouts.sort((x, y) => x.date.localeCompare(y.date));
  return lastDrop;
}
