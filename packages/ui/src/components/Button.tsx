import { ActivityIndicator, Pressable, StyleSheet, View, type PressableProps } from 'react-native';
import { border, color, radius, ring, shadow, size, space } from '../theme';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

type Base = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  icon?: IconName;
  loading?: boolean;
  testID?: string;
};

export function PrimaryButton({
  label,
  icon,
  loading,
  disabled,
  variant = 'primary',
  ...rest
}: Base & { variant?: 'primary' | 'dark' }) {
  const bg = variant === 'primary' ? color.primary : color.text;
  const fg = variant === 'primary' ? color.onPrimary : color.palette.cream;
  const off = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!off, busy: !!loading }}
      accessibilityLabel={label}
      disabled={off}
      {...rest}
      style={({ pressed }) => [
        styles.primary,
        { backgroundColor: bg, opacity: off ? 0.4 : 1 },
        pressed ? styles.pressed : styles.raised,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.row}>
          {icon ? <Icon name={icon} color={fg} /> : null}
          <Text variant="button" style={{ color: fg }}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

export function SecondaryButton({
  label,
  icon,
  disabled,
  variant = 'outline',
  ...rest
}: Base & { variant?: 'outline' | 'ghost' }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      accessibilityLabel={label}
      disabled={disabled}
      {...rest}
      style={({ pressed }) => [
        styles.secondary,
        variant === 'outline' ? styles.outline : null,
        { opacity: disabled ? 0.4 : pressed ? 0.7 : 1 },
      ]}
    >
      <View style={styles.row}>
        {icon ? <Icon name={icon} color={color.text} /> : null}
        <Text variant="row">{label}</Text>
      </View>
    </Pressable>
  );
}

/** Tautan teks (warna primary-ink), area sentuh min 44. */
export function LinkButton({
  label,
  icon,
  disabled,
  size: linkSize = 'md',
  tone = 'primary',
  ...rest
}: Base & { size?: 'md' | 'sm'; tone?: 'primary' | 'text' }) {
  const fg = tone === 'text' ? color.text : color.primaryInk;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      {...rest}
      style={({ pressed }) => [
        styles.link,
        linkSize === 'sm' && styles.linkSm,
        { opacity: disabled ? 0.4 : pressed ? 0.6 : 1 },
      ]}
    >
      <View style={[styles.row, styles.rowLink]}>
        {icon ? <Icon name={icon} color={fg} size={space[5]} /> : null}
        <Text variant={linkSize === 'sm' ? 'controlStrong' : 'row'} style={{ color: fg }}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  primary: {
    height: size.buttonPrimary,
    borderRadius: radius.stadium,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space[6],
  },
  raised: shadow.raised,
  pressed: { transform: [{ translateY: 2 }] },
  secondary: {
    minHeight: size.buttonSecondary,
    borderRadius: radius.stadium,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space[5],
  },
  outline: { ...ring(border.control, color.lineStrong), backgroundColor: color.surface },
  link: {
    minHeight: size.touchMin,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space[2],
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  rowLink: { gap: space[2] },
  linkSm: { minHeight: space[8] + space[1] },
});
