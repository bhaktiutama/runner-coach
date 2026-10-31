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
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import type { Workout } from '@/data/rows';
import { t } from '@/i18n/t';
import { isLocked, useEntitlement } from '@/lib/entitlement';
import { approxKm, intensitySegments, minutesOf, segmentRows, TYPE_ZONE, typeName } from '@/lib/workoutView';

type Props = { workout: Workout; onStart?: () => void; onDetails?: () => void; startLabel?: string };

/** Kartu latihan hari ini (2.1, wireframe Today): padding 20, jarak 16. */
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
            <Icon name="check" size={space[4]} color={color.success} />
            <Text variant="controlStrong" color="success">
              {t('today.done')}
            </Text>
          </View>
        ) : (
          <Text variant="controlStrong" color="textMuted">
            {t('today.approxKm', { km: approxKm(workout.steps) })}
          </Text>
        )}
      </View>
      <View style={styles.big}>
        <Text variant="numberLg" testID="workout-minutes">
          {String(minutesOf(workout.steps))}
        </Text>
        <Text variant="heading" color="textMuted">
          {t('today.minutes')}
        </Text>
      </View>
      <SegmentBar segments={intensitySegments(workout.steps)} />
      <View style={styles.rows}>
        {rows.map((r) => (
          <View key={r.key} style={styles.row}>
            <View style={styles.label}>
              <LaneMark zone={r.zone} drill={r.drill} />
              <Text variant={r.emphasis ? 'controlStrong' : 'bodySm'}>{r.label}</Text>
            </View>
            <Text
              variant={r.emphasis ? 'controlStrong' : 'bodySm'}
              color={r.emphasis ? 'text' : 'textMuted'}
              style={styles.value}
            >
              {r.summary}
            </Text>
          </View>
        ))}
      </View>
      {onStart ? (
        <PrimaryButton label={startLabel ?? t('today.start')} icon="play" onPress={onStart} testID="start" />
      ) : null}
      {onDetails ? (
        <View style={styles.detail}>
          <LinkButton size="sm" label={t('today.details')} onPress={onDetails} testID="details" />
        </View>
      ) : null}
    </Card>
  );
}

/**
 * Kartu kedua 2.1 (F-21): sesi strength/core, warna charcoal. Lebih ringkas dari kartu lari:
 * nama + menit + jumlah gerakan. Terkunci (paywall aktif, lewat minggu gratis) -> ke 4.4.
 */
export function StrengthCard({ workout, onStart, onDetails }: Props) {
  const ent = useEntitlement();
  const locked = isLocked(workout, ent);
  const done = workout.status === 'completed';
  const n = workout.steps.filter((s) => s.kind === 'exercise').length;
  return (
    <Card style={[styles.card, styles.strength]} testID="strength-card">
      <View style={styles.head}>
        <BibTag label={typeName(workout.type)} zone="strength" />
        {done ? (
          <View style={styles.done}>
            <Icon name="check" size={space[4]} color={color.success} />
            <Text variant="controlStrong" color="success">
              {t('today.done')}
            </Text>
          </View>
        ) : (
          <Text variant="controlStrong" color="textMuted">
            {t('strength.exercises', { n })}
          </Text>
        )}
      </View>
      <View style={styles.big}>
        <Text variant="numberLg" testID="strength-minutes">
          {String(minutesOf(workout.steps))}
        </Text>
        <Text variant="heading" color="textMuted">
          {t('today.minutes')}
        </Text>
      </View>
      <Text variant="bodySm" color="textMuted">
        {t('strength.cardBody')}
      </Text>
      {done ? null : locked ? (
        <PrimaryButton
          label={t('premium.unlock')}
          icon="premium"
          onPress={() => router.push('/premium')}
          testID="strength-unlock"
        />
      ) : onStart ? (
        <PrimaryButton label={t('strength.start')} icon="play" onPress={onStart} testID="strength-start" />
      ) : null}
      {onDetails ? (
        <View style={styles.detail}>
          <LinkButton size="sm" label={t('today.details')} onPress={onDetails} testID="strength-details" />
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  strength: { borderLeftWidth: space[2], borderLeftColor: color.zone.strength },
  card: { gap: space[4] },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  done: { flexDirection: 'row', gap: space[1], alignItems: 'center' },
  big: { flexDirection: 'row', alignItems: 'baseline', gap: space[2] },
  rows: { gap: space[2] + space[1] / 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: space[3] },
  label: { flexDirection: 'row', alignItems: 'center', gap: space[2] + space[1] / 2 },
  value: { flexShrink: 1, textAlign: 'right' },
  detail: { marginTop: -space[2] },
});
