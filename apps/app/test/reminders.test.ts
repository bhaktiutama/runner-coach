import { describe, expect, it } from 'vitest';
import { FORBIDDEN_IN_NOTIFICATION, planReminders } from '../src/lib/reminders';

const text = (title: string, min: number) => `Hari ini: ${title} ${min} menit. Siap lari?`;
const base = {
  today: '2026-11-02',
  nowTime: '04:00',
  reminderTime: '05:30',
  planStatus: 'active' as const,
  workouts: [
    { date: '2026-11-02', status: 'scheduled', title: 'Tempo', minutes: 42 },
    { date: '2026-11-03', status: 'completed', title: 'Easy', minutes: 30 },
    { date: '2026-11-05', status: 'scheduled', title: 'Easy', minutes: 30 },
    { date: '2026-11-12', status: 'scheduled', title: 'Long run', minutes: 60 },
  ],
};

describe('pengingat (TRD 9)', () => {
  it('hanya hari latihan scheduled dalam 7 hari', () => {
    expect(planReminders(base, text).map((r) => r.date)).toEqual(['2026-11-02', '2026-11-05']);
  });
  it('tidak saat plan dijeda atau pengingat mati', () => {
    expect(planReminders({ ...base, planStatus: 'paused' }, text)).toEqual([]);
    expect(planReminders({ ...base, reminderTime: null }, text)).toEqual([]);
  });
  it('dijadwalkan ulang setelah pindah latihan', () => {
    const moved = {
      ...base,
      workouts: base.workouts.map((w) => (w.date === '2026-11-05' ? { ...w, date: '2026-11-06' } : w)),
    };
    expect(planReminders(moved, text).map((r) => r.date)).toEqual(['2026-11-02', '2026-11-06']);
  });
  it('hari ini dilewati jika jam sudah lewat; isi tanpa data kesehatan', () => {
    const r = planReminders({ ...base, nowTime: '06:00' }, text);
    expect(r.map((x) => x.date)).toEqual(['2026-11-05']);
    for (const x of planReminders(base, text))
      for (const f of FORBIDDEN_IN_NOTIFICATION) expect(x.body.toLowerCase()).not.toContain(f);
  });
});
