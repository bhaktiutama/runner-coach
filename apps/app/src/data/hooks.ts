import {
  addDays,
  convertToEasy,
  generatePlan,
  mergeWorkouts,
  mondayOf,
  paceZones,
  runningDistance,
  totalDuration,
  type GeneratedPlan,
  type Proposal,
  type Weekday,
} from '@run-coach/training-engine';

const APP_VERSION = Constants.expoConfig?.version ?? '0.1.0';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as auth from '@/auth/service';
import { getDb } from '@/db/client';
import { localDate, localDateOf } from '@/lib/today';
import { draftToPlanInput, parseDraft, type Draft } from './onboarding';
import Constants from 'expo-constants';
import { cancelReminders } from '@/lib/reminderSync';
import { cancelTimerCues } from '@/lib/notifications';
import { shareTextFile, pickTextFile } from '@/lib/files';
import { track } from '@/lib/analytics';
import * as acts from './activities';
import * as backup from './backup';
import * as planOps from './planOps';
import * as repo from './repo';

// Hook data untuk komponen (TRD 2 aturan 2): komponen tidak memanggil SQLite/Supabase langsung.

export const keys = {
  meta: ['meta'] as const,
  profile: ['profile'] as const,
  plan: ['plan'] as const,
  workouts: (planId: string, from?: string, to?: string) => ['workouts', planId, from, to] as const,
  workout: (id: string) => ['workout', id] as const,
  session: ['session'] as const,
};

export function useMeta() {
  return useQuery({ queryKey: keys.meta, queryFn: async () => repo.getMeta(await getDb()) });
}

export function useDraft() {
  const q = useMeta();
  return { ...q, draft: parseDraft(q.data?.onboarding_draft ?? null) };
}

export function useSaveDraft() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (d: Draft | null) => repo.setDraft(await getDb(), d),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.meta }),
  });
}

export function useProfile() {
  return useQuery({ queryKey: keys.profile, queryFn: async () => repo.getProfile(await getDb()) });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Parameters<typeof repo.updateProfile>[1]) =>
      repo.updateProfile(await getDb(), patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.profile }),
  });
}

export function useToday(): string {
  const p = useProfile();
  return localDate(p.data?.timezone ?? 'Asia/Jakarta');
}

export function useActivePlan() {
  return useQuery({
    queryKey: keys.plan,
    queryFn: async () => {
      const db = await getDb();
      const profile = await repo.getProfile(db);
      await repo.markMissed(db, localDate(profile.timezone));
      return repo.getActivePlan(db);
    },
  });
}

export function useWorkouts(planId: string | undefined, from?: string, to?: string) {
  return useQuery({
    queryKey: keys.workouts(planId ?? '-', from, to),
    enabled: !!planId,
    queryFn: async () => repo.getWorkouts(await getDb(), planId!, from, to),
  });
}

export function useWeekWorkouts(planId: string | undefined, date: string) {
  const monday = mondayOf(date);
  return useWorkouts(planId, monday, addDays(monday, 6));
}

export function useWorkout(id: string | undefined) {
  return useQuery({
    queryKey: keys.workout(id ?? '-'),
    enabled: !!id,
    queryFn: async () => repo.getWorkout(await getDb(), id!),
  });
}

export function invalidatePlanData(qc: ReturnType<typeof useQueryClient>) {
  return Promise.all([
    qc.invalidateQueries({ queryKey: keys.plan }),
    qc.invalidateQueries({ queryKey: ['workouts'] }),
    qc.invalidateQueries({ queryKey: ['workout'] }),
  ]);
}

/** Generate plan dari draft (tanpa simpan) untuk validasi di 1.7. */
export function buildPlan(draft: Draft, today: string): GeneratedPlan {
  return generatePlan(draftToPlanInput(draft, today));
}

/** Akhir 1.7: buat plan + simpan lokal, lalu ke 1.8. */
export function useCreatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ draft, today }: { draft: Draft; today: string }) => {
      const db = await getDb();
      const input = draftToPlanInput(draft, today);
      const plan = generatePlan(input);
      await repo.savePlanFromOnboarding(db, draft, input, plan);
      await repo.setDraft(db, { ...draft, step: 'preview' });
      return plan;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: keys.meta });
      await qc.invalidateQueries({ queryKey: keys.profile });
      await invalidatePlanData(qc);
    },
  });
}

/** Setelah login berhasil: tandai pemilik data lokal (TRD 3.4) dan tutup onboarding. */
export function useCompleteSignIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string | null) => {
      const db = await getDb();
      if (userId) await repo.setOwner(db, userId);
      const draft = parseDraft((await repo.getMeta(db)).onboarding_draft);
      await repo.setDraft(db, null);
      if (draft?.distance) {
        track('onboarding_completed', { target_type: draft.distance });
        track('plan_created', {
          target_type: draft.distance,
          days_per_week: draft.availableDays?.length ?? 0,
        });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.meta }),
  });
}

