import type { Weekday } from '../../packages/training-engine/src/dates';
import type { GoalDistance, PlanInput } from '../../packages/training-engine/src/types';
import { addDays, mondayOf, weekdayOf } from './calc';

// Matriks skenario Lapisan 2 (dokumen Plan Validity Testing, bagian Matriks skenario).
// Deterministik: PRNG ber-seed tetap, jadi setiap run menghasilkan skenario yang sama persis.

export type Scenario = {
  id: string;
  label: string;
  group: 'persona' | 'pairwise' | 'penuh';
  input: PlanInput;
  /** Jumlah minggu yang diminta (sebelum batas MIN/MAX engine). null = tanpa race. */
  weeksAsked: number | null;
};

/** Senin acuan; hari mulai lain = acuan + 0..6. */
export const BASE_MONDAY = '2026-11-02';

export const MIN_WEEKS: Record<GoalDistance, number> = { '5k': 4, '10k': 5, hm: 6, fm: 8, fitness: 8 };
export const DEFAULT_WEEKS: Record<GoalDistance, number> = { '5k': 8, '10k': 10, hm: 12, fm: 16, fitness: 8 };

/** Tanggal race supaya plan berjumlah `weeks` minggu (07 bagian 7: race Senin/Selasa tidak dihitung). */
export function raceFor(start: string, weeks: number, raceWd: number): string {
  const counts = raceWd >= 2 ? 1 : 0;
  return addDays(mondayOf(start), 7 * (weeks - counts) + raceWd);
}

type Profile = { key: string; label: string; goal: Omit<PlanInput['goal'], 'distance' | 'raceDate'> };

export const PROFILES: Profile[] = [
  {
    key: 'rw',
    label: 'pemula run-walk',
    goal: {
      level: 'beginner',
      baselineDistance: null,
      baselineTimeS: null,
      weeklyVolumeM: 0,
      longestRunM: 2000,
    },
  },
  {
    key: 'beg',
    label: 'pemula',
    goal: {
      level: 'beginner',
      baselineDistance: null,
      baselineTimeS: null,
      weeklyVolumeM: 6000,
      longestRunM: 3000,
    },
  },
  {
    key: 'recu',
    label: 'rekreasional tanpa waktu',
    goal: {
      level: 'recreational',
      baselineDistance: null,
      baselineTimeS: null,
      weeklyVolumeM: 15000,
      longestRunM: 5000,
    },
  },
  {
    key: '5k',
    label: '5K 32:30, 15 km/mgg, terjauh 7 km',
    goal: {
      level: null,
      baselineDistance: '5k',
      baselineTimeS: 1950,
      weeklyVolumeM: 15000,
      longestRunM: 7000,
    },
  },
  {
    key: '10k',
    label: '10K 60:00, 30 km/mgg, terjauh 10 km',
    goal: {
      level: null,
      baselineDistance: '10k',
      baselineTimeS: 3600,
      weeklyVolumeM: 30000,
      longestRunM: 10000,
    },
  },
  {
    key: 'hm',
    label: 'HM 2:10, 45 km/mgg, terjauh 12 km',
    goal: {
      level: null,
      baselineDistance: 'hm',
      baselineTimeS: 7800,
      weeklyVolumeM: 45000,
      longestRunM: 12000,
    },
  },
  {
    key: 'hi',
    label: '10K 45:00, 60 km/mgg, terjauh 20 km',
    goal: {
      level: null,
      baselineDistance: '10k',
      baselineTimeS: 2700,
      weeklyVolumeM: 60000,
      longestRunM: 20000,
    },
  },
];

