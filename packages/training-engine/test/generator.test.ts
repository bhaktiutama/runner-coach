import { describe, expect, it } from 'vitest';
import {
  addDays,
  adjacentWeekdays,
  diffDays,
  engineId,
  generatePlan,
  intensitySplit,
  mondayOf,
  parseSteps,
  RULES,
  runningDistance,
  weekday,
  type GeneratedPlan,
  type GoalDistance,
  type PlanInput,
  type Weekday,
  LONG_RUN_SHARE,
  totalDuration,
} from '../src';

const START = '2026-11-02'; // Senin
const DAYS: Record<number, Weekday[]> = {
  3: [1, 3, 5],
  4: [0, 2, 4, 6],
  5: [0, 1, 3, 4, 6],
  6: [0, 1, 2, 3, 4, 5],
};
const TARGETS: GoalDistance[] = ['5k', '10k', 'hm', 'fm', 'fitness'];
const WEEKS = { '5k': 8, '10k': 10, hm: 12, fm: 16, fitness: 8 } as const;

type Profile = { name: string; goal: Partial<PlanInput['goal']> };
const PROFILES: Profile[] = [
  { name: 'pemula run-walk', goal: { level: 'beginner', weeklyVolumeM: 0, longestRunM: 2000 } },
  { name: 'pemula', goal: { level: 'beginner', weeklyVolumeM: 8000, longestRunM: 4000 } },
  { name: 'rekreasional', goal: { level: 'recreational', weeklyVolumeM: 18000, longestRunM: 8000 } },
  {
    name: 'tahu waktu 10K',
    goal: {
      level: null,
      baselineDistance: '10k',
      baselineTimeS: 3600,
      weeklyVolumeM: 25000,
      longestRunM: 12000,
    },
  },
];

function input(distance: GoalDistance, p: Profile, nDays: number, lightMode = false): PlanInput {
  const longRunDay: Weekday = DAYS[nDays]!.includes(6) ? 6 : 5;
  return {
    goal: {
      distance,
      raceDate: distance === 'fitness' ? null : addDays(START, WEEKS[distance] * 7 - 2),
      baselineDistance: null,
      baselineTimeS: null,
      level: null,
      weeklyVolumeM: 0,
      longestRunM: 0,
      ...p.goal,
    },
    availableDays: DAYS[nDays]!,
    longRunDay,
    lightMode,
    startDate: START,
  };
}

const HARD = new Set(['tempo', 'interval']);

function byWeek(plan: GeneratedPlan) {
  const m = new Map<number, GeneratedPlan['workouts']>();
  for (const w of plan.workouts) m.set(w.weekIndex, [...(m.get(w.weekIndex) ?? []), w]);
  return m;
}

const combos: [GoalDistance, Profile, number, boolean][] = [];
for (const t of TARGETS)
  for (const p of PROFILES)
    for (const n of [3, 4, 5, 6]) for (const l of [false, true]) combos.push([t, p, n, l]);

