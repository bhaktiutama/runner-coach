// Tanggal lokal pengguna sebagai string `YYYY-MM-DD` (Schema 1). Semua hitungan di UTC
// supaya tidak bergeser karena zona waktu perangkat.

/** 0 = Senin ... 6 = Minggu. */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

const DAY_MS = 86_400_000;

export function toUtc(date: string): number {
  const [y, m, d] = date.split('-').map(Number);
  return Date.UTC(y!, m! - 1, d!);
}

export function fromUtc(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

export function addDays(date: string, days: number): string {
  return fromUtc(toUtc(date) + days * DAY_MS);
}

export function diffDays(from: string, to: string): number {
  return Math.round((toUtc(to) - toUtc(from)) / DAY_MS);
}

export function weekday(date: string): Weekday {
  return ((new Date(toUtc(date)).getUTCDay() + 6) % 7) as Weekday;
}

/** Senin di minggu tanggal itu. */
export function mondayOf(date: string): string {
  return addDays(date, -weekday(date));
}

/** Apakah dua hari dalam seminggu bersebelahan (termasuk Minggu -> Senin). */
export function adjacentWeekdays(a: Weekday, b: Weekday): boolean {
  const d = Math.abs(a - b);
  return d === 1 || d === 6;
}
