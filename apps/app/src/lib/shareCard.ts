import { addDays, isSupportType, type EngineMessageKey, type WorkoutType } from '@run-coach/training-engine';
import {
  formatDateLong,
  formatDateFull,
  formatDistanceValue,
  formatDuration,
  formatNumber,
  formatPace,
  formatTotalDuration,
  weekdayShortName,
  type Unit,
} from '@run-coach/ui/format';
import { t, type MessageKey } from '@/i18n/t';
import { et } from './rationale';
import type { AchievementId } from './achievements';
import { TYPE_ZONE, typeName, type ViewZone } from './workoutView';

// Kartu bagikan (F-29, docs/specs/10-SHARE.md). Fungsi murni: data lokal -> model kartu -> SVG 1080 x 1920.
// Builder sengaja TIDAK menerima RPE, tag, catatan, detak jantung atau alasan jeda, jadi data itu tidak
// mungkin masuk ke gambar. Nama hanya jika pengguna menyalakan "Tampilkan nama" di 2.7.

export const CARD_W = 1080;
export const CARD_H = 1920;

export type ShareKind = 'activity' | 'week' | 'achievement' | 'plan';

/** Warna kartu dari token tema aktif (diisi pemanggil dari `color`, diuji dari tokens.json). */
export type CardPalette = {
  dark: boolean;
  bg: string;
  surface: string;
  surfaceSunken: string;
  text: string;
  textMuted: string;
  line: string;
  primary: string;
  onPrimary: string;
  success: string;
  zone: Record<ViewZone, string>;
  onZone: Record<ViewZone, string>;
  phase: Record<'base' | 'build' | 'peak' | 'taper', string>;
};

export type DayState = 'done' | 'missed' | 'planned' | 'rest';

export type CardModel = {
  kind: ShareKind;
  /** Warna aksen (zona latihan, sukses, primer) dan warna teks di atasnya. */
  accent: string;
  onAccent: string;
  kicker: string;
  title: string;
  /** Angka besar + satuan. */
  hero?: { value: string; unit?: string };
  /** Isi SVG ikon spot (grid 48, tanpa pembungkus <svg>). `big` = ikon utama kartu pencapaian. */
  icon?: { body: string; big?: boolean };
  body?: string;
  highlight?: string;
  stats: { label: string; value: string }[];
  days?: { label: string; state: DayState }[];
  phases?: { color: string; weeks: number; current: boolean }[];
  context?: string;
  name?: string;
};

// ---------- Builder per jenis kartu ----------

type Common = { name?: string | null };

export type ActivityInput = Common & {
  type: WorkoutType | null;
  distanceM: number | null;
  durationS: number;
  date: string;
  unit: Unit;
  showPace: boolean;
  /** Jumlah gerakan (strength/core dari timer). */
  exercises?: number | null;
  weekIndex?: number | null;
  weeksTotal?: number | null;
  goal?: string | null;
  highlight?: 'first_5k' | 'record' | null;
  icon?: string;
};

const unitLabel = (u: Unit) => t(`share.unit.${u}` as MessageKey);

function goalText(goal: string | null | undefined): string | null {
  if (!goal) return null;
  return goal === 'fitness'
    ? t('share.goalFitness')
    : t('share.goal', { distance: et(`distance.${goal}` as EngineMessageKey) });
}

function weekContext(i: { weekIndex?: number | null; weeksTotal?: number | null; goal?: string | null }) {
  const parts = [
    i.weekIndex && i.weeksTotal ? t('share.weekOf', { n: i.weekIndex, total: i.weeksTotal }) : null,
    goalText(i.goal),
  ].filter(Boolean);
  return parts.join(' · ') || undefined;
}

