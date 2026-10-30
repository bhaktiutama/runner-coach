// Migrasi skema lokal berurutan (TRD 3.1). Versi tersimpan di PRAGMA user_version.
// Jangan ubah migrasi yang sudah dirilis; tambah versi baru.
// Skema: docs/specs/05-BACKEND-SCHEMA.md bagian 2.

/** `foreignKeysOff`: untuk membangun ulang tabel (SQLite tidak bisa mengubah CHECK). Tanpa ini,
 * DROP TABLE memicu ON DELETE SET NULL di tabel anak dan relasinya hilang. */
export type Migration = { version: number; sql: string; foreignKeysOff?: boolean };

const std = `id TEXT PRIMARY KEY NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL`;

export const migrations: Migration[] = [
  {
    version: 1,
    sql: `
CREATE TABLE app_meta (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  schema_version INTEGER NOT NULL,
  owner_id TEXT NULL,
  last_backup_at TEXT NULL,
  analytics_opt_in INTEGER NOT NULL DEFAULT 1 CHECK (analytics_opt_in IN (0, 1)),
  backup_reminder_dismissed INTEGER NOT NULL DEFAULT 0 CHECK (backup_reminder_dismissed IN (0, 1)),
  onboarding_draft TEXT NULL,
  active_timer TEXT NULL
);
CREATE TABLE profile (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  display_name TEXT NULL,
  unit TEXT NOT NULL DEFAULT 'km' CHECK (unit IN ('km', 'mi')),
  timezone TEXT NOT NULL DEFAULT 'Asia/Jakarta',
  locale TEXT NOT NULL DEFAULT 'id-ID',
  reminder_time TEXT NULL,
  intensity_guide TEXT NOT NULL DEFAULT 'pace' CHECK (intensity_guide IN ('pace', 'hr', 'rpe')),
  health_flag INTEGER NOT NULL DEFAULT 0 CHECK (health_flag IN (0, 1)),
  disclaimer_accepted_at TEXT NULL
);
INSERT INTO app_meta (id, schema_version) VALUES (1, 1);
INSERT INTO profile (id) VALUES (1);
`,
  },
  {
    version: 2,
    sql: `
CREATE TABLE goals (
  ${std},
  distance TEXT NOT NULL CHECK (distance IN ('5k', '10k', 'hm', 'fm', 'fitness')),
  race_date TEXT NULL,
  race_name TEXT NULL,
  target_time_s INTEGER NULL,
  baseline_distance TEXT NULL,
  baseline_time_s INTEGER NULL,
  level TEXT NULL CHECK (level IN ('beginner', 'recreational')),
  weekly_volume_m INTEGER NOT NULL,
  longest_run_m INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  CHECK (baseline_time_s IS NOT NULL OR level IS NOT NULL)
);
CREATE UNIQUE INDEX goals_one_active ON goals (status) WHERE status = 'active';
CREATE TABLE plans (
  ${std},
  goal_id TEXT NOT NULL REFERENCES goals (id) ON DELETE CASCADE,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  params TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
  pause_reason TEXT NULL CHECK (pause_reason IN ('injury', 'sick', 'busy')),
  paused_at TEXT NULL,
  pause_expected_days INTEGER NULL
);
CREATE TABLE planned_workouts (
  ${std},
  plan_id TEXT NOT NULL REFERENCES plans (id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  week_index INTEGER NOT NULL,
  phase TEXT NOT NULL CHECK (phase IN ('base', 'build', 'peak', 'taper', 'return')),
  type TEXT NOT NULL CHECK (type IN ('easy', 'run_walk', 'long', 'tempo', 'interval', 'strides', 'recovery', 'rest')),
  steps TEXT NOT NULL,
  target_distance_m INTEGER NULL,
  target_duration_s INTEGER NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'skipped', 'missed')),
  original_date TEXT NULL,
  rationale TEXT NOT NULL DEFAULT '[]'
);
CREATE INDEX planned_workouts_date ON planned_workouts (date);
`,
  },
  {
    version: 3,
    sql: `
CREATE TABLE activities (
  ${std},
  planned_workout_id TEXT NULL REFERENCES planned_workouts (id) ON DELETE SET NULL,
  source TEXT NOT NULL CHECK (source IN ('manual', 'timer', 'strava', 'healthkit', 'health_connect')),
  external_id TEXT NULL,
  started_at TEXT NOT NULL,
  distance_m INTEGER NULL,
  duration_s INTEGER NOT NULL CHECK (duration_s > 0),
  avg_hr INTEGER NULL,
  segments TEXT NULL,
  splits TEXT NULL
);
CREATE INDEX activities_started_at ON activities (started_at DESC);
CREATE UNIQUE INDEX activities_external ON activities (source, external_id) WHERE external_id IS NOT NULL;
CREATE TABLE workout_feedback (
  ${std},
  activity_id TEXT NOT NULL UNIQUE REFERENCES activities (id) ON DELETE CASCADE,
  rpe INTEGER NOT NULL CHECK (rpe BETWEEN 1 AND 10),
  tags TEXT NOT NULL DEFAULT '[]',
  notes TEXT NULL
);
CREATE TABLE fitness_snapshots (
  ${std},
  date TEXT NOT NULL UNIQUE,
  vdot_estimate REAL NULL,
  predicted_time_min_s INTEGER NULL,
  predicted_time_max_s INTEGER NULL,
  weekly_volume_m INTEGER NOT NULL
);
`,
  },
  {
    version: 4,
    sql: `
CREATE TABLE plan_adjustments (
  ${std},
  plan_id TEXT NOT NULL REFERENCES plans (id) ON DELETE CASCADE,
  week_index INTEGER NOT NULL,
  rule TEXT NOT NULL,
  changes TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('proposed', 'accepted', 'rejected')),
  UNIQUE (plan_id, week_index, rule)
);
`,
  },
  {
    // Tipe latihan 'progression' (E-22). Tabel dibangun ulang mengikuti prosedur resmi SQLite.
    version: 5,
    foreignKeysOff: true,
    sql: `
CREATE TABLE planned_workouts_v5 (
  ${std},
  plan_id TEXT NOT NULL REFERENCES plans (id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  week_index INTEGER NOT NULL,
  phase TEXT NOT NULL CHECK (phase IN ('base', 'build', 'peak', 'taper', 'return')),
  type TEXT NOT NULL CHECK (type IN ('easy', 'run_walk', 'long', 'tempo', 'interval', 'strides', 'recovery', 'progression', 'rest')),
  steps TEXT NOT NULL,
  target_distance_m INTEGER NULL,
  target_duration_s INTEGER NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'skipped', 'missed')),
  original_date TEXT NULL,
  rationale TEXT NOT NULL DEFAULT '[]'
);
INSERT INTO planned_workouts_v5 SELECT * FROM planned_workouts;
DROP TABLE planned_workouts;
ALTER TABLE planned_workouts_v5 RENAME TO planned_workouts;
CREATE INDEX planned_workouts_date ON planned_workouts (date);
`,
  },
  {
    // Fase 2 (F-21, F-22): tipe 'strength'/'core', pilihan strength di profil, rasa beban sesi
    // strength, bahasa. Install baru (belum ada target) mengikuti bahasa perangkat ('system').
    version: 6,
    foreignKeysOff: true,
    sql: `
CREATE TABLE planned_workouts_v6 (
  ${std},
  plan_id TEXT NOT NULL REFERENCES plans (id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  week_index INTEGER NOT NULL,
  phase TEXT NOT NULL CHECK (phase IN ('base', 'build', 'peak', 'taper', 'return')),
  type TEXT NOT NULL CHECK (type IN ('easy', 'run_walk', 'long', 'tempo', 'interval', 'strides', 'recovery', 'progression', 'rest', 'strength', 'core')),
  steps TEXT NOT NULL,
  target_distance_m INTEGER NULL,
  target_duration_s INTEGER NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'skipped', 'missed')),
  original_date TEXT NULL,
  rationale TEXT NOT NULL DEFAULT '[]'
);
INSERT INTO planned_workouts_v6 SELECT * FROM planned_workouts;
DROP TABLE planned_workouts;
ALTER TABLE planned_workouts_v6 RENAME TO planned_workouts;
CREATE INDEX planned_workouts_date ON planned_workouts (date);
ALTER TABLE profile ADD COLUMN strength_opt_in INTEGER NOT NULL DEFAULT 0 CHECK (strength_opt_in IN (0, 1));
ALTER TABLE workout_feedback ADD COLUMN load_feel TEXT NULL CHECK (load_feel IN ('too_hard', 'ok', 'too_easy'));
UPDATE profile SET locale = 'system' WHERE NOT EXISTS (SELECT 1 FROM goals);
`,
  },
];

export const LATEST_SCHEMA_VERSION = migrations[migrations.length - 1]!.version;
