import type { Db } from '@/db/types';
import { newId, nowIso } from '@/lib/id';
import type { WorkoutRow, WorkoutStatus } from './rows';

// Aktivitas + feedback (F-06, F-15, Schema 2). Lokal saja.

export const TAGS = ['hot', 'poor_sleep', 'sore_legs', 'pain'] as const;
export type Tag = (typeof TAGS)[number];

export type ActivityRow = {
  id: string;
  created_at: string;
  updated_at: string;
  planned_workout_id: string | null;
  source: 'manual' | 'timer' | 'strava' | 'healthkit' | 'health_connect';
  external_id: string | null;
  started_at: string;
  distance_m: number | null;
  duration_s: number;
  avg_hr: number | null;
  segments: string | null;
  splits: string | null;
};

export const LOAD_FEELS = ['too_hard', 'ok', 'too_easy'] as const;
export type LoadFeel = (typeof LOAD_FEELS)[number];

export type ActivityView = ActivityRow & {
  rpe: number | null;
  load_feel: LoadFeel | null;
  tags: Tag[];
  notes: string | null;
  workout_type: WorkoutRow['type'] | null;
  workout_steps: string | null;
  workout_date: string | null;
};

export type NewActivity = {
  plannedWorkoutId: string | null;
  source: 'manual' | 'timer';
  startedAt: string;
  distanceM: number | null;
  durationS: number;
  segments?: unknown;
  rpe: number;
  tags: Tag[];
  notes?: string | null;
  /** Sesi strength/core (F-21): terlalu berat / pas / terlalu ringan. */
  loadFeel?: LoadFeel | null;
};

/** Simpan aktivitas + feedback dalam 1 transaksi; latihan yang dicocokkan jadi `completed` (3.1). */
export async function saveActivity(db: Db, a: NewActivity): Promise<string> {
  if (!(a.durationS > 0)) throw new Error('duration');
  if (!(a.rpe >= 1 && a.rpe <= 10)) throw new Error('rpe');
  const id = newId();
  const ts = nowIso();
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO activities (id, created_at, updated_at, planned_workout_id, source, started_at, distance_m, duration_s, segments)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        ts,
        ts,
        a.plannedWorkoutId,
        a.source,
        a.startedAt,
        a.distanceM,
        Math.round(a.durationS),
        a.segments ? JSON.stringify(a.segments) : null,
      ],
    );
    await db.runAsync(
      `INSERT INTO workout_feedback (id, created_at, updated_at, activity_id, rpe, tags, notes, load_feel)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newId(),
        ts,
        ts,
        id,
        a.rpe,
        JSON.stringify(a.tags.filter((t) => TAGS.includes(t))),
        a.notes ?? null,
        a.loadFeel && LOAD_FEELS.includes(a.loadFeel) ? a.loadFeel : null,
      ],
    );
    if (a.plannedWorkoutId) {
      await db.runAsync("UPDATE planned_workouts SET status = 'completed', updated_at = ? WHERE id = ?", [
        ts,
        a.plannedWorkoutId,
      ]);
    }
  });
  return id;
}

/**
 * FL-3: latihan lari terjadwal (strength/core tidak dicocokkan ke log lari) di tanggal itu yang belum selesai (scheduled, missed atau skipped).
 * Tidak ada -> lari tambahan.
 */
export async function matchWorkout(db: Db, date: string): Promise<WorkoutRow | null> {
  return db.getFirstAsync<WorkoutRow>(
    `SELECT w.* FROM planned_workouts w JOIN plans p ON p.id = w.plan_id
     WHERE p.status != 'archived' AND w.date = ? AND w.status IN ('scheduled', 'missed', 'skipped')
       AND w.type NOT IN ('strength', 'core')
     ORDER BY CASE w.status WHEN 'scheduled' THEN 0 WHEN 'missed' THEN 1 ELSE 2 END LIMIT 1`,
    [date],
  );
}

const VIEW_SQL = `SELECT a.*, f.rpe, f.tags, f.notes, f.load_feel, w.type AS workout_type, w.steps AS workout_steps, w.date AS workout_date
  FROM activities a LEFT JOIN workout_feedback f ON f.activity_id = a.id
  LEFT JOIN planned_workouts w ON w.id = a.planned_workout_id`;

type RawView = Omit<ActivityView, 'tags'> & { tags: string | null };
const toView = (r: RawView): ActivityView => ({ ...r, tags: r.tags ? (JSON.parse(r.tags) as Tag[]) : [] });

export async function listActivities(
  db: Db,
  opts: { from?: string; limit?: number } = {},
): Promise<ActivityView[]> {
  const rows = await db.getAllAsync<RawView>(
    `${VIEW_SQL} WHERE (? IS NULL OR substr(a.started_at, 1, 10) >= ?) ORDER BY a.started_at DESC LIMIT ?`,
    [opts.from ?? null, opts.from ?? null, opts.limit ?? 10_000],
  );
  return rows.map(toView);
}

export async function getActivity(db: Db, id: string): Promise<ActivityView | null> {
  const r = await db.getFirstAsync<RawView>(`${VIEW_SQL} WHERE a.id = ?`, [id]);
  return r ? toView(r) : null;
}

export async function workoutStatuses(
  db: Db,
  planId: string,
): Promise<{ date: string; status: WorkoutStatus; type: WorkoutRow['type'] }[]> {
  return db.getAllAsync('SELECT date, status, type FROM planned_workouts WHERE plan_id = ? ORDER BY date', [
    planId,
  ]);
}

/** Apakah semua latihan terjadwal minggu ini sudah tidak `scheduled` (untuk 2.5). */
export async function weekFinished(db: Db, planId: string, from: string, to: string): Promise<boolean> {
  const r = await db.getFirstAsync<{ n: number; open: number }>(
    `SELECT count(*) n, sum(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) open
     FROM planned_workouts WHERE plan_id = ? AND date >= ? AND date <= ?`,
    [planId, from, to],
  );
  return (r?.n ?? 0) > 0 && (r?.open ?? 0) === 0;
}