export function activityCard(i: ActivityInput, p: CardPalette): CardModel {
  const zone: ViewZone = i.type ? TYPE_ZONE[i.type] : 'easy';
  const support = !!i.type && isSupportType(i.type);
  const run = !support && !!i.distanceM && i.distanceM > 0;
  const stats: CardModel['stats'] = [];
  if (run) {
    stats.push({ label: t('share.stat.duration'), value: formatDuration(i.durationS) });
    if (i.showPace) {
      const perKm = i.durationS / (i.distanceM! / 1000);
      stats.push({ label: t('share.stat.pace'), value: formatPace(perKm, i.unit) });
    }
  } else if (support && i.exercises) {
    stats.push({ label: t('share.stat.exercises'), value: formatNumber(i.exercises) });
  }
  stats.push({ label: t('share.stat.date'), value: formatDateLong(i.date) });
  return {
    kind: 'activity',
    accent: p.zone[zone],
    onAccent: p.onZone[zone],
    kicker: t('share.kicker.activity'),
    title: i.type ? typeName(i.type) : t('share.extraRun'),
    hero: run
      ? { value: formatDistanceValue(i.distanceM!, i.unit), unit: unitLabel(i.unit) }
      : support
        ? { value: formatNumber(Math.max(1, Math.round(i.durationS / 60))), unit: t('share.unit.min') }
        : { value: formatDuration(i.durationS) },
    icon: i.icon ? { body: i.icon } : undefined,
    highlight: i.highlight ? t(`share.highlight.${i.highlight}` as MessageKey) : undefined,
    stats,
    context: weekContext(i),
    name: i.name ?? undefined,
  };
}

export type WeekInput = Common & {
  weekIndex: number;
  weeksTotal: number;
  done: number;
  total: number;
  distanceM: number;
  durationS: number;
  unit: Unit;
  phase?: string | null;
  goal?: string | null;
  /** 7 hari Senin..Minggu. */
  days: DayState[];
  icon?: string;
};

export function weekCard(i: WeekInput, p: CardPalette): CardModel {
  const all = i.total > 0 && i.done >= i.total;
  const stats: CardModel['stats'] = [
    { label: t('share.stat.workouts'), value: t('share.ofTotal', { done: i.done, total: i.total }) },
    { label: t('share.stat.time'), value: formatTotalDuration(i.durationS) },
  ];
  if (i.phase)
    stats.push({ label: t('share.stat.phase'), value: et(`phase.${i.phase}` as EngineMessageKey) });
  return {
    kind: 'week',
    accent: all ? p.success : p.primary,
    onAccent: all ? p.bg : p.onPrimary,
    kicker: t(all ? 'share.kicker.weekDone' : 'share.kicker.week', { n: i.weekIndex }),
    title: all ? t('share.weekAllDone') : t('share.weekPartial', { done: i.done, total: i.total }),
    hero: { value: formatDistanceValue(i.distanceM, i.unit), unit: unitLabel(i.unit) },
    icon: i.icon ? { body: i.icon } : undefined,
    stats,
    days: i.days.map((state, d) => ({ label: weekdayShortName(d), state })),
    context: weekContext({ weekIndex: i.weekIndex, weeksTotal: i.weeksTotal, goal: i.goal }),
    name: i.name ?? undefined,
  };
}

export type AchievementInput = Common & { id: AchievementId; goal?: string | null; icon?: string };

export function achievementCard(i: AchievementInput, p: CardPalette): CardModel {
  return {
    kind: 'achievement',
    accent: p.primary,
    onAccent: p.onPrimary,
    kicker: t('share.kicker.achievement'),
    title: t(`achv.${i.id}` as MessageKey),
    body: t(`share.achv.${i.id}` as MessageKey),
    icon: i.icon ? { body: i.icon, big: true } : undefined,
    stats: [],
    context: goalText(i.goal) ?? undefined,
    name: i.name ?? undefined,
  };
}

export type PlanInput = Common & {
  goal: string;
  raceName?: string | null;
  raceDate?: string | null;
  daysToRace?: number | null;
  weeks: { phase: string }[];
  currentWeek?: number | null;
  daysPerWeek: number;
  peakM?: number | null;
  unit: Unit;
  icon?: string;
};

