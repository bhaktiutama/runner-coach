import type { WorkoutType } from '@run-coach/training-engine';
import { InfoBox, RpePicker, space, TagChips, Text } from '@run-coach/ui';
import { StyleSheet, View } from 'react-native';
import { TAGS, type Tag } from '@/data/activities';
import { t, type MessageKey } from '@/i18n/t';
import { rpeVerdict } from '@/lib/progress';
import { typeName } from '@/lib/workoutView';

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
  return (
    <>
      <View style={styles.block}>
        <Text variant="subheading">{t('rpe.title')}</Text>
        <RpePicker
          value={rpe}
          onChange={setRpe}
          labels={[t('rpe.scale.low'), t('rpe.scale.mid'), t('rpe.scale.high')]}
        />
        {rpe ? (
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

const styles = StyleSheet.create({ block: { gap: space[2] + space[1] / 2 } });
