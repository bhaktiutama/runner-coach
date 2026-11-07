import { describe, expect, it } from 'vitest';
import { cardOrder, nextLongRun, planRecords, weekStreak } from '../src/lib/todayCards';

const w = (date: string, type: string, status: 'scheduled' | 'completed' | 'missed' | 'skipped') => ({
  id: date + type,
  date,
  type,
  status,
  target_distance_m: type === 'long' ? 8000 : null,
  target_duration_s: null,
});

describe('kartu geser 2.1', () => {
  it('kartu default tampil pertama; nilai asing = hitung mundur', () => {
    expect(cardOrder('streak')).toEqual(['streak', 'countdown', 'long_run', 'records']);
    expect(cardOrder('x')[0]).toBe('countdown');
  });

  it('ide 1: long run terjadwal berikutnya + sisa hari', () => {
    const ws = [
      w('2026-11-01', 'long', 'completed'),
      w('2026-11-08', 'long', 'scheduled'),
      w('2026-11-15', 'long', 'scheduled'),
    ];
    expect(nextLongRun(ws, '2026-11-05')).toMatchObject({ date: '2026-11-08', inDays: 3 });
    expect(nextLongRun([w('2026-11-01', 'long', 'completed')], '2026-11-05')).toBeNull();
  });

  it('ide 2: rekor plan (terjauh, terlama, pace easy terbaik >= 2 km), strength diabaikan', () => {
    const a = (id: string, date: string, km: number, min: number, type: string) => ({
      id,
      date,
      distance_m: km * 1000,
      duration_s: min * 60,
      workout_type: type,
    });
    const r = planRecords(
      [
        a('1', '2026-10-20', 5, 45, 'easy'),
        a('2', '2026-11-01', 8, 70, 'long'),
        a('3', '2026-11-02', 0, 90, 'strength'),
        a('4', '2026-11-03', 1, 5, 'easy'),
      ],
      '2026-10-19',
    );
    expect(r.longest).toEqual({ date: '2026-11-01', distanceM: 8000 });
    expect(r.longestTime).toEqual({ date: '2026-11-01', durationS: 4200 });
    expect(r.bestEasyPace).toEqual({ date: '2026-11-01', pace: 525 });
  });

  it('ide 3: streak minggu tuntas; minggu ini yang belum tuntas tidak memutus streak', () => {
    const st = [
      w('2026-10-13', 'easy', 'missed'),
      w('2026-10-20', 'easy', 'completed'),
      w('2026-10-27', 'easy', 'completed'),
      w('2026-10-28', 'strength', 'missed'),
      w('2026-11-03', 'easy', 'completed'),
      w('2026-11-06', 'easy', 'scheduled'),
    ];
    const s = weekStreak(st, '2026-11-05');
    expect(s.current).toBe(2);
    expect(s.best).toBe(2);
    expect(s.weeks.map((x) => x.state)).toEqual(['none', 'none', 'missed', 'done', 'done', 'open']);
  });
});
