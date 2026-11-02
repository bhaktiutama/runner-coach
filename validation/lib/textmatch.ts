// L1.2: cocokkan teks rationale di layar dengan template katalog + values, tanpa memakai
// fungsi format app. Template dijadikan pola; tiap placeholder yang tertangkap dibaca balik
// sebagai angka dan dibandingkan dengan nilai di values (toleransi sesuai presisi tampilan).

const norm = (s: string) =>
  s
    .replace(/[\u00a0\u202f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
const escRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function parseNum(s: string, lang: 'id' | 'en'): number {
  const t = lang === 'id' ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '');
  return Number(t.replace(/[^\d.-]/g, ''));
}

function parseClock(s: string): number[] {
  return (s.match(/\d+/g) ?? []).map(Number);
}

export type MatchResult = { ok: boolean; reason: string };

export function matchRationale(
  tpl: string,
  values: Record<string, number | string>,
  screen: string,
  lang: 'id' | 'en',
  distanceName: (code: string) => string,
): MatchResult {
  const keys: string[] = [];
  const pattern = norm(tpl)
    .split(/(\{\w+\})/)
    .map((part) => {
      const m = /^\{(\w+)\}$/.exec(part);
      if (!m) return escRe(part);
      keys.push(m[1]!);
      return '(.+?)';
    })
    .join('');
  const re = new RegExp(pattern);
  const hit = re.exec(norm(screen));
  if (!hit) return { ok: false, reason: 'teks di layar tidak cocok dengan template' };
  const bad: string[] = [];
  keys.forEach((k, i) => {
    const got = hit[i + 1]!;
    const v = values[k];
    if (v === undefined) return bad.push(`{${k}} tidak ada di values`);
    if (typeof v === 'string') {
      const want = k.endsWith('_code') ? distanceName(v) : v;
      if (got !== want) bad.push(`{${k}} "${got}" vs "${want}"`);
      return;
    }
    if (k.endsWith('_m')) {
      const km = parseNum(got, lang);
      if (!/km|mi/.test(got) || Math.abs(km * 1000 - v) > 51) bad.push(`{${k}} "${got}" vs ${v} m`);
    } else if (k.endsWith('_pace')) {
      const [mm, ss] = parseClock(got);
      if (Math.abs((mm ?? 0) * 60 + (ss ?? 0) - v) > 1) bad.push(`{${k}} "${got}" vs ${v} dtk/km`);
    } else if (k.endsWith('_s')) {
      const p = parseClock(got);
      // Waktu race: m:ss di bawah 1 jam, j:mm di atasnya.
      const sec = v < 3600 ? (p[0] ?? 0) * 60 + (p[1] ?? 0) : (p[0] ?? 0) * 3600 + (p[1] ?? 0) * 60;
      if (Math.abs(sec - v) > (v < 3600 ? 1 : 60)) bad.push(`{${k}} "${got}" vs ${v} dtk`);
    } else {
      const n = parseNum(got, lang);
      if (Math.abs(n - Math.round(v * 10) / 10) > 0.051) bad.push(`{${k}} "${got}" vs ${v}`);
    }
  });
  return { ok: bad.length === 0, reason: bad.join('; ') };
}
