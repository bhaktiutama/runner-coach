import {
  addDays,
  applyChanges,
  buildReturnWeek,
  diffDays,
  easierStrength,
  isSupportType,
  planStrength,
  type GeneratedWorkout,
  type Level,
  type Phase,
  type StrengthLevel,
  type StrengthType,
  generatePlan,
  mondayOf,
  paceZones,
  proposeAdjustments,
  runningDistance,
  shiftScheduled,
  totalDuration,
  type Change,
  type FeedbackPoint,
  type Proposal,
  type Weekday,
} from '@run-coach/training-engine';
import type { Db } from '@/db/types';
import { newId, nowIso } from '@/lib/id';
import { listActivities } from './activities';
import { getActivePlan, getWorkout, getWorkouts, longestRun30, updateWorkout } from './repo';
import { planParams, type PlanParams } from './rows';

// Operasi plan M6: jeda/lanjut (F-09, E-13), adaptasi (F-11), atur ulang hari (4.1).

export async function pausePlan(db: Db, reason: 'injury' | 'sick' | 'busy', expectedDays: number | null) {
  const p = await getActivePlan(db);
  if (!p) return;
  await db.runAsync(
    "UPDATE plans SET status = 'paused', pause_reason = ?, paused_at = ?, pause_expected_days = ?, updated_at = ? WHERE id = ?",
    [reason, nowIso(), expectedDays, nowIso(), p.id],
  );
}

/**
 * Lanjut setelah jeda: latihan terjadwal yang tersisa digeser per minggu penuh, 1 minggu
 * Return to run disisipkan mulai hari ini (E-13).
 */
export async function resumePlan(db: Db, today: string): Promise<void> {
  const p = await getActivePlan(db);
  if (!p || p.status !== 'paused' || !p.paused_at) return;
  const pausedDate = p.paused_at.slice(0, 10);
  const daysOff = Math.max(1, diffDays(pausedDate, today));
  const params = planParams(p);
  const ws = await getWorkouts(db, p.id);
  const resumeMonday = mondayOf(today);
  // Minggu return = sisa minggu ini + minggu berikut jika hari ini akhir minggu.
  const returnStart = today;
  const shiftFrom = pausedDate < resumeMonday ? pausedDate : today;
  const weeksShift = Math.max(1, Math.ceil(diffDays(mondayOf(shiftFrom), addDays(resumeMonday, 7)) / 7));
  const shifted = shiftScheduled(
    ws.map((w) => ({ id: w.id, date: w.date, status: w.status })),
    shiftFrom,
    weeksShift,
  );
  const longest = await longestRun30(db, pausedDate, p.goal.longest_run_m);
  const ret = buildReturnWeek({
    resumeDate: returnStart,
    availableDays: params.available_days as Weekday[],
    zones: paceZones(params.vdot),
    recentLongestM: longest,
    daysOff,
    weekIndex: 0,
  }).filter((w) => w.date < addDays(resumeMonday, 7 * weeksShift));
  const ts = nowIso();
  await db.withTransactionAsync(async () => {
    for (const s of shifted) {
      const orig = ws.find((w) => w.id === s.id)!;
      if (s.date !== orig.date) {
        // Melewati batas race: latihan dihapus (tanggal race tetap).
        if (p.goal.race_date && s.date >= p.goal.race_date)
          await db.runAsync('DELETE FROM planned_workouts WHERE id = ?', [s.id]);
        else await updateWorkout(db, s.id, { date: s.date });
      }
    }
    for (const w of ret) {
      const existing = await db.getFirstAsync<{ id: string }>(
        "SELECT id FROM planned_workouts WHERE plan_id = ? AND date = ? AND status = 'scheduled' AND type NOT IN ('strength', 'core')",
        [p.id, w.date],
      );
      if (existing) await db.runAsync('DELETE FROM planned_workouts WHERE id = ?', [existing.id]);
      await db.runAsync(
        `INSERT INTO planned_workouts (id, created_at, updated_at, plan_id, date, week_index, phase, type, steps,
          target_distance_m, target_duration_s, status, rationale) VALUES (?, ?, ?, ?, ?, ?, 'return', ?, ?, ?, ?, 'scheduled', ?)`,
        [
          newId(),
          ts,
          ts,
          p.id,
          w.date,
          0,
          w.type,
          JSON.stringify(w.steps),
          w.targetDistanceM,
          w.targetDurationS,
          JSON.stringify(w.rationale),
        ],
      );
    }
    await db.runAsync(
      "UPDATE plans SET status = 'active', pause_reason = NULL, paused_at = NULL, pause_expected_days = NULL, end_date = max(end_date, ?), updated_at = ? WHERE id = ?",
      [p.end_date, ts, p.id],
    );
  });
}