/** Pola hari tersedia (0 = Senin). Hari long run = elemen terakhir yang 5/6. */
export const DAY_PATTERNS: { key: string; days: Weekday[]; long: Weekday }[] = [
  { key: '3-sela', days: [1, 3, 6], long: 6 },
  { key: '3-urut', days: [3, 4, 5], long: 5 },
  { key: '4-sela', days: [0, 2, 4, 6], long: 6 },
  { key: '4-urut', days: [0, 1, 2, 5], long: 5 },
  { key: '5-sela', days: [0, 1, 3, 4, 6], long: 6 },
  { key: '5-urut', days: [0, 1, 2, 3, 5], long: 5 },
  { key: '6-minggu', days: [0, 1, 2, 3, 4, 6], long: 6 },
  { key: '6-sabtu', days: [0, 1, 2, 3, 4, 5], long: 5 },
];

const TARGETS: GoalDistance[] = ['5k', '10k', 'hm', 'fm', 'fitness'];
const WEEK_OPTS = ['min', 'default', 'default+6', '30', '34'] as const;
type WeekOpt = (typeof WEEK_OPTS)[number];

const weeksFor = (t: GoalDistance, o: WeekOpt) =>
  o === 'min'
    ? MIN_WEEKS[t]
    : o === 'default'
      ? DEFAULT_WEEKS[t]
      : o === 'default+6'
        ? DEFAULT_WEEKS[t] + 6
        : Number(o);

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Covering array 2-arah (pairwise) sederhana, greedy, seed tetap. */
function pairwise(sizes: number[], seed = 20261102): number[][] {
  const rnd = mulberry32(seed);
  const uncovered = new Set<string>();
  for (let a = 0; a < sizes.length; a++)
    for (let b = a + 1; b < sizes.length; b++)
      for (let i = 0; i < sizes[a]!; i++)
        for (let j = 0; j < sizes[b]!; j++) uncovered.add(`${a}:${i}|${b}:${j}`);
  const rows: number[][] = [];
  const gain = (row: number[]) => {
    let n = 0;
    for (let a = 0; a < row.length; a++)
      for (let b = a + 1; b < row.length; b++) if (uncovered.has(`${a}:${row[a]}|${b}:${row[b]}`)) n++;
    return n;
  };
  while (uncovered.size > 0) {
    let best: number[] = [];
    let bestGain = -1;
    for (let c = 0; c < 60; c++) {
      const row = sizes.map((s) => Math.floor(rnd() * s));
      // Paksa satu pasangan yang belum tertutup supaya selalu ada kemajuan.
      const first = uncovered.values().next().value as string;
      const [[a, i], [b, j]] = first.split('|').map((x) => x.split(':').map(Number)) as [
        [number, number],
        [number, number],
      ];
      row[a] = i;
      row[b] = j;
      const gn = gain(row);
      if (gn > bestGain) {
        bestGain = gn;
        best = row;
      }
    }
    for (let a = 0; a < best.length; a++)
      for (let b = a + 1; b < best.length; b++) uncovered.delete(`${a}:${best[a]}|${b}:${best[b]}`);
    rows.push(best);
  }
  return rows;
}

function makeInput(
  t: GoalDistance,
  p: Profile,
  dp: (typeof DAY_PATTERNS)[number],
  startWd: number,
  raceWd: number,
  weeks: number | null,
  light: boolean,
  strength: boolean,
  vdot?: number,
): PlanInput {
  const start = addDays(BASE_MONDAY, startWd);
  return {
    goal: {
      distance: t,
      raceDate: t === 'fitness' || weeks == null ? null : raceFor(start, weeks, raceWd),
      ...p.goal,
    },
    availableDays: dp.days,
    longRunDay: dp.long,
    lightMode: light,
    startDate: start,
    strength,
    ...(vdot ? { vdot } : {}),
  };
}

const HARI = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