export function planCard(i: PlanInput, p: CardPalette): CardModel {
  const stats: CardModel['stats'] = [
    { label: t('share.stat.weeks'), value: formatNumber(i.weeks.length) },
    { label: t('share.stat.daysPerWeek'), value: formatNumber(i.daysPerWeek) },
  ];
  if (i.peakM) {
    stats.push({
      label: t('share.stat.peak'),
      value: `${formatDistanceValue(i.peakM, i.unit)} ${unitLabel(i.unit)}`,
    });
  }
  const race = i.raceDate
    ? [i.raceName?.trim() || null, formatDateFull(i.raceDate)].filter(Boolean).join(' · ')
    : null;
  const phases: CardModel['phases'] = [];
  i.weeks.forEach((w, idx) => {
    const c = p.phase[w.phase as keyof CardPalette['phase']] ?? p.zone.recovery;
    const current = i.currentWeek === idx + 1;
    const last = phases[phases.length - 1];
    if (last && last.color === c && !current && !last.current) last.weeks += 1;
    else phases.push({ color: c, weeks: 1, current });
  });
  return {
    kind: 'plan',
    accent: p.primary,
    onAccent: p.onPrimary,
    kicker: t('share.kicker.plan'),
    title: goalText(i.goal) ?? '',
    hero:
      i.daysToRace != null && i.daysToRace >= 0
        ? { value: formatNumber(i.daysToRace), unit: t('share.unit.daysToRace') }
        : { value: formatNumber(i.weeks.length), unit: t('share.unit.weeks') },
    icon: i.icon ? { body: i.icon } : undefined,
    body: race ?? undefined,
    stats,
    phases,
    context:
      i.currentWeek && i.weeks.length
        ? t('share.weekOf', { n: i.currentWeek, total: i.weeks.length })
        : undefined,
    name: i.name ?? undefined,
  };
}

// ---------- Render SVG ----------

export function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Bungkus teks per kata dengan perkiraan lebar huruf (tanpa pengukuran font). Baris lebih = elipsis. */
export function wrapText(text: string, maxChars: number, maxLines: number): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length <= maxChars || !cur) cur = next;
    else {
      lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  if (lines.length <= maxLines) return lines.map((l) => clip(l, maxChars));
  const kept = lines.slice(0, maxLines);
  // Baris terakhir diberi elipsis, dipotong di batas kata bila bisa.
  const last = `${kept[maxLines - 1]} ${lines[maxLines]}`.slice(0, maxChars - 1);
  const cut = last.lastIndexOf(' ');
  kept[maxLines - 1] = `${(cut > 0 ? last.slice(0, cut) : last).trimEnd()}…`;
  return kept;
}

function clip(s: string, n: number): string {
  if (s.length <= n) return s;
  return `${s.slice(0, Math.max(1, n)).trimEnd()}…`;
}

/** Font yang dipakai kartu (nama sama dengan yang dimuat app, `fontFiles` di packages/ui). */
export const CARD_FONTS = {
  display: 'BricolageGrotesque_800ExtraBold',
  ui800: 'PlusJakartaSans_800ExtraBold',
  ui700: 'PlusJakartaSans_700Bold',
  ui600: 'PlusJakartaSans_600SemiBold',
} as const;

const F = CARD_FONTS;

/**
 * Skala spacing 8 pt (aturan spacing): jarak di dalam grup < jarak antar grup < padding kartu.
 * Semua jarak vertikal di kartu memakai salah satu nilai ini.
 */
const S = { xs: 16, sm: 24, s: 32, md: 48, lg: 72, xl: 96 } as const;

