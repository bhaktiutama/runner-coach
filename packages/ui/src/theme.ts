import type { TextStyle } from 'react-native';
import { tokens } from './tokens';

export { tokens };
/** Warna dasar + overlay sheet (charcoal 40%, diturunkan dari token text). */
type Widen<T> = { [K in keyof T]: T[K] extends string ? string : Widen<T[K]> };
export type ColorPalette = Widen<typeof tokens.color> & { overlay: string };

const lightColor: ColorPalette = { ...tokens.color, overlay: `${tokens.color.text}66` };
export type ColorScheme = 'light' | 'dark';

/**
 * Mode gelap (F-24, UI/UX 2.3): semantik sama, nilai dari `tokens.color.dark` + palet. Sama dengan
 * `[data-theme="dark"]` di docs/wireframes/source/ds/lintas/tokens.css (wireframe png/dark/).
 * Warna isian zona/fase/RPE dan status tetap (sudah terang); hanya teks "ink" yang dicerahkan.
 */
const d = tokens.color.dark;
const p = tokens.color.palette;
const darkColor: ColorPalette = {
  ...lightColor,
  bg: d.bg,
  surface: d.surface,
  surfaceSunken: d.surfaceSunken,
  text: d.text,
  textMuted: d.textMuted,
  line: d.line,
  lineStrong: d.lineStrong,
  primaryInk: d.primaryInk,
  accentInk: p.peach,
  success: p.forest,
  focusRing: p.cream,
  status: {
    ...lightColor.status,
    onTrackInk: p.mint,
    attentionInk: p.sand,
    behindInk: p.coral,
    recoveryInk: p.lavender,
  },
  zone: { ...lightColor.zone, strength: d.zoneStrength },
  overlay: d.overlay,
};

/** Campur dua warna hex `#RRGGBB` (t = 0 -> a, 1 -> b). Untuk turunan tone dari token, bukan warna baru. */
export function mixHex(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1, 7), 16);
  const pb = parseInt(b.slice(1, 7), 16);
  const ch = (sh: number) =>
    Math.round(((pa >> sh) & 255) * (1 - t) + ((pb >> sh) & 255) * t)
      .toString(16)
      .padStart(2, '0');
  return `#${ch(16)}${ch(8)}${ch(0)}`;
}

/**
 * Gradasi satu tone untuk cincin/bar timer: ekor lebih terang (dicampur cream), kepala sedikit lebih
 * dalam (dicampur charcoal). Tetap di sekitar warna zona; semua turunan dari token palet.
 */
export function toneRamp(base: string): [string, string] {
  return [mixHex(base, p.cream, 0.45), mixHex(base, p.charcoal, 0.12)];
}

let scheme: ColorScheme = 'light';
const palettes: Record<ColorScheme, ColorPalette> = { light: lightColor, dark: darkColor };

/** Dipanggil root layout sebelum render (dan saat sistem berganti tema, lalu pohon di-remount). */
export function setColorScheme(s: ColorScheme) {
  scheme = s;
}
export const getColorScheme = (): ColorScheme => scheme;
export const isDark = () => scheme === 'dark';
export const paletteFor = (s: ColorScheme) => palettes[s];

/**
 * `color.x` membaca palet tema aktif saat diakses (saat render). Jangan simpan nilainya di
 * konstanta modul; gaya statis lewat `themed()`.
 */
export const color: ColorPalette = new Proxy({} as ColorPalette, {
  get: (_t, k) => (palettes[scheme] as Record<string | symbol, unknown>)[k],
  has: (_t, k) => k in palettes[scheme],
  ownKeys: () => Reflect.ownKeys(palettes[scheme]),
  getOwnPropertyDescriptor: (_t, k) => ({
    ...Reflect.getOwnPropertyDescriptor(palettes[scheme], k),
    configurable: true,
  }),
});

/**
 * Pembungkus StyleSheet per tema: `const styles = themed(() => StyleSheet.create({...}))`.
 * Dibuat malas sekali per tema, dibaca saat render.
 */
