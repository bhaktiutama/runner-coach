import type { GeneratedPlan, GeneratedWorkout, PlanInput } from '../../packages/training-engine/src/types';
import {
  addDays,
  daysBetween,
  HARD_TYPES,
  intensity,
  isRun,
  km,
  mondayOf,
  pct,
  runDistance,
  segments,
  totalSeconds,
  weekdayOf,
  WEEKDAY_ID,
  type AnyStep,
} from './calc';
import { DIST_M, expectedPrediction, expectedZones, LEVEL_VDOT, vdotOf, type RaceCode } from './daniels';

// Validator Lapisan 2. Setiap pemeriksaan ditulis dari bunyi spec (TRD 4.2, 07 bagian 3 dan 7,
// engine-review), memakai tanggal kalender, dan tidak memanggil fungsi generator.

export type Severity = 'kritis' | 'mayor' | 'minor';

export type CheckDef = {
  id: string;
  rule: string;
  title: string;
  severity: Severity;
  source: string;
  /** true = invariant usulan dokumen Plan Validity Testing, lebih ketat dari bunyi TRD. */
  proposed?: boolean;
};

export const CHECKS: CheckDef[] = [
  {
    id: 'E-01a',
    rule: 'E-01',
    title: 'Rentang prediksi = Riegel x 0,97-1,03 (5K-HM) atau [T, T+20 mnt] (FM)',
    severity: 'mayor',
    source: 'TRD 4.1, 07 E-O1',
  },
  {
    id: 'E-02a',
    rule: 'E-02',
    title: 'VDOT dari waktu acuan (atau 26/33 tanpa waktu)',
    severity: 'mayor',
    source: 'TRD 4.1, engine-review E-02',
  },
  {
    id: 'E-02b',
    rule: 'E-02',
    title: 'Zona pace E/M/T/I/R sesuai rumus Daniels dari VDOT (selisih <= 2 dtk/km)',
    severity: 'mayor',
    source: 'TRD 4.1, engine-review E-02',
  },
  {
    id: 'E-03a',
    rule: 'E-03',
    title: 'Jumlah minggu = default tanpa race, atau sampai minggu race (maks 52, lebih jauh ditolak)',
    severity: 'mayor',
    source: 'TRD 4.2, 07 bagian 7 baris Minggu race',
  },
  {
    id: 'E-03b',
    rule: 'E-03',
    title: 'Teks E-03 tidak menyebut "durasi umum" bila jumlah minggu beda dari default',
    severity: 'mayor',
    source: 'TRD 4.2, 07 3.2',
  },
  {
    id: 'E-03c',
    rule: 'E-03',
    title: 'Race lebih dekat dari minimum ditolak dengan alasan yang benar',
    severity: 'mayor',
    source: 'kode MIN_WEEKS, 03-APP-FLOW 1.3',
  },
  {
    id: 'E-04a',
    rule: 'E-04',
    title: 'Urutan fase Base, Build, Peak, Taper (Bugar tanpa Taper)',
    severity: 'mayor',
    source: 'TRD 4.2',
  },
  {
    id: 'E-05a',
    rule: 'E-05',
    title: 'Volume minggu naik maks 10% dari minggu non-cutback terakhir',
    severity: 'mayor',
    source: 'TRD 4.2',
  },
  {
    id: 'E-05b',
    rule: 'E-05',
    title: 'Volume minggu 1 tidak melebihi max(volume sekarang, lari terjauh, 4 km)',
    severity: 'mayor',
    source: '07 bagian 7 baris Volume awal',
  },
  {
    id: 'E-05c',
    rule: 'E-05',
    title:
      'Volume 7 hari bergulir maks 110% dari 7 hari bergulir tertinggi sebelumnya (di luar 14 hari terakhir sebelum race)',
    severity: 'minor',
    source: 'Plan Validity Testing, Lapisan 2',
    proposed: true,
  },
  {
    id: 'E-06a',
    rule: 'E-06',
    title: 'Setiap sesi maks 110% lari terjauh 30 hari (onboarding + plan yang terlihat)',
    severity: 'kritis',
    source: 'TRD 4.2, 07 3.5 no. 5',
  },
  {
    id: 'E-07a',
    rule: 'E-07',
    title: 'Tidak lebih dari 3 minggu non-cutback berturut-turut (di luar taper dan run-walk)',
    severity: 'mayor',
    source: 'TRD 4.2, 07 bagian 7',
  },
  {
    id: 'E-07b',
    rule: 'E-07',
    title: 'Minggu cutback turun 20-30% dari minggu non-cutback terakhir',
    severity: 'mayor',
    source: 'TRD 4.2',
  },
  {
    id: 'E-08a',
    rule: 'E-08',
    title: 'Long run maks porsi volume minggu (5K/10K/Bugar 30%, HM 35%, FM 45%)',
    severity: 'mayor',
    source: 'TRD 4.2',
  },
  {
    id: 'E-08b',
    rule: 'E-08',
    title: 'Long run maks 2 jam (5K/10K/Bugar), 2,5 jam (HM), 3 jam (FM)',
    severity: 'mayor',
    source: 'TRD 4.2',
  },
  {
    id: 'E-09a',
    rule: 'E-09',
    title:
      'Minggu dengan sesi berat: waktu easy minimal 75% (lebih banyak easy = lebih konservatif, tidak ditandai)',
    severity: 'minor',
    source: 'TRD 4.2 (~80%), ambang Plan Validity Testing',
    proposed: true,
  },
  {
    id: 'E-10a',
    rule: 'E-10',
    title:
      'Jumlah sesi berat per minggu sesuai fase dan level (Base 0, Build 1, Peak/Taper maks 2, pemula maks 1)',
    severity: 'kritis',
    source: 'TRD 4.2, engine-review E-10',
  },
  {
    id: 'E-10b',
    rule: 'E-10',
    title:
      'Tidak ada sesi berat sehari sebelum/sesudah sesi berat lain atau long run (berdasarkan tanggal, lintas minggu)',
    severity: 'kritis',
    source: 'TRD 4.2, engine-review E-10',
  },
  {
    id: 'E-11a',
    rule: 'E-11',
    title: 'Jendela taper 7 hari (dihitung mundur dari race) tidak melebihi puncak dan turun menuju race',
    severity: 'mayor',
    source: 'TRD 4.2 E-11 (v0.4, berbasis tanggal race)',
  },
  {
    id: 'E-11b',
    rule: 'E-11',
    title: 'Volume 7 hari sebelum race turun 40-60% dari minggu puncak',
    severity: 'mayor',
    source: 'TRD 4.2 E-11 (v0.4), 07 3.5 no. 6',
  },
  {
    id: 'E-11c',
    rule: 'E-11',
    title: 'Jumlah sesi kualitas minggu taper tidak berkurang dari minggu puncak (sejauh muat sebelum race)',
    severity: 'mayor',
    source: 'TRD 4.2, 07 3.5 no. 6',
  },
  {
    id: 'E-11d',
    rule: 'E-11',
    title: 'Long run dan sesi berat paling lambat 3 hari sebelum race',
    severity: 'mayor',
    source: '07 bagian 7 baris Minggu race',
  },
  {
    id: 'E-11e',
    rule: 'E-11',
    title: 'Tidak ada latihan pada atau sesudah hari race; plan berakhir di race',
    severity: 'mayor',
    source: '07 bagian 7 baris Minggu race',
  },
  {
    id: 'E-12a',
    rule: 'E-12',
    title: 'Mode ringan: tidak ada segmen tempo/interval sama sekali',
    severity: 'kritis',
    source: 'TRD 4.2',
  },
  {
    id: 'E-14a',
    rule: 'E-14',
    title: 'Run-walk hanya untuk pemula tanpa waktu acuan dengan lari terjauh < 3 km',
    severity: 'mayor',
    source: 'TRD 4.2, 07 E-O2',
  },
  {
    id: 'E-14b',
    rule: 'E-14',
    title: 'Menit lari run-walk naik maks 10% per minggu; blok lari maks 20 menit',
    severity: 'mayor',
    source: '07 E-O2',
  },
  {
    id: 'E-14c',
    rule: 'E-14',
    title:
      'Run-walk benar-benar naik: blok lari atau menit lari easy bertambah tiap minggu (di luar taper) sampai lari 20 menit',
    severity: 'mayor',
    source: '07 E-O2, TRD 4.2 E-14',
  },
  {
    id: 'E-15a',
    rule: 'E-15',
    title: 'Tempo/interval: drill 8-12 menit sesudah pemanasan, sebelum bagian kerja',
    severity: 'minor',
    source: 'TRD 4.2',
  },
  {
    id: 'E-21a',
    rule: 'E-21',
    title:
      'Recovery run maks 30 mnt, pace easy paling lambat + 0-30 dtk/km, sehari sesudah long run/sesi berat, syarat level',
    severity: 'minor',
    source: 'TRD 4.2',
  },
  {
    id: 'E-22a',
    rule: 'E-22',
    title:
      'Progression run hanya di Build bukan cutback, 10 mnt terakhir pace M, tidak bersebelahan dengan long run/sesi berat',
    severity: 'minor',
    source: 'TRD 4.2',
  },
  {
    id: 'RAT-a',
    rule: 'E-07',
    title: 'Angka E-07 (pct) = penurunan volume yang sebenarnya (selisih <= 2 poin)',
    severity: 'minor',
    source: '07 bagian 3.2 (template wajib menyebut angka yang dipakai)',
  },
  {
    id: 'RAT-b',
    rule: 'E-08',
    title:
      'Angka E-08 (week_volume_m, share_pct) = volume minggu dan porsi sebenarnya (selisih <= 2% / 2 poin)',
    severity: 'minor',
    source: '07 bagian 3',
  },
  {
    id: 'RAT-c',
    rule: 'E-06',
    title: 'Angka E-06 (distance_m, cap_m) = jarak sesi dan 110% lari terjauh',
    severity: 'minor',
    source: '07 bagian 3',
  },
  {
    id: 'RAT-d',
    rule: 'E-09',
    title: 'Angka E-09 (easy_pct) = porsi easy minggu itu (selisih <= 1 poin)',
    severity: 'minor',
    source: '07 bagian 3',
  },
  {
    id: 'RAT-e',
    rule: 'E-11',
    title: 'Angka E-11 (pct) = penurunan volume 7 hari sebelum race (selisih <= 5 poin)',
    severity: 'minor',
    source: '07 bagian 3',
    proposed: true,
  },
  {
    id: 'RAT-f',
    rule: 'E-05',
    title: 'Angka E-05 di layar 1.8 (week_m, pct) = minggu 2 dan kenaikan dari minggu 1 yang terlihat',
    severity: 'minor',
    source: '07 bagian 3',
  },
  {
    id: 'WAJ-a',
    rule: 'E-05',
    title: 'Easy run minimal 2 km',
    severity: 'minor',
    source: '07 bagian 7 baris Volume dan pembulatan',
  },
  {
    id: 'WAJ-b',
    rule: 'E-04',
    title: 'Tidak ada latihan sebelum tanggal mulai',
    severity: 'mayor',
    source: '07 bagian 7',
  },
  {
    id: 'WAJ-c',
    rule: 'E-04',
    title: 'Tidak ada 2 sesi lari di tanggal yang sama',
    severity: 'mayor',
    source: 'TRD 4.2 (satu latihan per hari lari)',
  },
  {
    id: 'WAJ-d',
    rule: 'E-04',
    title: 'Setiap latihan punya rationale; rationale plan memuat aturan wajib',
    severity: 'minor',
    source: '07 3.5 no. 2',
  },
  {
    id: 'WAJ-e',
    rule: 'E-04',
    title: 'Setiap placeholder template (ID dan EN) terisi oleh values',
    severity: 'minor',
    source: '07 3.5 no. 3',
  },
];