// Kartu putih di tengah kanvas 9:16; padding sama di keempat sisi (80).
const CARD_X = 72;
const CARD_Y = 240;
const CARD_WIDTH = CARD_W - CARD_X * 2;
const CARD_BOTTOM = 1580;
const PAD = 80;
const X0 = CARD_X + PAD;
const INNER = CARD_WIDTH - PAD * 2;
const HEAD_TOP = CARD_Y + PAD;
const HEAD_H = 112;
/** Garis pemisah statistik dan baris bawah (zona yang sudah disetujui pemilik). */
const STATS_LINE = 1244;
const FOOT_Y = CARD_BOTTOM - 72;

function text(
  x: number,
  y: number,
  s: string,
  o: { font: string; size: number; fill: string; anchor?: 'start' | 'middle' | 'end'; ls?: number },
) {
  return (
    `<text x="${x}" y="${y}" font-family="${o.font}" font-size="${o.size}" fill="${o.fill}"` +
    (o.anchor && o.anchor !== 'start' ? ` text-anchor="${o.anchor}"` : '') +
    (o.ls ? ` letter-spacing="${o.ls}"` : '') +
    `>${escapeXml(s)}</text>`
  );
}

/** Perkiraan lebar teks (px) tanpa pengukuran font: rata-rata lebar huruf x ukuran. */
const approxWidth = (s: string, size: number, k = 0.6) => s.length * size * k;
/** Tinggi huruf kapital / angka font display (dipakai untuk menaruh baseline dari tepi atas blok). */
const CAP = 0.72;

/** Blok vertikal: tinggi visual + gambar dari tepi atas. Jarak antar blok diatur `gap` sebelum blok. */
type Block = { h: number; gap: number; draw: (top: number) => string };

function titleBlock(title: string, p: CardPalette, gap: number): Block {
  const size = title.length > 16 ? 64 : 80;
  const lines = wrapText(title, Math.floor(INNER / (size * 0.56)), 2);
  const lh = size * 1.1;
  return {
    gap,
    h: size * CAP + lh * (lines.length - 1),
    draw: (top) =>
      lines
        .map((l, i) => text(X0, top + size * CAP + lh * i, l, { font: F.display, size, fill: p.text }))
        .join(''),
  };
}

function bodyBlock(body: string, p: CardPalette, gap: number, size = 40): Block {
  const lines = wrapText(body, Math.floor(INNER / (size * 0.52)), 3);
  const lh = size * 1.4;
  return {
    gap,
    h: size * CAP + lh * (lines.length - 1),
    draw: (top) =>
      lines
        .map((l, i) => text(X0, top + size * CAP + lh * i, l, { font: F.ui600, size, fill: p.textMuted }))
        .join(''),
  };
}

/** Angka besar: ukuran dipilih agar angka + satuan memenuhi lebar tanpa keluar kartu. */
function heroBlock(
  hero: { value: string; unit?: string },
  p: CardPalette,
  gap: number,
  tnum: boolean,
): Block {
  const unitSize = 72;
  const unitW = hero.unit ? approxWidth(hero.unit, unitSize, 0.54) + S.sm : 0;
  const size = Math.round(Math.max(160, Math.min(340, (INNER - unitW) / (hero.value.length * 0.64))));
  return {
    gap,
    h: size * CAP,
    draw: (top) =>
      // tnum hanya di ekspor web (canvas); react-native-svg tidak mengenal font-variant.
      `<text x="${X0}" y="${top + size * CAP}" fill="${p.text}"${tnum ? ' style="font-variant-numeric: tabular-nums"' : ''}>` +
      `<tspan font-family="${F.display}" font-size="${size}">${escapeXml(hero.value)}</tspan>` +
      (hero.unit
        ? `<tspan font-family="${F.ui700}" font-size="${unitSize}" fill="${p.textMuted}" dx="${S.sm}">${escapeXml(hero.unit)}</tspan>`
        : '') +
      '</text>',
  };
}

