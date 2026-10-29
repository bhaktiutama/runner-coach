import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { border, color, radius, size, space } from '../theme';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export function SettingsGroup({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <View style={styles.group}>
      {title ? (
        <Text variant="label" color="textMuted" style={styles.groupTitle}>
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
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={label}
      disabled={!onPress}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [styles.row, !first && styles.sep, { opacity: pressed ? 0.7 : 1 }]}
    >
      {icon ? <Icon name={icon} color={fg} /> : null}
      <View style={styles.flex}>
        <Text variant="control" style={{ color: fg }} numberOfLines={2}>
          {label}
        </Text>
        {sub ? (
          <Text variant="label" color="textMuted">
            {sub}
          </Text>
        ) : null}
      </View>
      {value ? (
        <Text color="textMuted" style={styles.value} numberOfLines={1}>
          {value}
        </Text>
      ) : null}
      {right ?? (onPress ? <Icon name="chevron-right" color={color.textMuted} /> : null)}
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

const KNOB = size.touchMin - space[3];
const styles = StyleSheet.create({
  flex: { flex: 1 },
  group: { gap: space[2] },
  groupTitle: { paddingHorizontal: space[2] },
  card: { backgroundColor: color.surface, borderRadius: radius.lg, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    minHeight: size.buttonPrimary,
    paddingHorizontal: space[5],
    paddingVertical: space[3],
  },
  sep: { borderTopWidth: border.hairline, borderTopColor: color.line },
  value: { maxWidth: '45%', flexShrink: 1 },
  switch: {
    width: KNOB * 2 + space[2],
    height: KNOB + space[2],
    borderRadius: radius.stadium,
    padding: space[1],
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
