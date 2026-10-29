import {
  addDays,
  type GeneratedPlan,
  type GeneratedWorkout,
  type PlanInput,
  type Rationale,
  type Step,
} from '@run-coach/training-engine';
import type { Db } from '@/db/types';
import { newId, nowIso } from '@/lib/id';
import type { Draft } from './onboarding';
import {
  toWorkout,
  type GoalRow,
  type MetaRow,
  type PlanParams,
  type PlanRow,
  type ProfileRow,
  type Workout,
  type WorkoutRow,
  type WorkoutStatus,
} from './rows';

// Repository SQLite lokal. Satu-satunya tempat data pribadi (TRD 3). Tidak ada panggilan jaringan.

export async function getMeta(db: Db): Promise<MetaRow> {
  return (await db.getFirstAsync<MetaRow>('SELECT * FROM app_meta WHERE id = 1'))!;
}

export async function setDraft(db: Db, draft: Draft | null): Promise<void> {
  await db.runAsync('UPDATE app_meta SET onboarding_draft = ? WHERE id = 1', [
    draft ? JSON.stringify(draft) : null,
  ]);
}

export async function setOwner(db: Db, ownerId: string | null): Promise<void> {
  await db.runAsync('UPDATE app_meta SET owner_id = ? WHERE id = 1', [ownerId]);
}

export async function updateMeta(
  db: Db,
  patch: Partial<Pick<MetaRow, 'last_backup_at' | 'analytics_opt_in' | 'backup_reminder_dismissed'>>,
): Promise<void> {
  const keys = Object.keys(patch) as (keyof typeof patch)[];
  if (!keys.length) return;
  await db.runAsync(
    `UPDATE app_meta SET ${keys.map((k) => `${k} = ?`).join(', ')} WHERE id = 1`,
    keys.map((k) => patch[k] ?? null),
  );
}

export async function getProfile(db: Db): Promise<ProfileRow> {
  return (await db.getFirstAsync<ProfileRow>('SELECT * FROM profile WHERE id = 1'))!;
}

const PROFILE_KEYS = [
  'display_name',
  'unit',
  'timezone',
  'locale',
  'reminder_time',
  'intensity_guide',
  'health_flag',
  'disclaimer_accepted_at',
] as const;

export async function updateProfile(db: Db, patch: Partial<ProfileRow>): Promise<void> {
  const keys = PROFILE_KEYS.filter((k) => k in patch);
  if (!keys.length) return;
  await db.runAsync(
    `UPDATE profile SET ${keys.map((k) => `${k} = ?`).join(', ')} WHERE id = 1`,
    keys.map((k) => (patch[k] as string | number | null | undefined) ?? null),
  );
}

async function insertWorkouts(db: Db, planId: string, workouts: GeneratedWorkout[], ts: string) {
  for (const w of workouts) {
    await db.runAsync(
      `INSERT INTO planned_workouts (id, created_at, updated_at, plan_id, date, week_index, phase, type, steps,
        target_distance_m, target_duration_s, status, rationale)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'scheduled', ?)`,
      [
        newId(),
        ts,
        ts,
        planId,
        w.date,
        w.weekIndex,
        w.phase,
        w.type,
        JSON.stringify(w.steps),
        w.targetDistanceM,
        w.targetDurationS,
        JSON.stringify(w.rationale),
      ],
    );
  }
}

/**
 * Simpan target + plan hasil engine (akhir 1.7). Goal/plan aktif lama diarsipkan.
 * Profil: jam pengingat, flag kesehatan + waktu disclaimer (jawaban screening tidak disimpan).
 */
