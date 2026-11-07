import {
  border,
  Card,
  color,
  Icon,
  radius,
  size,
  space,
  type SpotIconName,
  Text,
  themed,
} from '@run-coach/ui';
import {
  formatDateLong,
  formatDayMonth,
  formatDistance,
  formatDuration,
  formatNumber,
  formatDayMonthNumeric,
  formatPaceValue,
  formatTotalDuration,
  formatWeekdayShort,
} from '@run-coach/ui/format';
import { router } from 'expo-router';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  ScrollView,
  type ScrollViewInstance,
  StyleSheet,
  View,
} from 'react-native';
import { useActivities, useProfile, useUpdateProfile, useWorkouts, useWorkoutStatuses } from '@/data/hooks';
import type { PlanRow } from '@/data/rows';
import { t, type MessageKey } from '@/i18n/t';
import { addDays } from '@run-coach/training-engine';
import { rangeTotals } from '@/lib/progress';
import { cardOrder, nextLongRun, planRecords, weekStreak, type TodayCard } from '@/lib/todayCards';
import { CARD_H, CardHead, CountdownCard } from './CountdownCard';

type Props = {
  today: string;
  plan: Pick<PlanRow, 'id' | 'start_date' | 'end_date'> & {
    goal: { distance: '5k' | '10k' | 'hm' | 'fm' | 'fitness'; race_date: string | null };
  };
  planTargetM: number;
  /** Fase minggu ini, untuk baris kedua judul kartu hitung mundur. */
  phase?: string;
};

/**
 * 2.1 kartu geser (review 2026-11-05): hitung mundur, long run berikutnya, rekor plan, streak minggu.
 * Digeser per halaman; titik di bawah bisa diketuk. Kartu default dipilih lewat "Jadikan utama"
 * (`profile.today_card`) dan selalu tampil pertama.
 */