/** Usulan adaptasi minggu yang baru selesai (2.5). Usulan yang sudah ditolak tidak muncul lagi. */
export async function weeklyProposals(db: Db, today: string, weekStart: string): Promise<Proposal[]> {
  const p = await getActivePlan(db);
  if (!p) return [];
  const week = await getWorkouts(db, p.id, weekStart, addDays(weekStart, 6));
  const nextWeek = await getWorkouts(db, p.id, addDays(weekStart, 7), addDays(weekStart, 13));
  // Sesi strength/core bukan lari: tidak dipakai untuk E-13/E-17/E-18.
  const acts = (await listActivities(db)).filter((a) => !a.workout_type || !isSupportType(a.workout_type));
  const feedback: FeedbackPoint[] = acts
    .filter((a) => a.rpe != null && a.workout_type)
    .map((a) => ({ date: a.started_at, type: a.workout_type!, rpe: a.rpe! }))
    .reverse();
  const last = acts[0]?.started_at.slice(0, 10) ?? null;
  const props = proposeAdjustments({ week, nextWeek, feedback, lastRunDate: last, today });
  const decided = await db.getAllAsync<{ rule: string }>(
    "SELECT rule FROM plan_adjustments WHERE plan_id = ? AND week_index = ? AND status != 'proposed'",
    [p.id, weekIndexFor(planParams(p), addDays(weekStart, 7))],
  );
  return props.filter((x) => !decided.some((d) => d.rule === x.rule));
}

function weekIndexFor(params: PlanParams, date: string): number {
  const first = params.weeks?.[0]?.startDate ?? date;
  return Math.floor(diffDays(first, mondayOf(date)) / 7) + 1;
}

