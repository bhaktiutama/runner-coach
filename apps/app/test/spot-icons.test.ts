import { describe, expect, it } from 'vitest';
import spot from '../../../packages/ui/src/spot-icons.json';
import { migrate } from '../src/db/migrate';
import { migrations } from '../src/db/migrations';
import { achievements } from '../src/lib/achievements';
import { feelSpot, TYPE_SPOT } from '../src/lib/spotMap';
import { createNodeDb } from './node-db';

describe('ikon spot (UI/UX 14)', () => {
  it('setiap jenis latihan punya ikon yang ada di set', () => {
    for (const name of Object.values(TYPE_SPOT)) expect(spot).toHaveProperty(name);
  });

  it('wajah rasa memakai batas RPE yang sama: 1-4 ringan, 5-7 pas, 8-10 berat', () => {
    expect([1, 4, 5, 7, 8, 10].map(feelSpot)).toEqual([
      'feel-easy',
      'feel-easy',
      'feel-ok',
      'feel-ok',
      'feel-hard',
      'feel-hard',
    ]);
  });

  it('isi SVG hanya memakai warna lewat placeholder token, tanpa hex', () => {
    for (const body of Object.values(spot)) expect(body).not.toMatch(/#[0-9a-fA-F]{3,6}/);
  });

  it('migrasi v9: profil lama mendapat spot_icons = 1 (ikon tampil)', async () => {
    const db = createNodeDb();
    for (const m of migrations.filter((x) => x.version <= 8)) {
      db.raw.exec(m.sql);
      db.raw.exec(`PRAGMA user_version = ${m.version}`);
    }
    await migrate(db);
    const p = await db.getFirstAsync<{ spot_icons: number }>('SELECT spot_icons FROM profile');
    expect(p?.spot_icons).toBe(1);
  });
});

describe('pencapaian (F-28)', () => {
  const runs = (dates: string[], status: 'completed' | 'missed' = 'completed') =>
    dates.map((date) => ({ date, status, type: 'easy' }));
  const base = { acts: [], statuses: [], today: '2026-11-06', planEnd: '2027-01-21' };

  it('5K pertama dari jarak aktivitas terjauh', () => {
    const a = achievements({ ...base, acts: [{ distance_m: 3200 }, { distance_m: null }] });
    expect(a[0]).toMatchObject({ id: 'first_5k', earned: false, done: 3200, total: 5000 });
    expect(achievements({ ...base, acts: [{ distance_m: 5000 }] })[0]!.earned).toBe(true);
  });

  it('4 minggu beruntun: kemajuan dari streak sekarang, didapat jika rekor >= 4', () => {
    // Minggu 12, 19, 26 Okt, 2 Nov tuntas (Senin), hari ini Jumat 6 Nov.
    const four = runs(['2026-10-12', '2026-10-19', '2026-10-26', '2026-11-02']);
    expect(achievements({ ...base, statuses: four })[1]).toMatchObject({ earned: true, done: 4 });
    const two = runs(['2026-10-26', '2026-11-02']);
    expect(achievements({ ...base, statuses: two })[1]).toMatchObject({ earned: false, done: 2, total: 4 });
  });

  it('plan tuntas hanya setelah plan berakhir dan >= 80% lari selesai', () => {
    const st = [
      ...runs(['2026-10-12', '2026-10-13', '2026-10-14', '2026-10-15']),
      ...runs(['2026-10-16'], 'missed'),
    ];
    expect(achievements({ ...base, statuses: st })[2]!.earned).toBe(false); // plan belum berakhir
    expect(achievements({ ...base, statuses: st, planEnd: '2026-11-01' })[2]).toMatchObject({
      earned: true,
      done: 4,
      total: 4,
    });
  });
});
