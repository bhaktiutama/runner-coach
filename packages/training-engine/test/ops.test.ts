import { describe, expect, it } from 'vitest';
import {
  applyChanges,
  buildReturnWeek,
  checkMove,
  convertToEasy,
  easyRun,
  longRun,
  mergeWorkouts,
  paceZones,
  proposeAdjustments,
  runningDistance,
  shiftScheduled,
  tempoRun,
  totalDuration,
  weeksToShift,
  strengthSteps,
  type MovableWorkout,
} from '../src';

const z = paceZones(40);
const W = (
  id: string,
  date: string,
  type: MovableWorkout['type'],
  steps = easyRun(5000, z),
): MovableWorkout => ({
  id,
  date,
  type,
  steps,
  status: 'scheduled',
});
// Minggu: Sen easy, Rab tempo, Sab long
const week = [
  W('a', '2026-11-02', 'easy'),
  W('b', '2026-11-04', 'tempo', tempoRun(1200, z, true)),
  W('c', '2026-11-07', 'long', longRun(10000, z)),
];

describe('pindah latihan (FL-5)', () => {
  it('hari asal', () => {
    expect(checkMove(week[0]!, '2026-11-02', week, 10000).verdict).toBe('origin');
  });
  it('kosong dan aman', () => {
    expect(checkMove(week[0]!, '2026-11-03', week, 10000).verdict).toBe('safe');
  });
  it('sehari setelah sesi berat: bisa dengan saran pelan', () => {
    const r = checkMove(week[0]!, '2026-11-05', week, 10000);
    expect(r.verdict).toBe('after_hard');
    expect(r.rationale[0]!.rule).toBe('E-10');
  });
  it('sesi berat ke sebelah sesi berat lain ditolak (E-10)', () => {
    const wk = [...week, W('d', '2026-11-06', 'interval', tempoRun(900, z, true))];
    expect(checkMove(wk[1]!, '2026-11-05', wk, 10000).verdict).toBe('hard_adjacent');
  });
  it('hari terisi: tawaran gabung dengan cek E-06', () => {
    const r = checkMove(week[0]!, '2026-11-07', week, 10000);
    expect(r.verdict).toBe('occupied');
    expect(r.mergeWith).toBe('c');
    expect(r.rationale[0]!.values.cap_m).toBe(11000);
  });
  it('gabung: sesi berat dipertahankan, total dibatasi 110% lari terjauh', () => {
    const m = mergeWorkouts(week[2]!, week[0]!, z, 10000);
    expect(m.type).toBe('long');
    expect(runningDistance(m.steps)).toBeLessThanOrEqual(11000 + 200);
    const h = mergeWorkouts(week[0]!, week[1]!, z, 20000);
    expect(h.type).toBe('tempo');
  });
  it('ganti jadi easy: durasi sama', () => {
    const e = convertToEasy(week[1]!, z);
    expect(e.type).toBe('easy');
    expect(Math.abs(totalDuration(e.steps) - totalDuration(week[1]!.steps))).toBeLessThan(60);
  });
});

describe('adaptasi (TRD 4.3)', () => {
  const base = { week, nextWeek: week, lastRunDate: '2026-11-07', today: '2026-11-08' };
  it('E-17: RPE >= 8 pada 2 easy run berturut-turut', () => {
    const p = proposeAdjustments({
      ...base,
      feedback: [
        { date: '2026-11-02', type: 'easy', rpe: 8 },
        { date: '2026-11-07', type: 'long', rpe: 9 },
      ],
    });
    expect(p.map((x) => x.rule)).toContain('E-17');
    const e17 = p.find((x) => x.rule === 'E-17')!;
    expect(e17.changes).toEqual([
      { kind: 'volume', pct: -10 },
      { kind: 'hard_to_easy', workout_id: 'b' },
    ]);
    const applied = applyChanges(week, e17.changes, z);
    expect(applied.find((w) => w.id === 'b')!.type).toBe('easy');
    expect(totalDuration(applied.find((w) => w.id === 'a')!.steps)).toBeLessThan(
      totalDuration(week[0]!.steps),
    );
  });
  it('E-17 tidak terpicu jika hanya 1 RPE tinggi', () => {
    const p = proposeAdjustments({
      ...base,
      feedback: [
        { date: '2026-11-02', type: 'easy', rpe: 9 },
        { date: '2026-11-07', type: 'easy', rpe: 5 },
      ],
    });
    expect(p).toEqual([]);
  });
  it('E-18: RPE <= 4 pada 3 sesi kualitas berturut-turut', () => {
    const fb = [1, 2, 3].map((i) => ({ date: `2026-10-0${i}`, type: 'tempo' as const, rpe: 4 }));
    expect(proposeAdjustments({ ...base, feedback: fb }).map((p) => p.rule)).toEqual(['E-18']);
  });
  it('E-19: >= 2 terlewat ulangi minggu; 1 terlewat tidak ada usulan', () => {
    const one = [{ ...week[0]!, status: 'missed' as const }, week[1]!, week[2]!];
    expect(proposeAdjustments({ ...base, week: one, feedback: [] })).toEqual([]);
    const two = [
      { ...week[0]!, status: 'missed' as const },
      { ...week[1]!, status: 'skipped' as const },
      week[2]!,
    ];
    expect(proposeAdjustments({ ...base, week: two, feedback: [] })[0]!.rule).toBe('E-19');
  });
  it('E-13: tidak lari >= 10 hari', () => {
    const p = proposeAdjustments({ ...base, lastRunDate: '2026-10-25', feedback: [] });
    expect(p[0]!.rule).toBe('E-13');
    expect(p[0]!.rationale.values.days).toBe(14);
  });
});

