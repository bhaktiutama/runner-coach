import { describe, expect, it } from 'vitest';
import {
  addDays,
  diffDays,
  easierStrength,
  engineId,
  EXERCISES,
  flattenSteps,
  generatePlan,
  isSupportType,
  mondayOf,
  parseSteps,
  RULES,
  runningDistance,
  strengthLevel,
  strengthSteps,
  totalDuration,
  type GoalDistance,
  type PlanInput,
  type Weekday,
} from '../src';

const START = '2026-11-02';
const DAYS: Record<number, Weekday[]> = {
  3: [1, 3, 5],
  4: [0, 2, 4, 6],
  5: [0, 1, 3, 4, 6],
  6: [0, 1, 2, 3, 4, 5],
};
const WEEKS = { '5k': 8, '10k': 10, hm: 12, fm: 16, fitness: 8 } as const;
const PROFILES = [
  { level: 'beginner' as const, weeklyVolumeM: 0, longestRunM: 2000 },
  { level: 'beginner' as const, weeklyVolumeM: 8000, longestRunM: 4000 },
  { level: 'recreational' as const, weeklyVolumeM: 18000, longestRunM: 8000 },
];

function input(distance: GoalDistance, p: (typeof PROFILES)[number], n: number, light: boolean): PlanInput {
  return {
    goal: {
      distance,
      raceDate: distance === 'fitness' ? null : addDays(START, WEEKS[distance] * 7 - 2),
      baselineDistance: null,
      baselineTimeS: null,
      ...p,
    },
    availableDays: DAYS[n]!,
    longRunDay: DAYS[n]!.includes(6) ? 6 : 5,
    lightMode: light,
    startDate: START,
    strength: true,
  };
}

const combos: [GoalDistance, (typeof PROFILES)[number], number, boolean][] = [];
for (const t of ['5k', '10k', 'hm', 'fm', 'fitness'] as GoalDistance[])
  for (const p of PROFILES)
    for (const n of [3, 4, 5, 6]) for (const l of [false, true]) combos.push([t, p, n, l]);

describe.each(combos)('strength %s / %o / %i hari / ringan=%s', (target, profile, n, light) => {
  const inp = input(target, profile, n, light);
  const plan = generatePlan(inp);
  const runs = plan.workouts.filter((w) => !isSupportType(w.type));
  const sup = plan.workouts.filter((w) => isSupportType(w.type));
  const runOn = (d: string) => runs.find((w) => w.date === d);

  it('lari tidak berubah dibanding plan tanpa strength', () => {
    const base = generatePlan({ ...inp, strength: false });
    expect(runs).toEqual(base.workouts);
    expect(plan.weeks).toEqual(base.weeks);
  });

  it('E-23/E-26 jumlah sesi per minggu sesuai fase; minggu race tanpa strength', () => {
    const raceMonday = inp.goal.raceDate && target !== 'fitness' ? mondayOf(inp.goal.raceDate) : null;
    for (const wk of plan.weeks) {
      const list = sup.filter((w) => w.weekIndex === wk.weekIndex);
      const max = wk.startDate === raceMonday ? 0 : wk.phase === 'taper' ? 1 : wk.phase === 'peak' ? 1 : 2;
      expect(list.length).toBeLessThanOrEqual(max);
      if (wk.phase === 'taper') for (const w of list) expect(w.type).toBe('core');
      // Minggu penuh Base/Build tetap dapat minimal 1 sesi.
      if ((wk.phase === 'base' || wk.phase === 'build') && wk.startDate >= START)
        expect(list.length).toBeGreaterThan(0);
    }
  });

  it('E-24 tidak di hari long run, tidak sehari sebelum long run / interval, tidak berurutan', () => {
    for (const s of sup) {
      expect(runOn(s.date)?.type).not.toBe('long');
      const next = runOn(addDays(s.date, 1));
      expect(next && (next.type === 'long' || next.type === 'interval')).toBeFalsy();
      for (const o of sup) if (o !== s) expect(Math.abs(diffDays(o.date, s.date))).toBeGreaterThanOrEqual(2);
      if (inp.goal.raceDate && target !== 'fitness')
        expect(diffDays(s.date, inp.goal.raceDate)).toBeGreaterThan(2);
      expect(s.date >= START).toBe(true);
    }
  });

  it('E-12 mode ringan: core saja', () => {
    if (light) for (const s of sup) expect(s.type).toBe('core');
  });

  it('E-25 level naik tiap 3 minggu, pemula maks level 2', () => {
    for (const s of sup) {
      const lvl = s.rationale.find((r) => r.rule === 'E-25')!.values.level as number;
      expect(lvl).toBe(strengthLevel(s.weekIndex, profile.level));
      if (profile.level === 'beginner') expect(lvl).toBeLessThanOrEqual(2);
    }
  });

  it('steps valid, tanpa jarak lari, durasi wajar', () => {
    for (const s of sup) {
      expect(parseSteps(s.steps)).toEqual(s.steps);
      expect(runningDistance(s.steps)).toBe(0);
      expect(s.targetDistanceM).toBe(0);
      const min = totalDuration(s.steps) / 60;
      const [lo, hi] = s.type === 'strength' ? [12, 35] : [5, 15];
      expect(min).toBeGreaterThanOrEqual(lo);
      expect(min).toBeLessThanOrEqual(hi);
    }
  });

  it('rationale: setiap placeholder terisi dan aturan terdaftar', () => {
    for (const s of sup) {
      expect(s.rationale.length).toBeGreaterThan(0);
      for (const r of s.rationale) {
        expect(RULES[r.rule]).toBeDefined();
        const scoped = typeof r.values.scope === 'string' ? `rule.${r.rule}.${r.values.scope}` : null;
        const tpl =
          (scoped && (engineId as Record<string, string>)[scoped]) || engineId[`rule.${r.rule}` as never];
        expect(tpl).toBeTruthy();
        for (const m of (tpl as string).matchAll(/\{(\w+)\}/g)) expect(r.values).toHaveProperty(m[1]!);
      }
    }
  });
});

