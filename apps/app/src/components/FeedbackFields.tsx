import { InfoBox, RpePicker, TagChips, Text } from '@run-coach/ui';
import { TAGS, type Tag } from '@/data/activities';
import { t, type MessageKey } from '@/i18n/t';
import { rpeVerdict } from '@/lib/progress';
import { typeName } from '@/lib/workoutView';
import type { WorkoutType } from '@run-coach/training-engine';

/** RPE (wajib) + tag catatan cepat (opsional), dipakai 2.4 dan 2.6. */
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
      <Text variant="heading">{t('rpe.title')}</Text>
      <RpePicker
        value={rpe}
        onChange={setRpe}
        labels={[t('rpe.scale.low'), t('rpe.scale.mid'), t('rpe.scale.high')]}
      />
      {rpe ? (
        <Text variant="heading" testID="rpe-verdict">
          {t(`rpe.verdict.${rpeVerdict(rpe, type)}` as MessageKey, {
            rpe,
            type: type ? typeName(type).toLowerCase() : typeName('easy').toLowerCase(),
          })}
        </Text>
      ) : null}
      {showTags ? (
        <>
          <Text variant="label" color="textMuted">
            {t('tags.title')}
          </Text>
          <TagChips
            tags={TAGS.map((v) => ({ value: v, label: t(`tag.${v}` as MessageKey) }))}
            selected={tags}
            onToggle={(v) => setTags(tags.includes(v) ? tags.filter((x) => x !== v) : [...tags, v])}
          />
          {tags.includes('pain') ? (
            <InfoBox tone="warn">
              <Text>{t('tag.painHint')}</Text>
            </InfoBox>
          ) : null}
        </>
      ) : null}
    </>
  );
}