describe.each(combos)('%s / %o / %i hari / ringan=%s', (target, profile, nDays, light) => {
  const inp = input(target, profile, nDays, light);
  const plan = generatePlan(inp);
  const weeks = byWeek(plan);

  it('E-03 durasi plan', () => {
    expect(plan.weeks.length).toBe(WEEKS[target]);
  });

  it('E-04 urutan fase base -> build -> peak -> taper (Bugar tanpa taper)', () => {
    const order = ['base', 'build', 'peak', 'taper'];
    const phases = plan.weeks.map((w) => w.phase);
    for (let i = 1; i < phases.length; i++) {
      expect(order.indexOf(phases[i]!)).toBeGreaterThanOrEqual(order.indexOf(phases[i - 1]!));
    }
    expect(phases.includes('taper')).toBe(target !== 'fitness');
  });

  it('E-21 recovery run hanya sehari setelah long run / sesi berat, rekreasional >= 5 hari', () => {
    const rec = plan.workouts.filter((w) => w.type === 'recovery');
    if (profile.goal.level === 'beginner' || nDays < 5 || light) expect(rec).toHaveLength(0);
    for (const r of rec) {
      const prev = plan.workouts.find((w) => diffDays(w.date, r.date) === 1);
      expect(prev && (prev.type === 'long' || HARD.has(prev.type))).toBe(true);
      expect(totalDuration(r.steps)).toBeLessThanOrEqual(30 * 60);
      expect(r.rationale.map((x) => x.rule)).toContain('E-21');
    }
  });

  it('E-22 progression run hanya di Build, rekreasional, tidak bersebelahan dengan sesi berat/long', () => {
    for (const p of plan.workouts.filter((w) => w.type === 'progression')) {
      expect(p.phase).toBe('build');
      expect(profile.goal.level === 'beginner' || light || target === 'fitness').toBe(false);
      const near = plan.workouts.filter((w) => Math.abs(diffDays(w.date, p.date)) === 1);
      expect(near.some((w) => w.type === 'long' || HARD.has(w.type))).toBe(false);
      expect(p.rationale.map((x) => x.rule)).toContain('E-22');
    }
  });

  it('volume tidak macet: minggu non-cutback fase Base/Build/Peak tidak turun > 10%', () => {
    let ref = 0;
    for (const w of plan.weeks.filter((x) => x.phase !== 'taper' && x.phase !== 'return')) {
      if (w.cutback) continue;
      if (ref > 0 && !(profile.goal.level === 'beginner' && profile.goal.weeklyVolumeM === 0))
        expect(w.volumeM).toBeGreaterThanOrEqual(ref * 0.9);
      ref = w.volumeM;
    }
  });

  it('E-05 volume naik maks 10% dari minggu non-cutback terakhir', () => {
    let ref = plan.weeks[0]!.volumeM;
    for (const w of plan.weeks.slice(1)) {
      expect(w.volumeM).toBeLessThanOrEqual(Math.round(ref * 1.1) + 1);
      if (!w.cutback && w.phase !== 'taper') ref = w.volumeM;
    }
  });

  it('E-06 tidak ada sesi > 110% lari terjauh 30 hari', () => {
    const all = [...plan.workouts].sort((a, b) => a.date.localeCompare(b.date));
    for (const w of all) {
      let longest = diffDays(inp.startDate, w.date) <= 30 ? inp.goal.longestRunM : 0;
      for (const p of all) {
        const d = diffDays(p.date, w.date);
        if (d > 0 && d <= 30) longest = Math.max(longest, runningDistance(p.steps));
      }
      expect(runningDistance(w.steps)).toBeLessThanOrEqual(Math.floor(longest * 1.1) + 1);
    }
  });

  it('E-07 cutback tiap minggu ke-4 turun 20-30%', () => {
    let ref = plan.weeks[0]!.volumeM;
    for (const w of plan.weeks) {
      if (w.cutback) {
        const drop = 1 - w.volumeM / ref;
        expect(drop).toBeGreaterThanOrEqual(0.15);
        expect(drop).toBeLessThanOrEqual(0.31);
        expect(w.weekIndex % 4).toBe(0);
      } else if (w.phase !== 'taper') ref = w.volumeM;
    }
  });

  it('E-08 long run maks porsi volume per jarak (30%, HM 35%, FM 45%) atau batas E-06/minimum', () => {
    for (const w of plan.workouts.filter((x) => x.type === 'long')) {
      const week = plan.weeks[w.weekIndex - 1]!;
      expect(runningDistance(w.steps)).toBeLessThanOrEqual(
        Math.max(week.volumeM * LONG_RUN_SHARE[inp.goal.distance], 2000) + 200,
      );
    }
  });

  it('E-09 sekitar 80% waktu di intensitas easy', () => {
    const s = plan.workouts.reduce(
      (a, w) => {
        const x = intensitySplit(w.steps);
        return { e: a.e + x.easy_s, h: a.h + x.hard_s };
      },
      { e: 0, h: 0 },
    );
    expect(s.e / (s.e + s.h)).toBeGreaterThanOrEqual(0.75);
  });

  it('E-10 sesi berat maks 2/minggu, pemula maks 1, tidak berurutan', () => {
    for (const [, ws] of weeks) {
      const hard = ws.filter((w) => HARD.has(w.type));
      expect(hard.length).toBeLessThanOrEqual(profile.goal.level === 'beginner' ? 1 : 2);
      for (let i = 0; i < hard.length; i++)
        for (let j = i + 1; j < hard.length; j++)
          expect(adjacentWeekdays(weekday(hard[i]!.date), weekday(hard[j]!.date))).toBe(false);
    }
  });

  it('E-11 taper: minggu terakhir turun 40-60% dari puncak, sesi kualitas tidak berkurang', () => {
    if (target === 'fitness') return;
    const peak = Math.max(...plan.weeks.filter((w) => w.phase !== 'taper').map((w) => w.volumeM));
    const last = plan.weeks[plan.weeks.length - 1]!;
    const drop = 1 - last.volumeM / peak;
    expect(drop).toBeGreaterThanOrEqual(0.4);
    expect(drop).toBeLessThanOrEqual(0.6);
    if (light) return;
    const hardIn = (idx: number) => (weeks.get(idx) ?? []).filter((w) => HARD.has(w.type)).length;
    const peakWeeks = plan.weeks
      .filter((w) => w.phase === 'peak' && !w.cutback)
      .map((w) => hardIn(w.weekIndex));
    const peakHard = Math.max(0, ...peakWeeks);
    for (const w of plan.weeks.filter((x) => x.phase === 'taper')) {
      expect(hardIn(w.weekIndex)).toBeGreaterThanOrEqual(Math.min(peakHard, 1));
    }
  });

  it('E-12 mode ringan tanpa sesi berat', () => {
    if (!light) return;
    expect(plan.workouts.filter((w) => HARD.has(w.type))).toEqual([]);
    expect(plan.rationale.some((r) => r.rule === 'E-12')).toBe(true);
  });

  it('E-14 run-walk hanya untuk pemula tanpa waktu acuan dengan lari terjauh < 3 km', () => {
    const rw = plan.workouts.some((w) => w.type === 'run_walk');
    expect(rw).toBe(profile.name === 'pemula run-walk');
  });

  it('E-15 tempo dan interval diawali drill 8-12 menit setelah pemanasan', () => {
    for (const w of plan.workouts.filter((x) => HARD.has(x.type))) {
      const kinds = w.steps.map((s) => s.kind);
      expect(kinds[0]).toBe('warmup');
      expect(kinds[1]).toBe('drill');
      const drillSets = w.steps.reduce((a, s) => (s.kind === 'drill' ? a + s.sets : a), 0);
      expect(drillSets).toBeGreaterThanOrEqual(8);
      expect(drillSets).toBeLessThanOrEqual(12);
    }
  });

  it('steps valid menurut zod dan tanggal di dalam plan', () => {
    for (const w of plan.workouts) {
      expect(() => parseSteps(w.steps)).not.toThrow();
      expect(w.date >= inp.startDate).toBe(true);
      if (inp.goal.raceDate) expect(w.date < inp.goal.raceDate).toBe(true);
    }
  });

  it('07 3.5: rationale plan minimal + setiap latihan punya rationale + template terisi', () => {
    const rules = new Set(plan.rationale.map((r) => r.rule));
    for (const id of ['E-02', 'E-03', 'E-04', 'E-05', 'E-09'] as const) expect(rules.has(id)).toBe(true);
    if (!plan.runWalk) expect(rules.has('E-06')).toBe(true);
    if (target !== 'fitness') expect(rules.has('E-11')).toBe(true);
    if (inp.goal.baselineTimeS && target !== 'fitness') expect(rules.has('E-01')).toBe(true);
    for (const w of plan.workouts) {
      expect(w.rationale.length).toBeGreaterThan(0);
      if (w.type === 'long')
        expect(w.rationale.map((r) => r.rule)).toEqual(expect.arrayContaining(['E-06', 'E-08']));
      if (HARD.has(w.type))
        expect(w.rationale.map((r) => r.rule)).toEqual(expect.arrayContaining(['E-10', 'E-15']));
    }
    const all = [...plan.rationale, ...plan.workouts.flatMap((w) => w.rationale)];
    for (const r of all) {
      expect(RULES[r.rule]).toBeDefined();
      const key =
        r.values.scope === 'plan' && `rule.${r.rule}.plan` in engineId
          ? `rule.${r.rule}.plan`
          : `rule.${r.rule}`;
      const tpl = engineId[key as keyof typeof engineId];
      const holes = [...tpl.matchAll(/\{(\w+)\}/g)].map((m) => m[1]!);
      for (const h of holes) expect(r.values, `${r.rule} butuh ${h}`).toHaveProperty(h);
    }
  });
});