/** "Oke, terapkan" / "Tetap plan awal" (FL-4). Usulan dicatat di plan_adjustments. */
export async function decideProposal(
  db: Db,
  weekStart: string,
  proposal: Proposal,
  accept: boolean,
  today: string,
) {
  const p = await getActivePlan(db);
  if (!p) return;
  const params = planParams(p);
  const nextStart = addDays(weekStart, 7);
  const weekIdx = weekIndexFor(params, nextStart);
  const ts = nowIso();
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO plan_adjustments (id, created_at, updated_at, plan_id, week_index, rule, changes, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT (plan_id, week_index, rule) DO UPDATE SET status = excluded.status, updated_at = excluded.updated_at`,
      [
        newId(),
        ts,
        ts,
        p.id,
        weekIdx,
        proposal.rule,
        JSON.stringify(proposal.changes),
        accept ? 'accepted' : 'rejected',
      ],
    );
    if (!accept) return;
    await applyProposal(db, p.id, params, weekStart, proposal.changes, today);
    await db.runAsync('UPDATE plans SET version = version + 1, updated_at = ? WHERE id = ?', [ts, p.id]);
  });
}

async function applyProposal(
  db: Db,
  planId: string,
  params: PlanParams,
  weekStart: string,
  changes: Change[],
  today: string,
) {
  const zones = paceZones(params.vdot + (changes.find((c) => c.kind === 'pace_up') ? 1 : 0));
  const nextStart = addDays(weekStart, 7);
  const next = await getWorkouts(db, planId, nextStart, addDays(nextStart, 6));
  if (changes.some((c) => c.kind === 'repeat_week')) {
    // E-19: minggu depan = salinan minggu ini (volume tidak dinaikkan).
    const cur = await getWorkouts(db, planId, weekStart, addDays(weekStart, 6));
    for (const w of next.filter((x) => x.status === 'scheduled'))
      await db.runAsync('DELETE FROM planned_workouts WHERE id = ?', [w.id]);
    const ts = nowIso();
    for (const w of cur) {
      await db.runAsync(
        `INSERT INTO planned_workouts (id, created_at, updated_at, plan_id, date, week_index, phase, type, steps,
          target_distance_m, target_duration_s, status, rationale) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'scheduled', ?)`,
        [
          newId(),
          ts,
          ts,
          planId,
          addDays(w.date, 7),
          w.week_index + 1,
          w.phase,
          w.type,
          JSON.stringify(w.steps),
          w.target_distance_m,
          w.target_duration_s,
          JSON.stringify([...w.rationale, { rule: 'E-19', values: { missed: 2 } }]),
        ],
      );
    }
    return;
  }
  if (changes.some((c) => c.kind === 'return_week')) {
    for (const w of next.filter((x) => x.status === 'scheduled'))
      await db.runAsync('DELETE FROM planned_workouts WHERE id = ?', [w.id]);
    const ret = buildReturnWeek({
      resumeDate: today > nextStart ? today : nextStart,
      availableDays: params.available_days as Weekday[],
      zones,
      recentLongestM: await longestRun30(db, today, 3000),
      daysOff: 10,
      weekIndex: 0,
    });
    const ts = nowIso();
    for (const w of ret) {
      await db.runAsync(
        `INSERT INTO planned_workouts (id, created_at, updated_at, plan_id, date, week_index, phase, type, steps,
          target_distance_m, target_duration_s, status, rationale) VALUES (?, ?, ?, ?, ?, 0, 'return', ?, ?, ?, ?, 'scheduled', ?)`,
        [
          newId(),
          ts,
          ts,
          planId,
          w.date,
          w.type,
          JSON.stringify(w.steps),
          w.targetDistanceM,
          w.targetDurationS,
          JSON.stringify(w.rationale),
        ],
      );
    }
    return;
  }
  if (changes.some((c) => c.kind === 'pace_up')) {
    await db.runAsync("UPDATE plans SET params = json_set(params, '$.vdot', ?) WHERE id = ?", [
      params.vdot + 1,
      planId,
    ]);
  }
  for (const u of applyChanges(next, changes, zones)) {
    await updateWorkout(db, u.id, {
      type: u.type,
      steps: u.steps,
      target_distance_m: runningDistance(u.steps),
      target_duration_s: totalDuration(u.steps),
    });
  }
}

/**
 * Atur ulang hari tersedia / hari long run dari Profil (4.1 -> 1.6): latihan mulai hari ini
 * dibuat ulang dengan target yang sama; riwayat tetap.
 */
export async function regenerateFromToday(db: Db, today: string, days: Weekday[], longRunDay: Weekday) {
  const p = await getActivePlan(db);
  if (!p) return;
  const g = p.goal;
  const params = planParams(p);
  const longest = await longestRun30(db, today, g.longest_run_m);
  const plan = generatePlan({
    goal: {
      distance: g.distance,
      raceDate: g.race_date,
      baselineDistance: (g.baseline_distance as never) ?? null,
      baselineTimeS: g.baseline_time_s,
      level: g.level,
      weeklyVolumeM: g.weekly_volume_m,
      longestRunM: longest,
    },
    availableDays: days,
    longRunDay,
    lightMode: params.light_mode,
    startDate: today,
    vdot: params.vdot,
    strength: !!params.strength,
  });
  const ts = nowIso();
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      "DELETE FROM planned_workouts WHERE plan_id = ? AND date >= ? AND status = 'scheduled'",
      [p.id, today],
    );
    for (const w of plan.workouts) {
      await db.runAsync(
        `INSERT INTO planned_workouts (id, created_at, updated_at, plan_id, date, week_index, phase, type, steps,
          target_distance_m, target_duration_s, status, rationale) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'scheduled', ?)`,
        [
          newId(),
          ts,
          ts,
          p.id,
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
    const newParams: PlanParams = {
      ...params,
      available_days: days,
      long_run_day: longRunDay,
      weeks: plan.weeks,
    };
    await db.runAsync(
      'UPDATE plans SET params = ?, start_date = ?, end_date = ?, version = version + 1, updated_at = ? WHERE id = ?',
      [JSON.stringify(newParams), plan.startDate, plan.endDate, ts, p.id],
    );
  });
}

// ---- Strength + core (F-21) ----

function goalLevel(g: { level: Level | null; weekly_volume_m: number }): Level {
  // Sama dengan effectiveLevel engine: tanpa level (punya waktu acuan) -> dari volume.
  return g.level ?? (g.weekly_volume_m < 10_000 ? 'beginner' : 'recreational');
}

async function insertGenerated(db: Db, planId: string, ws: GeneratedWorkout[]) {
  const ts = nowIso();
  for (const w of ws) {
    await db.runAsync(
      `INSERT INTO planned_workouts (id, created_at, updated_at, plan_id, date, week_index, phase, type, steps,
        target_distance_m, target_duration_s, status, rationale) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'scheduled', ?)`,
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
 * Sakelar strength di Profil (4.1): nyala = sesi strength/core ditambahkan mulai hari ini ke lari
 * yang sudah ada (lari tidak berubah); mati = sesi strength terjadwal mulai hari ini dihapus.
 */
export async function setStrength(db: Db, today: string, on: boolean): Promise<void> {
  const p = await getActivePlan(db);
  await db.withTransactionAsync(async () => {
    await db.runAsync('UPDATE profile SET strength_opt_in = ? WHERE id = 1', [on ? 1 : 0]);
    if (!p) return;
    const params = planParams(p);
    await db.runAsync(
      "DELETE FROM planned_workouts WHERE plan_id = ? AND date >= ? AND status = 'scheduled' AND type IN ('strength', 'core')",
      [p.id, today],
    );
    if (on) {
      const runs = (await getWorkouts(db, p.id, today)).filter((w) => !isSupportType(w.type));
      const strength = planStrength(
        runs.map((w) => ({
          date: w.date,
          weekIndex: w.week_index,
          phase: w.phase,
          type: w.type,
          steps: w.steps,
          targetDistanceM: w.target_distance_m ?? 0,
          targetDurationS: w.target_duration_s ?? 0,
          rationale: [],
        })),
        {
          level: goalLevel(p.goal),
          lightMode: params.light_mode,
          startDate: today,
          raceDate: p.goal.distance === 'fitness' ? null : p.goal.race_date,
          weeks: (params.weeks ?? []).map((w) => ({ ...w, phase: w.phase as Phase })),
        },
      );
      await insertGenerated(db, p.id, strength);
    }
    await db.runAsync(
      "UPDATE plans SET params = json_set(params, '$.strength', json(?)), updated_at = ? WHERE id = ?",
      [on ? 'true' : 'false', nowIso(), p.id],
    );
  });
}

/**
 * E-25: sesi strength terasa terlalu berat -> sesi strength/core terjadwal berikutnya turun 1 level.
 * Mengembalikan id sesi yang diubah (null jika tidak ada).
 */
export async function easeNextStrength(db: Db, afterWorkoutId: string): Promise<string | null> {
  const done = await getWorkout(db, afterWorkoutId);
  if (!done || !isSupportType(done.type)) return null;
  const next = await db.getFirstAsync<{ id: string }>(
    `SELECT id FROM planned_workouts WHERE plan_id = ? AND date > ? AND status = 'scheduled'
       AND type IN ('strength', 'core') ORDER BY date LIMIT 1`,
    [done.plan_id, done.date],
  );
  if (!next) return null;
  const w = (await getWorkout(db, next.id))!;
  const cur = (w.rationale.find((r) => r.rule === 'E-25')?.values.level as number | undefined) ?? 1;
  const e = easierStrength(w.type as StrengthType, cur as StrengthLevel);
  await updateWorkout(db, w.id, {
    steps: e.steps,
    target_duration_s: totalDuration(e.steps),
    rationale: [...w.rationale.filter((r) => r.rule !== 'E-25'), e.rationale],
  });
  return w.id;
}
