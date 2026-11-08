import type { WorkoutStatus } from '@/data/rows';
import type { SpotIconName } from '@run-coach/ui';
import { weekStreak } from './todayCards';

// Pencapaian (F-28, UI/UX 14): dihitung dari data yang sudah ada di HP, tidak disimpan di tabel.

export const FIRST_5K_M = 5000;
export const STREAK_WEEKS = 4;
/** Plan tuntas: plan sudah berakhir dan minimal 80% latihan lari selesai. */
export const PLAN_DONE_RATIO = 0.8;

export type AchievementId = 'first_5k' | 'streak_4' | 'plan_done';
export type Achievement = {
  id: AchievementId;
  spot: SpotIconName;
  earned: boolean;
  /** Kemajuan menuju syarat (satuan: meter, minggu, latihan). */
  done: number;
  total: number;
};

type Status = { date: string; status: WorkoutStatus; type: string };

export function achievements(input: {
  acts: { distance_m: number | null }[];
  statuses: Status[];
  today: string;
  planEnd: string;
}): Achievement[] {
  const best = Math.max(0, ...input.acts.map((a) => a.distance_m ?? 0));
  const streak = weekStreak(input.statuses, input.today);
  const runs = input.statuses.filter((s) => s.type !== 'strength' && s.type !== 'core' && s.type !== 'rest');
  const completed = runs.filter((s) => s.status === 'completed').length;
  const need = Math.ceil(runs.length * PLAN_DONE_RATIO);
  return [
    {
      id: 'first_5k',
      spot: 'badge-5k',
      earned: best >= FIRST_5K_M,
      done: Math.min(best, FIRST_5K_M),
      total: FIRST_5K_M,
    },
    {
      id: 'streak_4',
      spot: 'badge-streak',
      earned: streak.best >= STREAK_WEEKS,
      done: streak.best >= STREAK_WEEKS ? STREAK_WEEKS : Math.min(streak.current, STREAK_WEEKS),
      total: STREAK_WEEKS,
    },
    {
      id: 'plan_done',
      spot: 'badge-plan',
      earned: runs.length > 0 && input.today > input.planEnd && completed >= need,
      done: Math.min(completed, need),
      total: Math.max(need, 1),
    },
  ];
}
