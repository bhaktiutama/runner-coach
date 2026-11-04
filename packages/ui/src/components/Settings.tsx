import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { duration, easing, useReducedMotion } from '../motion';
import { border, color, radius, shadow, size, space, themed } from '../theme';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export function SettingsGroup({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <View style={styles.group}>
      {title ? (
        <Text variant="sectionCaps" color="textMuted" style={styles.groupTitle}>
          {title}
        </Text>
      ) : null}
      <View style={styles.card}>{children}</View>
    </View>
  );
}

export function SettingsRow({
  label,
  value,
  icon,
  danger,
  onPress,
  right,
  first,
  testID,
  sub,
}: {
  label: string;
  value?: string;
  icon?: IconName;
  danger?: boolean;
  onPress?: () => void;
  right?: ReactNode;
  first?: boolean;
  testID?: string;
  sub?: string;
}) {
  const fg = danger ? color.status.behindInk : color.text;
  const chevron = !right && onPress;
  // Label dan nilai dalam satu baris yang boleh membungkus: jika tidak muat (iPhone SE/mini, Ukuran
  // Teks besar), nilai turun ke baris kedua di bawah label, rata kiri (seperti `sub`).
  const content = (
    <>
      {icon ? <Icon name={icon} size={space[5]} color={fg} /> : null}
      <View style={styles.labelCol}>
        <View style={styles.line}>
          <Text variant="rowRegular" style={[styles.label, { color: fg }]}>
            {label}
          </Text>
          {value ? (
            <Text variant="bodySm" color="textMuted" style={styles.value}>
              {value}
            </Text>
          ) : null}
        </View>
        {sub ? (
          <Text variant="caption" color="textMuted">
            {sub}
          </Text>
        ) : null}
      </View>
      {chevron ? <Icon name="chevron-right" size={space[4] + space[1] / 2} color={color.textMuted} /> : null}
      {right ?? null}
    </>
  );
  const rowStyle = [styles.row, sub && styles.rowTall, !first && styles.sep];
  // Tanpa onPress: View biasa. Pressable yang dinonaktifkan ikut menonaktifkan kontrol di dalamnya
  // (mis. Switch) di web.
  if (!onPress) {
    return (
      <View testID={testID} style={rowStyle}>
        {content}
      </View>
    );
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [...rowStyle, { opacity: pressed ? 0.7 : 1 }]}
    >
      {content}
    </Pressable>
  );
}

/** Sakelar stadium (4.5). */
export function Switch({
  value,
  onChange,
  label,
  testID,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  label: string;
  testID?: string;
}) {
  const reduced = useReducedMotion();
  const x = useRef(new Animated.Value(value ? SWITCH_TRAVEL : 0)).current;
  const first = useRef(true);
  useEffect(() => {
    const to = value ? SWITCH_TRAVEL : 0;
    if (first.current || reduced) {
      first.current = false;
      x.setValue(to);
      return;
    }
    const a = Animated.timing(x, {
      toValue: to,
      duration: duration.base,
      easing: easing.standard,
      useNativeDriver: true,
    });
    a.start();
    return () => a.stop();
  }, [value, reduced, x]);
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={label}
      onPress={() => onChange(!value)}
      testID={testID}
      style={[styles.switch, { backgroundColor: value ? color.success : color.lineStrong }]}
    >
      <Animated.View style={[styles.knob, { transform: [{ translateX: x }] }]} />
    </Pressable>
  );
}

export function DangerButton({
  label,
  onPress,
  disabled,
  loading,
  testID,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  testID?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled || loading}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [styles.danger, { opacity: disabled ? 0.4 : pressed ? 0.8 : 1 }]}
    >
      <Text variant="button" style={{ color: color.onSuccess }}>
        {label}
      </Text>
    </Pressable>
  );
}

/** Sakelar 52 x 32, kenop 26, celah 3 (4.5). */
const KNOB = space[6] + border.selected - border.hairline / 2;
const KNOB_PAD = (space[8] - KNOB) / 2;
/** Jarak geser knob dari kiri ke kanan. */
const SWITCH_TRAVEL = size.input - KNOB - 2 * KNOB_PAD;
const styles = themed(() =>
  StyleSheet.create({
    labelCol: { flex: 1, gap: border.selected - border.hairline / 2 },
    rowTall: { minHeight: space[10] + space[6] },
    group: { gap: space[2] },
    groupTitle: { paddingLeft: space[1] },
    card: { backgroundColor: color.surface, borderRadius: radius.md, overflow: 'hidden', ...shadow.card },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[3],
      minHeight: size.input,
      paddingHorizontal: space[4],
      paddingVertical: space[2],
    },
    sep: { borderTopWidth: border.hairline, borderTopColor: color.line },
    line: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      alignItems: 'center',
      columnGap: space[3],
      rowGap: border.selected - border.hairline / 2,
    },
    label: { flexShrink: 0, maxWidth: '100%' },
    value: { flexShrink: 0, maxWidth: '100%' },
    switch: {
      width: size.input,
      height: space[8],
      borderRadius: radius.stadium,
      padding: KNOB_PAD,
      justifyContent: 'center',
    },
    knob: { width: KNOB, height: KNOB, borderRadius: radius.stadium, backgroundColor: color.surface },
    danger: {
      height: size.buttonPrimary,
      borderRadius: radius.stadium,
      backgroundColor: color.status.behindInk,
      alignItems: 'center',
      justifyContent: 'center',
    },
  }),
);