describe('jeda + Return to run (F-09, E-13)', () => {
  it('minggu return: easy saja, volume rendah', () => {
    const r = buildReturnWeek({
      resumeDate: '2026-11-09',
      availableDays: [0, 2, 4, 5],
      zones: z,
      recentLongestM: 10000,
      daysOff: 12,
      weekIndex: 5,
    });
    expect(r.length).toBe(4);
    expect(r.every((w) => w.type === 'easy' && w.phase === 'return')).toBe(true);
    expect(r.every((w) => runningDistance(w.steps) <= 5200)).toBe(true);
    expect(r[0]!.rationale[0]).toEqual({ rule: 'E-13', values: { days: 12 } });
  });
  it('geser plan: hanya latihan terjadwal setelah tanggal', () => {
    const items = [
      { id: '1', date: '2026-11-02', status: 'completed' as const },
      { id: '2', date: '2026-11-10', status: 'scheduled' as const },
    ];
    const s = shiftScheduled(items, '2026-11-09', 2);
    expect(s[0]!.date).toBe('2026-11-02');
    expect(s[1]!.date).toBe('2026-11-24');
    expect(weeksToShift('2026-11-04', '2026-11-12')).toBe(2);
  });
});

describe('strength (F-21): pindah dan adaptasi', () => {
  const st = W('s', '2026-11-03', 'strength', strengthSteps('strength', 1));
  const wk = [...week, st];

  it('strength boleh ke hari yang ada lari (bukan bentrok)', () => {
    expect(checkMove(st, '2026-11-02', wk, 10000).verdict).toBe('safe');
  });
  it('E-24: strength tidak ke hari long run atau sehari sebelumnya', () => {
    expect(checkMove(st, '2026-11-07', wk, 10000).verdict).toBe('before_key');
    expect(checkMove(st, '2026-11-06', wk, 10000).verdict).toBe('before_key');
  });
  it('strength bentrok dengan strength lain di hari yang sama', () => {
    const other = W('t', '2026-11-05', 'core', strengthSteps('core', 1));
    expect(checkMove(st, '2026-11-05', [...wk, other], 10000).verdict).toBe('occupied');
  });
  it('lari tidak melihat strength sebagai bentrok', () => {
    expect(checkMove(week[0]!, '2026-11-03', wk, 10000).verdict).toBe('safe');
  });
  it('E-19: strength terlewat tidak dihitung', () => {
    const missedWeek = [
      { ...week[0]!, status: 'missed' as const },
      { ...st, status: 'missed' as const },
      week[1]!,
      week[2]!,
    ];
    const p = proposeAdjustments({
      week: missedWeek,
      nextWeek: [],
      feedback: [],
      lastRunDate: '2026-11-07',
      today: '2026-11-09',
    });
    expect(p.find((x) => x.rule === 'E-19')).toBeUndefined();
  });
  it('perubahan volume tidak menyentuh strength', () => {
    const res = applyChanges([st, week[0]!], [{ kind: 'volume', pct: -10 }], z);
    expect(res.map((r) => r.id)).toEqual(['a']);
  });
});
