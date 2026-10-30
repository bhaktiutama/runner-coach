import { Text as RNText, type TextProps } from 'react-native';
import { color as colors, typography, type TypographyVariant } from '../theme';

type ColorKey = 'text' | 'textMuted' | 'primaryInk' | 'onPrimary' | 'success' | 'accentInk';

export type AppTextProps = TextProps & {
  variant?: TypographyVariant;
  color?: ColorKey | 'darkText' | 'darkTextMuted';
  align?: 'left' | 'center' | 'right';
};

/**
 * Batas pembesaran iOS/Android "Ukuran Teks". Teks di dalam bentuk tetap (pil, chip, tombol,
 * bib, tab, angka besar) dibatasi 1,2x agar tidak meluber; teks isi boleh sampai 1,5x.
 */
const TIGHT = new Set<TypographyVariant>([
  'button',
  'control',
  'controlStrong',
  'controlSm',
  'controlSmStrong',
  'badge',
  'bib',
  'tag',
  'tab',
  'dow',
  'chartLabel',
  'axis',
  'axisSm',
  'counter',
  'rpe',
  'statusCaps',
  'eyebrow',
  'calendarDay',
  'timer',
  'numberXl',
  'numberLg',
  'estimate',
  'drillName',
  'wordmark',
]);
export const fontScaleMax = (v: TypographyVariant) => (TIGHT.has(v) ? 1.2 : 1.5);

export function Text({ variant = 'body', color = 'text', align, style, ...rest }: AppTextProps) {
  const c =
    color === 'darkText'
      ? colors.dark.text
      : color === 'darkTextMuted'
        ? colors.dark.textMuted
        : colors[color];
  return (
    <RNText
      maxFontSizeMultiplier={fontScaleMax(variant)}
      {...rest}
      style={[typography[variant], { color: c }, align ? { textAlign: align } : null, style]}
    />
  );
}
