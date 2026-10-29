import { addDays, mondayOf, weekday, type Weekday } from './dates';
import type { GeneratedWorkout } from './types';
import type { PaceZones } from './vdot';
import { easyRun, MIN_EASY_M } from './workouts';

// Jeda plan (F-09, FL-6) + E-13: setelah jeda, 1 minggu Return to run lalu sisa plan digeser.

export type PlannedRef = {
  id: string;
  date: string;
  status: 'scheduled' | 'completed' | 'skipped' | 'missed';
};

/**
 * Minggu Return to run mulai `resumeDate`: easy saja (tanpa sesi berat), tiap sesi
 * 50% dari lari terjauh 30 hari terakhir (min 2 km), maks 4 sesi di hari tersedia.
 */
export function buildReturnWeek(a: {
  resumeDate: string;
  availableDays: Weekday[];
  zones: PaceZones;
  recentLongestM: number;
  daysOff: number;
  weekIndex: number;
}): GeneratedWorkout[] {
  const out: GeneratedWorkout[] = [];
  const dist = Math.max(MIN_EASY_M, Math.round((a.recentLongestM * 0.5) / 500) * 500);
  const days = [...a.availableDays].sort((x, y) => x - y).slice(0, 4);
  for (let i = 0; i < 7; i++) {
    const date = addDays(a.resumeDate, i);
    if (!days.includes(weekday(date))) continue;
    const steps = easyRun(dist, a.zones);
    out.push({
      date,
      weekIndex: a.weekIndex,
      phase: 'return',
      type: 'easy',
      steps,
      targetDistanceM: dist,
      targetDurationS: steps[0]!.kind === 'work' ? (steps[0]!.duration_s ?? 0) : 0,
      rationale: [{ rule: 'E-13', values: { days: a.daysOff } }],
    });
  }
  return out;
}

/** Geser latihan terjadwal pada/sesudah `fromDate` sejumlah minggu penuh (hari dalam minggu tetap). */
export function shiftScheduled<T extends PlannedRef>(workouts: T[], fromDate: string, weeks: number): T[] {
  return workouts.map((w) =>
    w.status === 'scheduled' && w.date >= fromDate ? { ...w, date: addDays(w.date, weeks * 7) } : w,
  );
}

/** Jumlah minggu geser setelah jeda: minggu Return to run + minggu yang terlewat. */
export function weeksToShift(pausedAt: string, resumeDate: string): number {
  const weeksPaused = Math.ceil(
    (+new Date(mondayOf(resumeDate)) - +new Date(mondayOf(pausedAt))) / (7 * 86_400_000),
  );
  return Math.max(1, weeksPaused + 1);
}
