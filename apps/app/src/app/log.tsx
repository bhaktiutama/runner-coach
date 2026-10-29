import { addDays } from '@run-coach/training-engine';
import {
  BibTag,
  border,
  Chip,
  color,
  fontFiles,
  Icon,
  IconButton,
  InfoBox,
  PrimaryButton,
  radius,
  ring,
  ScreenTitle,
  size,
  space,
  Text,
  TextField,
} from '@run-coach/ui';
import { formatDayMonth, formatPace } from '@run-coach/ui/format';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
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

/** 2.6 Catat lari manual (F-15, FL-3). Tata letak = wireframe LogManual. */
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
          {error ? <InfoBox tone="danger">{error}</InfoBox> : null}
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
        <Text variant="controlStrong" color="textMuted" align="center" style={styles.flex}>
          {t('log.header')}
        </Text>
        <View style={styles.spacer} />
      </View>
      <ScreenTitle title={t('log.title')} subtitle={t('log.subtitle')} />
      <View style={styles.block}>
        <Text variant="label" color="textMuted">
          {t('log.date')}
        </Text>
        <View style={styles.row}>
          <Chip
            fill
            label={t('log.today')}
            selected={date === today && !picking}
            onPress={() => (setDate(today), setPicking(false))}
          />
          <Chip
            fill
            label={t('log.yesterday')}
            selected={date === addDays(today, -1) && !picking}
            onPress={() => (setDate(addDays(today, -1)), setPicking(false))}
          />
          <Chip
            fill
            label={picking ? formatDayMonth(date) : t('log.pick')}
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
      </View>
      <View style={styles.block}>
        <Text variant="label" color="textMuted">
          {t('log.for')}
        </Text>
        {match.data ? (
          <Pressable
            testID="log-for-plan"
            accessibilityRole="radio"
            accessibilityState={{ selected: forPlan }}
            onPress={() => setForPlan(true)}
            style={[styles.option, styles.optionTall, forPlan ? styles.optionOn : styles.optionOff]}
          >
            <BibTag label={typeName(match.data.type)} zone={TYPE_ZONE[match.data.type]} />
            <Text variant="controlStrong" style={styles.flex}>
              {t('log.scheduledToday', {
                type: typeName(match.data.type),
                when: date === today ? t('log.when.today') : formatDayMonth(date),
              })}
            </Text>
            {forPlan ? <Icon name="check" size={space[5]} /> : null}
          </Pressable>
        ) : null}
        <Pressable
          testID="log-extra"
          accessibilityRole="radio"
          accessibilityState={{ selected: !linked }}
          onPress={() => setForPlan(false)}
          style={[styles.option, !linked ? styles.optionOn : styles.optionOff]}
        >
          <Text variant={!linked ? 'controlStrong' : 'control'} style={styles.flex}>
            {t('log.extra')}
          </Text>
          {!linked ? <Icon name="check" size={space[5]} /> : null}
        </Pressable>
      </View>
      <View style={styles.row}>
        <View style={styles.flex}>
          <TextField
            numeric
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
            numeric
            label={t('log.duration')}
            value={dur}
            onChangeText={setDur}
            keyboardType="numbers-and-punctuation"
            testID="log-duration"
            placeholder={t('log.durationPlaceholder')}
          />
        </View>
      </View>
      {pace ? (
        <Text variant="control" color="textMuted">
          {t('log.paceLabel')}
          <Text variant="control" style={styles.paceValue}>
            {formatPace(pace)}
          </Text>
        </Text>
      ) : null}
      <FeedbackFields rpe={rpe} setRpe={setRpe} tags={tags} setTags={setTags} type={linked?.type ?? null} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  top: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  spacer: { width: size.touchMin },
  block: { gap: space[2] + space[1] / 2 },
  row: { flexDirection: 'row', gap: space[2] },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    minHeight: size.input,
    paddingHorizontal: space[4],
    borderRadius: radius.lg,
    backgroundColor: color.surface,
  },
  optionTall: { minHeight: size.buttonPrimary },
  optionOn: ring(border.selected, color.text),
  optionOff: ring(border.control, color.line),
  paceValue: { fontFamily: fontFiles.display700, color: color.text },
});