function pillBlock(label: string, bg: string, fg: string, gap: number): Block {
  const size = 36;
  const h = 72;
  const w = Math.min(INNER, approxWidth(label, size, 0.56) + S.md * 2);
  return {
    gap,
    h,
    draw: (top) =>
      `<rect x="${X0}" y="${top}" width="${w}" height="${h}" rx="${h / 2}" fill="${bg}"/>` +
      text(X0 + w / 2, top + h / 2 + size * 0.36, label, { font: F.ui800, size, fill: fg, anchor: 'middle' }),
  };
}

function daysBlock(days: NonNullable<CardModel['days']>, p: CardPalette, gap: number): Block {
  const r = 36;
  const step = (INNER - r * 2) / Math.max(1, days.length - 1);
  return {
    gap,
    h: r * 2 + S.xs + 28 * CAP,
    draw: (top) =>
      days
        .map((d, i) => {
          const cx = X0 + r + step * i;
          const cy = top + r;
          const fill =
            d.state === 'done'
              ? p.success
              : d.state === 'planned'
                ? p.surfaceSunken
                : d.state === 'missed'
                  ? p.line
                  : 'none';
          const stroke = d.state === 'rest' ? ` stroke="${p.line}" stroke-width="5"` : '';
          const tick =
            d.state === 'done'
              ? `<path d="M${cx - 15} ${cy} l10 10 l20 -22" fill="none" stroke="${p.bg}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`
              : '';
          return (
            `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"${stroke}/>${tick}` +
            text(cx, top + r * 2 + S.xs + 28 * CAP, d.label, {
              font: F.ui700,
              size: 28,
              fill: p.textMuted,
              anchor: 'middle',
            })
          );
        })
        .join(''),
  };
}

function phasesBlock(phases: NonNullable<CardModel['phases']>, p: CardPalette, gap: number): Block {
  const h = 40;
  const total = phases.reduce((s, x) => s + x.weeks, 0);
  return {
    gap,
    h,
    draw: (top) => {
      let x = X0;
      return phases
        .map((ph) => {
          const w = (INNER * ph.weeks) / total;
          const seg = `<rect x="${x + 3}" y="${top}" width="${Math.max(6, w - 6)}" height="${h}" rx="12" fill="${ph.color}"/>`;
          const mark = ph.current
            ? `<rect x="${x - 3}" y="${top - 8}" width="${Math.max(6, w + 6)}" height="${h + 16}" rx="16" fill="none" stroke="${p.text}" stroke-width="5"/>`
            : '';
          x += w;
          return seg + mark;
        })
        .join('');
    },
  };
}

function iconBlock(body: string, size: number, gap: number): Block {
  return {
    gap,
    h: size,
    draw: (top) => `<g transform="translate(${X0} ${top}) scale(${size / 48})" ${SPOT_ATTRS}>${body}</g>`,
  };
}

/** Grup isi utama per jenis kartu (hukum kedekatan: elemen yang berkaitan berjarak kecil). */
function mainBlocks(c: CardModel, p: CardPalette, tnum: boolean): Block[] {
  const b: Block[] = [];
  if (c.kind === 'achievement') {
    if (c.icon) b.push(iconBlock(c.icon.body, 320, 0));
    b.push(titleBlock(c.title, p, b.length ? S.lg : 0));
    if (c.body) b.push(bodyBlock(c.body, p, S.s, 44));
    return b;
  }
  b.push(titleBlock(c.title, p, 0));
  // Judul -> angka: satu langkah lebih besar karena descender judul + tinggi angka display memakan ruang optis.
  if (c.hero) b.push(heroBlock(c.hero, p, S.lg, tnum));
  // Pendukung angka besar: sorotan, keterangan race, lajur hari, bar fase.
  if (c.highlight) b.push(pillBlock(c.highlight, p.primary, p.onPrimary, S.md));
  if (c.body) b.push(bodyBlock(c.body, p, S.md));
  if (c.days?.length) b.push(daysBlock(c.days, p, S.lg));
  if (c.phases?.length) b.push(phasesBlock(c.phases, p, c.body ? S.s : S.lg));
  return b;
}

