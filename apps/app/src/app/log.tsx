import { addDays } from '@run-coach/training-engine';
import {
  BibTag,
  Chip,
  ChoiceCard,
  IconButton,
  InfoBox,
  PrimaryButton,
  space,
  Text,
  TextField,
} from '@run-coach/ui';
import { formatDate, formatPace } from '@run-coach/ui/format';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Calendar } from '@/components/Calendar';
import { FeedbackFields } from '@/components/FeedbackFields';
import { Screen } from '@/components/Screen';
import type { Tag } from '@/data/activities';
import { useMatchWorkout, useProfile, useSaveActivity, useToday } from '@/data/hooks';
import { t } from '@/i18n/t';
import { goHome } from '@/lib/nav';
import { averagePace, parseDuration, parseKm } from '@/lib/progress';
import { isoAtLocal } from '@/lib/today';
import { TYPE_ZONE, typeName } from '@/lib/workoutView';

/** 2.6 Catat lari manual (F-15, FL-3). */
export default function LogRun() {
  const today = useToday();
  const tz = useProfile().data?.timezone ?? 'Asia/Jakarta';
  const [date, setDate] = useState(today);
  const [picking, setPicking] = useState(false);
  const [ym, setYm] = useState({ y: Number(today.slice(0, 4)), m: Number(today.slice(5, 7)) - 1 });
  const match = useMatchWorkout(date);
  const [forPlan, setForPlan] = useState(true);
  const [km, setKm] = useState('');
  const [dur, setDur] = useState('');
  const [rpe, setRpe] = useState<number | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [error, setError] = useState<string | null>(null);
  const save = useSaveActivity();
  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  const durS = parseDuration(dur);
  const distM = parseKm(km);
  const pace = averagePace(distM, durS ?? 0);
  const linked = forPlan && match.data ? match.data : null;

  const onSave = async () => {
    if (!durS || !distM) return setError(t('finish.invalid'));
    if (!rpe) return setError(t('finish.needRpe'));
    const r = await save.mutateAsync({
      plannedWorkoutId: linked?.id ?? null,
      source: 'manual',
      startedAt: isoAtLocal(date, '12:00', tz),
      distanceM: distM,
      durationS: durS,
      rpe,
      tags,
    });
    goHome(r.weekDone ? '/week-summary' : '/');
  };

  return (
    <Screen
      testID="screen-log"
      footer={
        <>
          {error ? (
            <InfoBox tone="danger">
              <Text>{error}</Text>
            </InfoBox>
          ) : null}
          <PrimaryButton
            label={t('common.save')}
            testID="log-save"
            loading={save.isPending}
            onPress={() => void onSave()}
          />
        </>
      }
    >
      <View style={styles.top}>
        <IconButton icon="close" label={t('common.close')} onPress={close} />
        <Text color="textMuted" align="center" style={styles.flex}>
          {t('log.header')}
        </Text>
        <View style={styles.spacer} />
      </View>
      <Text variant="title">{t('log.title')}</Text>
      <Text color="textMuted">{t('log.subtitle')}</Text>
      <Text variant="label" color="textMuted">
        {t('log.date')}
      </Text>
      <View style={styles.row}>
        <Chip
          label={t('log.today')}
          selected={date === today && !picking}
          onPress={() => (setDate(today), setPicking(false))}
        />
        <Chip
          label={t('log.yesterday')}
          selected={date === addDays(today, -1) && !picking}
          onPress={() => (setDate(addDays(today, -1)), setPicking(false))}
        />
        <Chip
          label={picking ? formatDate(date) : t('log.pick')}
          selected={picking}
          onPress={() => setPicking(true)}
        />
      </View>
      {picking ? (
        <Calendar
          year={ym.y}
          month0={ym.m}
          selected={date}
          minDate={addDays(today, -365)}
          onSelect={(d) => d <= today && setDate(d)}
          onMonth={(y, m) => setYm({ y, m })}
        />
      ) : null}
      <Text variant="label" color="textMuted">
        {t('log.for')}
      </Text>
      {match.data ? (
        <ChoiceCard
          wide
          testID="log-for-plan"
          title={t('log.scheduledToday', {
            type: typeName(match.data.type),
            when: date === today ? t('log.when.today') : formatDate(date),
          })}
          selected={forPlan}
          onPress={() => setForPlan(true)}
        />
      ) : null}
      {match.data && forPlan ? (
        <BibTag label={typeName(match.data.type)} zone={TYPE_ZONE[match.data.type]} />
      ) : null}
      <ChoiceCard
        wide
        testID="log-extra"
        title={t('log.extra')}
        selected={!linked}
        onPress={() => setForPlan(false)}
      />
      <View style={styles.row}>
        <View style={styles.flex}>
          <TextField
            label={t('log.distance')}
            value={km}
            onChangeText={setKm}
            keyboardType="decimal-pad"
            testID="log-km"
            placeholder="5,0"
          />
        </View>
        <View style={styles.flex}>
          <TextField
            label={t('log.duration')}
            value={dur}
            onChangeText={setDur}
            keyboardType="numbers-and-punctuation"
            testID="log-duration"
            placeholder={t('log.durationPlaceholder')}
          />
        </View>
      </View>
      {pace ? <Text color="textMuted">{t('log.pace', { pace: formatPace(pace) })}</Text> : null}
      <FeedbackFields rpe={rpe} setRpe={setRpe} tags={tags} setTags={setTags} type={linked?.type ?? null} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', gap: space[3], flexWrap: 'wrap' },
  top: { flexDirection: 'row', alignItems: 'center' },
  spacer: { width: space[10] + space[2] },
});