export function useSession() {
  return useQuery({ queryKey: keys.session, queryFn: auth.currentUserId });
}

export { auth };

/** Jarak aktivitas (meter) di rentang tanggal lokal [from, to]. */
export function useActivityDistance(from: string, to: string) {
  const tz = useProfile().data?.timezone ?? 'Asia/Jakarta';
  return useQuery({
    queryKey: ['activityDistance', from, to, tz],
    queryFn: async () => {
      const list = await acts.listActivities(await getDb(), { from: addDays(from, -1) });
      return list
        .filter((a) => {
          const d = localDateOf(a.started_at, tz);
          return d >= from && d <= to;
        })
        .reduce((s, a) => s + (a.distance_m ?? 0), 0);
    },
  });
}

// ---- Mutasi latihan (2.2, 3.2) ----

async function zonesFor(planId: string) {
  const db = await getDb();
  const p = await db.getFirstAsync<{ params: string }>('SELECT params FROM plans WHERE id = ?', [planId]);
  return paceZones((JSON.parse(p!.params) as { vdot: number }).vdot);
}

export function useWorkoutActions() {
  const qc = useQueryClient();
  const done = () => invalidatePlanData(qc);
  const move = useMutation({
    mutationFn: async ({ id, toDate }: { id: string; toDate: string }) => {
      const db = await getDb();
      const w = (await repo.getWorkout(db, id))!;
      await repo.updateWorkout(db, id, { date: toDate, original_date: w.original_date ?? w.date });
    },
    onSuccess: done,
  });
  const merge = useMutation({
    mutationFn: async ({ id, intoId, longestM }: { id: string; intoId: string; longestM: number }) => {
      const db = await getDb();
      const moving = (await repo.getWorkout(db, id))!;
      const target = (await repo.getWorkout(db, intoId))!;
      const z = await zonesFor(target.plan_id);
      const m = mergeWorkouts(target, moving, z, longestM);
      await db.withTransactionAsync(async () => {
        await repo.updateWorkout(db, intoId, {
          type: m.type,
          steps: m.steps,
          rationale: [...m.rationale, ...target.rationale.filter((r) => r.rule !== 'E-06')],
          target_distance_m: runningDistance(m.steps),
          target_duration_s: totalDuration(m.steps),
        });
        await repo.deleteWorkout(db, id);
      });
    },
    onSuccess: done,
  });
  const skip = useMutation({
    mutationFn: async (id: string) => {
      const db = await getDb();
      track('workout_skipped', { workout_type: (await repo.getWorkout(db, id))?.type ?? 'unknown' });
      await repo.setWorkoutStatus(db, id, 'skipped');
    },
    onSuccess: done,
  });
  const toEasy = useMutation({
    mutationFn: async (id: string) => {
      const db = await getDb();
      const w = (await repo.getWorkout(db, id))!;
      const e = convertToEasy(w, await zonesFor(w.plan_id));
      await repo.updateWorkout(db, id, {
        type: e.type,
        steps: e.steps,
        target_distance_m: runningDistance(e.steps),
        target_duration_s: totalDuration(e.steps),
      });
    },
    onSuccess: done,
  });
  return { move, merge, skip, toEasy };
}

export function useLongest30(date: string, fallbackM: number) {
  return useQuery({
    queryKey: ['longest30', date, fallbackM],
    queryFn: async () => repo.longestRun30(await getDb(), date, fallbackM),
  });
}

// ---- Aktivitas (M5) ----

/** Aktivitas + tanggal lokal (profile.timezone). */
export function useActivities(from?: string) {
  const tz = useProfile().data?.timezone ?? 'Asia/Jakarta';
  return useQuery({
    queryKey: ['activities', from, tz],
    queryFn: async () =>
      (await acts.listActivities(await getDb(), { from: from ? addDays(from, -1) : undefined }))
        .map((a) => ({ ...a, date: localDateOf(a.started_at, tz) }))
        .filter((a) => !from || a.date >= from),
  });
}

export function useActivity(id: string | undefined) {
  return useQuery({
    queryKey: ['activity', id],
    enabled: !!id,
    queryFn: async () => acts.getActivity(await getDb(), id!),
  });
}

export function useMatchWorkout(date: string) {
  return useQuery({ queryKey: ['match', date], queryFn: async () => acts.matchWorkout(await getDb(), date) });
}

export function useWorkoutStatuses(planId: string | undefined) {
  return useQuery({
    queryKey: ['statuses', planId],
    enabled: !!planId,
    queryFn: async () => acts.workoutStatuses(await getDb(), planId!),
  });
}

export function useActiveTimer() {
  return useQuery({ queryKey: ['activeTimer'], queryFn: async () => repo.getActiveTimer(await getDb()) });
}

