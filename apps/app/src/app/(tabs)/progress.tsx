import type { EngineMessageKey } from '@run-coach/training-engine';
import {
  BarChart,
  Card,
  color,
  Icon,
  LaneMark,
  LineTrend,
  SegmentedControl,
  space,
  Text,
  TrackRing,
} from '@run-coach/ui';
import {
  formatDayMonth,
  formatDayMonthNumeric,
  formatDistance,
  formatDuration,
  formatNumber,
  formatPace,
  formatPercent,
  formatRaceRange,
  formatRaceTime,
  formatWeekdayShort,
} from '@run-coach/ui/format';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { useActivePlan, useActivities, useToday, useWorkoutStatuses } from '@/data/hooks';
import { planParams } from '@/data/rows';
import { t } from '@/i18n/t';
import { adherence, easyPaceTrend, rangeStart, weeklyVolume, type Range } from '@/lib/progress';
import { et } from '@/lib/rationale';
import { TYPE_ZONE, typeName } from '@/lib/workoutView';

/** 3.3 Progres (F-07). */
export default function ProgressTab() {
  const today = useToday();
  const plan = useActivePlan();
  const all = useActivities();
  const statuses = useWorkoutStatuses(plan.data?.id);
  const [range, setRange] = useState<Range>('8w');
  const { width } = useWindowDimensions();
  if (!plan.data) return null;
  const acts = all.data ?? [];
  const first = acts.length ? acts[acts.length - 1]!.date : null;
  const from = rangeStart(range, today, plan.data.start_date, first);
  const weeks = weeklyVolume(acts, from, today);
  const trend = easyPaceTrend(acts, from);
  const adh = adherence(statuses.data ?? [], from, today);
  const params = planParams(plan.data);
  const pred = params.prediction;
  const g = plan.data.goal;
  const recent = acts.slice(0, 5);
  const chartW = Math.min(width, 640) - space.screenX * 2 - space[5] * 2;

  return (
    <Screen testID="screen-progress">
      <View style={styles.head}>
        <Text variant="title" style={styles.flex}>
          {t('progress.title')}
        </Text>
        <View style={styles.seg}>
          <SegmentedControl
            value={range}
            onChange={setRange}
            items={[
              { value: '8w', label: t('progress.range.8w') },
              { value: 'plan', label: t('progress.range.plan') },
              { value: 'all', label: t('progress.range.all') },
            ]}
          />
        </View>
      </View>
      <Card>
        <View style={styles.row}>
          <Text variant="heading">{t('progress.volume')}</Text>
          <Text color="textMuted">{t('progress.km')}</Text>
        </View>
        <BarChart
          bars={weeks.slice(-12).map((w) => ({
            value: w.distanceM,
            label: formatNumber(Math.round(w.distanceM / 1000)),
            phase: w.current ? 'peak' : 'base',
          }))}
        />
        <View style={styles.row}>
          {weeks.slice(-12).map((w) => (
            <Text key={w.weekStart} variant="caption" color="textMuted" align="center" style={styles.flex}>
              {w.current ? t('progress.thisWeek') : formatDayMonthNumeric(w.weekStart)}
            </Text>
          ))}
        </View>
      </Card>
      <Card>
        <View style={styles.row}>
          <Text variant="heading">{t('progress.pace')}</Text>
          {trend.length >= 2 ? (
            <Text variant="heading" color="success">
              {t('progress.paceChange', {
                from: formatPace(trend[0]!.pace).replace(' /km', ''),
                to: formatPace(trend[trend.length - 1]!.pace),
              })}
            </Text>
          ) : null}
        </View>
        {trend.length >= 2 ? (
          <>
            <LineTrend values={trend.map((x) => x.pace)} width={chartW} invert />
            <Text variant="label" color="textMuted">
              {t('progress.paceNote')}
            </Text>
          </>
        ) : (
          <Text color="textMuted">{t('progress.paceEmpty')}</Text>
        )}
      </Card>
      <View style={styles.pair}>
        <Card style={styles.flex}>
          <TrackRing
            width={space[10] * 3 + space[8]}
            height={space[10] * 2 + space[4]}
            progress={adh.ratio ?? 0}
            color={color.primary}
            trackColor={color.surfaceSunken}
          >
            <Text variant="numberMd">{adh.ratio == null ? '-' : formatPercent(adh.ratio)}</Text>
          </TrackRing>
          <Text variant="heading">{t('progress.adherence')}</Text>
          <Text variant="label" color="textMuted">
            {adh.total
              ? t('progress.adherenceSub', { done: adh.done, total: adh.total })
              : t('progress.adherenceEmpty')}
          </Text>
        </Card>
        <Card style={styles.flex}>
          {pred && g.distance !== 'fitness' ? (
            <>
              <Text variant="label" color="textMuted">
                {t('progress.prediction', { distance: et(`distance.${g.distance}` as EngineMessageKey) })}
              </Text>
              <Text variant="numberMd" testID="prediction">
                {formatRaceRange(pred.minS, pred.maxS)}
              </Text>
              {g.target_time_s ? (
                <Text variant="label" color="textMuted">
                  {t('progress.target', { time: formatRaceTime(g.target_time_s) })}
                </Text>
              ) : null}
              {pred.rough ? (
                <Text variant="caption" color="textMuted">
                  {t('progress.predictionRough')}
                </Text>
              ) : null}
            </>
          ) : (
            <Text color="textMuted">{t('progress.noPrediction')}</Text>
          )}
        </Card>
      </View>
      <Text variant="label" color="textMuted">
        {t('progress.recent')}
      </Text>
      {recent.length === 0 ? <Text color="textMuted">{t('progress.empty')}</Text> : null}
      {recent.map((a) => (
        <Pressable key={a.id} onPress={() => router.push(`/activity/${a.id}`)} testID={`activity-${a.id}`}>
          <Card style={styles.item}>
            <LaneMark zone={a.workout_type ? TYPE_ZONE[a.workout_type] : 'easy'} tall />
            <View style={styles.flex}>
              <Text variant="heading">
                {a.workout_type ? typeName(a.workout_type) : t('progress.extraRun')}
              </Text>
              <Text variant="label" color="textMuted">
                {t('progress.itemSub', {
                  date: `${formatWeekdayShort(a.date)} ${formatDayMonth(a.date)}`,
                  km: a.distance_m ? formatDistance(a.distance_m) : '-',
                  duration: formatDuration(a.duration_s),
                })}
              </Text>
            </View>
            <Icon name="chevron-right" />
          </Card>
        </Pressable>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  head: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  seg: { flexBasis: space[10] * 6, flexShrink: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pair: { flexDirection: 'row', gap: space[3] },
  item: { flexDirection: 'row', alignItems: 'center', gap: space[4] },
});
