import { addDays, adjacentWeekdays, diffDays, mondayOf, weekday, type Weekday } from './dates';
import { predictRange } from './riegel';
import { intensitySplit, runningDistance, type Step } from './steps';
import {
  DISTANCE_M,
  type GeneratedPlan,
  type GeneratedWorkout,
  type GoalDistance,
  type Level,
  type Phase,
  type PlanInput,
  type Prediction,
  type Rationale,
  type WeekSummary,
  type WorkoutType,
} from './types';
import { LEVEL_VDOT, paceZones, raceTimeFromVdot, vdotFromRace, type PaceZones } from './vdot';
import {
  DRILL_MINUTES,
  easyPaceMid,
  easyRun,
  intervalRun,
  longRun,
  MIN_EASY_M,
  progressionRun,
  PROGRESSION_FAST_S,
  recoveryRun,
  RECOVERY_MAX_S,
  runWalk,
  stepsSummary,
  stridesRun,
  tempoRun,
} from './workouts';

export const ENGINE_VERSION = '0.1.0';

// ---- Konstanta aturan (TRD 4.2). Angka heuristik (tingkat D) wajib direview pelatih (D6). ----

/** E-03: durasi default (minggu). */
export const DEFAULT_WEEKS: Record<GoalDistance, number> = { '5k': 8, '10k': 10, hm: 12, fm: 16, fitness: 8 };
/** Durasi minimum plan dipadatkan; di bawah ini engine menolak (UI menawarkan target lebih pendek). */
export const MIN_WEEKS: Record<GoalDistance, number> = { '5k': 4, '10k': 5, hm: 6, fm: 8, fitness: 8 };
/** Batas atas: minggu ekstra masuk fase Base. */
export const MAX_WEEKS = 30;

/** Volume puncak target per level (m/minggu). Tidak pernah dicapai lebih cepat dari E-05. */
const PEAK_VOLUME_M: Record<Level, Record<GoalDistance, number>> = {
  beginner: { '5k': 20_000, '10k': 28_000, hm: 38_000, fm: 50_000, fitness: 18_000 },
  recreational: { '5k': 30_000, '10k': 38_000, hm: 48_000, fm: 60_000, fitness: 25_000 },
};

const MAX_WEEKLY_INCREASE = 0.1; // E-05
const CUTBACK_EVERY = 4; // E-07
const CUTBACK_FACTOR = 0.8; // E-07: turun 20-30% setelah pembulatan
// E-08: porsi long run dari volume minggu dan batas waktunya. HM/FM butuh long run yang lebih
// jauh relatif terhadap volume (pelari rekreasional jarang bervolume tinggi); batas waktu
// mencegah sesi > 2,5 jam (HM) / 3 jam (FM) untuk pelari lambat.
export const LONG_RUN_SHARE: Record<GoalDistance, number> = {
  '5k': 0.3,
  '10k': 0.3,
  hm: 0.35,
  fm: 0.45,
  fitness: 0.3,
};
export const LONG_RUN_MAX_S: Record<GoalDistance, number> = {
  '5k': 120 * 60,
  '10k': 120 * 60,
  hm: 150 * 60,
  fm: 180 * 60,
  fitness: 120 * 60,
};
const SESSION_CAP = 1.1; // E-06
const LONGEST_WINDOW_DAYS = 30; // E-06
const RUN_WALK_LONGEST_M = 3000; // E-14 / E-O2
const RUN_WALK_EXIT_S = 20 * 60; // E-14: keluar setelah blok lari 20 menit
const RUN_WALK_EASY_S = 30 * 60;
const RUN_WALK_LONG_S = 40 * 60;

/** E-11: fraksi volume puncak per minggu taper; minggu terakhir turun 50%. */
const TAPER_FRACTIONS: Record<number, number[]> = { 1: [0.5], 2: [0.7, 0.5], 3: [0.8, 0.65, 0.5] };

export class EngineError extends Error {
  constructor(
    public code: 'race_too_soon' | 'race_in_past' | 'invalid_days' | 'long_run_day_unavailable',
    message?: string,
  ) {
    super(message ?? code);
  }
}

export function effectiveLevel(input: PlanInput): Level {
  if (input.goal.level) return input.goal.level;
  return input.goal.weeklyVolumeM < 10_000 ? 'beginner' : 'recreational';
}

export function isRunWalk(input: PlanInput): boolean {
  return (
    input.goal.level === 'beginner' &&
    input.goal.baselineTimeS == null &&
    input.goal.longestRunM < RUN_WALK_LONGEST_M
  );
}

