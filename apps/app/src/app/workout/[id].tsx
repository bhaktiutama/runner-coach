import { totalDuration, type EngineMessageKey } from '@run-coach/training-engine';
import {
  BibTag,
  border,
  Card,
  color,
  IconButton,
  InfoBox,
  IntensityChart,
  LaneMark,
  PrimaryButton,
  SecondaryButton,
  SegmentedControl,
  space,
  Text,
} from '@run-coach/ui';
import { formatDate } from '@run-coach/ui/format';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { RationaleList } from '@/components/RationaleList';
import { Screen } from '@/components/Screen';
import { useProfile, useUpdateProfile, useWorkout, useWorkoutActions } from '@/data/hooks';
import { t, type MessageKey } from '@/i18n/t';
import { et } from '@/lib/rationale';
import { intensitySegments, minutesOf, segmentRows, TYPE_ZONE, typeName } from '@/lib/workoutView';

/** 2.2 Detail latihan. */
export default function WorkoutDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const w = useWorkout(id);
  const profile = useProfile();
  const updateProfile = useUpdateProfile();
  const actions = useWorkoutActions();
  const [easyDone, setEasyDone] = useState(false);
  const back = () => (router.canGoBack() ? router.back() : router.replace('/'));

  if (w.isPending) return <Screen>{null}</Screen>;
  if (!w.data) {
    return (
      <Screen>
        <IconButton icon="back" label={t('detail.back')} onPress={back} />
        <Text>{t('detail.notFound')}</Text>
      </Screen>
    );
  }
  const wk = w.data;
  const rows = segmentRows(wk.steps, wk.type);
  const totalMin = Math.round(totalDuration(wk.steps) / 60);
  const hard = wk.type === 'tempo' || wk.type === 'interval';
  const scheduled = wk.status === 'scheduled';
  const why = [
    et(`workout.why.${wk.type}` as EngineMessageKey),
    rows.some((r) => r.drill) ? et('workout.why.drill') : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Screen
      testID="screen-detail"
      footer={
        scheduled ? (
          <>
            <PrimaryButton
              label={t('today.start')}
              icon="play"
              onPress={() => router.push(`/timer/${wk.id}`)}
              testID="start"
            />
            <View style={styles.row}>
              <View style={styles.flex}>
                <SecondaryButton
                  label={t('detail.move')}
                  onPress={() => router.push(`/move/${wk.id}`)}
                  testID="move"
                />
              </View>
              {hard ? (
                <View style={styles.flex}>
                  <SecondaryButton
                    label={t('detail.toEasy')}
                    testID="to-easy"
                    onPress={async () => {
                      await actions.toEasy.mutateAsync(wk.id);
                      setEasyDone(true);
                    }}
                  />
                </View>
              ) : null}
            </View>
          </>
        ) : null
      }
    >
      <View style={styles.top}>
        <IconButton icon="back" label={t('detail.back')} onPress={back} testID="back" />
        <Text color="textMuted" style={styles.flex} align="center">
          {formatDate(wk.date)}
        </Text>
        <View style={styles.spacer} />
      </View>
      <BibTag label={typeName(wk.type)} zone={TYPE_ZONE[wk.type]} />
      <Text variant="title">{t('detail.title', { type: typeName(wk.type), min: minutesOf(wk.steps) })}</Text>
      {!scheduled ? <Text color="textMuted">{t(`detail.status.${wk.status}` as MessageKey)}</Text> : null}
      {easyDone ? (
        <InfoBox tone="ok">
          <Text>{t('detail.toEasyDone')}</Text>
        </InfoBox>
      ) : null}
      <Text variant="label" color="textMuted">
        {t('detail.intensity')}
      </Text>
      <IntensityChart segments={intensitySegments(wk.steps)} />
      <View style={styles.axis}>
        <Text variant="caption" color="textMuted">
          {t('detail.axisStart')}
        </Text>
        <Text variant="caption" color="textMuted">
          {t('detail.axisEnd', { min: totalMin })}
        </Text>
      </View>
      <View>
        {rows.map((r, i) => (
          <View key={r.key} style={styles.seg}>
            <LaneMark zone={r.zone} drill={r.drill} tall />
            <View style={styles.flex}>
              <Text variant="heading">{t('detail.segment', { n: i + 1, label: r.label })}</Text>
              {r.sub ? (
                <Text variant="label" color="textMuted">
                  {r.sub}
                </Text>
              ) : null}
            </View>
            <Text color="textMuted">{r.durationLabel}</Text>
            <Text variant="heading" style={styles.detail} align="right">
              {r.detail}
            </Text>
          </View>
        ))}
      </View>
      <Card variant="outline">
        <Text variant="heading">{t('detail.why')}</Text>
        <Text color="textMuted">{why}</Text>
        <RationaleList items={wk.rationale} />
      </Card>
      <Text variant="label" color="textMuted">
        {t('detail.guide')}
      </Text>
      <SegmentedControl
        value={profile.data?.intensity_guide ?? 'pace'}
        onChange={(v) => updateProfile.mutate({ intensity_guide: v })}
        items={[
          { value: 'pace', label: t('detail.guide.pace') },
          { value: 'hr', label: t('detail.guide.hr'), disabled: true },
          { value: 'rpe', label: t('detail.guide.rpe') },
        ]}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', gap: space[3] },
  top: { flexDirection: 'row', alignItems: 'center' },
  spacer: { width: space[10] + space[2] },
  axis: { flexDirection: 'row', justifyContent: 'space-between' },
  seg: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    paddingVertical: space[3],
    borderBottomWidth: border.hairline,
    borderBottomColor: color.line,
  },
  detail: { minWidth: space[10] * 2 },
});