/** Simpan aktivitas (2.4 / 2.6). Mengembalikan apakah minggu itu kini selesai (-> 2.5). */
export function useSaveActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (a: acts.NewActivity & { clearTimer?: boolean }) => {
      const db = await getDb();
      const id = await acts.saveActivity(db, a);
      const wt = a.plannedWorkoutId
        ? ((await repo.getWorkout(db, a.plannedWorkoutId))?.type ?? 'extra')
        : 'extra';
      track('workout_completed', { workout_type: wt, source: a.source });
      track('rpe_submitted', { workout_type: wt });
      if (a.clearTimer) await repo.setActiveTimer(db, null);
      let weekDone = false;
      if (a.plannedWorkoutId) {
        const w = await repo.getWorkout(db, a.plannedWorkoutId);
        if (w) {
          const m = mondayOf(w.date);
          weekDone = await acts.weekFinished(db, w.plan_id, m, addDays(m, 6));
        }
      }
      return { id, weekDone };
    },
    onSuccess: async () => {
      await invalidatePlanData(qc);
      await Promise.all(
        ['activities', 'activity', 'match', 'statuses', 'activityDistance', 'activeTimer', 'longest30'].map(
          (k) => qc.invalidateQueries({ queryKey: [k] }),
        ),
      );
    },
  });
}

export function useDiscardTimer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => repo.setActiveTimer(await getDb(), null),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['activeTimer'] }),
  });
}

// ---- Privasi, akun, jeda, adaptasi (M6) ----

export function usePrivacyActions() {
  const qc = useQueryClient();
  const all = () => qc.invalidateQueries();
  const exportFile = useMutation({
    mutationFn: async (today: string) => {
      const db = await getDb();
      const file = await backup.exportBackup(db, APP_VERSION);
      const ok = await shareTextFile(backup.backupFileName(today), JSON.stringify(file, null, 1));
      if (ok) await repo.updateMeta(db, { last_backup_at: new Date().toISOString() });
      return ok;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.meta }),
  });
  const pickRestore = useMutation({
    mutationFn: async () => {
      const text = await pickTextFile();
      return text == null ? null : backup.parseBackup(text);
    },
  });
  const restore = useMutation({
    mutationFn: async (file: backup.BackupFile) => backup.importBackup(await getDb(), file),
    onSuccess: all,
  });
  const wipe = useMutation({
    mutationFn: async () => {
      await cancelTimerCues();
      await cancelReminders();
      await backup.wipeLocalData(await getDb());
    },
    onSuccess: all,
  });
  const signOut = useMutation({ mutationFn: auth.signOut, onSuccess: all });
  const deleteAccount = useMutation({
    mutationFn: async () => {
      const r = await auth.deleteAccount();
      if (!r.ok) throw new Error(r.error);
      // Hanya jika server berhasil: hapus data lokal (FL-7).
      await cancelReminders();
      await backup.wipeLocalData(await getDb());
    },
    onSuccess: all,
  });
  const setAnalytics = useMutation({
    mutationFn: async (on: boolean) => repo.updateMeta(await getDb(), { analytics_opt_in: on ? 1 : 0 }),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.meta }),
  });
  const setBackupReminder = useMutation({
    mutationFn: async (dismissed: boolean) =>
      repo.updateMeta(await getDb(), { backup_reminder_dismissed: dismissed ? 1 : 0 }),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.meta }),
  });
  return { exportFile, pickRestore, restore, wipe, signOut, deleteAccount, setAnalytics, setBackupReminder };
}

export function usePlanOps() {
  const qc = useQueryClient();
  const all = () => qc.invalidateQueries();
  return {
    pause: useMutation({
      mutationFn: async (a: { reason: 'injury' | 'sick' | 'busy'; days: number | null }) =>
        planOps.pausePlan(await getDb(), a.reason, a.days),
      onSuccess: all,
    }),
    resume: useMutation({
      mutationFn: async (today: string) => planOps.resumePlan(await getDb(), today),
      onSuccess: all,
    }),
    decide: useMutation({
      mutationFn: async (a: { weekStart: string; proposal: Proposal; accept: boolean; today: string }) =>
        planOps.decideProposal(await getDb(), a.weekStart, a.proposal, a.accept, a.today),
      onSuccess: all,
    }),
    regenerate: useMutation({
      mutationFn: async (a: { today: string; days: Weekday[]; longRunDay: Weekday }) =>
        planOps.regenerateFromToday(await getDb(), a.today, a.days, a.longRunDay),
      onSuccess: all,
    }),
    newGoal: useMutation({
      mutationFn: async () => {
        const db = await getDb();
        await db.runAsync("UPDATE plans SET status = 'archived' WHERE status != 'archived'");
        await db.runAsync("UPDATE goals SET status = 'abandoned' WHERE status = 'active'");
        await repo.setDraft(db, { step: 'goal' });
      },
      onSuccess: all,
    }),
  };
}

export function useProposals(today: string, weekStart: string) {
  return useQuery({
    queryKey: ['proposals', weekStart, today],
    queryFn: async () => planOps.weeklyProposals(await getDb(), today, weekStart),
  });
}
