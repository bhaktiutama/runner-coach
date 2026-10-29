import { addDays, mondayOf } from '@run-coach/training-engine';
import { border, color, IconButton, radius, size, space, Text, weekdayShortName } from '@run-coach/ui';
import { formatMonthYear } from '@run-coach/ui/format';
import { Pressable, StyleSheet, View } from 'react-native';
import { t } from '@/i18n/t';

type Props = {
  year: number;
  month0: number;
  selected: string | null;
  minDate: string;
  onSelect: (date: string) => void;
  onMonth: (year: number, month0: number) => void;
};

const iso = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

/** Kalender bulan (1.3): minggu mulai Senin. */
export function Calendar({ year, month0, selected, minDate, onSelect, onMonth }: Props) {
  const first = iso(year, month0, 1);
  const start = mondayOf(first);
  const cells: (string | null)[] = [];
  for (let d = start; ; d = addDays(d, 1)) {
    const inMonth = d.slice(0, 7) === first.slice(0, 7);
    if (!inMonth && d > first && cells.length % 7 === 0) break;
    cells.push(inMonth ? d : null);
    if (cells.length > 42) break;
  }
  const shift = (delta: number) => {
    const m = month0 + delta;
    onMonth(year + Math.floor(m / 12), ((m % 12) + 12) % 12);
  };
  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <IconButton icon="back" variant="sunken" label={t('race.prevMonth')} onPress={() => shift(-1)} />
        <Text variant="heading" style={styles.month}>
          {formatMonthYear(year, month0)}
        </Text>
        <IconButton
          icon="chevron-right"
          variant="sunken"
          label={t('race.nextMonth')}
          onPress={() => shift(1)}
        />
      </View>
      <View style={styles.row}>
        {Array.from({ length: 7 }, (_, i) => (
          <Text key={i} variant="label" color="textMuted" align="center" style={styles.cell}>
            {weekdayShortName(i)}
          </Text>
        ))}
      </View>
      {Array.from({ length: Math.ceil(cells.length / 7) }, (_, r) => (
        <View key={r} style={styles.row}>
          {cells.slice(r * 7, r * 7 + 7).map((d, i) => {
            if (!d) return <View key={i} style={styles.cell} />;
            const disabled = d < minDate;
            const on = d === selected;
            return (
              <Pressable
                key={d}
                testID={`day-${d}`}
                accessibilityRole="button"
                accessibilityState={{ selected: on, disabled }}
                accessibilityLabel={d}
                disabled={disabled}
                onPress={() => onSelect(d)}
                style={[styles.cell, styles.day, on && styles.dayOn]}
              >
                <Text
                  variant="numberMd"
                  align="center"
                  color={disabled ? 'textMuted' : 'text'}
                  style={disabled && styles.off}
                >
                  {String(Number(d.slice(8)))}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: color.surface, borderRadius: radius.lg, padding: space[4], gap: space[2] },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  month: { flex: 1, textAlign: 'center' },
  row: { flexDirection: 'row' },
  cell: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  day: {
    minHeight: size.touchMin,
    borderRadius: radius.stadium,
    borderWidth: border.hairline,
    borderColor: 'transparent',
  },
  dayOn: { backgroundColor: color.primary },
  off: { opacity: 0.4 },
});