export function matrixScenarios(): Scenario[] {
  const out: Scenario[] = [];
  // 1) Pairwise: target x profil x pola hari x hari mulai x hari race x jarak ke race x ringan x strength x override VDOT.
  const sizes = [TARGETS.length, PROFILES.length, DAY_PATTERNS.length, 7, 7, WEEK_OPTS.length, 2, 2, 2];
  for (const r of pairwise(sizes)) {
    const [ti, pi, di, sw, rw, wo, li, si, vi] = r as [
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
    ];
    const t = TARGETS[ti]!;
    const p = PROFILES[pi]!;
    const dp = DAY_PATTERNS[di]!;
    const weeks = t === 'fitness' ? null : weeksFor(t, WEEK_OPTS[wo]!);
    const vdot = vi ? 40 : undefined;
    out.push({
      id: '',
      group: 'pairwise',
      label: `${t} / ${p.label} / ${dp.key} / mulai ${HARI[sw]} / race ${t === 'fitness' ? '-' : HARI[rw]} / ${t === 'fitness' ? '-' : WEEK_OPTS[wo]} mgg${li ? ' / ringan' : ''}${si ? ' / strength' : ''}${vdot ? ' / VDOT 40' : ''}`,
      input: makeInput(t, p, dp, sw, rw, weeks, !!li, !!si, vdot),
      weeksAsked: weeks,
    });
  }
  // 2) Kombinasi penuh dimensi berisiko: hari mulai x hari race x jarak ke race x target (profil tetap per target).
  const prof: Record<string, Profile> = {
    '5k': PROFILES[3]!,
    '10k': PROFILES[3]!,
    hm: PROFILES[4]!,
    fm: PROFILES[5]!,
  };
  for (const t of ['5k', '10k', 'hm', 'fm'] as GoalDistance[])
    for (const dp of [DAY_PATTERNS[6]!, DAY_PATTERNS[2]!])
      for (const wo of ['min', 'default', 'default+6', '30'] as WeekOpt[])
        for (let sw = 0; sw < 7; sw++)
          for (let rw = 0; rw < 7; rw++) {
            const weeks = weeksFor(t, wo);
            out.push({
              id: '',
              group: 'penuh',
              label: `${t} / ${prof[t]!.label} / ${dp.key} / mulai ${HARI[sw]} / race ${HARI[rw]} / ${wo} mgg`,
              input: makeInput(t, prof[t]!, dp, sw, rw, weeks, false, false),
              weeksAsked: weeks,
            });
          }
  return out.map((s, i) => ({ ...s, id: `S-${String(i + 1).padStart(4, '0')}` }));
}

