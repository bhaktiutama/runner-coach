import type { WorkoutType } from '@run-coach/training-engine';
import { InfoBox, RpePicker, size, space, SpotIcon, TagChips, Text, themed } from '@run-coach/ui';
import { StyleSheet, View } from 'react-native';
import { TAGS, type Tag } from '@/data/activities';
import { HelpHint } from '@/components/HelpHint';
import { t, type MessageKey } from '@/i18n/t';
import { rpeVerdict } from '@/lib/progress';
import { typeName } from '@/lib/workoutView';
import { feelSpot, useSpotIcons } from '@/lib/spot';

/** Label RPE: "6 / 10: Sesuai target tempo" jika di rentang target tipe latihan, selain itu deskripsi skala. */
export function rpeLabel(rpe: number, type: WorkoutType | null): string {
  const within = rpeVerdict(rpe, type) === 'within';
  const desc = within
    ? t('rpe.within', { type: typeName(type ?? 'easy').toLowerCase() })
    : t(`rpe.desc.${rpe}` as MessageKey);
  return t('rpe.value', { rpe, desc });
}

/** RPE (wajib) + tag catatan cepat (opsional), dipakai 2.4 dan 2.6. Wireframe Finish / LogManual. */
export function FeedbackFields({
  rpe,
  setRpe,
  tags,
  setTags,
  type,
  showTags = true,
}: {
  rpe: number | null;
  setRpe: (n: number) => void;
  tags: Tag[];
  setTags: (t: Tag[]) => void;
  type: WorkoutType | null;
  showTags?: boolean;
}) {
  const icons = useSpotIcons();
  return (
    <>
      <View style={styles.block}>
        <View style={styles.hintRow}>
          <Text variant="subheading">{t('rpe.title')}</Text>
          <HelpHint topic="rpe" term="RPE" />
        </View>
        <RpePicker
          value={rpe}
          onChange={setRpe}
          labels={[t('rpe.scale.low'), t('rpe.scale.mid'), t('rpe.scale.high')]}
        />
        {rpe && icons ? (
          // UI/UX 14: wajah rasa (1-4, 5-7, 8-10) di kiri label; angka tetap tertulis.
          <View style={styles.feelRow}>
            <SpotIcon name={feelSpot(rpe)} size={size.spotSm} testID={`spot-${feelSpot(rpe)}`} />
            <Text variant="row" testID="rpe-verdict" style={styles.flex}>
              {rpeLabel(rpe, type)}
            </Text>
          </View>
        ) : rpe ? (
          <Text variant="row" testID="rpe-verdict">
            {rpeLabel(rpe, type)}
          </Text>
        ) : null}
      </View>
      {showTags ? (
        <View style={styles.block}>
          <Text variant="label" color="textMuted">
            {t('tags.title')}
          </Text>
          <TagChips
            tags={TAGS.map((v) => ({ value: v, label: t(`tag.${v}` as MessageKey) }))}
            selected={tags}
            onToggle={(v) => setTags(tags.includes(v) ? tags.filter((x) => x !== v) : [...tags, v])}
          />
          {tags.includes('pain') ? <InfoBox tone="warn">{t('tag.painHint')}</InfoBox> : null}
        </View>
      ) : null}
    </>
  );
}

const styles = themed(() =>
  StyleSheet.create({
    hintRow: { flexDirection: 'row', alignItems: 'center', gap: space[1] + space[1] / 2 },
    block: { gap: space[2] + space[1] / 2 },
    feelRow: { flexDirection: 'row', alignItems: 'center', gap: space[2] + space[1] / 2 },
    flex: { flex: 1 },
  }),
);