export function estimateVdot(input: PlanInput): number {
  if (input.vdot) return input.vdot;
  const g = input.goal;
  if (g.baselineDistance && g.baselineTimeS)
    return vdotFromRace(DISTANCE_M[g.baselineDistance], g.baselineTimeS);
  return LEVEL_VDOT[g.level ?? effectiveLevel(input)];
}

/** Jumlah minggu plan (E-03). Minggu 1 = minggu kalender (Senin) yang memuat startDate. */
export function planWeeks(input: PlanInput): number {
  const { distance, raceDate } = input.goal;
  if (!raceDate || distance === 'fitness') return DEFAULT_WEEKS[distance];
  if (raceDate <= input.startDate) throw new EngineError('race_in_past');
  // Race Senin/Selasa: minggu race bukan minggu latihan; taper = minggu sebelumnya.
  const raceWeekCounts = weekday(raceDate) >= 2 ? 1 : 0;
  const weeks = diffDays(mondayOf(input.startDate), mondayOf(raceDate)) / 7 + raceWeekCounts;
  if (weeks < MIN_WEEKS[distance]) throw new EngineError('race_too_soon');
  return Math.min(weeks, MAX_WEEKS);
}

export function taperWeeks(distance: GoalDistance, weeks: number): number {
  if (distance === 'fitness') return 0;
  if (distance === 'hm') return weeks >= 12 ? 2 : 1;
  if (distance === 'fm') return weeks >= 18 ? 3 : 2;
  return 1;
}

/** E-04: pembagian fase. */
export function phaseLayout(distance: GoalDistance, weeks: number): Phase[] {
  const taper = taperWeeks(distance, weeks);
  const rest = weeks - taper;
  let peak: number;
  let build: number;
  if (distance === 'fitness') {
    peak = Math.max(1, Math.round(rest * 0.25));
    build = Math.max(1, Math.round(rest * 0.375));
  } else {
    peak = Math.max(1, Math.round(rest * 0.15));
    build = Math.max(1, Math.round(rest * 0.4));
  }
  const base = Math.max(1, rest - peak - build);
  build = rest - peak - base;
  return [
    ...Array<Phase>(base).fill('base'),
    ...Array<Phase>(build).fill('build'),
    ...Array<Phase>(peak).fill('peak'),
    ...Array<Phase>(taper).fill('taper'),
  ];
}

// Dibulatkan ke bawah per 100 m. Pembulatan per 0,5-1 km (versi lama) ditambah pembulatan
// durasi per menit membuat kenaikan 10% habis dan volume macet di sekitar 10 km/minggu.
const roundDown = (m: number) => Math.floor(m / 100) * 100;

/** Pilih k hari dari hari tersedia, wajib memuat long run, dengan jarak antar hari sebesar mungkin. */
export function chooseRunDays(available: Weekday[], k: number, longDay: Weekday): Weekday[] {
  const days = [...new Set(available)].sort((a, b) => a - b);
  if (k >= days.length) return days;
  const chosen: Weekday[] = [longDay];
  while (chosen.length < k) {
    let best: Weekday | null = null;
    let bestGap = -1;
    for (const d of days) {
      if (chosen.includes(d)) continue;
      const gap = Math.min(...chosen.map((c) => Math.min(Math.abs(c - d), 7 - Math.abs(c - d))));
      if (gap > bestGap) {
        bestGap = gap;
        best = d;
      }
    }
    chosen.push(best!);
  }
  return chosen.sort((a, b) => a - b);
}

/** E-10: hari sesi berat, tidak bersebelahan satu sama lain maupun dengan long run. */
export function chooseHardDays(
  runDays: Weekday[],
  longDay: Weekday,
  count: number,
  latest?: Weekday,
): Weekday[] {
  const blocked = new Set<Weekday>([longDay]);
  const hard: Weekday[] = [];
  // Utamakan hari yang paling jauh dari long run.
  const candidates = runDays
    .filter((d) => d !== longDay && (latest == null || d <= latest))
    .sort((a, b) => {
      const ga = Math.min(Math.abs(a - longDay), 7 - Math.abs(a - longDay));
      const gb = Math.min(Math.abs(b - longDay), 7 - Math.abs(b - longDay));
      return gb - ga || a - b;
    });
  for (const d of candidates) {
    if (hard.length >= count) break;
    if ([...blocked].some((b) => adjacentWeekdays(b, d))) continue;
    hard.push(d);
    blocked.add(d);
  }
  return hard.sort((a, b) => a - b);
}

export type RunWalkBlock = { runS: number; walkS: number; easyReps: number; longReps: number };

/** Waktu blok (lari + jalan) per sesi, di luar pemanasan dan pendinginan jalan 5 mnt. */
const RW_EASY_BLOCK_S = RUN_WALK_EASY_S - 600;
const RW_LONG_BLOCK_S = RUN_WALK_LONG_S - 600;