export type Failure = { check: string; scenario: string; date?: string; detail: string };
export type CheckTally = {
  evaluated: number;
  failed: number;
  failures: Failure[];
  scenEval: Set<string>;
  scenFail: Set<string>;
};
export type Tally = Record<string, CheckTally>;

export const newTally = (): Tally =>
  Object.fromEntries(
    CHECKS.map((c) => [
      c.id,
      { evaluated: 0, failed: 0, failures: [], scenEval: new Set<string>(), scenFail: new Set<string>() },
    ]),
  );

export const DEFAULT_WEEKS: Record<string, number> = { '5k': 8, '10k': 10, hm: 12, fm: 16, fitness: 8 };
const LONG_SHARE: Record<string, number> = { '5k': 0.3, '10k': 0.3, hm: 0.35, fm: 0.45, fitness: 0.3 };
const LONG_MAX_S: Record<string, number> = { '5k': 7200, '10k': 7200, hm: 9000, fm: 10800, fitness: 7200 };
const MIN_EASY_M = 2000;

type Catalog = Record<string, string>;

export type Ctx = { scenario: string; catalogs: { id: Catalog; en: Catalog } };

/** Level per 07 bagian 7: pilihan pengguna, atau volume < 10 km/minggu = pemula. */
export function levelOf(input: PlanInput): 'beginner' | 'recreational' {
  return input.goal.level ?? (input.goal.weeklyVolumeM < 10_000 ? 'beginner' : 'recreational');
}

