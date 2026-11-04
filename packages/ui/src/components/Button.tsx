import { ActivityIndicator, Pressable, StyleSheet, View, type PressableProps } from 'react-native';
import { border, color, radius, size, space, themed, isDark } from '../theme';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

type Base = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  icon?: IconName;
  loading?: boolean;
  testID?: string;
};

/**
 * Tepi kaca (UI/UX 3, v0.9, meniru referensi ala liquid glass): isi rata tanpa gradasi dan tanpa
 * bayangan keluar. Cahaya seolah tembus dari bawah: tepi atas/kiri sedikit gelap, tepi bawah/kanan
 * sedikit terang, dengan tepi lembut. Ditekan: semua efek hilang, tombol datar sejajar layar.
 */
const H = border.hairline;
const HL = border.control;
const inset = (x: number, y: number, c: string) => `inset ${x}px ${y}px ${H}px -${H / 2}px ${c}`;

function glassPrimary(pressed: boolean) {
  if (pressed) return { boxShadow: 'none' };
  const dark = color.scrim;
  const light = color.palette.white;
  return {
    boxShadow: [
      inset(0, H, `${dark}26`),
      inset(H, 0, `${dark}1A`),
      inset(0, -HL, `${light}66`),
      inset(-H, 0, `${light}33`),
      `0px 0px 0px ${H / 2}px ${dark}14`,
    ].join(', '),
  };
}

function glassSecondary(pressed: boolean) {
  if (pressed) return { boxShadow: 'none' };
  const dark = isDark();
  const rim = dark ? color.palette.cream : color.palette.white;
  const a = dark ? ['40', '26', '33', '1A'] : ['F2', 'B3', 'CC', '80'];
  return {
    boxShadow: [
      inset(0, -HL, `${rim}${a[0]}`),
      inset(-HL, 0, `${rim}${a[1]}`),
      inset(0, H, `${rim}${a[2]}`),
      inset(H, 0, `${rim}${a[3]}`),
      `0px 0px 0px ${H / 2}px ${dark ? `${color.scrim}66` : `${color.text}1F`}`,
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
        glassPrimary(pressed && !off),
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
        variant === 'outline' ? [styles.outline, glassSecondary(pressed && !disabled)] : null,
        { opacity: disabled ? 0.4 : variant === 'outline' ? 1 : pressed ? 0.7 : 1 },
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
    // Sekunder kaca: abu rata (gelap: surface) + tepi kaca dari glassSecondary.
    outline: { backgroundColor: isDark() ? color.surface : color.surfaceSunken },
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