describe('library gerakan', () => {
  it('semua gerakan di sesi ada di library + punya nama dan cue', () => {
    const ids = new Set<string>();
    for (const type of ['strength', 'core'] as const)
      for (const lvl of [1, 2, 3] as const)
        for (const s of strengthSteps(type, lvl)) if (s.kind === 'exercise') ids.add(s.exercise_id);
    for (const id of ids) {
      expect(EXERCISES.some((e) => e.id === id)).toBe(true);
    }
    for (const e of EXERCISES) {
      expect(engineId[`exercise.${e.id}.name` as never]).toBeTruthy();
      expect(engineId[`exercise.${e.id}.cue` as never]).toBeTruthy();
      expect(e.animation).toBeNull();
    }
  });

  it('flatten: istirahat antar set, tidak setelah set terakhir', () => {
    const flat = flattenSteps(strengthSteps('strength', 1));
    expect(flat[0]!.kind).toBe('exercise');
    expect(flat[flat.length - 1]!.kind).toBe('exercise');
    expect(flat.filter((x) => x.kind === 'rest').length).toBe(
      flat.filter((x) => x.kind === 'exercise').length - 1,
    );
  });

  it('cutback/peak: maks 2 set, level sama', () => {
    for (const s of strengthSteps('strength', 3, true))
      if (s.kind === 'exercise') expect(s.sets).toBeLessThanOrEqual(2);
  });

  it('easierStrength turun 1 level, minimal 1', () => {
    expect(easierStrength('strength', 3).level).toBe(2);
    expect(easierStrength('strength', 1).level).toBe(1);
    expect(easierStrength('core', 2).rationale).toEqual({
      rule: 'E-25',
      values: { level: 1, scope: 'down' },
    });
  });

  it('exercise step: reps xor duration', () => {
    expect(() => parseSteps([{ kind: 'exercise', exercise_id: 'plank', sets: 2, rest_s: 30 }])).toThrow();
    expect(() =>
      parseSteps([{ kind: 'exercise', exercise_id: 'plank', sets: 2, reps: 5, duration_s: 30, rest_s: 30 }]),
    ).toThrow();
  });
});