/**
 * SVG kartu 1080 x 1920 (9:16). Zona aman Story/Status: tidak ada teks penting di 240 px atas dan
 * 340 px bawah. Tiga zona di dalam kartu: kepala (kicker + ikon), isi utama (dipusatkan secara optis,
 * sedikit di atas tengah), dan statistik + baris bawah. `fontCss` (web) = @font-face berisi data URL
 * agar font ikut saat dirender ke canvas.
 */
export function cardSvg(c: CardModel, p: CardPalette, o: { fontCss?: string; logo?: string } = {}): string {
  const out: string[] = [];
  out.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_W}" height="${CARD_H}" viewBox="0 0 ${CARD_W} ${CARD_H}">`,
  );
  if (o.fontCss) out.push(`<style>${o.fontCss}</style>`);
  out.push(`<rect width="${CARD_W}" height="${CARD_H}" fill="${p.bg}"/>`);
  // Lingkaran aksen dekoratif di pojok kanan atas dan kiri bawah (di luar kartu, tidak mengganggu isi).
  out.push(`<circle cx="${CARD_W - 60}" cy="200" r="380" fill="${c.accent}" opacity="0.35"/>`);
  out.push(`<circle cx="40" cy="${CARD_H - 160}" r="260" fill="${c.accent}" opacity="0.2"/>`);
  out.push(
    `<rect x="${CARD_X}" y="${CARD_Y}" width="${CARD_WIDTH}" height="${CARD_BOTTOM - CARD_Y}" rx="56" fill="${p.surface}"/>`,
  );

  // Kepala: pil kicker dan ikon spot sejajar di tengah tinggi baris yang sama.
  const kSize = 32;
  const kH = 64;
  // Lebar huruf diukur dari render (Plus Jakarta 800 + letter-spacing 2, ~0.57 em). Teks di tengah pil,
  // jadi selisih perkiraan terbagi rata dan padding kiri = kanan.
  const kW = c.kicker.length * (kSize * 0.57 + 2) + S.sm * 2;
  const kTop = HEAD_TOP + (HEAD_H - kH) / 2;
  out.push(`<rect x="${X0}" y="${kTop}" width="${kW}" height="${kH}" rx="${kH / 2}" fill="${c.accent}"/>`);
  out.push(
    text(X0 + kW / 2, kTop + kH / 2 + kSize * 0.36, c.kicker, {
      font: F.ui800,
      size: kSize,
      fill: c.onAccent,
      ls: 2,
      anchor: 'middle',
    }),
  );
  if (c.icon && c.kind !== 'achievement') {
    out.push(
      `<g transform="translate(${X0 + INNER - HEAD_H} ${HEAD_TOP}) scale(${HEAD_H / 48})" ${SPOT_ATTRS}>${c.icon.body}</g>`,
    );
  }

  // Isi utama: tinggi grup dihitung dulu, lalu diletakkan di pusat optis area antara kepala dan
  // statistik (45% ruang kosong di atas, 55% di bawah), sehingga ruang putih seimbang.
  const stats = c.stats.slice(0, 3);
  const areaTop = HEAD_TOP + HEAD_H + S.lg;
  const areaBottom = (stats.length ? STATS_LINE : FOOT_Y - 40) - S.lg;
  const blocks = mainBlocks(c, p, !!o.fontCss);
  const groupH = blocks.reduce((s, b) => s + b.gap + b.h, 0);
  let y = areaTop + Math.max(0, (areaBottom - areaTop - groupH) * 0.45);
  for (const b of blocks) {
    y += b.gap;
    out.push(b.draw(y));
    y += b.h;
  }

  // Statistik di bawah kartu (rata bawah), maksimal 3 kolom.
  if (stats.length) {
    const sy = STATS_LINE + 56;
    out.push(`<rect x="${X0}" y="${STATS_LINE}" width="${INNER}" height="3" fill="${p.line}"/>`);
    const colW = INNER / stats.length;
    stats.forEach((st, i) => {
      const x = X0 + colW * i + (i > 0 ? 28 : 0);
      if (i > 0)
        out.push(`<rect x="${X0 + colW * i}" y="${sy - 16}" width="3" height="128" fill="${p.line}"/>`);
      // Ukuran angka menyesuaikan lebar kolom (min 36); baru dipotong jika tetap tidak muat.
      const room = colW - 40;
      const vSize = Math.max(36, Math.min(60, Math.floor(room / (st.value.length * 0.54))));
      out.push(text(x, sy + 24, st.label, { font: F.ui700, size: 32, fill: p.textMuted }));
      out.push(
        text(x, sy + 24 + 60 + 22, clip(st.value, Math.floor(room / (vSize * 0.54))), {
          font: F.display,
          size: vSize,
          fill: p.text,
        }),
      );
    });
  }

  // Baris bawah: nama / konteks di kiri, merek di kanan.
  const left = [c.name?.trim() || null, c.context ?? null].filter(Boolean).join(' · ');
  if (left) out.push(text(X0, FOOT_Y, clip(left, 30), { font: F.ui600, size: 34, fill: p.textMuted }));
  const brand = t('app.name');
  const bx = X0 + INNER;
  out.push(text(bx, FOOT_Y, brand, { font: F.display, size: 40, fill: p.text, anchor: 'end' }));
  if (o.logo) {
    const lx = bx - approxWidth(brand, 40, 0.56) - 72;
    out.push(`<g transform="translate(${lx} ${FOOT_Y - 46}) scale(0.9)">${o.logo}</g>`);
  }
  out.push('</svg>');
  return out.join('');
}

