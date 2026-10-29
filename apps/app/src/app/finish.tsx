import {
  color,
  Icon,
  InfoBox,
  LinkButton,
  PrimaryButton,
  radius,
  size,
  space,
  Text,
  TextField,
} from '@run-coach/ui';
import { formatDuration, formatNumber, formatPaceValue } from '@run-coach/ui/format';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { FeedbackFields } from '@/components/FeedbackFields';
import { Screen } from '@/components/Screen';
import type { Tag } from '@/data/activities';
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

  const durS = parseDuration(dur);
  const distM = parseKm(km);
  const pace = averagePace(distM, durS ?? 0);

  const onSave = async () => {
    if (!durS || (km.trim() !== '' && !distM)) return setError(t('finish.invalid'));
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
      clearTimer: true,
    });
    goHome(r.weekDone ? '/week-summary' : '/');
  };

  return (
    <Screen
      testID="screen-finish"
      footer={
        <>
          {error ? (
            <InfoBox tone="danger">
              <Text>{error}</Text>
            </InfoBox>
          ) : null}
          <PrimaryButton
            label={t('common.save')}
            testID="finish-save"
            loading={save.isPending}
            onPress={() => void onSave()}
          />
        </>
      }
    >
      <View style={styles.check}>
        <Icon name="check" color={color.onSuccess} size={size.touchMin} strokeWidth={3} />
      </View>
      <Text variant="title">{t('finish.title', { type: typeName(w.data.type) })}</Text>
      <Text color="success" testID="finish-segments">
        {t('finish.segments', { done: sum.segmentsDone, total: sum.segmentsTotal })}
      </Text>
      <View style={styles.row}>
        <View style={styles.flex}>
          <TextField
            label={t('finish.duration')}
            value={dur}
            onChangeText={setDur}
            testID="finish-duration"
            keyboardType="numbers-and-punctuation"
          />
        </View>
        <View style={styles.flex}>
          <TextField
            label={t('finish.distance')}
            value={km}
            onChangeText={setKm}
            testID="finish-distance"
            keyboardType="decimal-pad"
          />
        </View>
        <View style={styles.flex}>
          <Text variant="label" color="textMuted">
            {t('finish.avg')}
          </Text>
          <Text variant="numberMd" style={styles.avg}>
            {pace ? formatPaceValue(pace) : t('finish.noPace')}
          </Text>
        </View>
      </View>
      <Text variant="caption" color="textMuted">
        {t('finish.estimate')}
      </Text>
      <FeedbackFields rpe={rpe} setRpe={setRpe} tags={tags} setTags={setTags} type={w.data.type} />
      <Text variant="label" color="textMuted">
        {t('finish.watch')}
      </Text>
      <LinkButton
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
  row: { flexDirection: 'row', gap: space[3], alignItems: 'flex-start' },
  check: {
    width: size.buttonPrimary + space[10],
    height: size.buttonPrimary + space[10],
    borderRadius: radius.stadium,
    backgroundColor: color.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avg: { marginTop: space[3] },
});
