import { Pressable, StyleSheet, View } from 'react-native';
import { border, color, radius, ring, size, space } from '../theme';
import { Chip } from './Controls';
import { Text } from './Text';

const rpeColor = (n: number) =>
  n <= 3 ? color.rpe['1-3'] : n <= 6 ? color.rpe['4-6'] : n <= 8 ? color.rpe['7-8'] : color.rpe['9-10'];

/** RPE 1-10 dalam 1 baris (2.4, 2.6). Label skala diberikan dari katalog. */
export function RpePicker({
  value,
  onChange,
  labels,
}: {
  value: number | null;
  onChange: (n: number) => void;
  labels: [string, string, string];
}) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row} accessibilityRole="radiogroup">
        {Array.from({ length: 10 }, (_, i) => {
          const n = i + 1;
          const on = value === n;
          return (
            <Pressable
              key={n}
              testID={`rpe-${n}`}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              accessibilityLabel={String(n)}
              onPress={() => onChange(n)}
              style={[
                styles.btn,
                on && {
                  backgroundColor: rpeColor(n),
                  ...ring(border.selected - border.hairline / 2, color.text),
                },
              ]}
            >
              <Text variant="rpe" style={on && n >= 9 ? { color: color.zone.onInterval } : null}>
                {String(n)}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.scale}>
        {labels.map((l) => (
          <Text key={l} variant="caption" color="textMuted">
            {l}
          </Text>
        ))}
      </View>
    </View>
  );
}

export function TagChips<T extends string>({
  tags,
  selected,
  onToggle,
}: {
  tags: { value: T; label: string }[];
  selected: T[];
  onToggle: (v: T) => void;
}) {
  return (
    <View style={styles.tags}>
      {tags.map((t) => (
        <Chip
          key={t.value}
          testID={`tag-${t.value}`}
          label={t.label}
          selected={selected.includes(t.value)}
          onPress={() => onToggle(t.value)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space[2] + space[1] / 2 },
  row: { flexDirection: 'row', gap: space[1] },
  btn: {
    flex: 1,
    height: size.touchMin + space[1],
    borderRadius: radius.md,
    backgroundColor: color.surfaceSunken,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scale: { flexDirection: 'row', justifyContent: 'space-between' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
});
