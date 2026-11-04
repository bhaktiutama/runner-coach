import { ActivityIndicator, Pressable, StyleSheet, View, type PressableProps } from 'react-native';
import { border, color, radius, ring, size, space, themed, isDark } from '../theme';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

type Base = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  icon?: IconName;
  loading?: boolean;
  testID?: string;
};

/** Tebal sisi bawah tombol (UI/UX 3, v0.9) dan sisa saat ditekan. */
const EDGE = space[1];
const EDGE_PRESSED = border.hairline;

/** Sisi gelap tombol varian `dark`: hitam pekat di terang, krem redup di gelap. */
const edgeDark = () => (isDark() ? color.lineStrong : color.scrim);

/**
 * Tombol bertebal (bukan kertas melayang): sisi bawah padat warna lebih gelap + bayangan lembut
 * pendek + kilau tipis di tepi atas. Ditekan: tombol turun dan sisinya menipis, seperti tombol fisik.
 */
function depth(edge: string, pressed: boolean) {
  const e = pressed ? EDGE_PRESSED : EDGE;
  return {
    transform: [{ translateY: EDGE - e }],
    boxShadow: [
      `0px ${e}px 0px 0px ${edge}`,
      `0px ${e + space[1]}px ${space[2]}px -${space[1]}px ${color.scrim}40`,
      `inset 0px ${border.hairline}px 0px 0px ${color.palette.white}59`,
    ].join(', '),
  };
}

export function PrimaryButton({
  label,
  icon,
  loading,
  disabled,
  variant = 'primary',
  ...rest
}: Base & { variant?: 'primary' | 'dark' }) {
  const bg = variant === 'primary' ? color.primary : color.text;
  const fg = variant === 'primary' ? color.onPrimary : isDark() ? color.bg : color.palette.cream;
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
        depth(variant === 'primary' ? color.primaryEdge : edgeDark(), pressed && !off),
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.row}>
          {icon ? <Icon name={icon} size={space[5]} color={fg} /> : null}
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
  tall,
  ...rest
}: Base & { variant?: 'outline' | 'ghost'; /** Tinggi 52 (4.5). */ tall?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      accessibilityLabel={label}
      disabled={disabled}
      {...rest}
      style={({ pressed }) => [
        styles.secondary,
        tall && styles.tall,
        variant === 'outline' ? styles.outline : null,
        { opacity: disabled ? 0.4 : pressed ? 0.7 : 1 },
      ]}
    >
      <View style={styles.row}>
        {icon ? <Icon name={icon} size={space[5]} color={color.text} /> : null}
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

const styles = themed(() =>
  StyleSheet.create({
    primary: {
      height: size.buttonPrimary,
      borderRadius: radius.stadium,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: space[6],
    },
    secondary: {
      minHeight: size.buttonSecondary,
      borderRadius: radius.stadium,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: space[5],
    },
    tall: { minHeight: size.input },
    outline: { ...ring(border.control, color.lineStrong), backgroundColor: color.surface },
    link: {
      minHeight: size.touchMin,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: space[2],
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[2] + border.selected - border.hairline / 2,
    },
    rowLink: { gap: space[2] },
    linkSm: { minHeight: space[8] + space[1] },
  }),
);