/**
 * E-14 + E-05: blok run-walk berikutnya. Menit lari aktual tiap sesi (ulangan x blok lari)
 * naik maks 10%, total waktu sesi tetap. Grid 15 detik.
 */
export function nextRunWalkBlock(prev: RunWalkBlock | null): RunWalkBlock {
  const reps = (runS: number, walkS: number, blockS: number) =>
    Math.max(1, Math.floor(blockS / (runS + walkS)));
  const make = (runS: number, walkS: number): RunWalkBlock => ({
    runS,
    walkS,
    easyReps: reps(runS, walkS, RW_EASY_BLOCK_S),
    longReps: reps(runS, walkS, RW_LONG_BLOCK_S),
  });
  if (!prev) return make(60, 120);
  const prevEasy = prev.easyReps * prev.runS;
  const prevLong = prev.longReps * prev.runS;
  let best = prev;
  let bestFrac = prev.runS / (prev.runS + prev.walkS);
  for (let walkS = 120; walkS >= 30; walkS -= 15) {
    for (let runS = prev.runS; runS <= RUN_WALK_EXIT_S; runS += 15) {
      const c = make(runS, walkS);
      const f = runS / (runS + walkS);
      const ok =
        c.easyReps * runS <= prevEasy * (1 + MAX_WEEKLY_INCREASE) + 1e-9 &&
        c.longReps * runS <= prevLong * (1 + MAX_WEEKLY_INCREASE) + 1e-9;
      if (ok && f > bestFrac + 1e-9) {
        best = c;
        bestFrac = f;
      }
    }
  }
  return best;
}

function hardCount(phase: Phase, level: Level, sessions: number, input: PlanInput, cutback: boolean): number {
  if (input.lightMode || phase === 'return') return 0;
  if (input.goal.distance === 'fitness') return phase === 'base' ? 0 : 1;
  let h = 0;
  if (phase === 'build') h = 1;
  if (phase === 'peak' || phase === 'taper') h = level === 'beginner' || sessions < 4 ? 1 : 2;
  if (level === 'beginner') h = Math.min(h, 1);
  if (cutback) h = Math.min(h, 1);
  return h;
}

function hardType(
  distance: GoalDistance,
  phase: Phase,
  weekIndex: number,
  slot: number,
  h: number,
): 'tempo' | 'interval' {
  if (h === 2) return slot === 0 ? 'interval' : 'tempo';
  if (distance === 'fitness') return weekIndex % 2 === 0 ? 'interval' : 'tempo';
  if (phase === 'build') return 'tempo';
  const short = distance === '5k' || distance === '10k';
  if (phase === 'peak') return short ? 'interval' : weekIndex % 2 === 0 ? 'interval' : 'tempo';
  return short ? 'interval' : 'tempo';
}

function hardSteps(
  type: 'tempo' | 'interval',
  phase: Phase,
  phaseWeek: number,
  level: Level,
  distance: GoalDistance,
  z: PaceZones,
  budgetM: number,
): Step[] | null {
  if (type === 'tempo') {
    const maxMin = level === 'beginner' ? 20 : 25;
    let mins = phase === 'build' ? 12 + 2 * phaseWeek : phase === 'peak' ? maxMin : 15;
    mins = Math.min(mins, maxMin);
    for (; mins >= 8; mins--) {
      const steps = tempoRun(mins * 60, z, true);
      if (runningDistance(steps) <= budgetM) return steps;
    }
    return null;
  }
  const repM = level === 'beginner' && (distance === '5k' || distance === 'fitness') ? 400 : 800;
  let reps = phase === 'build' ? 4 + Math.min(phaseWeek, 2) : phase === 'peak' ? 6 : 4;
  if (repM === 400) reps += 2;
  for (; reps >= 3; reps--) {
    const steps = intervalRun(reps, repM, z, true);
    if (runningDistance(steps) <= budgetM) return steps;
  }
  return null;
}

/** Lari terjauh di jendela 30 hari sebelum `date` (E-06): data awal + plan itu sendiri. */
function longest30(date: string, input: PlanInput, history: GeneratedWorkout[]): number {
  let longest = diffDays(input.startDate, date) <= LONGEST_WINDOW_DAYS ? input.goal.longestRunM : 0;
  for (const w of history) {
    const d = diffDays(w.date, date);
    if (d > 0 && d <= LONGEST_WINDOW_DAYS) longest = Math.max(longest, runningDistance(w.steps));
  }
  return longest;
}