const wdate = (w: GeneratedWorkout) => `${w.date} (${WEEKDAY_ID[weekdayOf(w.date)]})`;

export function validatePlan(input: PlanInput, plan: GeneratedPlan, tally: Tally, ctx: Ctx) {
  const g = input.goal;
  const level = levelOf(input);
  const race = g.distance === 'fitness' ? null : g.raceDate;
  const runs = plan.workouts.filter((w) => isRun(w.type)).sort((a, b) => a.date.localeCompare(b.date));
  const dist = new Map(runs.map((w) => [w, runDistance(w.steps as AnyStep[])]));
  const isRunWalkPlan = runs.some((w) => w.type === 'run_walk');

  const check = (id: string, ok: boolean, detail: () => string, date?: string) => {
    const t = tally[id]!;
    t.evaluated++;
    t.scenEval.add(ctx.scenario);
    if (!ok) {
      t.failed++;
      t.scenFail.add(ctx.scenario);
      if (t.failures.filter((f) => f.scenario === ctx.scenario).length < 3 && t.failures.length < 600)
        t.failures.push({ check: id, scenario: ctx.scenario, date, detail: detail() });
    }
  };

  // ---- E-01 / E-02 ----
  if (plan.prediction && g.distance !== 'fitness') {
    if (g.baselineDistance && g.baselineTimeS) {
      const e = expectedPrediction(g.baselineDistance as RaceCode, g.baselineTimeS, g.distance as RaceCode);
      const p = plan.prediction;
      const ok =
        Math.abs(p.likelyS - e.likely) <= 2 && Math.abs(p.minS - e.min) <= 2 && Math.abs(p.maxS - e.max) <= 2;
      check(
        'E-01a',
        ok,
        () =>
          `engine ${p.minS}-${p.maxS} dtk (paling mungkin ${p.likelyS}), harapan ${Math.round(e.min)}-${Math.round(e.max)} (${Math.round(e.likely)})`,
      );
    } else {
      check(
        'E-01a',
        plan.prediction.rough === true,
        () => 'tanpa waktu acuan, prediksi harus berlabel "perkiraan kasar"',
      );
    }
  }
  const expVdot =
    input.vdot ??
    (g.baselineDistance && g.baselineTimeS
      ? vdotOf(DIST_M[g.baselineDistance as RaceCode], g.baselineTimeS)
      : LEVEL_VDOT[g.level ?? level]);
  check(
    'E-02a',
    Math.abs(plan.vdot - expVdot) <= 0.051,
    () => `VDOT engine ${plan.vdot}, harapan ${expVdot.toFixed(2)}`,
  );
  const ez = expectedZones(plan.vdot);
  const zoneBad: string[] = [];
  for (const k of ['easy', 'threshold', 'interval', 'repetition', 'marathon'] as const) {
    const a = plan.zones[k];
    const e = ez[k];
    if (Math.abs(a.min - e.min) > 2 || Math.abs(a.max - e.max) > 2)
      zoneBad.push(`${k} ${a.min}-${a.max} vs ${Math.round(e.min)}-${Math.round(e.max)}`);
  }
  check('E-02b', zoneBad.length === 0, () => zoneBad.join('; '));

  // ---- E-03 ----
  const expWeeks = (() => {
    if (!race) return DEFAULT_WEEKS[g.distance]!;
    const w = daysBetween(mondayOf(input.startDate), mondayOf(race)) / 7 + (weekdayOf(race) >= 2 ? 1 : 0);
    return w;
  })();
  check(
    'E-03a',
    plan.weeks.length === expWeeks,
    () => `engine ${plan.weeks.length} minggu, harapan ${expWeeks}`,
  );
  const e03 = plan.rationale.find((r) => r.rule === 'E-03');
  if (e03) {
    // Template yang dipakai app: varian `rule.E-03.<scope>` bila engine mengisi scope.
    const key = typeof e03.values.scope === 'string' ? `rule.E-03.${e03.values.scope}` : 'rule.E-03';
    const tpl = ctx.catalogs.id[key] ?? ctx.catalogs.id['rule.E-03'] ?? '';
    // Klaim "durasi {weeks} ini = durasi umum" hanya boleh bila jumlah minggu = default.
    const claimsCommon = /\{weeks\} minggu, durasi umum/i.test(tpl);
    const defaultOk =
      e03.values.default_weeks == null || Number(e03.values.default_weeks) === DEFAULT_WEEKS[g.distance];
    check(
      'E-03b',
      !(claimsCommon && plan.weeks.length !== DEFAULT_WEEKS[g.distance]) && defaultOk,
      () =>
        `plan ${plan.weeks.length} minggu (default ${g.distance}: ${DEFAULT_WEEKS[g.distance]}), template ${key}: "${tpl}"`,
    );
  }

  // ---- E-04 ----
  const order = { base: 0, build: 1, peak: 2, taper: 3, return: -1 } as Record<string, number>;
  const phases = plan.weeks.map((w) => w.phase);
  const mono = phases.every((p, i) => i === 0 || order[p]! >= order[phases[i - 1]!]!);
  const taperOk = g.distance === 'fitness' ? !phases.includes('taper') : phases.at(-1) === 'taper';
  check('E-04a', mono && taperOk && phases[0] === 'base', () => `urutan fase: ${phases.join(', ')}`);

  // ---- E-05 ----
  const startVol = Math.max(g.weeklyVolumeM, g.longestRunM, 4000);
  check(
    'E-05b',
    plan.weeks[0]!.volumeM <= startVol,
    () => `minggu 1 ${km(plan.weeks[0]!.volumeM)} km > ${km(startVol)} km`,
  );
  let lastFull = plan.weeks[0]!.volumeM;
  for (const w of plan.weeks.slice(1)) {
    if (w.phase === 'taper' || w.cutback) continue;
    check(
      'E-05a',
      w.volumeM <= lastFull * 1.1 + 1,
      () =>
        `minggu ${w.weekIndex}: ${km(w.volumeM)} km = +${pct(w.volumeM / lastFull - 1)} dari ${km(lastFull)} km`,
      w.startDate,
    );
    lastFull = w.volumeM;
  }
  // 7 hari bergulir (usulan): mulai hari ke-14 plan, dibanding maksimum jendela yang berakhir >= 7 hari sebelumnya.
  const byDate = new Map<string, number>();
  for (const w of runs) byDate.set(w.date, (byDate.get(w.date) ?? 0) + dist.get(w)!);
  const lastDate = runs.at(-1)?.date;
  if (lastDate) {
    const roll = (d: string) => {
      let s = 0;
      for (let i = 0; i < 7; i++) s += byDate.get(addDays(d, -i)) ?? 0;
      return s;
    };
    const first = addDays(input.startDate, 6);
    const rolls: [string, number][] = [];
    for (let d = first; d <= lastDate; d = addDays(d, 1)) rolls.push([d, roll(d)]);
    let worst: { d: string; r: number; p: number } | null = null;
    for (let i = 7; i < rolls.length; i++) {
      // 14 hari terakhir sebelum race dinilai oleh E-11b (taper), bukan di sini.
      if (race && daysBetween(rolls[i]![0], race) <= 14) continue;
      const prior = Math.max(...rolls.slice(0, i - 6).map((x) => x[1]), startVol);
      const [d, r] = rolls[i]!;
      if (r > prior * 1.1 + 100 && (!worst || r / prior > worst.r / worst.p)) worst = { d, r, p: prior };
    }
    check(
      'E-05c',
      !worst,
      () =>
        `7 hari s.d. ${worst!.d}: ${km(worst!.r)} km = ${pct(worst!.r / worst!.p)} dari puncak 7 hari sebelumnya (${km(worst!.p)} km)`,
      worst?.d,
    );
  }

  // ---- E-06 ----
  for (const w of runs) {
    let longest = daysBetween(input.startDate, w.date) <= 30 ? g.longestRunM : 0;
    for (const o of runs) {
      const d = daysBetween(o.date, w.date);
      if (d > 0 && d <= 30) longest = Math.max(longest, dist.get(o)!);
    }
    const cap = Math.floor(longest * 1.1);
    check(
      'E-06a',
      dist.get(w)! <= cap + 1,
      () =>
        `${w.type} ${wdate(w)} ${km(dist.get(w)!)} km > batas ${km(cap)} km (terjauh 30 hari ${km(longest)} km)`,
      w.date,
    );
    const r = w.rationale.find((x) => x.rule === 'E-06');
    if (r) {
      const ok =
        Math.abs(Number(r.values.distance_m) - dist.get(w)!) <= 2 &&
        Number(r.values.cap_m) === Math.floor(Number(r.values.longest_30d_m) * 1.1);
      check(
        'RAT-c',
        ok,
        () => `${wdate(w)}: values ${JSON.stringify(r.values)}, jarak sebenarnya ${dist.get(w)} m`,
        w.date,
      );
    }
  }

  // ---- Per minggu kalender ----
  const weeks = new Map<number, GeneratedWorkout[]>();
  for (const w of runs) weeks.set(w.weekIndex, [...(weeks.get(w.weekIndex) ?? []), w]);
  const summary = new Map(plan.weeks.map((w) => [w.weekIndex, w]));

  // E-07
  let streak = 0;
  let lastNonCut = plan.weeks[0]!.volumeM;
  for (const w of plan.weeks) {
    const rw = (weeks.get(w.weekIndex) ?? []).some((x) => x.type === 'run_walk');
    if (w.phase === 'taper' || rw) {
      streak = 0;
      continue;
    }
    // Cutback yang ekornya masuk jendela taper (berbasis tanggal race) ikut diturunkan taper; E-11 menilai.
    const inTaperWindow =
      !!race &&
      daysBetween(addDays(w.startDate, 6), race) <= 7 * plan.weeks.filter((x) => x.phase === 'taper').length;
    if (w.cutback && inTaperWindow) {
      streak = 0;
      continue;
    }
    if (w.cutback) {
      const drop = 1 - w.volumeM / lastNonCut;
      check(
        'E-07b',
        drop >= 0.195 && drop <= 0.305,
        () => `minggu ${w.weekIndex}: turun ${pct(drop)} dari ${km(lastNonCut)} km`,
        w.startDate,
      );
      const r = (weeks.get(w.weekIndex) ?? []).flatMap((x) => x.rationale).find((x) => x.rule === 'E-07');
      if (r)
        check(
          'RAT-a',
          Math.abs(Number(r.values.pct) - drop * 100) <= 2,
          () => `minggu ${w.weekIndex}: teks "turun ${r.values.pct}%", nyatanya ${pct(drop)}`,
          w.startDate,
        );
      streak = 0;
    } else {
      streak++;
      lastNonCut = w.volumeM;
    }
    check(
      'E-07a',
      streak <= 3,
      () => `minggu ${w.weekIndex}: ${streak} minggu non-cutback berturut-turut`,
      w.startDate,
    );
  }

  // E-08, E-09, E-10a, E-21, E-22, WAJ-a
  const hardMaxByPhase = (phase: string, sessions: number) => {
    if (input.lightMode) return 0;
    let h = phase === 'base' ? 0 : phase === 'build' ? 1 : level === 'beginner' || sessions < 4 ? 1 : 2;
    if (g.distance === 'fitness') h = phase === 'base' ? 0 : 1;
    if (level === 'beginner') h = Math.min(h, 1);
    return h;
  };
  for (const [wi, ws] of weeks) {
    const s = summary.get(wi)!;
    const vol = s.volumeM;
    for (const w of ws.filter((x) => x.type === 'long')) {
      const d = dist.get(w)!;
      const share = LONG_SHARE[g.distance]!;
      check(
        'E-08a',
        d <= Math.ceil(vol * share) + 1 || d <= MIN_EASY_M,
        () => `${wdate(w)}: long ${km(d)} km = ${pct(d / vol)} dari ${km(vol)} km (batas ${pct(share, 0)})`,
        w.date,
      );
      check(
        'E-08b',
        totalSeconds(w.steps as AnyStep[]) <= LONG_MAX_S[g.distance]!,
        () => `${wdate(w)}: ${Math.round(totalSeconds(w.steps as AnyStep[]) / 60)} mnt`,
        w.date,
      );
      const r = w.rationale.find((x) => x.rule === 'E-08');
      if (r)
        check(
          'RAT-b',
          Math.abs(Number(r.values.week_volume_m) - vol) <= Math.max(100, vol * 0.02) &&
            Math.abs(Number(r.values.share_pct) - (d / vol) * 100) <= 2,
          () =>
            `${wdate(w)}: teks volume ${km(Number(r.values.week_volume_m))} km porsi ${r.values.share_pct}%, nyatanya ${km(vol)} km porsi ${pct(d / vol)}`,
          w.date,
        );
    }
    const hard = ws.filter((x) => HARD_TYPES.has(x.type));
    const split = ws.reduce(
      (a, x) => {
        const i = intensity(x.steps as AnyStep[]);
        return { e: a.e + i.easyS, h: a.h + i.hardS };
      },
      { e: 0, h: 0 },
    );
    const easyShare = split.e / Math.max(1, split.e + split.h);
    if (hard.length > 0)
      check(
        'E-09a',
        easyShare >= 0.75,
        () => `minggu ${wi} (${s.phase}): easy ${pct(easyShare)}`,
        s.startDate,
      );
    const r9 = ws.flatMap((x) => x.rationale).find((x) => x.rule === 'E-09');
    if (r9)
      check(
        'RAT-d',
        Math.abs(Number(r9.values.easy_pct) - easyShare * 100) <= 1,
        () => `minggu ${wi}: teks ${r9.values.easy_pct}%, nyatanya ${pct(easyShare)}`,
        s.startDate,
      );
    const maxHard = hardMaxByPhase(s.phase, input.availableDays.length);
    check(
      'E-10a',
      hard.length <= maxHard,
      () =>
        `minggu ${wi} (${s.phase}, ${level === 'beginner' ? 'pemula' : 'rekreasional'}, ${input.availableDays.length} hari tersedia): ${hard.length} sesi berat, maks ${maxHard}`,
      s.startDate,
    );

    for (const w of ws) {
      if (w.type === 'easy')
        check(
          'WAJ-a',
          dist.get(w)! >= MIN_EASY_M - 1,
          () => `${wdate(w)}: easy ${km(dist.get(w)!, 3)} km`,
          w.date,
        );
      if (w.type === 'recovery') {
        const segs = segments(w.steps as AnyStep[]);
        const prev = ws.find((x) => daysBetween(x.date, w.date) === 1);
        const ok =
          totalSeconds(w.steps as AnyStep[]) <= 1800 &&
          segs.every(
            (x) => !x.pace || (x.pace.min === plan.zones.easy.max && x.pace.max === plan.zones.easy.max + 30),
          ) &&
          !!prev &&
          (prev.type === 'long' || HARD_TYPES.has(prev.type)) &&
          level === 'recreational' &&
          !input.lightMode &&
          input.availableDays.length >= 5;
        check(
          'E-21a',
          ok,
          () =>
            `${wdate(w)}: ${Math.round(totalSeconds(w.steps as AnyStep[]) / 60)} mnt, hari sebelumnya ${prev?.type ?? 'tidak ada lari'}`,
          w.date,
        );
      }
      if (w.type === 'progression') {
        const segs = segments(w.steps as AnyStep[]);
        const last = segs.at(-1)!;
        const near = ws.some(
          (x) => (x.type === 'long' || HARD_TYPES.has(x.type)) && Math.abs(daysBetween(x.date, w.date)) === 1,
        );
        const ok =
          s.phase === 'build' &&
          !s.cutback &&
          level === 'recreational' &&
          last.durationS === 600 &&
          !!last.pace &&
          last.pace.min === plan.zones.marathon.min &&
          !near;
        check(
          'E-22a',
          ok,
          () =>
            `${wdate(w)}: fase ${s.phase}${s.cutback ? ' cutback' : ''}, segmen akhir ${last.durationS} dtk, bersebelahan sesi kunci: ${near ? 'ya' : 'tidak'}`,
          w.date,
        );
      }
      if (HARD_TYPES.has(w.type) && !input.lightMode) {
        const st = w.steps as AnyStep[];
        const firstDrill = st.findIndex((x) => x.kind === 'drill');
        const firstWork = st.findIndex((x) => x.kind === 'work' || x.kind === 'repeat');
        const drillMin = st.filter((x) => x.kind === 'drill').reduce((a, x) => a + (x.sets ?? 0), 0);
        const ok =
          st[0]?.kind === 'warmup' &&
          firstDrill === 1 &&
          firstWork > firstDrill &&
          drillMin >= 8 &&
          drillMin <= 12;
        check(
          'E-15a',
          ok,
          () => `${wdate(w)}: urutan ${st.map((x) => x.kind).join(' > ')}, drill ${drillMin} mnt`,
          w.date,
        );
      }
    }
  }

  // ---- E-10b: berdasarkan tanggal, lintas minggu ----
  for (const w of runs.filter((x) => HARD_TYPES.has(x.type))) {
    const n = runs.find(
      (o) =>
        o !== w &&
        (o.type === 'long' || HARD_TYPES.has(o.type)) &&
        Math.abs(daysBetween(o.date, w.date)) === 1,
    );
    check('E-10b', !n, () => `${w.type} ${wdate(w)} bersebelahan dengan ${n!.type} ${wdate(n!)}`, w.date);
  }

  // ---- E-11 ----
  if (race) {
    const nonTaper = plan.weeks.filter((w) => w.phase !== 'taper');
    const peak = Math.max(...nonTaper.map((w) => w.volumeM));
    // Jendela k = hari ke-(7k-6) s.d. ke-7k sebelum race; k = 1 paling dekat race.
    const nTaper = plan.weeks.filter((w) => w.phase === 'taper').length;
    if (nTaper > 1) {
      const winSum = (k: number) =>
        runs
          .filter((w) => {
            const d = daysBetween(w.date, race);
            return d >= 7 * (k - 1) + 1 && d <= 7 * k;
          })
          .reduce((a, w) => a + dist.get(w)!, 0);
      const sums = Array.from({ length: nTaper }, (_, i) => winSum(nTaper - i));
      const ok = sums.every((v, i) => v <= peak * 1.02 && (i === 0 || v <= sums[i - 1]! * 1.05));
      check(
        'E-11a',
        ok,
        () =>
          `jendela taper (jauh ke dekat): ${sums.map((v) => `${km(v)} km`).join(', ')}; puncak ${km(peak)} km`,
        race,
      );
    }
    const pre = runs.filter((w) => {
      const d = daysBetween(w.date, race);
      return d >= 1 && d <= 7;
    });
    const preSum = pre.reduce((a, w) => a + dist.get(w)!, 0);
    const preDrop = 1 - preSum / peak;
    check(
      'E-11b',
      preDrop >= 0.4 && preDrop <= 0.6,
      () =>
        `7 hari sebelum race (${WEEKDAY_ID[weekdayOf(race)]} ${race}): ${km(preSum)} km = ${pct(preSum / peak)} dari puncak ${km(peak)} km`,
      race,
    );
    // Angka di layar 1.8 (rationale plan) = penurunan 7 hari terakhir sebelum race.
    const r11 = plan.rationale.find((x) => x.rule === 'E-11');
    if (r11)
      check(
        'RAT-e',
        Math.abs(Number(r11.values.pct) - preDrop * 100) <= 5,
        () => `teks "volume turun ${r11.values.pct}%", 7 hari sebelum race turun ${pct(preDrop)}`,
        race,
      );
    if (!input.lightMode && !isRunWalkPlan && g.distance !== 'fitness') {
      const peakWeeks = plan.weeks.filter((w) => w.phase === 'peak' && !w.cutback);
      const peakQ = Math.max(
        0,
        ...peakWeeks.map((w) => (weeks.get(w.weekIndex) ?? []).filter((x) => HARD_TYPES.has(x.type)).length),
      );
      // Per minggu kalender taper. Harapan = min(sesi kualitas minggu puncak, jumlah maksimum yang
      // muat di minggu itu: hari tersedia, >= 3 hari sebelum race (E-11d), bukan hari long run dan
      // tidak sehari sebelum/sesudah long run (E-10), tidak bersebelahan satu sama lain).
      const longDates = new Set(runs.filter((x) => x.type === 'long').map((x) => x.date));
      for (const tw of plan.weeks.filter((w) => w.phase === 'taper')) {
        const days = Array.from({ length: 7 }, (_, i) => addDays(tw.startDate, i)).filter(
          (d) => d >= input.startDate && d < race,
        );
        const q = runs.filter((x) => HARD_TYPES.has(x.type) && days.includes(x.date)).length;
        const cand = days.filter(
          (d) =>
            input.availableDays.includes(weekdayOf(d)) &&
            daysBetween(d, race) >= 3 &&
            !longDates.has(d) &&
            !longDates.has(addDays(d, -1)) &&
            !longDates.has(addDays(d, 1)),
        );
        let feasible = 0;
        let last: string | null = null;
        for (const d of cand) {
          if (last && daysBetween(last, d) <= 1) continue;
          feasible++;
          last = d;
        }
        const need = Math.min(peakQ, feasible);
        check(
          'E-11c',
          q >= need,
          () =>
            `minggu taper ${tw.weekIndex}: ${q} sesi kualitas, harapan ${need} (puncak ${peakQ}, muat ${feasible})`,
          tw.startDate,
        );
      }
    }
    const late = runs.filter(
      (x) =>
        (x.type === 'long' || HARD_TYPES.has(x.type)) &&
        daysBetween(x.date, race) >= 0 &&
        daysBetween(x.date, race) < 3,
    );
    check(
      'E-11d',
      late.length === 0,
      () =>
        late.map((w) => `${w.type} ${wdate(w)}, ${daysBetween(w.date, race)} hari sebelum race`).join('; '),
      late[0]?.date,
    );
    const after = runs.filter((w) => w.date >= race);
    check(
      'E-11e',
      after.length === 0 && plan.endDate === race,
      () =>
        after.length
          ? `${after.length} latihan pada/sesudah race, pertama ${after[0]!.date}`
          : `plan berakhir ${plan.endDate}, race ${race}`,
      race,
    );
    if (after.length === 0 && runs.length) {
      const gap = daysBetween(runs.at(-1)!.date, race);
      if (gap > 7)
        check(
          'E-11e',
          false,
          () =>
            `latihan terakhir ${runs.at(-1)!.date}, ${gap} hari sebelum race ${race}: plan berhenti jauh sebelum race`,
          race,
        );
    }
  }

  // ---- E-12, E-14 ----
  if (input.lightMode) {
    const bad = runs.filter((w) =>
      segments(w.steps as AnyStep[]).some((x) => x.zone === 'tempo' || x.zone === 'interval'),
    );
    check(
      'E-12a',
      bad.length === 0,
      () => `${bad.length} latihan bersegmen cepat, pertama ${bad[0]!.type} ${wdate(bad[0]!)}`,
    );
  }
  const rwEligible = g.level === 'beginner' && !g.baselineTimeS && g.longestRunM < 3000;
  check(
    'E-14a',
    isRunWalkPlan === rwEligible,
    () =>
      `run-walk ${isRunWalkPlan ? 'ada' : 'tidak ada'}, syarat ${rwEligible ? 'terpenuhi' : 'tidak terpenuhi'}`,
  );
  if (isRunWalkPlan) {
    let prevRun = 0;
    let prevBlock = 0;
    let prevEasyMin = 0;
    for (const [wi, ws] of [...weeks].sort((a, b) => a[0] - b[0])) {
      const rw = ws.filter((x) => x.type === 'run_walk');
      if (!rw.length) continue;
      const runMin = Math.max(
        ...rw.map((x) =>
          segments(x.steps as AnyStep[])
            .filter((s) => s.kind === 'work' && !s.walk)
            .reduce((a, s) => a + s.durationS, 0),
        ),
      );
      const block = Math.max(
        ...rw.flatMap((x) =>
          segments(x.steps as AnyStep[])
            .filter((s) => s.kind === 'work' && !s.walk)
            .map((s) => s.durationS),
        ),
      );
      const s = summary.get(wi)!;
      const ok = (prevRun === 0 || s.phase === 'taper' || runMin <= prevRun * 1.1 + 1) && block <= 1200;
      check(
        'E-14b',
        ok,
        () =>
          `minggu ${wi}: menit lari ${Math.round(runMin / 60)} (sebelumnya ${Math.round(prevRun / 60)}), blok ${block} dtk`,
        s.startDate,
      );
      if (s.phase !== 'taper') {
        const easy = rw.map((x) =>
          segments(x.steps as AnyStep[])
            .filter((q) => q.kind === 'work' && !q.walk)
            .reduce((a, q) => a + q.durationS, 0),
        );
        const easyMin = Math.min(...easy);
        // Minggu pertama yang terlihat bisa sebagian; dibanding mulai minggu kedua.
        if (prevBlock > 0 && prevBlock < 1200)
          check(
            'E-14c',
            block > prevBlock || easyMin > prevEasyMin,
            () =>
              `minggu ${wi}: blok ${block} dtk dan lari easy ${easyMin} dtk sama dengan minggu sebelumnya`,
            s.startDate,
          );
        prevBlock = block;
        prevEasyMin = easyMin;
        prevRun = runMin;
      }
    }
  }

  // ---- WAJ ----
  const early = plan.workouts.filter((w) => w.date < input.startDate);
  check('WAJ-b', early.length === 0, () => `${early.length} latihan sebelum ${input.startDate}`);
  const dup = runs.filter((w, i) => i > 0 && runs[i - 1]!.date === w.date);
  check('WAJ-c', dup.length === 0, () => `tanggal ganda: ${dup.map((w) => w.date).join(', ')}`);
  const noRat = plan.workouts.filter((w) => w.type !== 'rest' && w.rationale.length === 0);
  const planRules = new Set(plan.rationale.map((r) => r.rule));
  const need = [
    'E-03',
    'E-04',
    'E-05',
    'E-09',
    ...(input.lightMode ? ['E-12'] : []),
    ...(race ? ['E-11'] : []),
  ];
  const missing = need.filter((r) => !planRules.has(r as `E-${string}`));
  if (!planRules.has('E-01') && !planRules.has('E-02')) missing.push('E-01/E-02');
  check(
    'WAJ-d',
    noRat.length === 0 && missing.length === 0,
    () => `${noRat.length} latihan tanpa rationale; rationale plan tanpa ${missing.join(', ') || '-'}`,
  );
  const unfilled: string[] = [];
  for (const r of [...plan.rationale, ...plan.workouts.flatMap((w) => w.rationale)]) {
    for (const [lang, cat] of Object.entries(ctx.catalogs)) {
      const scoped = typeof r.values.scope === 'string' ? cat[`rule.${r.rule}.${r.values.scope}`] : undefined;
      const tpl = scoped ?? cat[`rule.${r.rule}`];
      if (!tpl) {
        unfilled.push(`${lang} ${r.rule}: template tidak ada`);
        continue;
      }
      for (const m of tpl.matchAll(/\{(\w+)\}/g))
        if (!(m[1]! in r.values)) unfilled.push(`${lang} ${r.rule}: {${m[1]}}`);
    }
  }
  check('WAJ-e', unfilled.length === 0, () => [...new Set(unfilled)].slice(0, 5).join('; '));

  // RAT-f: E-05 tingkat plan dibanding minggu yang terlihat.
  const e05 = plan.rationale.find((r) => r.rule === 'E-05');
  const w1 = plan.weeks[0];
  const w2 = plan.weeks[1];
  if (e05 && w1 && w2) {
    const vis1 = (weeks.get(1) ?? []).reduce((a, w) => a + dist.get(w)!, 0);
    const shown = Number(e05.values.pct);
    const realPct = vis1 > 0 ? (w2.volumeM / vis1 - 1) * 100 : NaN;
    check(
      'RAT-f',
      Number(e05.values.week_m) === w2.volumeM &&
        (Math.abs(vis1 - w1.volumeM) <= 50 || Math.abs(shown - realPct) <= 2),
      () =>
        `teks: minggu 2 ${km(Number(e05.values.week_m))} km naik ${shown}% dari minggu lalu; minggu 1 yang terlihat hanya ${km(vis1)} km (volume hitungan ${km(w1.volumeM)} km termasuk hari sebelum tanggal mulai)`,
    );
  }
}

export const workoutDistance = (w: GeneratedWorkout) => runDistance(w.steps as AnyStep[]);
