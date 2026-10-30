import { describe, expect, it } from 'vitest';
import { migrate } from '../src/db/migrate';
import { migrations } from '../src/db/migrations';
import { createNodeDb } from './node-db';

// v5 membangun ulang planned_workouts (tipe 'progression'); relasi aktivitas tidak boleh hilang.
describe('migrasi v5', () => {
  it('relasi activities -> planned_workouts tetap, tipe progression diterima', async () => {
    const db = createNodeDb();
    for (const m of migrations.filter((x) => x.version <= 4)) {
      db.raw.exec(m.sql);
      db.raw.exec(`PRAGMA user_version = ${m.version}`);
    }
    const now = '2026-10-30T00:00:00Z';
    db.raw.exec(`
      INSERT INTO goals (id, created_at, updated_at, distance, level, weekly_volume_m, longest_run_m) VALUES ('g', '${now}', '${now}', '10k', 'recreational', 20000, 8000);
      INSERT INTO plans (id, created_at, updated_at, goal_id, start_date, end_date, params) VALUES ('p', '${now}', '${now}', 'g', '2026-11-02', '2027-01-10', '{}');
      INSERT INTO planned_workouts (id, created_at, updated_at, plan_id, date, week_index, phase, type, steps) VALUES ('w', '${now}', '${now}', 'p', '2026-11-03', 1, 'base', 'easy', '[]');
      INSERT INTO activities (id, created_at, updated_at, planned_workout_id, source, started_at, duration_s) VALUES ('a', '${now}', '${now}', 'w', 'manual', '${now}', 1800);
    `);
    await migrate(db);
    const a = await db.getFirstAsync<{ planned_workout_id: string | null }>(
      "SELECT planned_workout_id FROM activities WHERE id = 'a'",
    );
    expect(a?.planned_workout_id).toBe('w');
    await db.runAsync(
      "INSERT INTO planned_workouts (id, created_at, updated_at, plan_id, date, week_index, phase, type, steps) VALUES ('w2', ?, ?, 'p', '2026-11-04', 1, 'build', 'progression', '[]')",
      [now, now],
    );
    const fk = await db.getFirstAsync<{ foreign_keys: number }>('PRAGMA foreign_keys');
    expect(fk?.foreign_keys).toBe(1);
  });
});