describe('E-08 long run HM/FM', () => {
  it('FM rekreasional dengan waktu 10K: long run puncak >= 20 km dan <= 3 jam', () => {
    const plan = generatePlan(input('fm', PROFILES[3]!, 5));
    const longs = plan.workouts.filter((w) => w.type === 'long');
    expect(Math.max(...longs.map((w) => runningDistance(w.steps)))).toBeGreaterThanOrEqual(20_000);
    for (const w of longs) expect(totalDuration(w.steps)).toBeLessThanOrEqual(180 * 60);
  });

  it('HM rekreasional dengan waktu 10K: long run puncak >= 14 km dan <= 2,5 jam', () => {
    const plan = generatePlan(input('hm', PROFILES[3]!, 4));
    const longs = plan.workouts.filter((w) => w.type === 'long');
    expect(Math.max(...longs.map((w) => runningDistance(w.steps)))).toBeGreaterThanOrEqual(14_000);
    for (const w of longs) expect(totalDuration(w.steps)).toBeLessThanOrEqual(150 * 60);
  });
});

describe('kasus khusus', () => {
  const base = input('10k', PROFILES[2]!, 4);

  it('plan mulai di tengah minggu: tidak ada latihan sebelum startDate', () => {
    const plan = generatePlan({ ...base, startDate: '2026-11-05' });
    expect(plan.workouts.every((w) => w.date >= '2026-11-05')).toBe(true);
    expect(plan.weeks[0]!.startDate).toBe(mondayOf('2026-11-05'));
  });

  it('race terlalu dekat ditolak', () => {
    expect(() => generatePlan({ ...base, goal: { ...base.goal, raceDate: addDays(START, 14) } })).toThrow(
      'race_too_soon',
    );
  });

  it('race lebih jauh: minggu tambahan masuk Base', () => {
    const plan = generatePlan({ ...base, goal: { ...base.goal, raceDate: addDays(START, 7 * 14 - 2) } });
    expect(plan.weeks.length).toBe(14);
    expect(plan.weeks.filter((w) => w.phase === 'base').length).toBeGreaterThan(4);
  });

  it('hari tersedia < 3 atau long run di luar hari tersedia ditolak', () => {
    expect(() => generatePlan({ ...base, availableDays: [0, 6] })).toThrow('invalid_days');
    expect(() => generatePlan({ ...base, availableDays: [0, 2, 4], longRunDay: 6 })).toThrow();
  });

  it.each(['2027-01-04', '2027-01-05', '2027-01-07', '2027-01-10'])(
    'race %s: taper tidak kosong, tidak ada long run/sesi berat < 3 hari sebelum race',
    (race) => {
      const plan = generatePlan({ ...base, goal: { ...base.goal, raceDate: race } });
      const last = plan.weeks[plan.weeks.length - 1]!;
      const peak = Math.max(...plan.weeks.filter((w) => w.phase !== 'taper').map((w) => w.volumeM));
      expect(last.phase).toBe('taper');
      expect(1 - last.volumeM / peak).toBeLessThanOrEqual(0.6);
      for (const w of plan.workouts) {
        const d = diffDays(w.date, race);
        expect(d).toBeGreaterThan(0);
        if (w.type === 'long' || w.type === 'tempo' || w.type === 'interval')
          expect(d).toBeGreaterThanOrEqual(3);
      }
    },
  );

  it('long run selalu di hari pilihan pengguna', () => {
    const plan = generatePlan(base);
    for (const w of plan.workouts.filter((x) => x.type === 'long'))
      expect(weekday(w.date)).toBe(base.longRunDay);
  });

  it('run-walk: blok lari naik tiap minggu dan berhenti di 20 menit', () => {
    const p = input('5k', PROFILES[0]!, 3);
    const plan = generatePlan({ ...p, goal: { ...p.goal, raceDate: addDays(START, 7 * 20 - 2) } });
    const runMins = plan.workouts
      .filter((w) => w.type === 'run_walk')
      .map((w) => Number(w.rationale.find((r) => r.rule === 'E-14')!.values.run_min));
    for (let i = 1; i < runMins.length; i++) expect(runMins[i]!).toBeGreaterThanOrEqual(runMins[i - 1]!);
    expect(Math.max(...runMins)).toBeLessThanOrEqual(20);
  });

  it('vdot override (E-20) mengubah zona', () => {
    const a = generatePlan(base);
    const b = generatePlan({ ...base, vdot: a.vdot + 5 });
    expect(b.zones.threshold.min).toBeLessThan(a.zones.threshold.min);
  });

  it('wireframe 1.8: 10K 4 hari dari 14 km mengikuti pola 14, 15, 16, cutback', () => {
    const p = generatePlan({
      ...base,
      goal: { ...base.goal, weeklyVolumeM: 14000, longestRunM: 6000, level: 'recreational' },
    });
    const v = p.weeks.map((w) => Math.round(w.volumeM / 1000));
    expect(v[0]).toBeGreaterThanOrEqual(13);
    expect(v[0]).toBeLessThanOrEqual(14);
    expect(p.weeks[3]!.cutback).toBe(true);
  });
});
