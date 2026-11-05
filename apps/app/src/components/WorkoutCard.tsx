import {
  BibTag,
  Card,
  color,
  Icon,
  ImageHeader,
  LaneMark,
  radius,
  LinkButton,
  PrimaryButton,
  SegmentBar,
  space,
  Text,
  themed,
} from '@run-coach/ui';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import type { Workout } from '@/data/rows';
import { t } from '@/i18n/t';
import { isLocked, useEntitlement } from '@/lib/entitlement';
import { workoutImage } from '@/lib/imagery';
import { approxKm, intensitySegments, minutesOf, segmentRows, TYPE_ZONE, typeName } from '@/lib/workoutView';
import { exerciseName, FEEL_KEY } from '@/timer/labels';

type Props = { workout: Workout; onStart?: () => void; onDetails?: () => void; startLabel?: string };

/** Kartu latihan hari ini (2.1, wireframe Today): padding 20, jarak 16. */
export function WorkoutCard({ workout, onStart, onDetails, startLabel }: Props) {
  const zone = TYPE_ZONE[workout.type];
  const rows = segmentRows(workout.steps, workout.type);
  const done = workout.status === 'completed';
  const image = workoutImage(workout.type, workout.date);
  const bib = <BibTag label={typeName(workout.type)} zone={zone} />;
  const status = done ? (
    <View style={styles.done}>
      <Icon name="check" size={space[4]} color={color.success} />
      <Text variant="controlStrong" color="success">
        {t('today.done')}
      </Text>
    </View>
  ) : (
    <Text variant="controlStrong" color={image ? 'text' : 'textMuted'}>
      {t('today.approxKm', { km: approxKm(workout.steps) })}
    </Text>
  );
  return (
    <Card style={styles.card} testID="workout-card">
      {image ? (
        // UI/UX 12: baris bib + jarak menjadi header bergambar; jarak/status di pil surface.
        <ImageHeader source={image}>
          {bib}
          <View style={styles.pill}>{status}</View>
        </ImageHeader>
      ) : (
        <View style={styles.head}>
          {bib}
          {status}
        </View>
      )}
      <View style={styles.bigGroup}>
        <View style={styles.big}>
          <Text variant="numberLg" testID="workout-minutes">
            {String(minutesOf(workout.steps))}
          </Text>
          <Text variant="heading" color="textMuted">
            {t('today.minutes')}
          </Text>
        </View>
        {/* Satu segmen saja: bar + baris akan mengulang nama tipe ("Easy, Easy, Easy"); tampilkan rasa usaha. */}
        {rows.length <= 1 ? (
          zone in FEEL_KEY ? (
            <Text variant="bodySm" color="textMuted" testID="workout-feel">
              {t(FEEL_KEY[zone as keyof typeof FEEL_KEY])}
            </Text>
          ) : null
        ) : null}
      </View>
      {rows.length > 1 ? <SegmentBar segments={intensitySegments(workout.steps)} /> : null}
      <View style={[styles.rows, rows.length <= 1 && styles.hidden]}>
        {(rows.length > 1 ? rows : []).map((r) => (
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
      <View style={styles.bigGroup}>
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
      </View>
      {/* Daftar gerakan singkat: isi yang berguna, bukan ruang kosong. */}
      <Text variant="controlStrong" numberOfLines={2} testID="strength-moves">
        {exerciseList(workout)}
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

const styles = themed(() =>
  StyleSheet.create({
    hidden: { display: 'none' },
    strength: { borderLeftWidth: space[2], borderLeftColor: color.zone.strength },
    card: { gap: space[4] },
    head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    done: { flexDirection: 'row', gap: space[1], alignItems: 'center' },
    pill: {
      backgroundColor: color.surface,
      borderRadius: radius.stadium,
      paddingHorizontal: space[2] + space[1] / 2,
      paddingVertical: space[1],
    },
    big: { flexDirection: 'row', alignItems: 'baseline', gap: space[2] },
    bigGroup: { gap: space[1] },
    rows: { gap: space[2] + space[1] / 2 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: space[3] },
    label: { flexDirection: 'row', alignItems: 'center', gap: space[2] + space[1] / 2 },
    value: { flexShrink: 1, textAlign: 'right' },
    detail: { marginTop: -space[2] },
  }),
);

/** "Squat · Glute bridge · Reverse lunge +3" */
function exerciseList(w: Workout): string {
  const ids = w.steps.flatMap((s) => (s.kind === 'exercise' ? [s.exercise_id] : []));
  const head = ids.slice(0, 3).map(exerciseName).join(' · ');
  return ids.length > 3 ? t('strength.moreMoves', { list: head, n: ids.length - 3 }) : head;
}
