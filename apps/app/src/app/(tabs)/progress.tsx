import { addDays, mondayOf, type EngineMessageKey } from '@run-coach/training-engine';
import {
  BarChart,
  Card,
  color,
  fontFiles,
  Icon,
  ImageHeader,
  LaneMark,
  LineTrend,
  radius,
  shadow,
  size,
  space,
  Text,
  themed,
  TrackRing,
} from '@run-coach/ui';
import {
  formatDayMonth,
  formatDayMonthNumeric,
  formatDistance,
  formatDuration,
  formatMonthShort,
  formatNumber,
  formatTotalDuration,
  formatPace,
  formatPaceValue,
  formatPercent,
  formatRaceRange,
  formatWeekdayShort,
} from '@run-coach/ui/format';
import { router, useIsFocused } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { HelpHint } from '@/components/HelpHint';
import { Screen } from '@/components/Screen';
import { useActivePlan, useActivities, useToday, useWorkoutStatuses } from '@/data/hooks';
import { planParams } from '@/data/rows';
import { t, type MessageKey } from '@/i18n/t';
import {
  adherence,
  easyPaceTrend,
  historyBars,
  planBars,
  rangeStart,
  rangeTotals,
  weeklyVolume,
  type Range,
  type VolumeBar,
} from '@/lib/progress';
import { weekIndexOf } from '@/lib/planView';
import { et } from '@/lib/rationale';
import { TYPE_ZONE, typeName } from '@/lib/workoutView';
import { IMAGES } from '@/lib/imagery';

