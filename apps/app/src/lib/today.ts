/** Tanggal lokal `YYYY-MM-DD` di zona waktu pengguna (profile.timezone). */
export function localDate(timezone = 'Asia/Jakarta', at: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(at);
  return parts;
}
