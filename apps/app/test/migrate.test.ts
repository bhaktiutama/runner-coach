import { describe, expect, it } from 'vitest';
import { migrate } from '../src/db/migrate';
import { LATEST_SCHEMA_VERSION, migrations } from '../src/db/migrations';
import { createNodeDb } from './node-db';

describe('migrasi lokal', () => {
  it('database baru naik ke versi terbaru', async () => {
    const db = createNodeDb();
    expect(await migrate(db)).toBe(LATEST_SCHEMA_VERSION);
    const meta = await db.getFirstAsync<{ schema_version: number }>('SELECT schema_version FROM app_meta');
    expect(meta?.schema_version).toBe(LATEST_SCHEMA_VERSION);
    const tables = await db.getAllAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name",
    );
    expect(tables.map((t) => t.name)).toEqual([
      'activities',
      'app_meta',
      'fitness_snapshots',
      'goals',
      'plan_adjustments',
      'planned_workouts',
      'plans',
      'profile',
      'workout_feedback',
    ]);
  });

  it('naik dari setiap versi sebelumnya tanpa kehilangan data', async () => {
    for (let from = 1; from < LATEST_SCHEMA_VERSION; from++) {
      const db = createNodeDb();
      db.raw.exec('PRAGMA foreign_keys = ON');
      for (const m of migrations.filter((x) => x.version <= from)) {
        db.raw.exec(m.sql);
        db.raw.exec(`PRAGMA user_version = ${m.version}`);
      }
      db.raw.exec("UPDATE profile SET display_name = 'Rani', reminder_time = '05:30'");
      await migrate(db);
      const p = await db.getFirstAsync<{ display_name: string; reminder_time: string }>(
        'SELECT display_name, reminder_time FROM profile',
      );
      expect(p).toEqual({ display_name: 'Rani', reminder_time: '05:30' });
      const v = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
      expect(v?.user_version).toBe(LATEST_SCHEMA_VERSION);
    }
  });

  it('idempoten saat dijalankan ulang', async () => {
    const db = createNodeDb();
    await migrate(db);
    await migrate(db);
    const n = await db.getFirstAsync<{ n: number }>('SELECT count(*) n FROM profile');
    expect(n?.n).toBe(1);
  });

  it('menolak database dari versi app lebih baru', async () => {
    const db = createNodeDb();
    db.raw.exec(`PRAGMA user_version = ${LATEST_SCHEMA_VERSION + 1}`);
    await expect(migrate(db)).rejects.toThrow();
  });

  it('check constraint menolak nilai di luar enum', async () => {
    const db = createNodeDb();
    await migrate(db);
    await expect(db.runAsync("UPDATE profile SET unit = 'yard'")).rejects.toThrow();
  });
});
