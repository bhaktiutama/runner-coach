import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { border, color, radius, shadow, size, space } from '../theme';
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
  const content = (
    <>
      {icon ? <Icon name={icon} size={space[5]} color={fg} /> : null}
      <View style={styles.labelCol}>
        <Text variant="rowRegular" style={{ color: fg }} numberOfLines={2}>
          {label}
        </Text>
        {sub ? (
          <Text variant="caption" color="textMuted">
            {sub}
          </Text>
        ) : null}
      </View>
      {value || (!right && onPress) ? (
        <View style={styles.valueWrap}>
          {value ? (
            <Text variant="bodySm" color="textMuted" style={styles.value} numberOfLines={1}>
              {value}
            </Text>
          ) : null}
          {!right && onPress ? (
            <Icon name="chevron-right" size={space[4] + space[1] / 2} color={color.textMuted} />
          ) : null}
        </View>
      ) : null}
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
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={label}
      onPress={() => onChange(!value)}
      testID={testID}
      style={[styles.switch, { backgroundColor: value ? color.success : color.lineStrong }]}
    >
      <View style={[styles.knob, value ? styles.knobOn : null]} />
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
const styles = StyleSheet.create({
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
  valueWrap: { flexDirection: 'row', alignItems: 'center', gap: space[1] + space[1] / 2, maxWidth: '55%' },
  value: { flexShrink: 1 },
  switch: {
    width: size.input,
    height: space[8],
    borderRadius: radius.stadium,
    padding: KNOB_PAD,
    justifyContent: 'center',
  },
  knob: { width: KNOB, height: KNOB, borderRadius: radius.stadium, backgroundColor: color.surface },
  knobOn: { alignSelf: 'flex-end' },
  danger: {
    height: size.buttonPrimary,
    borderRadius: radius.stadium,
    backgroundColor: color.status.behindInk,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