export function TodayCarousel({ today, plan, planTargetM, phase }: Props) {
  const profile = useProfile();
  const update = useUpdateProfile();
  const ahead = useWorkouts(plan.id, today);
  const acts = useActivities(plan.start_date);
  const statuses = useWorkoutStatuses(plan.id);
  const [w, setW] = useState(0);
  const [page, setPage] = useState(0);
  const ref = useRef<ScrollViewInstance>(null);
  const def = profile.data?.today_card ?? 'countdown';
  const order = cardOrder(def);
  // Kartu default baru dipilih -> kembali ke halaman pertama (kartu itu).
  useEffect(() => {
    ref.current?.scrollTo({ x: 0, animated: true });
    setPage(0);
  }, [def]);

  // Ikon pin: terisi warna (lingkaran tipis) = kartu utama; garis pudar = ketuk untuk jadikan utama.
  const pin = (c: TodayCard) => {
    const on = c === def;
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: on }}
        accessibilityLabel={on ? t('today.card.default') : t('today.card.makeDefault')}
        disabled={on}
        onPress={() => update.mutate({ today_card: c })}
        style={[styles.pin, on && styles.pinOn]}
        testID={on ? `card-default-${c}` : `card-pin-${c}`}
      >
        <Icon
          name="pin"
          size={space[4]}
          color={on ? color.primaryInk : color.textMuted}
          strokeWidth={on ? 2.5 : 2}
        />
      </Pressable>
    );
  };

  const body = (c: TodayCard): ReactNode => {
    switch (c) {
      case 'countdown':
        return (
          <CountdownCard
            today={today}
            distance={plan.goal.distance}
            raceDate={plan.goal.race_date}
            planStart={plan.start_date}
            planEnd={plan.end_date}
            planTargetM={planTargetM}
            phase={phase}
            pin={pin(c)}
          />
        );
      case 'long_run': {
        const lr = nextLongRun(ahead.data ?? [], today);
        return (
          <Shell
            title={t('today.card.longRun')}
            sub={t('today.card.longRunSub')}
            spot="next-long"
            pin={pin(c)}
            testID="card-long_run"
          >
            {lr ? (
              <Pressable onPress={() => router.push(`/workout/${lr.id}`)} style={styles.row}>
                <View style={styles.flex}>
                  <Text variant="row">
                    {lr.target_distance_m
                      ? t('today.card.longRunWhat', { km: formatDistance(lr.target_distance_m) })
                      : t('today.card.longRunWhatTime', { time: formatDuration(lr.target_duration_s ?? 0) })}
                  </Text>
                  <Text variant="controlSm" color="textMuted">
                    {formatDateLong(lr.date)}
                  </Text>
                </View>
                <Big
                  value={lr.inDays === 0 ? t('today.card.todayShort') : formatNumber(lr.inDays)}
                  label={lr.inDays === 0 ? '' : t('today.countdownDays')}
                />
              </Pressable>
            ) : null}
            {lr ? (
              // Lajur 7 hari dari hari ini: hari long run = isian warna zona long, hari ini = garis.
              <View style={styles.days}>
                {Array.from({ length: 7 }, (_, i) => {
                  const d = addDays(today, i);
                  const isLr = d === lr.date;
                  return (
                    <View key={d} style={styles.dayCol}>
                      <View
                        style={[
                          styles.dayBar,
                          i < lr.inDays && styles.dayPassed,
                          isLr && { backgroundColor: color.zone.long },
                          i === 0 && !isLr && styles.dayToday,
                        ]}
                      />
                      <Text variant="caption" color={isLr ? 'text' : 'textMuted'} numberOfLines={1}>
                        {formatWeekdayShort(d)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ) : (
              <Text variant="bodySm" color="textMuted">
                {t('today.card.longRunNone')}
              </Text>
            )}
          </Shell>
        );
      }
      case 'records': {
        const r = planRecords(acts.data ?? [], plan.start_date);
        const runs = (acts.data ?? []).filter(
          (a) => a.workout_type !== 'strength' && a.workout_type !== 'core',
        );
        const tot = rangeTotals(runs, plan.start_date, today);
        const items: [MessageKey, string | null, string | null][] = [
          [
            'today.card.recLongest',
            r.longest ? formatDistance(r.longest.distanceM) : null,
            r.longest?.date ?? null,
          ],
          [
            'today.card.recPaceKm',
            r.bestEasyPace ? formatPaceValue(r.bestEasyPace.pace) : null,
            r.bestEasyPace?.date ?? null,
          ],
          [
            'today.card.recTime',
            r.longestTime ? formatDuration(r.longestTime.durationS) : null,
            r.longestTime?.date ?? null,
          ],
        ];
        return (
          <Shell
            title={t('today.card.records')}
            sub={t('today.card.recordsSub')}
            spot="records"
            pin={pin(c)}
            testID="card-records"
          >
            {r.longest || r.longestTime ? (
              <View style={styles.recs}>
                {items.map(([k, v, d]) => (
                  <View key={k} style={styles.rec}>
                    <Text variant="captionStrong" color="textMuted" numberOfLines={1}>
                      {t(k)}
                    </Text>
                    <Text variant="numberSm" numberOfLines={1}>
                      {v ?? '-'}
                    </Text>
                    <Text variant="caption" color="textMuted">
                      {d ? formatDayMonth(d) : ' '}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text variant="bodySm" color="textMuted">
                {t('today.card.recordsNone')}
              </Text>
            )}
            <View style={styles.totals}>
              {[
                t('today.card.totRuns', { n: tot.count }),
                formatDistance(tot.distanceM),
                formatTotalDuration(tot.durationS),
              ].map((x) => (
                <View key={x} style={styles.totChip}>
                  <Text variant="captionStrong">{x}</Text>
                </View>
              ))}
            </View>
          </Shell>
        );
      }
      case 'streak': {
        const s = weekStreak(statuses.data ?? [], today);
        return (
          <Shell
            title={t('today.card.streak')}
            sub={t('today.card.streakSub')}
            spot="streak"
            pin={pin(c)}
            testID="card-streak"
          >
            <View style={styles.row}>
              <Text variant="row" style={styles.flex}>
                {s.current > 0 ? t('today.card.streakNow', { n: s.current }) : t('today.card.streakZero')}
              </Text>
              <Text variant="controlSm" color="textMuted">
                {t('today.card.streakBestOnly', { n: s.best })}
              </Text>
            </View>
            {/* 6 minggu terakhir lebar penuh: tinggi isian = bagian lari selesai, label tanggal Senin. */}
            <View style={styles.days} accessibilityLabel={t('today.card.streakWeeks')}>
              {s.weeks.map((x) => (
                <View key={x.monday} style={styles.dayCol}>
                  <View style={[styles.weekBar, x.state === 'open' && styles.weekOpen]}>
                    <View
                      style={[
                        styles.weekFill,
                        {
                          height: `${x.total ? Math.round((x.done / x.total) * 100) : 0}%`,
                          backgroundColor: x.state === 'done' ? color.success : color.line,
                        },
                      ]}
                    />
                  </View>
                  <Text variant="caption" color={x.state === 'open' ? 'text' : 'textMuted'} numberOfLines={1}>
                    {x.state === 'open' ? t('progress.thisWeek') : formatDayMonthNumeric(x.monday)}
                  </Text>
                </View>
              ))}
            </View>
          </Shell>
        );
      }
    }
  };

  // Halaman = lebar konten + GAP; kartu diberi jarak GAP/2 di kiri-kanan agar tidak menempel saat digeser,
  // dan ScrollView melebar GAP/2 ke luar sehingga tepi kartu tetap sejajar dengan isi layar lain.
  const pageW = w + GAP;
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!w) return;
    setPage(Math.round(e.nativeEvent.contentOffset.x / pageW));
  };

  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)} testID="today-carousel">
      {w ? (
        <ScrollView
          ref={ref}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={32}
          style={[styles.scroller, { width: pageW }]}
        >
          {order.map((c) => (
            <View key={c} style={[styles.page, { width: pageW }]}>
              {body(c)}
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.placeholder} />
      )}
      {/* Titik penanda di dalam kartu (bagian bawah), bukan di bawah carousel. */}
      <View style={styles.dots} accessibilityRole="tablist" pointerEvents="box-none">
        {order.map((c, i) => (
          <Pressable
            key={c}
            accessibilityRole="tab"
            accessibilityState={{ selected: i === page }}
            accessibilityLabel={t(`today.card.name.${c}` as MessageKey)}
            onPress={() => {
              ref.current?.scrollTo({ x: i * pageW, animated: true });
              setPage(i);
            }}
            style={styles.dotHit}
            testID={`card-dot-${c}`}
          >
            <View style={[styles.dot, i === page && styles.dotOn]} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function Shell({
  title,
  sub,
  spot,
  pin,
  children,
  testID,
}: {
  title: string;
  sub: string;
  spot: SpotIconName;
  pin: ReactNode;
  children: ReactNode;
  testID: string;
}) {
  return (
    <Card style={styles.card} testID={testID}>
      <CardHead title={title} sub={sub} spot={spot} pin={pin} />
      {/* Isi + visual dikelompokkan di tengah ruang sisa: jarak atas dan bawah seimbang. */}
      <View style={styles.body}>{children}</View>
    </Card>
  );
}

function Big({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.big}>
      <Text variant="numberMd">{value}</Text>
      {label ? (
        <Text variant="caption" color="textMuted">
          {label}
        </Text>
      ) : null}
    </View>
  );
}

/** Jarak antar kartu saat digeser. */
const GAP = space[4];

const styles = themed(() =>
  StyleSheet.create({
    flex: { flex: 1 },
    scroller: { marginHorizontal: -GAP / 2, overflow: 'visible' },
    page: { paddingHorizontal: GAP / 2, paddingVertical: space[1] },
    placeholder: { height: CARD_H + space[2] },
    card: { gap: space[3], padding: space[4], paddingBottom: space[6] + space[1], height: CARD_H },
    row: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
    body: { flex: 1, justifyContent: 'center', gap: space[3] },
    big: { alignItems: 'center', minWidth: space[10] },
    recs: { flexDirection: 'row', gap: space[2] },
    rec: { flex: 1, minWidth: 0, gap: space[1] / 2 },
    weeks: { flexDirection: 'row', gap: space[1] + space[1] / 2 },
    weekDot: {
      width: space[3] + space[1],
      height: space[5],
      borderRadius: radius.stadium,
      backgroundColor: color.line,
    },
    days: { flexDirection: 'row', gap: space[1] + space[1] / 2 },
    dayCol: { flex: 1, alignItems: 'center', gap: space[1] },
    dayBar: {
      alignSelf: 'stretch',
      height: space[2],
      borderRadius: radius.stadium,
      backgroundColor: color.surfaceSunken,
    },
    dayPassed: { backgroundColor: color.zone.long, opacity: 0.35 },
    dayToday: { borderWidth: border.selected, borderColor: color.text, backgroundColor: color.surface },
    weekBar: {
      alignSelf: 'stretch',
      height: space[6],
      borderRadius: radius.sm,
      backgroundColor: color.surfaceSunken,
      overflow: 'hidden',
      justifyContent: 'flex-end',
    },
    weekFill: { width: '100%' },
    totals: { flexDirection: 'row', gap: space[2] },
    totChip: {
      paddingHorizontal: space[2] + space[1] / 2,
      paddingVertical: space[1],
      borderRadius: radius.stadium,
      backgroundColor: color.surfaceSunken,
    },
    weekOpen: { backgroundColor: color.surface, borderWidth: border.selected, borderColor: color.success },
    pin: {
      width: size.touchMin * 0.75,
      height: size.touchMin * 0.75,
      marginVertical: -space[2],
      marginRight: -space[2],
      borderRadius: radius.stadium,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pinOn: { backgroundColor: color.surfaceSunken },
    dots: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: space[3],
      flexDirection: 'row',
      justifyContent: 'center',
    },
    dotHit: { width: space[5], height: space[4], alignItems: 'center', justifyContent: 'center' },
    dot: {
      width: space[2] - border.selected,
      height: space[2] - border.selected,
      borderRadius: radius.stadium,
      backgroundColor: color.line,
    },
    dotOn: { width: space[4], backgroundColor: color.textMuted },
  }),
);