export function generatePlan(input: PlanInput): GeneratedPlan {
  const days = [...new Set(input.availableDays)];
  if (days.length < 3 || days.length > 6) throw new EngineError('invalid_days');
  if (!days.includes(input.longRunDay)) throw new EngineError('long_run_day_unavailable');

  const distance = input.goal.distance;
  const level = effectiveLevel(input);
  const vdot = Math.round(estimateVdot(input) * 10) / 10;
  const zones = paceZones(vdot);
  const weeks = planWeeks(input);
  const phases = phaseLayout(distance, weeks);
  const firstMonday = mondayOf(input.startDate);
  const raceDate = distance === 'fitness' ? null : input.goal.raceDate;
  const runWalkPlan = isRunWalk(input);

  const startVolume = Math.max(input.goal.weeklyVolumeM, input.goal.longestRunM, MIN_EASY_M * 2);
  const peakTarget = Math.max(PEAK_VOLUME_M[level][distance], startVolume);

  const history: GeneratedWorkout[] = [];
  const summaries: WeekSummary[] = [];
  let lastFullVolume = startVolume; // volume minggu non-cutback terakhir (E-05)
  let peakVolume = 0;
  let block: RunWalkBlock | null = null;
  let runWalkActive = runWalkPlan;
  let taperIndex = 0;
  let peakHard = 0;
  const phaseWeekCounter: Partial<Record<Phase, number>> = {};

  for (let w = 1; w <= weeks; w++) {
    const phase = phases[w - 1]!;
    phaseWeekCounter[phase] = (phaseWeekCounter[phase] ?? 0) + 1;
    const phaseWeek = phaseWeekCounter[phase]!;
    const monday = addDays(firstMonday, (w - 1) * 7);
    const cutback = !runWalkActive && phase !== 'taper' && w % CUTBACK_EVERY === 0 && w < weeks;

    // Target volume minggu ini.
    let target: number;
    let taperPct = 0;
    if (phase === 'taper') {
      const fr = TAPER_FRACTIONS[taperWeeks(distance, weeks)]![taperIndex++]!;
      target = roundDown(peakVolume * fr);
      taperPct = Math.round((1 - fr) * 100);
    } else if (w === 1) {
      target = roundDown(startVolume);
    } else if (cutback) {
      target = roundDown(lastFullVolume * CUTBACK_FACTOR);
      if (target < lastFullVolume * 0.7) target = Math.ceil((lastFullVolume * 0.7) / 500) * 500;
    } else {
      // Margin 100 m: jarak aktual per sesi dibulatkan sendiri-sendiri dan bisa sedikit melebihi target.
      target = Math.min(roundDown(lastFullVolume * (1 + MAX_WEEKLY_INCREASE) - 100), roundDown(peakTarget));
      target = Math.max(target, Math.min(lastFullVolume, roundDown(peakTarget)));
    }

    const week = buildWeek({
      input,
      weekIndex: w,
      phase,
      phaseWeek,
      monday,
      target,
      cutback,
      level,
      zones,
      raceDate,
      history,
      runWalk: runWalkActive ? (block = phase === 'taper' && block ? block : nextRunWalkBlock(block)) : null,
      taperPct,
      peakHard,
    });

    if (runWalkActive && block && block.runS >= RUN_WALK_EXIT_S) runWalkActive = false;
    if (phase === 'peak') peakHard = Math.max(peakHard, week.hard);
    if (phase !== 'taper' && !cutback) {
      lastFullVolume = week.volume;
      peakVolume = Math.max(peakVolume, week.volume);
    }
    summaries.push({ weekIndex: w, phase, startDate: monday, volumeM: week.volume, cutback });
    history.push(...week.workouts);
  }

  const workouts = history.filter((x) => x.date >= input.startDate && (!raceDate || x.date < raceDate));
  const endDate = raceDate ?? addDays(firstMonday, weeks * 7 - 1);
  const prediction = buildPrediction(input, vdot);
  const rationale = planRationale({
    input,
    weeks,
    phases,
    summaries,
    workouts,
    zones,
    vdot,
    prediction,
    runWalkPlan,
    level,
  });

  return {
    engineVersion: ENGINE_VERSION,
    startDate: input.startDate,
    endDate,
    weeks: summaries,
    workouts,
    vdot,
    zones,
    prediction,
    runWalk: runWalkPlan,
    rationale,
    params: {
      available_days: [...days].sort((a, b) => a - b),
      long_run_day: input.longRunDay,
      light_mode: input.lightMode,
      engine_version: ENGINE_VERSION,
      vdot,
      rationale,
    },
  };
}

type BuildWeekArgs = {
  input: PlanInput;
  weekIndex: number;
  phase: Phase;
  phaseWeek: number;
  monday: string;
  target: number;
  cutback: boolean;
  level: Level;
  zones: PaceZones;
  raceDate: string | null;
  history: GeneratedWorkout[];
  runWalk: RunWalkBlock | null;
  taperPct: number;
  peakHard: number;
};