/** 3.3 Progres (F-07). Tata letak = wireframe Progress. */
export default function ProgressTab() {
  const focused = useIsFocused();
  const today = useToday();
  const plan = useActivePlan();
  const all = useActivities();
  const statuses = useWorkoutStatuses(plan.data?.id);
  const [range, setRange] = useState<Range>('8w');
  const [showAll, setShowAll] = useState(false);
  const { width } = useWindowDimensions();
  if (!plan.data) return null;
  const acts = all.data ?? [];
  const first = acts.length ? acts[acts.length - 1]!.date : null;
  const from = rangeStart(range, today, plan.data.start_date, first);
  const weeks = weeklyVolume(acts, from, today);
  const trend = easyPaceTrend(acts, from);
  const adh = adherence(statuses.data ?? [], from, today);
  const adhS = adherence(statuses.data ?? [], from, today, 'support');
  const params = planParams(plan.data);
  const pred = params.prediction;
  const g = plan.data.goal;
  // Daftar aktivitas mengikuti rentang; 5 teratas, sisanya lewat "Tampilkan semua".
  const inRange = acts.filter((a) => a.date >= from);
  const recent = showAll ? inRange : inRange.slice(0, 5);
  const totals = rangeTotals(acts, from, today);
  const monday = mondayOf(today);
  const weekAll = (statuses.data ?? []).filter((w) => w.date >= monday && w.date <= addDays(monday, 6));
  const weekDone = weekAll.filter((w) => w.status === 'completed').length;
  const weekIdx = weekIndexOf(params, today) ?? 1;
  const planTotalM = (params.weeks ?? []).reduce((s, w) => s + w.volumeM, 0);
  const chartW = Math.min(width, size.contentMax) - space.screenX * 2 - space[4] * 2;

  // Tiap rentang punya grafik sendiri (09-VOICE bagian 14): 8 mgg = 8 minggu terakhir; Plan = semua
  // minggu plan (nyata + target ke depan berwarna fase); Semua = sejak aktivitas pertama (per bulan jika panjang).
  const shown: VolumeBar[] =
    range === 'plan'
      ? planBars(params.weeks ?? [], acts, today)
      : range === 'all'
        ? historyBars(acts, from, today)
        : weeks.slice(-8).map((w, i, xs) => ({
            key: w.weekStart,
            start: w.weekStart,
            distanceM: w.distanceM,
            phase: !w.current && i >= xs.length - 3 ? 'peak' : w.current ? 'peak' : 'base',
            outline: w.current,
            current: w.current,
            week: null,
          }));
  const monthly = range === 'all' && shown.length > 0 && shown[0]!.key.length === 7;
  const dense = shown.length > 10;
  const every = Math.ceil(shown.length / 8);
  const axisLabel = (b: VolumeBar, i: number) => {
    if (dense && i % every !== 0 && !b.current) return '';
    if (b.current) return monthly ? formatMonthShort(b.start) : t('progress.thisWeek');
    if (monthly) return formatMonthShort(b.start);
    if (b.week != null) return t('progress.weekShort', { n: b.week });
    return formatDayMonthNumeric(b.start);
  };
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
                onPress={() => (setRange(r), setShowAll(false))}
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
      {/* Jalan masuk ke 2.5 selain sesudah latihan terakhir minggu itu. */}
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/week-summary')}
        style={styles.item}
        testID="open-week-summary"
      >
        <Icon name="trophy" size={space[5]} />
        <View style={styles.flex}>
          <Text variant="row">{t('progress.weekSummary')}</Text>
          <Text variant="caption" color="textMuted">
            {t('progress.weekSummarySub', { n: weekIdx, done: weekDone, total: weekAll.length })}
          </Text>
        </View>
        <Icon name="chevron-right" size={space[5]} />
      </Pressable>
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
        <Text variant="caption" color="textMuted" testID="range-totals">
          {range === 'plan'
            ? t('progress.totalsPlan', {
                km: formatDistance(totals.distanceM),
                target: formatDistance(planTotalM),
                n: totals.count,
              })
            : t('progress.totals', {
                km: formatDistance(totals.distanceM),
                time: formatTotalDuration(totals.durationS),
                n: totals.count,
              })}
        </Text>
        {range !== 'plan' && shown.every((w) => w.distanceM === 0) ? (
          <>
            {/* UI/UX 12: keadaan belum ada aktivitas memakai gambar track-aerial. */}
            <ImageHeader source={IMAGES.trackAerial} style={styles.emptyImage} />
            <Text variant="bodySm" color="textMuted">
              {t('progress.empty')}
            </Text>
          </>
        ) : (
          <>
            <BarChart
              key={`bars-${range}-${focused ? 'on' : 'off'}`}
              animate
              height={space[10] * 2 + space[4]}
              bars={shown.map((w) => ({
                value: w.distanceM,
                // Banyak batang: angka di atas batang disembunyikan agar tidak bertumpuk.
                label: dense ? '' : formatNumber(Math.round(w.distanceM / 1000)),
                phase: w.phase,
                outline: w.outline,
              }))}
            />
            {/* Banyak batang: label ditaruh absolut di tengah kolomnya agar tidak terpotong ("M..."). */}
            <View style={dense ? styles.xAxisAbs : styles.xAxis} testID={`volume-axis-${range}`}>
              {shown.map((w, i) =>
                dense ? (
                  axisLabel(w, i) ? (
                    <View
                      key={w.key}
                      style={[styles.axisTick, { left: `${((i + 0.5) / shown.length) * 100}%` }]}
                    >
                      <Text variant="axisSm" color="textMuted" align="center" numberOfLines={1}>
                        {axisLabel(w, i)}
                      </Text>
                    </View>
                  ) : null
                ) : (
                  <Text key={w.key} variant="axisSm" color="textMuted" align="center" style={styles.flex}>
                    {axisLabel(w, i)}
                  </Text>
                ),
              )}
            </View>
            {range === 'plan' ? (
              <Text variant="caption" color="textMuted">
                {t('progress.planLegend')}
              </Text>
            ) : null}
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
              key={`trend-${focused ? 'on' : 'off'}`}
              animate
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
              key={focused ? 'on' : 'off'}
              animateIn
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
          {adhS.total ? (
            <Text variant="caption" color="textMuted" testID="strength-adherence">
              {t('progress.strengthAdherence', { done: adhS.done, total: adhS.total })}
            </Text>
          ) : null}
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
        {!showAll && inRange.length > 5 ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => setShowAll(true)}
            style={styles.more}
            testID="progress-show-all"
          >
            <Text variant="controlStrong" color="primaryInk">
              {t('progress.showAll', { n: inRange.length })}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = themed(() =>
  StyleSheet.create({
    emptyImage: { marginTop: 0, marginHorizontal: 0, borderRadius: radius.md },
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
    xAxisAbs: { height: space[4], position: 'relative' },
    axisTick: { position: 'absolute', top: 0, width: space[8], marginLeft: -space[4] },
    more: { minHeight: size.touchMin, justifyContent: 'center', alignItems: 'center' },
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
  }),
);