export async function savePlanFromOnboarding(
  db: Db,
  draft: Draft,
  input: PlanInput,
  plan: GeneratedPlan,
): Promise<string> {
  const ts = nowIso();
  const goalId = newId();
  const planId = newId();
  await db.withTransactionAsync(async () => {
    await db.runAsync("UPDATE plans SET status = 'archived', updated_at = ? WHERE status != 'archived'", [
      ts,
    ]);
    await db.runAsync("UPDATE goals SET status = 'abandoned', updated_at = ? WHERE status = 'active'", [ts]);
    const g = input.goal;
    await db.runAsync(
      `INSERT INTO goals (id, created_at, updated_at, distance, race_date, race_name, target_time_s, baseline_distance,
        baseline_time_s, level, weekly_volume_m, longest_run_m, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [
        goalId,
        ts,
        ts,
        g.distance,
        g.raceDate,
        draft.raceName?.trim() || null,
        plan.prediction?.likelyS ?? null,
        g.baselineDistance,
        g.baselineTimeS,
        g.level ?? (g.baselineTimeS ? null : 'beginner'),
        g.weeklyVolumeM,
        g.longestRunM,
      ],
    );
    const params: PlanParams = {
      ...plan.params,
      weeks: plan.weeks,
      prediction: plan.prediction,
    };
    await db.runAsync(
      `INSERT INTO plans (id, created_at, updated_at, goal_id, start_date, end_date, params, version, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, 'active')`,
      [planId, ts, ts, goalId, plan.startDate, plan.endDate, JSON.stringify(params)],
    );
    await insertWorkouts(db, planId, plan.workouts, ts);
    await db.runAsync(
      `UPDATE profile SET reminder_time = ?, health_flag = ?, disclaimer_accepted_at = ? WHERE id = 1`,
      [draft.reminderTime ?? null, draft.healthFlag ? 1 : 0, ts],
    );
  });
  return planId;
}

export async function getActivePlan(db: Db): Promise<(PlanRow & { goal: GoalRow }) | null> {
  const p = await db.getFirstAsync<PlanRow>(
    "SELECT * FROM plans WHERE status != 'archived' ORDER BY created_at DESC LIMIT 1",
  );
  if (!p) return null;
  const goal = (await db.getFirstAsync<GoalRow>('SELECT * FROM goals WHERE id = ?', [p.goal_id]))!;
  return { ...p, goal };
}

export async function getWorkouts(db: Db, planId: string, from?: string, to?: string): Promise<Workout[]> {
  const rows = await db.getAllAsync<WorkoutRow>(
    `SELECT * FROM planned_workouts WHERE plan_id = ? AND (? IS NULL OR date >= ?) AND (? IS NULL OR date <= ?)
     ORDER BY date, created_at`,
    [planId, from ?? null, from ?? null, to ?? null, to ?? null],
  );
  return rows.map(toWorkout);
}

export async function getWorkout(db: Db, id: string): Promise<Workout | null> {
  const r = await db.getFirstAsync<WorkoutRow>('SELECT * FROM planned_workouts WHERE id = ?', [id]);
  return r ? toWorkout(r) : null;
}

export async function setWorkoutStatus(db: Db, id: string, status: WorkoutStatus): Promise<void> {
  await db.runAsync('UPDATE planned_workouts SET status = ?, updated_at = ? WHERE id = ?', [
    status,
    nowIso(),
    id,
  ]);
}

export async function updateWorkout(
  db: Db,
  id: string,
  patch: {
    type?: Workout['type'];
    steps?: Step[];
    rationale?: Rationale[];
    date?: string;
    original_date?: string | null;
    target_distance_m?: number;
    target_duration_s?: number;
  },
): Promise<void> {
  const sets: string[] = [];
  const vals: (string | number | null)[] = [];
  for (const [k, v] of Object.entries(patch)) {
    sets.push(`${k} = ?`);
    vals.push(k === 'steps' || k === 'rationale' ? JSON.stringify(v) : (v as string | number | null));
  }
  sets.push('updated_at = ?');
  vals.push(nowIso(), id);
  await db.runAsync(`UPDATE planned_workouts SET ${sets.join(', ')} WHERE id = ?`, vals);
}

export async function deleteWorkout(db: Db, id: string): Promise<void> {
  await db.runAsync('DELETE FROM planned_workouts WHERE id = ?', [id]);
}

/** State 3.1: latihan terjadwal yang tanggalnya sudah lewat tanpa aktivitas jadi `missed`. */
export async function markMissed(db: Db, today: string): Promise<number> {
  const r = await db.runAsync(
    `UPDATE planned_workouts SET status = 'missed', updated_at = ?
     WHERE status = 'scheduled' AND date < ?
       AND NOT EXISTS (SELECT 1 FROM activities a WHERE a.planned_workout_id = planned_workouts.id)`,
    [nowIso(), today],
  );
  return r.changes;
}

/** Lari terjauh (jarak aktual atau target latihan selesai) di 30 hari sebelum tanggal (E-06). */
export async function longestRun30(db: Db, date: string, fallbackM: number): Promise<number> {
  const from = addDays(date, -30);
  const a = await db.getFirstAsync<{ m: number | null }>(
    'SELECT max(distance_m) m FROM activities WHERE started_at >= ? AND started_at < ?',
    [from, date],
  );
  const w = await db.getFirstAsync<{ m: number | null }>(
    "SELECT max(target_distance_m) m FROM planned_workouts WHERE status = 'completed' AND date >= ? AND date < ?",
    [from, date],
  );
  return Math.max(a?.m ?? 0, w?.m ?? 0, fallbackM);
}

export async function getActiveTimer(db: Db): Promise<string | null> {
  return (
    (
      await db.getFirstAsync<{ active_timer: string | null }>(
        'SELECT active_timer FROM app_meta WHERE id = 1',
      )
    )?.active_timer ?? null
  );
}

export async function setActiveTimer(db: Db, json: string | null): Promise<void> {
  await db.runAsync('UPDATE app_meta SET active_timer = ? WHERE id = 1', [json]);
}
