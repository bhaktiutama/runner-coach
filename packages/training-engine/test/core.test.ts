import { describe, expect, it } from 'vitest';
import {
  addDays,
  assessGoal,
  DRILLS,
  engineId,
  flattenSteps,
  isDrillId,
  paceZones,
  parseSteps,
  predictRange,
  raceTimeFromVdot,
  REFERENCES,
  riegel,
  RULES,
  runningDistance,
  totalDistance,
  totalDuration,
  vdotFromRace,
  weekday,
  mondayOf,
  diffDays,
  adjacentWeekdays,
} from '../src';

describe('E-01 Riegel + rentang (07 E-O1)', () => {
  it('rumus Riegel 1,06', () => {
    expect(riegel(1500, 5000, 10000)).toBeCloseTo(1500 * 2 ** 1.06, 5);
  });
  it('5K-HM: Riegel +-3%', () => {
    const p = predictRange('10k', 3600, 'hm');
    const t = riegel(3600, 10000, 21097);
    expect(p.minS).toBe(Math.round(Math.round(t) * 0.97));
    expect(p.maxS).toBe(Math.round(Math.round(t) * 1.03));
    expect(p.likelyS).toBe(Math.round(t));
    expect(p.rough).toBe(false);
  });
  it('FM: [Riegel, Riegel + 20 mnt], paling mungkin +10 mnt; acuan 5K/10K kasar', () => {
    const p = predictRange('hm', 6000, 'fm');
    const t = Math.round(riegel(6000, 21097, 42195));
    expect([p.minS, p.likelyS, p.maxS]).toEqual([t, t + 600, t + 1200]);
    expect(p.rough).toBe(false);
    expect(predictRange('10k', 3000, 'fm').rough).toBe(true);
  });
});

describe('E-02 VDOT (kerangka Daniels)', () => {
  it('5K 19:57 = VDOT ~50; prediksi 10K ~41:21', () => {
    expect(vdotFromRace(5000, 1197)).toBeCloseTo(50, 0);
    expect(Math.abs(raceTimeFromVdot(50, 10000) - 2481)).toBeLessThan(15);
  });
  it('zona VDOT 50: threshold ~4:15 /km, interval ~3:55 /km', () => {
    const z = paceZones(50);
    expect(Math.abs(z.threshold.min - 255)).toBeLessThanOrEqual(5);
    expect(Math.abs(z.interval.max - 235)).toBeLessThanOrEqual(5);
    expect(z.easy.min).toBeGreaterThan(z.marathon.max);
    expect(z.repetition.max).toBeLessThan(z.interval.min);
  });
});

describe('steps (Schema 3)', () => {
  const example = [
    { kind: 'warmup', duration_s: 720, zone: 'easy' },
    { kind: 'drill', exercise_id: 'askip', sets: 2, distance_m: 20 },
    {
      kind: 'repeat',
      times: 6,
      steps: [
        { kind: 'work', distance_m: 800, zone: 'interval', pace_s_per_km: { min: 370, max: 380 } },
        { kind: 'recovery', duration_s: 120, zone: 'recovery' },
      ],
    },
    { kind: 'cooldown', duration_s: 720, zone: 'easy' },
  ];
  it('contoh Schema 3 valid', () => {
    expect(() => parseSteps(example)).not.toThrow();
  });
  it('step tanpa durasi/jarak dan drill tanpa dosis ditolak', () => {
    expect(() => parseSteps([{ kind: 'work', zone: 'easy' }])).toThrow();
    expect(() => parseSteps([{ kind: 'drill', exercise_id: 'askip', sets: 2 }])).toThrow();
    expect(() => parseSteps([{ kind: 'sprint', duration_s: 10, zone: 'easy' }])).toThrow();
    expect(() => parseSteps([])).toThrow();
  });
  it('flatten: repeat diurai, drill per set', () => {
    const flat = flattenSteps(parseSteps(example));
    expect(flat.length).toBe(1 + 2 + 12 + 1);
    expect(flat.filter((s) => s.kind === 'drill').map((s) => (s.kind === 'drill' ? s.set : 0))).toEqual([
      1, 2,
    ]);
    expect(runningDistance(parseSteps(example))).toBe(4800);
    expect(totalDistance(parseSteps(example))).toBeGreaterThanOrEqual(runningDistance(parseSteps(example)));
    expect(totalDuration(parseSteps(example))).toBeGreaterThan(720 * 2);
  });
});

describe('registri bukti (07 3.5 no. 1)', () => {
  const required = [
    'E-01',
    'E-02',
    'E-03',
    'E-04',
    'E-05',
    'E-06',
    'E-07',
    'E-08',
    'E-09',
    'E-10',
    'E-11',
    'E-12',
    'E-13',
    'E-14',
    'E-15',
    'E-16',
    'E-17',
    'E-18',
    'E-19',
    'E-20',
  ] as const;
  it.each(required)('%s punya grade, refs dan template', (id) => {
    const r = RULES[id];
    expect(r).toBeDefined();
    expect(['A', 'B', 'C', 'D']).toContain(r.grade);
    if (r.grade !== 'D') expect(r.refs.length).toBeGreaterThan(0);
    for (const ref of r.refs) expect(REFERENCES[ref]).toBeDefined();
    expect(engineId[`rule.${id}` as keyof typeof engineId]).toBeTruthy();
  });
  it('drill punya nama + cue', () => {
    for (const d of DRILLS) {
      expect(engineId[`drill.${d.id}.name` as keyof typeof engineId]).toBeTruthy();
      expect(engineId[`drill.${d.id}.cue` as keyof typeof engineId]).toBeTruthy();
    }
    expect(isDrillId('askip')).toBe(true);
    expect(isDrillId('nope')).toBe(false);
  });
});

describe('tanggal', () => {
  it('weekday, monday, diff, adjacency', () => {
    expect(weekday('2026-11-02')).toBe(0);
    expect(weekday('2026-11-08')).toBe(6);
    expect(mondayOf('2026-11-08')).toBe('2026-11-02');
    expect(diffDays('2026-11-02', addDays('2026-11-02', 30))).toBe(30);
    expect(adjacentWeekdays(6, 0)).toBe(true);
    expect(adjacentWeekdays(1, 3)).toBe(false);
  });
});

describe('penilaian target (FL-1 1.3 / 1.5)', () => {
  it('cukup waktu, dipadatkan, terlalu dekat', () => {
    const base = { distance: '10k' as const, startDate: '2026-11-02', longestRunM: 5000 };
    expect(assessGoal({ ...base, raceDate: addDays('2026-11-02', 70) }).fit).toBe('ok');
    expect(assessGoal({ ...base, raceDate: addDays('2026-11-02', 40) }).fit).toBe('compressed');
    const short = assessGoal({ ...base, raceDate: addDays('2026-11-02', 14) });
    expect(short.fit).toBe('too_short');
    expect(short.shorterTarget).toBe('5k');
    expect(assessGoal({ ...base, raceDate: null }).weeksUntilRace).toBeNull();
  });
  it('di bawah syarat minimum menyarankan target lebih pendek', () => {
    const a = assessGoal({ distance: 'fm', raceDate: null, startDate: '2026-11-02', longestRunM: 8000 });
    expect(a.belowMinimum).toBe(true);
    expect(a.shorterTarget).toBe('hm');
    expect(
      assessGoal({ distance: '5k', raceDate: null, startDate: '2026-11-02', longestRunM: 0 }).belowMinimum,
    ).toBe(false);
  });
});
