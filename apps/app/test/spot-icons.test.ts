import { describe, expect, it } from 'vitest';
import spot from '../../../packages/ui/src/spot-icons.json';
import { migrate } from '../src/db/migrate';
import { migrations } from '../src/db/migrations';
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