function dateOf(monday: string, d: Weekday) {
  return addDays(monday, d);
}

function buildWeek(a: BuildWeekArgs): { workouts: GeneratedWorkout[]; volume: number; hard: number } {
  const { input, weekIndex, phase, monday, target, cutback, zones, raceDate } = a;
  const longDay = input.longRunDay;
  const daysToRace = (d: Weekday) => (raceDate ? diffDays(dateOf(monday, d), raceDate) : Infinity);
  const weekRationale: Rationale[] = [];
  if (cutback) weekRationale.push({ rule: 'E-07', values: { week: weekIndex, pct: 20 } });
  if (phase === 'taper') weekRationale.push({ rule: 'E-11', values: { pct: a.taperPct, weeks: 1 } });
  if (phase === 'return') weekRationale.push({ rule: 'E-13', values: { days: 10 } });

  const mk = (d: Weekday, type: WorkoutType, steps: Step[], extra: Rationale[]): GeneratedWorkout => {
    const s = stepsSummary(steps);
    return {
      date: dateOf(monday, d),
      weekIndex,
      phase,
      type,
      steps,
      targetDistanceM: s.distanceM,
      targetDurationS: s.durationS,
      rationale: [...extra, ...weekRationale],
    };
  };

  // Run-walk (E-14): semua sesi lari-jalan, tanpa sesi berat. Taper: ulangan dipotong 50%.
  if (a.runWalk) {
    const rw = a.runWalk;
    const factor = phase === 'taper' ? 1 - a.taperPct / 100 : 1;
    const runDays = chooseRunDays(input.availableDays, Math.min(input.availableDays.length, 4), longDay);
    const vals = { run_min: rw.runS / 60, walk_min: rw.walkS / 60 };
    const workouts = runDays
      .filter((d) => daysToRace(d) > 0)
      .map((d) => {
        const r = Math.max(1, Math.round((d === longDay ? rw.longReps : rw.easyReps) * factor));
        return mk(d, 'run_walk', runWalk(r, rw.runS, rw.walkS, zones), [{ rule: 'E-14', values: vals }]);
      });
    const full = runDays.reduce((x: number, d) => {
      const r = Math.max(1, Math.round((d === longDay ? rw.longReps : rw.easyReps) * factor));
      return x + runningDistance(runWalk(r, rw.runS, rw.walkS, zones));
    }, 0);
    return { workouts, volume: full, hard: 0 };
  }

  // Menjelang race: tidak ada latihan pada/sesudah hari race; long run dan sesi berat >= 3 hari sebelum race.
  const inRaceWeek = raceDate != null && mondayOf(raceDate) === monday;
  const raceWd = raceDate ? weekday(raceDate) : null;
  const pool = input.availableDays.filter((d) => daysToRace(d) > 0);
  const hasLong = pool.includes(longDay) && daysToRace(longDay) >= 3;

  // Jumlah hari lari: volume kecil tidak dipecah ke terlalu banyak sesi.
  // Dibulatkan ke terdekat: dengan pembulatan ke bawah, minggu 7,3 km hanya dapat 2 sesi dan
  // sesi kedua terpotong E-06, sehingga cutback/taper turun lebih dari yang direncanakan.
  const sessions = Math.min(pool.length, Math.max(2, Math.round(target / 2500)));
  const usable = hasLong ? chooseRunDays(pool, sessions, longDay) : chooseRunDays(pool, sessions, pool[0]!);

  let h = hardCount(phase, a.level, usable.length, input, cutback);
  if (phase === 'taper') h = Math.max(h, Math.min(a.peakHard, h === 0 ? 0 : 2));
  // Minggu race tanpa long run: hari race diperlakukan sebagai sesi kunci untuk aturan jarak.
  const anchor = hasLong || !inRaceWeek ? longDay : raceWd!;
  const hardPool = usable.filter((d) => daysToRace(d) >= 3);
  const hardDays: Weekday[] = h > 0 ? chooseHardDays(hardPool, anchor, h) : [];

  const workouts: GeneratedWorkout[] = [];
  const histAll = () => [...a.history, ...workouts];

  // Long run: min(porsi volume E-08, batas waktu E-08, 110% lari terjauh 30 hari E-06).
  const share = LONG_RUN_SHARE[input.goal.distance];
  const timeCapM = Math.floor((LONG_RUN_MAX_S[input.goal.distance] / easyPaceMid(zones)) * 1000);
  let longM = 0;
  if (hasLong) {
    const date = dateOf(monday, longDay);
    const l30 = longest30(date, input, histAll());
    const cap = Math.floor(l30 * SESSION_CAP);
    longM = Math.min(Math.round(target * share), timeCapM, cap);
    longM = Math.max(longM, Math.min(MIN_EASY_M, cap));
  }

  // Sesi berat: harus muat di batas E-06 dan maks 40% volume minggu; jika tidak, jadi easy.
  const hard: { d: Weekday; type: 'tempo' | 'interval'; steps: Step[] }[] = [];
  for (const d of hardDays) {
    const date = dateOf(monday, d);
    const cap = Math.floor(longest30(date, input, histAll()) * SESSION_CAP);
    const type = hardType(input.goal.distance, phase, weekIndex, hard.length, hardDays.length);
    // Taper: jumlah sesi kualitas dipertahankan (E-11), jadi hanya dibatasi E-06.
    const budget = phase === 'taper' ? cap : Math.min(cap, target * 0.4);
    const steps = hardSteps(type, phase, a.phaseWeek, a.level, input.goal.distance, zones, budget);
    if (steps) hard.push({ d, type, steps });
  }
  hardDays.splice(0, hardDays.length, ...hard.map((x) => x.d));
  const hardM = hard.reduce((x, s) => x + runningDistance(s.steps), 0);

  // Sisa volume dibagi ke hari easy. Volume kecil: long run dikurangi dulu supaya hari easy tetap
  // dapat minimal MIN_EASY_M; kalau hari easy tetap tidak cukup, sisanya dikembalikan ke long run
  // (tetap dalam batas E-06/E-08). Tanpa ini volume pemula turun di fase Build.
  const easyDays = usable.filter((d) => d !== longDay && !hardDays.includes(d));
  if (hasLong && easyDays.length > 0) {
    const need = MIN_EASY_M * easyDays.length;
    if (target - longM - hardM < need) longM = Math.max(Math.min(MIN_EASY_M, longM), target - hardM - need);
  }
  let remaining = target - longM - hardM;
  while (easyDays.length > 0 && remaining / easyDays.length < MIN_EASY_M) easyDays.pop();
  // Minggu race tanpa long run: sisa volume jadi 1 easy run pendek (shakeout, min 2 km),
  // supaya taper tidak turun lebih dari 60% (E-11).
  const easyCandidates = usable.filter((d) => d !== longDay && !hardDays.includes(d));
  if (easyDays.length === 0 && !hasLong && inRaceWeek && remaining > 0 && easyCandidates.length > 0) {
    easyDays.push(easyCandidates[0]!);
    remaining = Math.max(remaining, MIN_EASY_M);
  }
  if (easyDays.length === 0 && hasLong && remaining > 0) {
    const l30 = longest30(dateOf(monday, longDay), input, histAll());
    const room = Math.min(Math.floor(l30 * SESSION_CAP), timeCapM) - longM;
    const add = Math.max(0, Math.min(remaining, room));
    longM += add;
    remaining -= add;
  }
  const perEasy = easyDays.length > 0 ? remaining / easyDays.length : 0;
  const stridesDay =
    phase === 'base' &&
    a.level === 'recreational' &&
    !input.lightMode &&
    a.phaseWeek >= 2 &&
    easyDays.length > 1
      ? easyDays[0]
      : null;

  // Recovery run (E-21): hari easy tepat sesudah long run / sesi berat di minggu yang sama,
  // untuk pelari rekreasional dengan >= 5 hari lari. Sisa jaraknya dipindah ke hari easy lain.
  const heavy = new Set<Weekday>([...(hasLong ? [longDay] : []), ...hardDays]);
  const recoveryDays =
    a.level === 'recreational' && !input.lightMode && phase !== 'return' && usable.length >= 5
      ? easyDays.filter((d) => d > 0 && heavy.has((d - 1) as Weekday) && d !== stridesDay)
      : [];
  const recoveryM = Math.min(perEasy, Math.floor((RECOVERY_MAX_S / (zones.easy.max + 15)) * 1000));
  // Progression run (E-22): fase Build, minggu ganjil, bukan cutback; tidak bersebelahan dengan
  // long run atau sesi berat supaya tetap ada hari pulih di antaranya.
  const progressionDay =
    phase === 'build' &&
    a.level === 'recreational' &&
    !input.lightMode &&
    !cutback &&
    input.goal.distance !== 'fitness' &&
    a.phaseWeek % 2 === 1
      ? (easyDays.find(
          (d) =>
            d !== stridesDay && !recoveryDays.includes(d) && ![...heavy].some((h) => adjacentWeekdays(h, d)),
        ) ?? null)
      : null;
  const normalEasy = easyDays.filter((d) => !recoveryDays.includes(d));
  const perNormal =
    normalEasy.length > 0
      ? perEasy + (recoveryDays.length * Math.max(0, perEasy - recoveryM)) / normalEasy.length
      : 0;

  // Jarak easy yang tidak muat di batas E-06 dipindah ke pendinginan jogging santai sesi berat
  // (intensitas tidak bertambah). Tanpa ini plan 3 hari turun 15-20% saat masuk fase Build.
  // Batas E-06 hari easy dihitung sebelum sesi berat diperpanjang, supaya jarak yang dipindah
  // tidak terhitung dua kali.
  const easyCap = new Map<Weekday, number>(
    normalEasy.map((d) => [d, Math.floor(longest30(dateOf(monday, d), input, histAll()) * SESSION_CAP)]),
  );
  let overflow = normalEasy.reduce<number>((x, d) => x + Math.max(0, perNormal - easyCap.get(d)!), 0);
  const easyMid = (zones.easy.min + zones.easy.max) / 2;
  for (const hs of hard) {
    if (overflow < 500) break;
    const cap = Math.floor(longest30(dateOf(monday, hs.d), input, histAll()) * SESSION_CAP);
    const room = cap - runningDistance(hs.steps) - 50;
    const extraS = Math.floor(((Math.min(overflow, room) / 1000) * easyMid) / 60) * 60;
    const cool = hs.steps.find((x) => x.kind === 'cooldown');
    if (extraS < 60 || !cool || !('duration_s' in cool) || cool.duration_s == null) continue;
    cool.duration_s += extraS;
    overflow -= (extraS / easyMid) * 1000;
  }

  const ordered = [...usable].sort((x, y) => x - y);
  for (const d of ordered) {
    const date = dateOf(monday, d);
    const l30 = longest30(date, input, histAll());
    const cap = Math.floor(l30 * SESSION_CAP);
    if (d === longDay && hasLong) {
      const steps = longRun(longM, zones);
      const dist = runningDistance(steps);
      workouts.push(
        mk(d, 'long', steps, [
          { rule: 'E-06', values: { distance_m: dist, longest_30d_m: l30, cap_m: cap } },
          {
            rule: 'E-08',
            values: {
              distance_m: dist,
              week_volume_m: target,
              share_pct: Math.round((dist / Math.max(1, target)) * 100),
              limit_pct: Math.round(share * 100),
            },
          },
        ]),
      );
      continue;
    }
    const hs = hard.find((x) => x.d === d);
    if (hs) {
      const extra: Rationale[] = [{ rule: 'E-10', values: { hard_per_week: hard.length } }];
      if (hs.steps.some((s) => s.kind === 'drill'))
        extra.push({ rule: 'E-15', values: { drill_min: DRILL_MINUTES } });
      workouts.push(mk(d, hs.type, hs.steps, extra));
      continue;
    }
    if (!easyDays.includes(d)) continue;
    if (recoveryDays.includes(d)) {
      const steps = recoveryRun(Math.min(recoveryM, cap), zones);
      workouts.push(
        mk(d, 'recovery', steps, [
          { rule: 'E-21', values: { min: Math.round(stepsSummary(steps).durationS / 60) } },
          { rule: 'E-06', values: { distance_m: runningDistance(steps), longest_30d_m: l30, cap_m: cap } },
        ]),
      );
      continue;
    }
    const dist = Math.min(perNormal, cap, easyCap.get(d) ?? cap);
    let type: WorkoutType = d === stridesDay ? 'strides' : d === progressionDay ? 'progression' : 'easy';
    const steps =
      type === 'strides'
        ? stridesRun(dist, zones)
        : type === 'progression'
          ? progressionRun(dist, zones)
          : easyRun(dist, zones);
    // Sesi terlalu pendek untuk segmen cepat: progressionRun mengembalikan easy biasa.
    if (type === 'progression' && steps.length === 1) type = 'easy';
    const extra: Rationale[] =
      type === 'progression' ? [{ rule: 'E-22', values: { fast_min: PROGRESSION_FAST_S / 60 } }] : [];
    workouts.push(
      mk(d, type, steps, [
        ...extra,
        { rule: 'E-06', values: { distance_m: runningDistance(steps), longest_30d_m: l30, cap_m: cap } },
      ]),
    );
  }

  // E-09 per minggu, ditempel ke latihan easy.
  const split = workouts.reduce(
    (acc, w) => {
      const s = intensitySplit(w.steps);
      return { e: acc.e + s.easy_s, h: acc.h + s.hard_s };
    },
    { e: 0, h: 0 },
  );
  const easyPct = Math.round((split.e / Math.max(1, split.e + split.h)) * 100);
  for (const w of workouts) {
    if (w.type === 'easy' || w.type === 'strides' || w.type === 'progression')
      w.rationale.unshift({ rule: 'E-09', values: { easy_pct: easyPct } });
  }

  // E-08 setelah pembulatan: long run maks porsi volume aktual.
  let volume = workouts.reduce((x, w) => x + w.targetDistanceM, 0);
  const long = workouts.find((w) => w.type === 'long');
  if (long && long.targetDistanceM > volume * share && long.targetDistanceM > MIN_EASY_M) {
    const others = volume - long.targetDistanceM;
    const steps = longRun(Math.max(MIN_EASY_M, Math.floor((others * share) / (1 - share))), zones);
    const dist = runningDistance(steps);
    long.steps = steps;
    long.targetDistanceM = dist;
    long.targetDurationS = stepsSummary(steps).durationS;
    for (const r of long.rationale) {
      if (r.rule === 'E-06' || r.rule === 'E-08') r.values.distance_m = dist;
    }
    volume = others + dist;
    const e08 = long.rationale.find((r) => r.rule === 'E-08');
    if (e08) {
      e08.values.week_volume_m = volume;
      e08.values.share_pct = Math.round((dist / volume) * 100);
    }
  }
  // Volume minggu = jarak rencana penuh (termasuk hari sebelum startDate di minggu 1).
  return { workouts, volume, hard: hard.length };
}

