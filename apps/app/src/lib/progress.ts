import { addDays, diffDays, mondayOf } from '@run-coach/training-engine';
import type { ActivityView } from '@/data/activities';

/** Aktivitas + tanggal lokal (dihitung dari started_at dan profile.timezone). */
export type DatedActivity = Pick<ActivityView, 'distance_m' | 'duration_s' | 'workout_type'> & {
  date: string;
};
import type { WorkoutStatus } from '@/data/rows';

// Statistik progres 3.3 (F-07). Murni, dihitung dari data lokal.

export type Range = '8w' | 'plan' | 'all';

export function rangeStart(
  range: Range,
  today: string,
  planStart: string,
  firstActivity: string | null,
): string {
  if (range === '8w') return addDays(mondayOf(today), -7 * 7);
  if (range === 'plan') return mondayOf(planStart);
  return mondayOf(firstActivity && firstActivity < planStart ? firstActivity : planStart);
}

/** Batang grafik volume 3.3 untuk satu rentang (F-07). `outline` = target plan yang belum dijalani. */
export type VolumeBar = {
  key: string;
  start: string;
  distanceM: number;
  phase: 'base' | 'build' | 'peak' | 'taper' | 'return';
  outline: boolean;
  current: boolean;
  /** Nomor minggu plan (rentang Plan) atau null. */
  week: number | null;
};

/**
 * Rentang Plan: satu batang per minggu plan dari minggu 1 sampai minggu terakhir. Minggu yang sudah
 * lewat dan minggu ini = jarak nyata, berwarna fase; minggu depan = target volume plan (garis luar).
 */
type PlanWeek = { weekIndex: number; phase: string; startDate: string; volumeM: number };
const PHASES = new Set(['base', 'build', 'peak', 'taper', 'return']);

export function planBars(weeks: PlanWeek[], acts: DatedActivity[], today: string): VolumeBar[] {
  const thisMonday = mondayOf(today);
  return weeks.map((w) => {
    const m = mondayOf(w.startDate);
    const future = m > thisMonday;
    const end = addDays(m, 6);
    const actual = acts
      .filter((a) => a.date >= m && a.date <= end)
      .reduce((x, a) => x + (a.distance_m ?? 0), 0);
    return {
      key: m,
      start: m,
      distanceM: future ? w.volumeM : actual,
      phase: (PHASES.has(w.phase) ? w.phase : 'base') as VolumeBar['phase'],
      outline: future,
      current: m === thisMonday,
      week: w.weekIndex,
    };
  });
}

/** Rentang Semua: per bulan jika lebih dari 16 minggu, selain itu per minggu. */
export function historyBars(acts: DatedActivity[], from: string, today: string): VolumeBar[] {
  const weekly = weeklyVolume(acts, from, today);
  if (weekly.length <= 16) {
    return weekly.map((w) => ({
      key: w.weekStart,
      start: w.weekStart,
      distanceM: w.distanceM,
      phase: 'build',
      outline: w.current,
      current: w.current,
      week: null,
    }));
  }
  const out: VolumeBar[] = [];
  const nowMonth = today.slice(0, 7);
  for (let m = from.slice(0, 7); m <= nowMonth;) {
    const d = acts.filter((a) => a.date.startsWith(m)).reduce((x, a) => x + (a.distance_m ?? 0), 0);
    out.push({
      key: m,
      start: `${m}-01`,
      distanceM: d,
      phase: 'build',
      outline: false,
      current: m === nowMonth,
      week: null,
    });
    const [y, mo] = m.split('-').map(Number) as [number, number];
    m = mo === 12 ? `${y + 1}-01` : `${y}-${String(mo + 1).padStart(2, '0')}`;
  }
  return out;
}

/** Total rentang: jarak, waktu, jumlah aktivitas (dari `from` sampai hari ini). */
export function rangeTotals(acts: DatedActivity[], from: string, today: string) {
  const xs = acts.filter((a) => a.date >= from && a.date <= today);
  return {
    distanceM: xs.reduce((s, a) => s + (a.distance_m ?? 0), 0),
    durationS: xs.reduce((s, a) => s + a.duration_s, 0),
    count: xs.length,
  };
}

export type WeekBar = { weekStart: string; distanceM: number; current: boolean };

