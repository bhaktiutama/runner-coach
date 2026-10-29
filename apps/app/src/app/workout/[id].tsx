import type { EngineMessageKey } from '@run-coach/training-engine';
import {
  BibTag,
  border,
  color,
  IconButton,
  InfoBox,
  IntensityChart,
  LaneMark,
  PrimaryButton,
  radius,
  ring,
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
import {
  intensityAxis,
  intensitySegments,
  minutesOf,
  segmentRows,
  TYPE_ZONE,
  typeName,
} from '@/lib/workoutView';

/** 2.2 Detail latihan. Tata letak = wireframe WorkoutDetail. */
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
  const axis = intensityAxis(wk.steps);
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
            <View style={styles.pair}>
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
        <Text variant="controlStrong" color="textMuted" align="center" style={styles.flex}>
          {formatDate(wk.date)}
        </Text>
        <View style={styles.spacer} />
      </View>
      <View style={styles.titleBlock}>
        <BibTag label={typeName(wk.type)} zone={TYPE_ZONE[wk.type]} />
        <Text variant="title">
          {t('detail.title', { type: typeName(wk.type), min: minutesOf(wk.steps) })}
        </Text>
        {!scheduled ? (
          <Text variant="bodySm" color="textMuted">
            {t(`detail.status.${wk.status}` as MessageKey)}
          </Text>
        ) : null}
      </View>
      {easyDone ? <InfoBox tone="ok">{t('detail.toEasyDone')}</InfoBox> : null}
      <View style={styles.chartBlock}>
        <Text variant="label" color="textMuted">
          {t('detail.intensity')}
        </Text>
        <IntensityChart segments={intensitySegments(wk.steps)} />
        <View style={styles.axis}>
          {axis.map((m, i) => (
            <Text key={i} variant="axis" color="textMuted">
              {i === axis.length - 1 ? t('detail.axisEnd', { min: m }) : String(m)}
            </Text>
          ))}
        </View>
      </View>
      <View>
        {rows.map((r, i) => (
          <View key={r.key} style={styles.seg}>
            <LaneMark zone={r.zone} drill={r.drill} stretch />
            <View style={styles.flex}>
              <Text variant="row">{t('detail.segment', { n: i + 1, label: r.label })}</Text>
              {r.sub ? (
                <Text variant="captionStrong" color="textMuted" style={styles.sub}>
                  {r.sub}
                </Text>
              ) : null}
            </View>
            <Text variant="numberRow" color="textMuted">
              {r.durationLabel}
            </Text>
            <Text variant="numberRowStrong" align="right" style={styles.detail}>
              {r.detail}
            </Text>
          </View>
        ))}
      </View>
      <View style={styles.why}>
        <Text variant="cardTitle">{t('detail.why')}</Text>
        <Text variant="bodySm" color="textMuted">
          {why}
        </Text>
        <RationaleList items={wk.rationale} />
      </View>
      <View style={styles.guide}>
        <Text variant="label" color="textMuted">
          {t('detail.guide')}
        </Text>
        <SegmentedControl
          compact
          value={profile.data?.intensity_guide ?? 'pace'}
          onChange={(v) => updateProfile.mutate({ intensity_guide: v })}
          items={[
            { value: 'pace', label: t('detail.guide.pace') },
            { value: 'hr', label: t('detail.guide.hr'), disabled: true },
            { value: 'rpe', label: t('detail.guide.rpe') },
          ]}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pair: { flexDirection: 'row', gap: space[2] },
  top: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  spacer: { width: space[10] + space[1] },
  titleBlock: { gap: space[2] + space[1] / 2, alignItems: 'flex-start' },
  chartBlock: { gap: space[2] },
  axis: { flexDirection: 'row', justifyContent: 'space-between' },
  seg: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    minHeight: space[10] + space[2],
    paddingVertical: space[1] + space[1] / 2,
    borderBottomWidth: border.hairline,
    borderBottomColor: color.line,
  },
  sub: { marginTop: border.selected - border.hairline / 2 },
  detail: { minWidth: space[10] * 2 - space[2] },
  why: {
    gap: space[2],
    padding: space[5],
    borderRadius: radius.lg,
    backgroundColor: color.surface,
    ...ring(border.hairline, color.line),
  },
  guide: { gap: space[2] + space[1] / 2 },
});
