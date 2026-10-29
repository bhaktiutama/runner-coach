import { addDays, diffDays, mondayOf, weekday } from '@run-coach/training-engine';
import type { PlanParams } from '@/data/rows';

/** Indeks minggu plan (1-based) untuk tanggal; null jika di luar plan. */
export function weekIndexOf(params: PlanParams, date: string): number | null {
  const weeks = params.weeks ?? [];
  if (!weeks.length) return null;
  const first = weeks[0]!.startDate;
  const idx = Math.floor(diffDays(first, mondayOf(date)) / 7) + 1;
  return idx >= 1 && idx <= weeks.length ? idx : null;
}

export function weekDates(date: string): string[] {
  const m = mondayOf(date);
  return Array.from({ length: 7 }, (_, i) => addDays(m, i));
}

export { weekday };