export function weeklyVolume(acts: DatedActivity[], from: string, today: string): WeekBar[] {
  const out: WeekBar[] = [];
  const thisMonday = mondayOf(today);
  for (let m = mondayOf(from); m <= thisMonday; m = addDays(m, 7)) {
    const end = addDays(m, 6);
    const d = acts.filter((a) => a.date >= m && a.date <= end).reduce((s, a) => s + (a.distance_m ?? 0), 0);
    out.push({ weekStart: m, distanceM: d, current: m === thisMonday });
  }
  return out;
}

const EASY = new Set(['easy', 'long', 'recovery', 'strides']);

/** Tren pace easy run per minggu (detik/km), hanya aktivitas easy/long dengan jarak. */
export function easyPaceTrend(acts: DatedActivity[], from: string): { weekStart: string; pace: number }[] {
  const byWeek = new Map<string, { d: number; t: number }>();
  for (const a of acts) {
    const date = a.date;
    if (date < from || !a.distance_m || a.distance_m < 500) continue;
    if (!a.workout_type || !EASY.has(a.workout_type)) continue;
    const w = mondayOf(date);
    const cur = byWeek.get(w) ?? { d: 0, t: 0 };
    byWeek.set(w, { d: cur.d + a.distance_m, t: cur.t + a.duration_s });
  }
  return [...byWeek.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([weekStart, v]) => ({ weekStart, pace: Math.round(v.t / (v.d / 1000)) }));
}

/**
 * Kepatuhan: selesai / (selesai + terlewat + dilewati) untuk latihan yang tanggalnya sudah lewat atau
 * selesai. Default hanya lari; strength/core dihitung terpisah (`kind: 'support'`, F-21).
 */
export function adherence(
  workouts: { date: string; status: WorkoutStatus; type?: string }[],
  from: string,
  today: string,
  kind: 'run' | 'support' = 'run',
): { done: number; total: number; ratio: number | null } {
  const support = (t?: string) => t === 'strength' || t === 'core';
  const due = workouts.filter(
    (w) =>
      (kind === 'support') === support(w.type) &&
      w.date >= from &&
      (w.date < today || w.status === 'completed'),
  );
  const done = due.filter((w) => w.status === 'completed').length;
  return { done, total: due.length, ratio: due.length ? done / due.length : null };
}

export function averagePace(distanceM: number | null, durationS: number): number | null {
  if (!distanceM || distanceM < 100) return null;
  return Math.round(durationS / (distanceM / 1000));
}

/** Parse "38:45", "1:05:30" atau "40" (menit) -> detik. */
export function parseDuration(text: string): number | null {
  const parts = text
    .trim()
    .split(':')
    .map((p) => p.trim());
  if (parts.some((p) => p === '' || !/^\d+$/.test(p))) return null;
  const n = parts.map(Number);
  if (n.length === 1) return n[0]! > 0 ? n[0]! * 60 : null;
  if (n.length === 2) return n[1]! < 60 ? n[0]! * 60 + n[1]! : null;
  if (n.length === 3) return n[1]! < 60 && n[2]! < 60 ? n[0]! * 3600 + n[1]! * 60 + n[2]! : null;
  return null;
}

/** Parse "5,2" atau "5.2" km -> meter. */
export function parseKm(text: string): number | null {
  const v = Number(text.trim().replace(',', '.'));
  return Number.isFinite(v) && v > 0 && v < 400 ? Math.round(v * 1000) : null;
}

/** Target RPE per tipe latihan, untuk label "6 / 10: Sesuai target tempo". */
export function rpeTarget(type: string | null): [number, number] {
  if (type === 'tempo') return [6, 7];
  if (type === 'interval') return [7, 8];
  if (type === 'strength') return [5, 6];
  if (type === 'core') return [4, 5];
  return [3, 5];
}

export function rpeVerdict(rpe: number, type: string | null): 'below' | 'within' | 'above' {
  const [lo, hi] = rpeTarget(type);
  return rpe < lo ? 'below' : rpe > hi ? 'above' : 'within';
}

export function daysBetween(a: string, b: string) {
  return diffDays(a, b);
}

/** Rasa beban strength dari RPE (F-21): 1-4 terlalu ringan, 5-7 pas, 8-10 terlalu berat. */
export function loadFeelFromRpe(rpe: number): 'too_easy' | 'ok' | 'too_hard' {
  return rpe >= 8 ? 'too_hard' : rpe <= 4 ? 'too_easy' : 'ok';
}
