// Semua angka dan tanggal yang tampil ke pengguna lewat modul ini (TRD 8, UI/UX 6).
// Data disimpan dalam meter dan detik; konversi hanya di sini.

export const DEFAULT_LOCALE = 'id-ID';
export type Unit = 'km' | 'mi';

const METERS_PER_MILE = 1609.344;

const pad2 = (n: number) => String(n).padStart(2, '0');

/** Angka biasa dengan koma desimal sesuai locale. */
export function formatNumber(value: number, fractionDigits = 0, locale = DEFAULT_LOCALE): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

/** Jarak dalam unit pengguna, tanpa satuan: 5200 -> "5,2". */
export function formatDistanceValue(meters: number, unit: Unit = 'km', locale = DEFAULT_LOCALE): string {
  const v = unit === 'km' ? meters / 1000 : meters / METERS_PER_MILE;
  return formatNumber(Math.round(v * 10) / 10, 1, locale);
}

/** Jarak dengan satuan: 5200 -> "5,2 km". */
export function formatDistance(meters: number, unit: Unit = 'km', locale = DEFAULT_LOCALE): string {
  return `${formatDistanceValue(meters, unit, locale)} ${unit}`;
}

/** Durasi jam:menit:detik atau menit:detik: 2325 -> "38:45", 3930 -> "1:05:30". */
export function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0 ? `${h}:${pad2(m)}:${pad2(sec)}` : `${m}:${pad2(sec)}`;
}

/** Waktu race jam:menit (untuk rentang prediksi): 3930 -> "1:05". Di bawah 1 jam: menit:detik. */
export function formatRaceTime(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  if (s < 3600) return formatDuration(s);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${h}:${pad2(m)}`;
}

/** Rentang waktu race: "1:05 - 1:08". */
export function formatRaceRange(minS: number, maxS: number): string {
  return `${formatRaceTime(minS)} - ${formatRaceTime(maxS)}`;
}

/** Total durasi ringkas: 8460 -> "2j 21m", 2700 -> "45m". */
export function formatTotalDuration(seconds: number): string {
  const totalMin = Math.round(Math.max(0, seconds) / 60);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h > 0 ? `${h}j ${m}m` : `${m}m`;
}

/** Menit bulat: 2520 -> "42". */
export function formatMinutes(seconds: number): string {
  return String(Math.round(seconds / 60));
}

/** Pace tanpa satuan: 405 s/km -> "6:45". */
export function formatPaceValue(secondsPerKm: number, unit: Unit = 'km'): string {
  const perUnit = unit === 'km' ? secondsPerKm : (secondsPerKm * METERS_PER_MILE) / 1000;
  const s = Math.round(perUnit);
  return `${Math.floor(s / 60)}:${pad2(s % 60)}`;
}

/** Pace dengan satuan: 405 -> "6:45 /km". */
export function formatPace(secondsPerKm: number, unit: Unit = 'km'): string {
  return `${formatPaceValue(secondsPerKm, unit)} /${unit}`;
}

/** Rentang pace: {min: 370, max: 380} -> "6:10 - 6:20 /km". */
export function formatPaceRange(minS: number, maxS: number, unit: Unit = 'km'): string {
  return `${formatPaceValue(minS, unit)} - ${formatPaceValue(maxS, unit)} /${unit}`;
}

/** Parse tanggal lokal `YYYY-MM-DD` tanpa geser zona waktu. */
export function parseLocalDate(date: string): Date {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y!, (m ?? 1) - 1, d ?? 1, 12));
}

/** "Selasa, 27 Okt" dari `YYYY-MM-DD`. */
export function formatDate(date: string, locale = DEFAULT_LOCALE): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(parseLocalDate(date));
}

/** "27 Okt 2026". */
export function formatDateLong(date: string, locale = DEFAULT_LOCALE): string {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parseLocalDate(date));
}

/** "27 Okt". */
export function formatDayMonth(date: string, locale = DEFAULT_LOCALE): string {
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(
    parseLocalDate(date),
  );
}

/** Tanggal angka ringkas untuk sumbu grafik: "7/9". */
export function formatDayMonthNumeric(date: string): string {
  const d = parseLocalDate(date);
  return `${d.getUTCDate()}/${d.getUTCMonth() + 1}`;
}

/** Nama hari singkat: "Sel". */
export function formatWeekdayShort(date: string, locale = DEFAULT_LOCALE): string {
  return new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' }).format(parseLocalDate(date));
}

/** Persen: 0.8 -> "80%". */
export function formatPercent(ratio: number, locale = DEFAULT_LOCALE): string {
  return new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 0 }).format(ratio);
}

/** "Januari 2027". */
export function formatMonthYear(year: number, month0: number, locale = DEFAULT_LOCALE): string {
  return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(Date.UTC(year, month0, 15)),
  );
}

/** "Minggu, 3 Jan 2027". */
export function formatDateFull(date: string, locale = DEFAULT_LOCALE): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parseLocalDate(date));
}

/** Nama hari singkat dari indeks 0 = Senin: "Sen". */
export function weekdayShortName(index: number, locale = DEFAULT_LOCALE): string {
  // 2026-11-02 adalah Senin.
  return new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' }).format(
    new Date(Date.UTC(2026, 10, 2 + index, 12)),
  );
}

/** Nama hari panjang dari indeks 0 = Senin: "Sabtu". */
export function weekdayLongName(index: number, locale = DEFAULT_LOCALE): string {
  return new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone: 'UTC' }).format(
    new Date(Date.UTC(2026, 10, 2 + index, 12)),
  );
}

/** Input waktu 1.4: digit diisi dari kanan -> "0 : 32 : 30". */
export function formatTimeDigits(d: string): string {
  const p = d.padStart(5, '0');
  return `${Number(p.slice(0, 1))} : ${p.slice(1, 3)} : ${p.slice(3, 5)}`;
}
export function digitsToSeconds(d: string): number {
  const p = d.padStart(5, '0');
  return Number(p.slice(0, 1)) * 3600 + Number(p.slice(1, 3)) * 60 + Number(p.slice(3, 5));
}
export function secondsToDigits(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h}${String(m).padStart(2, '0')}${String(sec).padStart(2, '0')}`.replace(/^0+/, '');
}

/**
 * Digit baru dari teks input terformat. Hapus 1 karakter = hapus 1 digit terakhir;
 * mengetik menambah digit di kanan; tempel = ambil semua digit. Maks 5 digit.
 */
export function nextTimeDigits(prev: string, text: string): string {
  const raw = text.replace(/\D/g, '');
  const prevRaw = prev ? formatTimeDigits(prev).replace(/\D/g, '') : '';
  let d: string;
  if (prevRaw && raw.length < prevRaw.length) d = prev.slice(0, -1);
  else if (prevRaw && raw.startsWith(prevRaw)) d = prev + raw.slice(prevRaw.length);
  else d = raw;
  return d.replace(/^0+/, '').slice(0, 5);
}

/** Jam timer mm:ss (2 digit menit), di atas 1 jam j:mm:ss: 522 -> "08:42". */
export function formatClock(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
}