export function themed<T extends object>(make: () => T): T {
  const cache: Partial<Record<ColorScheme, T>> = {};
  return new Proxy({} as T, {
    get: (_t, k) => {
      const c = (cache[scheme] ??= make());
      return (c as Record<string | symbol, unknown>)[k];
    },
  });
}
export const space = tokens.space;
export const radius = tokens.radius;
export const size = tokens.size;
export const border = tokens.border;
export const motion = tokens.motion;
export const breakpoint = tokens.breakpoint;

/** Nama font yang dimuat di app (lihat apps/app/src/app/_layout.tsx). */
export const fontFiles = {
  display500: 'BricolageGrotesque_500Medium',
  display700: 'BricolageGrotesque_700Bold',
  display800: 'BricolageGrotesque_800ExtraBold',
  ui500: 'PlusJakartaSans_500Medium',
  ui600: 'PlusJakartaSans_600SemiBold',
  ui700: 'PlusJakartaSans_700Bold',
  ui800: 'PlusJakartaSans_800ExtraBold',
} as const;

type TypoKey = keyof typeof tokens.typography;

function fontFor(family: readonly string[], weight: number): string {
  const display = family[0] === tokens.font.family.display[0];
  if (display)
    return weight >= 800 ? fontFiles.display800 : weight >= 700 ? fontFiles.display700 : fontFiles.display500;
  if (weight >= 800) return fontFiles.ui800;
  if (weight >= 700) return fontFiles.ui700;
  if (weight >= 600) return fontFiles.ui600;
  return fontFiles.ui500;
}

function toStyle(key: TypoKey): TextStyle {
  const t = tokens.typography[key];
  const ls =
    typeof t.letterSpacing === 'string' && t.letterSpacing.endsWith('em')
      ? parseFloat(t.letterSpacing) * t.fontSize
      : Number(t.letterSpacing) || 0;
  // Angka selalu font display + tnum (Design system aturan 4).
  const display = t.fontFamily[0] === tokens.font.family.display[0];
  return {
    fontFamily: fontFor(t.fontFamily, t.fontWeight),
    fontSize: t.fontSize,
    lineHeight: Math.round(t.fontSize * t.lineHeight),
    letterSpacing: ls,
    ...(display ? { fontVariant: ['tabular-nums'] as TextStyle['fontVariant'] } : {}),
  };
}

export const typography = Object.fromEntries(
  (Object.keys(tokens.typography) as TypoKey[]).map((k) => [k, toStyle(k)]),
) as Record<TypoKey, TextStyle>;

export type TypographyVariant = TypoKey;

/**
 * Garis dalam tanpa memakan ruang (wireframe memakai `inset box-shadow`), supaya isi tidak
 * bergeser saat garis menebal (terpilih 2.5 px).
 */
export function ring(width: number, c: string) {
  return { boxShadow: `inset 0px 0px 0px ${width}px ${c}` };
}

/** Bayangan keras 2/4 px (token shadow.card / shadow.raised); di mode gelap hitam pekat (wireframe). */
const shadowFor = (c: (k: 'card' | 'raised') => string) => ({
  card: {
    boxShadow: `${tokens.shadow.card.offsetX}px ${tokens.shadow.card.offsetY}px ${tokens.shadow.card.blur}px ${tokens.shadow.card.spread}px ${c('card')}`,
  },
  raised: {
    boxShadow: `${tokens.shadow.raised.offsetX}px ${tokens.shadow.raised.offsetY}px ${tokens.shadow.raised.blur}px ${tokens.shadow.raised.spread}px ${c('raised')}`,
  },
});
const shadows = {
  light: shadowFor((k) => tokens.shadow[k].color),
  dark: shadowFor((k) => (k === 'card' ? d.shadowCard : d.shadowRaised)),
};
export const shadow = new Proxy({} as (typeof shadows)['light'], {
  get: (_t, k) => (shadows[scheme] as Record<string | symbol, unknown>)[k],
});

export type ZoneKey = keyof typeof tokens.color.zone;
