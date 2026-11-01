import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { duration, easing, useReducedMotion } from '../motion';
import { border, color, radius, ring, size, space, themed } from '../theme';
import { Chip } from './Controls';
import { Text } from './Text';

/** Skala awal dan puncak animasi pilihan RPE. */
const POP_START = 0.85;
const POP_PEAK = 1.15;

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
        {Array.from({ length: 10 }, (_, i) => (
          <RpeButton key={i + 1} n={i + 1} on={value === i + 1} onPress={() => onChange(i + 1)} />
        ))}
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

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Tombol RPE: saat terpilih, kotaknya (bukan hanya angka) membesar 0.85 ke 1.15 lalu 1 sambil warnanya
 * terisi dari abu ke warna skala (UI/UX bagian 11, G9). Pilihan awal tampil langsung.
 */
function RpeButton({ n, on, onPress }: { n: number; on: boolean; onPress: () => void }) {
  const reduced = useReducedMotion();
  const fill = useRef(new Animated.Value(on ? 1 : 0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const first = useRef(true);
  useEffect(() => {
    const initial = first.current;
    first.current = false;
    if (initial || reduced || !on) {
      fill.setValue(on ? 1 : 0);
      scale.setValue(1);
      return;
    }
    fill.setValue(0);
    scale.setValue(POP_START);
    // JS driver untuk keduanya: warna tidak bisa memakai native driver, dan satu node tidak boleh campur.
    const a = Animated.parallel([
      Animated.timing(fill, {
        toValue: 1,
        duration: duration.base,
        easing: easing.standard,
        useNativeDriver: false,
      }),
      Animated.sequence([
        Animated.timing(scale, {
          toValue: POP_PEAK,
          duration: duration.base,
          easing: easing.stride,
          useNativeDriver: false,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: duration.fast,
          easing: easing.standard,
          useNativeDriver: false,
        }),
      ]),
    ]);
    a.start();
    return () => a.stop();
  }, [on, reduced, fill, scale]);
  return (
    <AnimatedPressable
      testID={`rpe-${n}`}
      accessibilityRole="radio"
      accessibilityState={{ selected: on }}
      accessibilityLabel={String(n)}
      onPress={onPress}
      style={[
        styles.btn,
        {
          backgroundColor: fill.interpolate({
            inputRange: [0, 1],
            outputRange: [color.surfaceSunken, rpeColor(n)],
          }),
          transform: [{ scale }],
        },
        on && ring(border.selected - border.hairline / 2, color.text),
      ]}
    >
      <Text variant="rpe" style={on && n >= 9 ? { color: color.zone.onInterval } : null}>
        {String(n)}
      </Text>
    </AnimatedPressable>
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

const styles = themed(() =>
  StyleSheet.create({
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
  }),
);