function buildPrediction(input: PlanInput, vdot: number): Prediction | null {
  const g = input.goal;
  if (g.distance === 'fitness') return null;
  if (g.baselineDistance && g.baselineTimeS)
    return predictRange(g.baselineDistance, g.baselineTimeS, g.distance);
  // "Saya tidak tahu": acuan 5K dari VDOT level, selalu "perkiraan kasar".
  const p = predictRange('5k', raceTimeFromVdot(vdot, 5000), g.distance);
  return { ...p, rough: true };
}

type PlanRationaleArgs = {
  input: PlanInput;
  weeks: number;
  phases: Phase[];
  summaries: WeekSummary[];
  workouts: GeneratedWorkout[];
  zones: PaceZones;
  vdot: number;
  prediction: Prediction | null;
  runWalkPlan: boolean;
  level: Level;
};

/** Rationale level plan (07 bagian 3.1). Urutan = urutan tampil di 1.8 (4 teratas). */
function planRationale(a: PlanRationaleArgs): Rationale[] {
  const out: Rationale[] = [];
  const count = (p: Phase) => a.phases.filter((x) => x === p).length;
  const firstLong = a.workouts.find((w) => w.type === 'long');
  const e06 = firstLong?.rationale.find((r) => r.rule === 'E-06');
  if (a.input.lightMode) out.push({ rule: 'E-12', values: {} });
  if (a.runWalkPlan) {
    const rw = a.workouts.find((w) => w.type === 'run_walk')?.rationale.find((r) => r.rule === 'E-14');
    if (rw) out.push(rw);
  }
  if (e06) out.push(e06);
  const w2 = a.summaries[1];
  const w1 = a.summaries[0]!;
  out.push({
    rule: 'E-05',
    values: {
      week_m: w2?.volumeM ?? w1.volumeM,
      pct: w2 ? Math.max(0, Math.round(((w2.volumeM - w1.volumeM) / Math.max(1, w1.volumeM)) * 100)) : 0,
    },
  });
  const split = a.workouts.reduce(
    (acc, w) => {
      const s = intensitySplit(w.steps);
      return { e: acc.e + s.easy_s, h: acc.h + s.hard_s };
    },
    { e: 0, h: 0 },
  );
  out.push({
    rule: 'E-09',
    values: { easy_pct: Math.round((split.e / Math.max(1, split.e + split.h)) * 100) },
  });
  if (count('taper') > 0) out.push({ rule: 'E-11', values: { pct: 50, weeks: count('taper') } });
  if (a.prediction && a.input.goal.baselineDistance && a.input.goal.baselineTimeS) {
    out.push({
      rule: 'E-01',
      values: {
        range_min_s: a.prediction.minS,
        range_max_s: a.prediction.maxS,
        likely_s: a.prediction.likelyS,
        baseline_s: a.input.goal.baselineTimeS,
      },
    });
  }
  out.push({
    rule: 'E-02',
    values: { vdot: a.vdot, easy_min_pace: a.zones.easy.min, easy_max_pace: a.zones.easy.max },
  });
  out.push({ rule: 'E-03', values: { weeks: a.weeks, distance_code: a.input.goal.distance } });
  out.push({
    rule: 'E-04',
    values: { base: count('base'), build: count('build'), peak: count('peak'), taper: count('taper') },
  });
  if (!a.input.lightMode && !a.runWalkPlan) {
    out.push({ rule: 'E-10', values: { hard_per_week: a.level === 'beginner' ? 1 : 2 } });
  }
  return out;
}
