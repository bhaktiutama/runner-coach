import {
  color,
  Icon,
  InfoBox,
  LinkButton,
  PrimaryButton,
  radius,
  SegmentedControl,
  size,
  space,
  Text,
  TextField,
} from '@run-coach/ui';
import { formatDuration, formatNumber, formatPaceValue } from '@run-coach/ui/format';
import { isSupportType } from '@run-coach/training-engine';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { FeedbackFields } from '@/components/FeedbackFields';
import { Screen } from '@/components/Screen';
import type { LoadFeel, Tag } from '@/data/activities';
import { useActiveTimer, useDiscardTimer, useSaveActivity, useWorkout } from '@/data/hooks';
import { t } from '@/i18n/t';
import { goHome } from '@/lib/nav';
import { averagePace, parseDuration, parseKm } from '@/lib/progress';
import { typeName } from '@/lib/workoutView';
import { buildSegments, summary, type TimerState } from '@/timer/machine';

/** 2.4 Selesai + RPE. Data dari timer yang baru selesai (app_meta.active_timer). */
export default function Finish() {
  const timer = useActiveTimer();
  const st = useMemo(() => (timer.data ? (JSON.parse(timer.data) as TimerState) : null), [timer.data]);
  const w = useWorkout(st?.workoutId);
  const save = useSaveActivity();
  const discard = useDiscardTimer();
  const sum = useMemo(
    () => (st && w.data ? summary(st, buildSegments(w.data.steps), st.finishedAt ?? Date.now()) : null),
    [st, w.data],
  );
  const [dur, setDur] = useState('');
  const [km, setKm] = useState('');
  const [rpe, setRpe] = useState<number | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [feel, setFeel] = useState<LoadFeel | null>(null);

  useEffect(() => {
    if (sum) {
      setDur(formatDuration(sum.durationS));
      setKm(formatNumber(Math.round(sum.distanceM / 100) / 10, 1));
    }
  }, [sum]);

  if (timer.isPending || (st && w.isPending)) return <Screen>{null}</Screen>;
  if (!st || !w.data || !sum) {
    return (
      <Screen>
        <Text>{t('finish.none')}</Text>
        <PrimaryButton label={t('common.close')} onPress={() => goHome()} />
      </Screen>
    );
  }

  const support = isSupportType(w.data.type);
  const durS = parseDuration(dur);
  const distM = support ? null : parseKm(km);
  const pace = averagePace(distM, durS ?? 0);

  const onSave = async () => {
    if (!durS || (!support && km.trim() !== '' && !distM)) return setError(t('finish.invalid'));
    if (!rpe) return setError(t('finish.needRpe'));
    const startedAt = new Date(st.startedAt ?? Date.now()).toISOString();
    const r = await save.mutateAsync({
      plannedWorkoutId: w.data!.id,
      source: 'timer',
      startedAt,
      distanceM: distM,
      durationS: durS,
      segments: sum.results,
      rpe,
      tags,
      loadFeel: support ? feel : null,
      clearTimer: true,
    });
    goHome(r.weekDone ? '/week-summary' : '/');
  };

  return (
    <Screen
      testID="screen-finish"
      gap="finish"
      footer={
        <>
          {error ? <InfoBox tone="danger">{error}</InfoBox> : null}
          <PrimaryButton
            label={t('common.save')}
            testID="finish-save"
            loading={save.isPending}
            onPress={() => void onSave()}
          />
        </>
      }
    >
      <View style={styles.head}>
        <View style={styles.check}>
          <Icon name="check" color={color.onSuccess} size={size.iconSm + space[1]} strokeWidth={3} />
        </View>
        <Text variant="title">{t('finish.title', { type: typeName(w.data.type) })}</Text>
        <Text variant="control" color="success" testID="finish-segments">
          {t('finish.segments', { done: sum.segmentsDone, total: sum.segmentsTotal })}
        </Text>
      </View>
      <View style={styles.row}>
        <View style={styles.flex}>
          <TextField
            numeric
            label={t('finish.duration')}
            value={dur}
            onChangeText={setDur}
            testID="finish-duration"
            keyboardType="numbers-and-punctuation"
          />
        </View>
        {support ? null : (
          <View style={styles.flex}>
            <TextField
              numeric
              label={t('finish.distance')}
              value={km}
              onChangeText={setKm}
              testID="finish-distance"
              keyboardType="decimal-pad"
            />
          </View>
        )}
        {support ? null : (
          <View style={[styles.flex, styles.avgCol]}>
            <Text variant="label" color="textMuted">
              {t('finish.avg')}
            </Text>
            <View style={styles.avgBox}>
              <Text variant="stat">{pace ? formatPaceValue(pace) : t('finish.noPace')}</Text>
            </View>
          </View>
        )}
      </View>
      {support ? (
        <View style={styles.feel}>
          <Text variant="label" color="textMuted">
            {t('finish.loadFeel')}
          </Text>
          <SegmentedControl
            value={feel ?? ('' as LoadFeel)}
            onChange={(v) => setFeel(v)}
            items={[
              { value: 'too_hard', label: t('finish.loadFeel.too_hard') },
              { value: 'ok', label: t('finish.loadFeel.ok') },
              { value: 'too_easy', label: t('finish.loadFeel.too_easy') },
            ]}
          />
          {feel === 'too_hard' ? (
            <Text variant="caption" color="textMuted">
              {t('finish.loadFeel.tooHardNote')}
            </Text>
          ) : null}
        </View>
      ) : (
        <Text variant="caption" color="textMuted">
          {t('finish.estimate')}
        </Text>
      )}
      <FeedbackFields rpe={rpe} setRpe={setRpe} tags={tags} setTags={setTags} type={w.data.type} />
      {support ? null : (
        <Text variant="caption" color="textMuted">
          {t('finish.watch')}
        </Text>
      )}
      <LinkButton
        size="sm"
        tone="text"
        label={t('finish.discard')}
        onPress={async () => {
          await discard.mutateAsync();
          goHome();
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  head: { gap: space[2], alignItems: 'flex-start' },
  row: { flexDirection: 'row', gap: space[2], alignItems: 'flex-end' },
  avgCol: { gap: space[2] },
  feel: { gap: space[2] },
  avgBox: { height: size.input, justifyContent: 'center' },
  check: {
    width: size.input,
    height: size.input,
    borderRadius: radius.stadium,
    backgroundColor: color.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
