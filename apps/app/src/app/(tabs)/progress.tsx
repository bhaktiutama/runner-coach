import type { EngineMessageKey } from '@run-coach/training-engine';
import {
  BarChart,
  Card,
  color,
  fontFiles,
  Icon,
  LaneMark,
  LineTrend,
  radius,
  shadow,
  size,
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
  formatPaceValue,
  formatPercent,
  formatRaceRange,
  formatWeekdayShort,
} from '@run-coach/ui/format';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { HelpHint } from '@/components/HelpHint';
import { Screen } from '@/components/Screen';
import { useActivePlan, useActivities, useToday, useWorkoutStatuses } from '@/data/hooks';
import { planParams } from '@/data/rows';
import { t, type MessageKey } from '@/i18n/t';
import { adherence, easyPaceTrend, rangeStart, weeklyVolume, type Range } from '@/lib/progress';
import { et } from '@/lib/rationale';
import { TYPE_ZONE, typeName } from '@/lib/workoutView';

/** 3.3 Progres (F-07). Tata letak = wireframe Progress. */
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
  const chartW = Math.min(width, size.contentMax) - space.screenX * 2 - space[4] * 2;

  const shown = weeks.slice(-8);
  return (
    <Screen testID="screen-progress" gap="progress">
      <View style={styles.head}>
        <Text variant="title">{t('progress.title')}</Text>
        <View style={styles.seg} accessibilityRole="tablist">
          {(['8w', 'plan', 'all'] as const).map((r) => {
            const on = range === r;
            return (
              <Pressable
                key={r}
                accessibilityRole="tab"
                accessibilityState={{ selected: on }}
                onPress={() => setRange(r)}
                style={[styles.segItem, on && styles.segOn]}
              >
                <Text variant="controlSmStrong" color={on ? 'text' : 'textMuted'}>
                  {t(`progress.range.${r}` as MessageKey)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      <Card style={styles.cardVol}>
        <View style={styles.row}>
          <View style={styles.hintRow}>
            <Text variant="controlStrong">{t('progress.volume')}</Text>
            <HelpHint topic="volume" term={t('progress.volume')} />
          </View>
          <Text variant="bodySm" color="textMuted">
            {t('progress.km')}
          </Text>
        </View>
        {shown.every((w) => w.distanceM === 0) ? (
          <Text variant="bodySm" color="textMuted">
            {t('progress.empty')}
          </Text>
        ) : (
          <>
            <BarChart
              height={space[10] * 2 + space[4]}
              bars={shown.map((w, i) => ({
                value: w.distanceM,
                label: formatNumber(Math.round(w.distanceM / 1000)),
                phase: !w.current && i >= shown.length - 3 ? 'peak' : w.current ? 'peak' : 'base',
                outline: w.current,
              }))}
            />
            <View style={styles.xAxis}>
              {shown.map((w) => (
                <Text key={w.weekStart} variant="axisSm" color="textMuted" align="center" style={styles.flex}>
                  {w.current ? t('progress.thisWeek') : formatDayMonthNumeric(w.weekStart)}
                </Text>
              ))}
            </View>
          </>
        )}
      </Card>
      <Card style={styles.cardPace}>
        <View style={styles.row}>
          <Text variant="controlStrong">{t('progress.pace')}</Text>
          {trend.length >= 2 ? (
            <Text variant="control" style={styles.paceDelta}>
              {t('progress.paceChange', {
                from: formatPaceValue(trend[0]!.pace),
                to: formatPace(trend[trend.length - 1]!.pace),
              })}
            </Text>
          ) : null}
        </View>
        {trend.length >= 2 ? (
          <>
            <LineTrend
              values={trend.map((x) => x.pace)}
              width={chartW}
              height={space[10] + space[4]}
              invert
            />
            <Text variant="caption" color="textMuted">
              {t('progress.paceNote')}
            </Text>
          </>
        ) : (
          <Text variant="bodySm" color="textMuted">
            {t('progress.paceEmpty')}
          </Text>
        )}
      </Card>
      <View style={styles.pair}>
        <Card style={styles.small}>
          <View style={styles.ringBox}>
            <TrackRing
              width={space[10] * 3 + space[3]}
              height={space[10] + space[8] + space[1]}
              stroke={space[2] + space[1] / 2}
              progress={adh.ratio ?? 0}
              color={color.primary}
              trackColor={color.surfaceSunken}
            >
              <Text variant="stat">{adh.ratio == null ? '-' : formatPercent(adh.ratio)}</Text>
            </TrackRing>
          </View>
          <View style={styles.hintRow}>
            <Text variant="label">{t('progress.adherence')}</Text>
            <HelpHint topic="kepatuhan" term={t('progress.adherence')} />
          </View>
          <Text variant="caption" color="textMuted">
            {adh.total
              ? t('progress.adherenceSub', { done: adh.done, total: adh.total })
              : t('progress.adherenceEmpty')}
          </Text>
        </Card>
        <Card style={[styles.small, styles.pred]}>
          {pred && g.distance !== 'fitness' ? (
            <>
              <View style={styles.hintRow}>
                <Text variant="label" color="textMuted" style={styles.shrink}>
                  {t('progress.prediction', { distance: et(`distance.${g.distance}` as EngineMessageKey) })}
                </Text>
                <HelpHint topic="prediksi" term={t('progress.predictionTerm')} />
              </View>
              <Text variant="title" testID="prediction">
                {formatRaceRange(pred.minS, pred.maxS)}
              </Text>
              {g.target_time_s ? (
                <Text variant="caption" color="textMuted">
                  {t('progress.target', { time: formatDuration(g.target_time_s) })}
                </Text>
              ) : null}
              {pred.rough ? (
                <Text variant="caption" color="textMuted">
                  {t('progress.predictionRough')}
                </Text>
              ) : null}
            </>
          ) : (
            <Text variant="bodySm" color="textMuted">
              {t('progress.noPrediction')}
            </Text>
          )}
        </Card>
      </View>
      <View style={styles.recent}>
        <Text variant="label" color="textMuted">
          {t('progress.recent')}
        </Text>
        {recent.length === 0 ? (
          <Text variant="bodySm" color="textMuted">
            {t('progress.empty')}
          </Text>
        ) : null}
        {recent.map((a) => (
          <Pressable
            key={a.id}
            onPress={() => router.push(`/activity/${a.id}`)}
            testID={`activity-${a.id}`}
            style={styles.item}
          >
            <LaneMark zone={a.workout_type ? TYPE_ZONE[a.workout_type] : 'easy'} stretch />
            <View style={styles.flex}>
              <Text variant="row">{a.workout_type ? typeName(a.workout_type) : t('progress.extraRun')}</Text>
              <Text variant="caption" color="textMuted">
                {t('progress.itemSub', {
                  date: `${formatWeekdayShort(a.date)} ${formatDayMonth(a.date)}`,
                  km: a.distance_m ? formatDistance(a.distance_m) : '-',
                  duration: formatDuration(a.duration_s),
                })}
              </Text>
            </View>
            <Icon name="chevron-right" size={space[5]} />
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hintRow: { flexDirection: 'row', alignItems: 'center', gap: space[1] + space[1] / 2 },
  shrink: { flexShrink: 1 },
  flex: { flex: 1 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  seg: {
    flexDirection: 'row',
    padding: space[1],
    borderRadius: radius.stadium,
    backgroundColor: color.surfaceSunken,
  },
  segItem: {
    minHeight: space[8] + space[1],
    paddingHorizontal: space[3],
    borderRadius: radius.stadium,
    justifyContent: 'center',
  },
  segOn: { backgroundColor: color.surface, ...shadow.card },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardVol: { padding: space[4], gap: space[2] + space[1] / 2 },
  cardPace: { padding: space[4], gap: space[2] },
  xAxis: { flexDirection: 'row', gap: space[2] },
  paceDelta: { fontFamily: fontFiles.display700, color: color.success },
  pair: { flexDirection: 'row', gap: space[2] },
  small: { flex: 1, padding: space[3] + space[1] / 2, gap: space[1] },
  pred: { gap: space[1] + space[1] / 2 },
  ringBox: { alignItems: 'center', height: space[10] + space[8] + space[1], justifyContent: 'center' },
  recent: { gap: space[2] },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    minHeight: size.dayRow,
    paddingVertical: space[2],
    paddingHorizontal: space[3] + space[1] / 2,
    borderRadius: radius.md,
    backgroundColor: color.surface,
    ...shadow.card,
  },
});
