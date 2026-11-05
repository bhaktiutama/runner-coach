import { addDays, diffDays, mondayOf } from '@run-coach/training-engine';
import type { WorkoutStatus } from '@/data/rows';

// Kartu geser di 2.1 (review 2026-11-05). Murni, dihitung dari data lokal.

export const TODAY_CARDS = ['countdown', 'long_run', 'records', 'streak'] as const;
export type TodayCard = (typeof TODAY_CARDS)[number];

/** Urutan kartu: kartu default di depan, sisanya mengikuti urutan tetap. */
export function cardOrder(first: string | null | undefined): TodayCard[] {
  const f = TODAY_CARDS.includes(first as TodayCard) ? (first as TodayCard) : 'countdown';
  return [f, ...TODAY_CARDS.filter((c) => c !== f)];
}

type PlanWorkout = {
  id: string;
  date: string;
  type: string;
  status: WorkoutStatus;
  target_distance_m: number | null;
  target_duration_s: number | null;
};

/** Ide 1: long run terjadwal berikutnya (hari ini termasuk jika belum selesai). */
export function nextLongRun(ws: PlanWorkout[], today: string) {
  const w = ws
    .filter((x) => x.type === 'long' && x.status === 'scheduled' && x.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))[0];
  return w ? { ...w, inDays: diffDays(today, w.date) } : null;
}

type DatedAct = {
  id: string;
  date: string;
  distance_m: number | null;
  duration_s: number;
  workout_type: string | null;
};
const EASY = new Set(['easy', 'long', 'recovery']);

/** Ide 2: rekor pribadi dalam plan: lari terjauh, terlama, pace easy terbaik (jarak >= 2 km). */
export function planRecords(acts: DatedAct[], from: string) {
  const runs = acts.filter(
    (a) => a.date >= from && a.workout_type !== 'strength' && a.workout_type !== 'core',
  );
  const longest =
    [...runs].filter((a) => a.distance_m).sort((a, b) => b.distance_m! - a.distance_m!)[0] ?? null;
  const longestTime = [...runs].sort((a, b) => b.duration_s - a.duration_s)[0] ?? null;
  const paced = runs
    .filter((a) => a.distance_m && a.distance_m >= 2000 && (!a.workout_type || EASY.has(a.workout_type)))
    .map((a) => ({ a, pace: a.duration_s / (a.distance_m! / 1000) }))
    .sort((x, y) => x.pace - y.pace)[0];
  return {
    longest: longest ? { date: longest.date, distanceM: longest.distance_m! } : null,
    longestTime: longestTime ? { date: longestTime.date, durationS: longestTime.duration_s } : null,
    bestEasyPace: paced ? { date: paced.a.date, pace: Math.round(paced.pace) } : null,
  };
}

type Status = { date: string; status: WorkoutStatus; type: string };

/**
 * Ide 3: streak minggu tuntas = minggu berturut-turut (mundur dari minggu terakhir yang sudah
 * lewat) yang semua latihan larinya `completed`. Minggu ini ikut dihitung hanya jika sudah tuntas,
 * dan tidak memutus streak jika belum. `weeks` = 6 minggu terakhir untuk tampilan lajur.
 */
export function weekStreak(statuses: Status[], today: string) {
  const runs = statuses.filter((s) => s.type !== 'strength' && s.type !== 'core' && s.type !== 'rest');
  const byWeek = new Map<string, Status[]>();
  for (const s of runs) {
    const m = mondayOf(s.date);
    byWeek.set(m, [...(byWeek.get(m) ?? []), s]);
  }
  const thisMonday = mondayOf(today);
  const state = (m: string): 'done' | 'open' | 'missed' | 'none' => {
    const xs = byWeek.get(m);
    if (!xs?.length) return 'none';
    if (xs.every((x) => x.status === 'completed')) return 'done';
    return m === thisMonday ? 'open' : 'missed';
  };
  let current = 0;
  for (let m = thisMonday; ; m = addDays(m, -7)) {
    const st = state(m);
    if (st === 'done') current++;
    else if (st === 'open') continue;
    else break;
  }
  let best = 0;
  let run = 0;
  const mondays = [...byWeek.keys()].filter((m) => m <= thisMonday).sort();
  for (const m of mondays) {
    run = state(m) === 'done' ? run + 1 : 0;
    best = Math.max(best, run);
  }
  const weeks = Array.from({ length: 6 }, (_, i) => addDays(thisMonday, -7 * (5 - i))).map((m) => ({
    monday: m,
    state: state(m),
  }));
  return { current, best, weeks };
}
