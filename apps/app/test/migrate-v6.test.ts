import { describe, expect, it } from 'vitest';
import { migrate } from '../src/db/migrate';
import { migrations } from '../src/db/migrations';
import { createNodeDb } from './node-db';

const now = '2026-10-30T00:00:00Z';

function upTo(version: number) {
  const db = createNodeDb();
  for (const m of migrations.filter((x) => x.version <= version)) {
    db.raw.exec(m.sql);
    db.raw.exec(`PRAGMA user_version = ${m.version}`);
  }
  return db;
}

// v6 membangun ulang planned_workouts (tipe strength/core) + kolom baru profil dan feedback.
describe('migrasi v6', () => {
  it('relasi aktivitas tetap, tipe strength diterima, profil lama tetap bahasa Indonesia', async () => {
    const db = upTo(5);
    db.raw.exec(`
      INSERT INTO goals (id, created_at, updated_at, distance, level, weekly_volume_m, longest_run_m) VALUES ('g', '${now}', '${now}', '10k', 'recreational', 20000, 8000);
      INSERT INTO plans (id, created_at, updated_at, goal_id, start_date, end_date, params) VALUES ('p', '${now}', '${now}', 'g', '2026-11-02', '2027-01-10', '{}');
      INSERT INTO planned_workouts (id, created_at, updated_at, plan_id, date, week_index, phase, type, steps) VALUES ('w', '${now}', '${now}', 'p', '2026-11-03', 1, 'base', 'progression', '[]');
      INSERT INTO activities (id, created_at, updated_at, planned_workout_id, source, started_at, duration_s) VALUES ('a', '${now}', '${now}', 'w', 'manual', '${now}', 1800);
      INSERT INTO workout_feedback (id, created_at, updated_at, activity_id, rpe) VALUES ('f', '${now}', '${now}', 'a', 5);
    `);
    await migrate(db);
    const a = await db.getFirstAsync<{ planned_workout_id: string | null }>(
      "SELECT planned_workout_id FROM activities WHERE id = 'a'",
    );
    expect(a?.planned_workout_id).toBe('w');
    await db.runAsync(
      "INSERT INTO planned_workouts (id, created_at, updated_at, plan_id, date, week_index, phase, type, steps) VALUES ('s', ?, ?, 'p', '2026-11-03', 1, 'base', 'strength', '[]')",
      [now, now],
    );
    const p = await db.getFirstAsync<{ locale: string; strength_opt_in: number }>('SELECT * FROM profile');
    expect(p).toMatchObject({ locale: 'id-ID', strength_opt_in: 0 });
    const f = await db.getFirstAsync<{ load_feel: string | null }>('SELECT load_feel FROM workout_feedback');
    expect(f?.load_feel).toBeNull();
    await expect(db.runAsync("UPDATE workout_feedback SET load_feel = 'heavy'")).rejects.toThrow();
  });

  it('install baru: bahasa mengikuti perangkat', async () => {
    const db = createNodeDb();
    await migrate(db);
    const p = await db.getFirstAsync<{ locale: string }>('SELECT locale FROM profile');
    expect(p?.locale).toBe('system');
  });
});