const SPOT_ATTRS = 'fill="none" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"';

/** Isi dalam elemen <svg> (untuk menyisipkan ikon spot / logo sebagai <g>). */
export function svgInner(svg: string): string {
  return svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
}

/** Status 7 hari untuk kartu minggu: lari selesai, terlewat, akan datang, atau tanpa lari. */
export function weekDays(
  monday: string,
  today: string,
  workouts: { date: string; type: WorkoutType; status: string }[],
): DayState[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = addDays(monday, i);
    const ws = workouts.filter((w) => w.date === d && w.type !== 'rest');
    if (!ws.length) return 'rest';
    if (ws.some((w) => w.status === 'completed')) return 'done';
    if (d < today || ws.every((w) => w.status === 'skipped' || w.status === 'missed')) return 'missed';
    return 'planned';
  });
}

/** Sorotan aktivitas: 5K pertama (aktivitas pertama >= 5 km) atau lari terjauh di plan (>= 3 lari). */
export function activityHighlight(
  act: { id: string; distance_m: number | null; started_at: string },
  all: { id: string; distance_m: number | null; started_at: string; workout_type: WorkoutType | null }[],
  planStart: string | null,
): 'first_5k' | 'record' | null {
  const runs = all.filter((a) => !a.workout_type || !isSupportType(a.workout_type));
  const first5k = [...runs]
    .filter((a) => (a.distance_m ?? 0) >= 5000)
    .sort((a, b) => a.started_at.localeCompare(b.started_at))[0];
  if (first5k?.id === act.id) return 'first_5k';
  if (!act.distance_m) return null;
  const inPlan = runs.filter((a) => !planStart || a.started_at.slice(0, 10) >= planStart);
  if (inPlan.length < 3) return null;
  const longest = Math.max(...inPlan.map((a) => a.distance_m ?? 0));
  const ties = inPlan.filter((a) => a.distance_m === longest);
  const firstLongest = ties.sort((a, b) => a.started_at.localeCompare(b.started_at))[0];
  return firstLongest?.id === act.id ? 'record' : null;
}
