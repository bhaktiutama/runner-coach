import { describe, expect, it } from 'vitest';
import { migrate } from '../src/db/migrate';
import { migrations } from '../src/db/migrations';
import { createNodeDb } from './node-db';

// v10: analitik jadi opt-in (TRD 6 aturan 5). Instalasi baru dan lama mulai dari 0.
describe('migrasi v10', () => {
  it('instalasi baru: analitik mati', async () => {
    const db = createNodeDb();
    await migrate(db);
    const m = await db.getFirstAsync<{ analytics_opt_in: number }>('SELECT analytics_opt_in FROM app_meta');
    expect(m?.analytics_opt_in).toBe(0);
  });

  it('instalasi lama dengan analitik aktif: dimatikan, bisa dinyalakan lagi', async () => {
    const db = createNodeDb();
    for (const m of migrations.filter((x) => x.version <= 9)) {
      db.raw.exec(m.sql);
      db.raw.exec(`PRAGMA user_version = ${m.version}`);
    }
    db.raw.exec('UPDATE app_meta SET analytics_opt_in = 1');
    await migrate(db);
    const m = await db.getFirstAsync<{ analytics_opt_in: number }>('SELECT analytics_opt_in FROM app_meta');
    expect(m?.analytics_opt_in).toBe(0);
    db.raw.exec('UPDATE app_meta SET analytics_opt_in = 1');
    const again = await db.getFirstAsync<{ analytics_opt_in: number }>(
      'SELECT analytics_opt_in FROM app_meta',
    );
    expect(again?.analytics_opt_in).toBe(1);
  });
});
