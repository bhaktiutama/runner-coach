import type { TextStyle } from 'react-native';
import { tokens } from './tokens';

export { tokens };
export const color = tokens.color;
export const space = tokens.space;
export const radius = tokens.radius;
export const size = tokens.size;
export const border = tokens.border;
export const motion = tokens.motion;
export const breakpoint = tokens.breakpoint;

/** Nama font yang dimuat di app (lihat apps/app/src/app/_layout.tsx). */
export const fontFiles = {
  display700: 'BricolageGrotesque_700Bold',
  display800: 'BricolageGrotesque_800ExtraBold',
  ui500: 'PlusJakartaSans_500Medium',
  ui600: 'PlusJakartaSans_600SemiBold',
  ui700: 'PlusJakartaSans_700Bold',
} as const;

type TypoKey = keyof typeof tokens.typography;

function fontFor(family: readonly string[], weight: number): string {
  const display = family[0] === tokens.font.family.display[0];
  if (display) return weight >= 800 ? fontFiles.display800 : fontFiles.display700;
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

export const shadow = {
  card: {
    boxShadow: `${tokens.shadow.card.offsetX}px ${tokens.shadow.card.offsetY}px ${tokens.shadow.card.blur}px ${tokens.shadow.card.spread}px ${tokens.shadow.card.color}`,
  },
  raised: {
    boxShadow: `${tokens.shadow.raised.offsetX}px ${tokens.shadow.raised.offsetY}px ${tokens.shadow.raised.blur}px ${tokens.shadow.raised.spread}px ${tokens.shadow.raised.color}`,
  },
} as const;

export type ZoneKey = keyof typeof tokens.color.zone;