/** 10 persona golden (dokumen Plan Validity Testing). P3 = input seed minggu 4. */
export function personas(): Scenario[] {
  const mk = (id: string, label: string, input: PlanInput): Scenario => ({
    id,
    label,
    group: 'persona',
    input,
    weeksAsked: null,
  });
  const g = (o: Partial<PlanInput['goal']> & { distance: GoalDistance }): PlanInput['goal'] => ({
    raceDate: null,
    baselineDistance: null,
    baselineTimeS: null,
    level: null,
    weeklyVolumeM: 0,
    longestRunM: 0,
    ...o,
  });
  const s = BASE_MONDAY;
  const sunday = (weeks: number, start = s) => raceFor(start, weeks, 6);
  return [
    mk('P1', 'Pemula run-walk, 5K, 3 hari, belum punya waktu acuan', {
      goal: g({
        distance: '5k',
        raceDate: sunday(8),
        level: 'beginner',
        weeklyVolumeM: 0,
        longestRunM: 2000,
      }),
      availableDays: [1, 3, 6],
      longRunDay: 6,
      lightMode: false,
      startDate: s,
    }),
    mk('P2', 'Pemula, 5K, 4 hari, mode ringan (screening "Ya")', {
      goal: g({
        distance: '5k',
        raceDate: sunday(8),
        level: 'beginner',
        weeklyVolumeM: 6000,
        longestRunM: 3000,
      }),
      availableDays: [0, 2, 4, 6],
      longRunDay: 6,
      lightMode: true,
      startDate: s,
    }),
    mk('P3', 'Rekreasional, 10K, 6 hari, race Kamis (input seed minggu 4)', {
      goal: g({
        distance: '10k',
        raceDate: '2027-01-21',
        baselineDistance: '5k',
        baselineTimeS: 1950,
        weeklyVolumeM: 15000,
        longestRunM: 7000,
      }),
      availableDays: [0, 1, 2, 3, 4, 6],
      longRunDay: 6,
      lightMode: false,
      startDate: '2026-10-11',
    }),
    mk('P4', 'Rekreasional, 10K, 4 hari, race Minggu, terjauh 7 km dari volume 15 km', {
      goal: g({
        distance: '10k',
        raceDate: sunday(12),
        baselineDistance: '5k',
        baselineTimeS: 1950,
        weeklyVolumeM: 15000,
        longestRunM: 7000,
      }),
      availableDays: [0, 2, 4, 6],
      longRunDay: 6,
      lightMode: false,
      startDate: s,
    }),
    mk('P5', 'Rekreasional, HM, 5 hari, waktu 10K 60 mnt, race Minggu', {
      goal: g({
        distance: 'hm',
        raceDate: sunday(14),
        baselineDistance: '10k',
        baselineTimeS: 3600,
        weeklyVolumeM: 30000,
        longestRunM: 10000,
      }),
      availableDays: [0, 1, 3, 4, 6],
      longRunDay: 6,
      lightMode: false,
      startDate: s,
    }),
    mk('P6', 'Rekreasional, FM, 5 hari, waktu HM 2:10, 18 minggu', {
      goal: g({
        distance: 'fm',
        raceDate: sunday(18),
        baselineDistance: 'hm',
        baselineTimeS: 7800,
        weeklyVolumeM: 45000,
        longestRunM: 10000,
      }),
      availableDays: [0, 1, 3, 4, 6],
      longRunDay: 6,
      lightMode: false,
      startDate: s,
    }),
    mk('P7', 'FM dengan race 8 minggu lagi (batas minimum)', {
      goal: g({
        distance: 'fm',
        raceDate: sunday(8),
        baselineDistance: 'hm',
        baselineTimeS: 7800,
        weeklyVolumeM: 45000,
        longestRunM: 10000,
      }),
      availableDays: [0, 1, 3, 4, 6],
      longRunDay: 6,
      lightMode: false,
      startDate: s,
    }),
    mk('P8', 'Bugar, 3 hari, dengan strength', {
      goal: g({ distance: 'fitness', level: 'recreational', weeklyVolumeM: 15000, longestRunM: 5000 }),
      availableDays: [1, 3, 5],
      longRunDay: 5,
      lightMode: false,
      startDate: s,
      strength: true,
    }),
    mk('P9', 'Plan mulai Jumat, race Rabu (10K, 6 hari)', {
      goal: g({
        distance: '10k',
        raceDate: raceFor(addDays(s, 4), 10, 2),
        baselineDistance: '5k',
        baselineTimeS: 1950,
        weeklyVolumeM: 15000,
        longestRunM: 7000,
      }),
      availableDays: [0, 1, 2, 3, 4, 6],
      longRunDay: 6,
      lightMode: false,
      startDate: addDays(s, 4),
    }),
    mk('P10', 'Volume tinggi: 60 km, HM 1:35, 6 hari', {
      goal: g({
        distance: 'hm',
        raceDate: sunday(12),
        baselineDistance: 'hm',
        baselineTimeS: 5700,
        weeklyVolumeM: 60000,
        longestRunM: 10000,
      }),
      availableDays: [0, 1, 2, 3, 4, 6],
      longRunDay: 6,
      lightMode: false,
      startDate: s,
    }),
  ];
}

export const describeInput = (i: PlanInput) =>
  `mulai ${i.startDate} (${HARI[weekdayOf(i.startDate)]}), race ${i.goal.raceDate ?? '-'}${i.goal.raceDate ? ` (${HARI[weekdayOf(i.goal.raceDate)]})` : ''}, hari ${i.availableDays.map((d) => HARI[d]).join('-')}, long ${HARI[i.longRunDay]}`;
