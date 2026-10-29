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

/** Tanggal lokal dari timestamp ISO UTC. */
export function localDateOf(iso: string, timezone = 'Asia/Jakarta'): string {
  return localDate(timezone, new Date(iso));
}

/** Selisih zona waktu (menit) pada saat tertentu, dari Intl. */
function offsetMinutes(timezone: string, at: Date): number {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
      .formatToParts(at)
      .map((x) => [x.type, x.value]),
  );
  const asUtc = Date.UTC(+p.year!, +p.month! - 1, +p.day!, +p.hour!, +p.minute!);
  return Math.round((asUtc - at.getTime()) / 60000);
}

/** ISO UTC untuk jam lokal tertentu di tanggal lokal (mis. log manual: pukul 12:00). */
export function isoAtLocal(date: string, time: string, timezone = 'Asia/Jakarta'): string {
  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  const guess = Date.UTC(y!, m! - 1, d!, hh!, mm!);
  const off = offsetMinutes(timezone, new Date(guess));
  return new Date(guess - off * 60000).toISOString();
}
