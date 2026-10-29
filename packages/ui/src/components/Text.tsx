import { Text as RNText, type TextProps } from 'react-native';
import { color as colors, typography, type TypographyVariant } from '../theme';

type ColorKey = 'text' | 'textMuted' | 'primaryInk' | 'onPrimary' | 'success' | 'accentInk';

export type AppTextProps = TextProps & {
  variant?: TypographyVariant;
  color?: ColorKey | 'darkText' | 'darkTextMuted';
  align?: 'left' | 'center' | 'right';
};

export function Text({ variant = 'body', color = 'text', align, style, ...rest }: AppTextProps) {
  const c =
    color === 'darkText'
      ? colors.dark.text
      : color === 'darkTextMuted'
        ? colors.dark.textMuted
        : colors[color];
  return (
    <RNText
      {...rest}
      style={[typography[variant], { color: c }, align ? { textAlign: align } : null, style]}
    />
  );
}
