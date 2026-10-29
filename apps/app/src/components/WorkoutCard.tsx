import {
  BibTag,
  Card,
  color,
  Icon,
  LaneMark,
  LinkButton,
  PrimaryButton,
  SegmentBar,
  space,
  Text,
} from '@run-coach/ui';
import { StyleSheet, View } from 'react-native';
import type { Workout } from '@/data/rows';
import { t } from '@/i18n/t';
import { approxKm, intensitySegments, minutesOf, segmentRows, TYPE_ZONE, typeName } from '@/lib/workoutView';

type Props = {
  workout: Workout;
  onStart?: () => void;
  onDetails?: () => void;
  startLabel?: string;
};

/** Kartu latihan hari ini (2.1): bib, menit besar, bar segmen, daftar segmen, Mulai. */
export function WorkoutCard({ workout, onStart, onDetails, startLabel }: Props) {
  const zone = TYPE_ZONE[workout.type];
  const rows = segmentRows(workout.steps, workout.type);
  const done = workout.status === 'completed';
  return (
    <Card style={styles.card} testID="workout-card">
      <View style={styles.head}>
        <BibTag label={typeName(workout.type)} zone={zone} />
        {done ? (
          <View style={styles.done}>
            <Icon name="check" color={color.success} />
            <Text variant="label" color="success">
              {t('today.done')}
            </Text>
          </View>
        ) : (
          <Text variant="numberMd" color="textMuted">
            {t('today.approxKm', { km: approxKm(workout.steps) })}
          </Text>
        )}
      </View>
      <View style={styles.big}>
        <Text variant="numberXl" testID="workout-minutes">
          {String(minutesOf(workout.steps))}
        </Text>
        <Text variant="title" color="textMuted">
          {t('today.minutes')}
        </Text>
      </View>
      <SegmentBar segments={intensitySegments(workout.steps)} />
      <View style={styles.rows}>
        {rows.map((r) => (
          <View key={r.key} style={styles.row}>
            <LaneMark zone={r.zone} drill={r.drill} />
            <Text style={[styles.flex, r.emphasis && styles.bold]}>{r.label}</Text>
            <Text color={r.emphasis ? 'text' : 'textMuted'} style={r.emphasis && styles.bold}>
              {r.summary}
            </Text>
          </View>
        ))}
      </View>
      {onStart ? (
        <PrimaryButton label={startLabel ?? t('today.start')} icon="play" onPress={onStart} testID="start" />
      ) : null}
      {onDetails ? <LinkButton label={t('today.details')} onPress={onDetails} testID="details" /> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: space[4] },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  done: { flexDirection: 'row', gap: space[1], alignItems: 'center' },
  big: { flexDirection: 'row', alignItems: 'baseline', gap: space[2] },
  rows: { gap: space[3] },
  row: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  flex: { flex: 1 },
  bold: { fontWeight: '700' },
});
