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
} from '@run-coach/training-engine';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as auth from '@/auth/service';
import { getDb } from '@/db/client';
import { localDate } from '@/lib/today';
import { draftToPlanInput, parseDraft, type Draft } from './onboarding';
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
      await repo.setDraft(db, null);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.meta }),
  });
}

export function useSession() {
  return useQuery({ queryKey: keys.session, queryFn: auth.currentUserId });
}

export { auth };

export function useActivityDistance(from: string, to: string) {
  return useQuery({
    queryKey: ['activityDistance', from, to],
    queryFn: async () => repo.activityDistance(await getDb(), from, to),
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
    mutationFn: async (id: string) => repo.setWorkoutStatus(await getDb(), id, 'skipped'),
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
