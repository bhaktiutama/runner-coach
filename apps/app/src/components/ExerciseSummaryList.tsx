import { border, color, Icon, radius, shadow, size, space, Text, themed } from '@run-coach/ui';
import { formatDuration } from '@run-coach/ui/format';
import { StyleSheet, View } from 'react-native';
import { t } from '@/i18n/t';
import { exerciseName } from '@/timer/labels';
import type { ExerciseSummary } from '@/timer/machine';

/**
 * U6 (09-VOICE bagian 13): ringkasan per gerakan strength di 2.4 dan 3.4. Set selesai dari total,
 * waktu kerja nyata vs rencana (tanpa istirahat), tanda jika ada set yang dilewati.
 */
export function ExerciseSummaryList({ items }: { items: ExerciseSummary[] }) {
  if (!items.length) return null;
  return (
    <View style={styles.table} testID="exercise-summary">
      {items.map((x, i) => {
        const full = !x.skipped && x.setsDone === x.sets;
        return (
          <View key={`${x.exerciseId}-${i}`} style={[styles.row, i < items.length - 1 && styles.sep]}>
            <Icon
              name={full ? 'check' : 'skip'}
              size={space[4]}
              color={full ? color.success : color.textMuted}
              strokeWidth={full ? 3 : 2}
            />
            <View style={styles.flex}>
              <Text variant="controlStrong" numberOfLines={1}>
                {exerciseName(x.exerciseId)}
              </Text>
              <Text variant="caption" color="textMuted">
                {x.setsDone > 0
                  ? t('summary.exerciseTime', {
                      actual: formatDuration(x.activeS),
                      planned: formatDuration(x.plannedS),
                    })
                  : t('summary.exerciseSkipped')}
              </Text>
            </View>
            <Text variant="numberRowStrong" color={full ? 'success' : 'textMuted'}>
              {t('summary.sets', { done: x.setsDone, total: x.sets })}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = themed(() =>
  StyleSheet.create({
    flex: { flex: 1 },
    table: { backgroundColor: color.surface, borderRadius: radius.md, ...shadow.card },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[3],
      minHeight: size.buttonSecondary,
      paddingVertical: space[2],
      paddingHorizontal: space[3] + border.selected - border.hairline / 2,
    },
    sep: { borderBottomWidth: border.hairline, borderBottomColor: color.line },
  }),
);
