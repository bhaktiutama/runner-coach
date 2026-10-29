import { addDays } from '@run-coach/training-engine';

// Perencana pengingat latihan (F-12, TRD 9). Murni: dari data lokal -> daftar notifikasi lokal.

export type ReminderInput = {
  today: string;
  /** Jam lokal `HH:MM` sekarang (untuk melewati pengingat hari ini yang sudah lewat). */
  nowTime: string;
  reminderTime: string | null;
  planStatus: 'active' | 'paused' | 'archived';
  workouts: { date: string; status: string; title: string; minutes: number }[];
};

export type Reminder = { date: string; time: string; body: string };

/**
 * 7 hari ke depan, hanya hari yang punya latihan `scheduled`. Tidak ada saat plan dijeda,
 * pengingat mati, atau latihan hari itu sudah selesai. Isi tanpa data kesehatan.
 */
export function planReminders(
  i: ReminderInput,
  text: (title: string, minutes: number) => string,
): Reminder[] {
  if (!i.reminderTime || i.planStatus !== 'active') return [];
  const out: Reminder[] = [];
  for (let d = 0; d < 7; d++) {
    const date = addDays(i.today, d);
    if (d === 0 && i.nowTime >= i.reminderTime) continue;
    const w = i.workouts.find((x) => x.date === date && x.status === 'scheduled');
    if (!w) continue;
    out.push({ date, time: i.reminderTime, body: text(w.title, w.minutes) });
  }
  return out;
}

/** Kunci yang boleh muncul di isi notifikasi: tipe, durasi, jarak, pace. */
export const FORBIDDEN_IN_NOTIFICATION = [
  'rpe',
  'tag',
  'nyeri',
  'cedera',
  'sakit',
  'jantung',
  'hamil',
  'pain',
];
