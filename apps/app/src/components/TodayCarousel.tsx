import { border, Card, color, Icon, radius, size, space, Text, themed } from '@run-coach/ui';
import {
  formatDateLong,
  formatDayMonth,
  formatDistance,
  formatDuration,
  formatNumber,
  formatPace,
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
import { cardOrder, nextLongRun, planRecords, weekStreak, type TodayCard } from '@/lib/todayCards';
import { CountdownCard } from './CountdownCard';

type Props = {
  today: string;
  plan: Pick<PlanRow, 'id' | 'start_date' | 'end_date'> & {
    goal: { distance: '5k' | '10k' | 'hm' | 'fm' | 'fitness'; race_date: string | null };
  };
  planTargetM: number;
};

/**
 * 2.1 kartu geser (review 2026-11-05): hitung mundur, long run berikutnya, rekor plan, streak minggu.
 * Digeser per halaman; titik di bawah bisa diketuk. Kartu default dipilih lewat "Jadikan utama"
 * (`profile.today_card`) dan selalu tampil pertama.
 */
export function TodayCarousel({ today, plan, planTargetM }: Props) {
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

  const pin = (c: TodayCard) =>
    c === def ? (
      <View style={styles.chip} testID={`card-default-${c}`}>
        <Icon name="check" size={space[3] + space[1]} color={color.success} strokeWidth={3} />
        <Text variant="captionStrong" color="success">
          {t('today.card.default')}
        </Text>
      </View>
    ) : (
      <Pressable
        accessibilityRole="button"
        onPress={() => update.mutate({ today_card: c })}
        style={styles.pinBtn}
        testID={`card-pin-${c}`}
      >
        <Text variant="captionStrong" color="primaryInk">
          {t('today.card.makeDefault')}
        </Text>
      </Pressable>
    );

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
            pin={pin(c)}
          />
        );
      case 'long_run': {
        const lr = nextLongRun(ahead.data ?? [], today);
        return (
          <Shell title={t('today.card.longRun')} pin={pin(c)} testID="card-long_run">
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
        const items: [MessageKey, string | null, string | null][] = [
          [
            'today.card.recLongest',
            r.longest ? formatDistance(r.longest.distanceM) : null,
            r.longest?.date ?? null,
          ],
          [
            'today.card.recPace',
            r.bestEasyPace ? formatPace(r.bestEasyPace.pace) : null,
            r.bestEasyPace?.date ?? null,
          ],
          [
            'today.card.recTime',
            r.longestTime ? formatDuration(r.longestTime.durationS) : null,
            r.longestTime?.date ?? null,
          ],
        ];
        return (
          <Shell title={t('today.card.records')} pin={pin(c)} testID="card-records">
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
          </Shell>
        );
      }
      case 'streak': {
        const s = weekStreak(statuses.data ?? [], today);
        return (
          <Shell title={t('today.card.streak')} pin={pin(c)} testID="card-streak">
            <View style={styles.row}>
              <View style={styles.flex}>
                <Text variant="row">
                  {s.current > 0 ? t('today.card.streakNow', { n: s.current }) : t('today.card.streakZero')}
                </Text>
                <Text variant="controlSm" color="textMuted">
                  {t(s.current > 0 ? 'today.card.streakBestOnly' : 'today.card.streakBest', { n: s.best })}
                </Text>
              </View>
              <View style={styles.weeks} accessibilityLabel={t('today.card.streakWeeks')}>
                {s.weeks.map((x) => (
                  <View
                    key={x.monday}
                    style={[
                      styles.weekDot,
                      x.state === 'done' && { backgroundColor: color.success },
                      x.state === 'missed' && { backgroundColor: color.surfaceSunken },
                      x.state === 'open' && styles.weekOpen,
                    ]}
                  />
                ))}
              </View>
            </View>
          </Shell>
        );
      }
    }
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!w) return;
    setPage(Math.round(e.nativeEvent.contentOffset.x / w));
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
          style={styles.scroller}
          contentContainerStyle={styles.track}
        >
          {order.map((c) => (
            <View key={c} style={[styles.page, { width: w }]}>
              {body(c)}
            </View>
          ))}
        </ScrollView>
      ) : null}
      <View style={styles.dots} accessibilityRole="tablist">
        {order.map((c, i) => (
          <Pressable
            key={c}
            accessibilityRole="tab"
            accessibilityState={{ selected: i === page }}
            accessibilityLabel={t(`today.card.name.${c}` as MessageKey)}
            onPress={() => {
              ref.current?.scrollTo({ x: i * w, animated: true });
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
  pin,
  children,
  testID,
}: {
  title: string;
  pin: ReactNode;
  children: ReactNode;
  testID: string;
}) {
  return (
    <Card style={styles.card} testID={testID}>
      <View style={styles.row}>
        <Text variant="captionStrong" color="textMuted" style={styles.flex}>
          {title}
        </Text>
        {pin}
      </View>
      {children}
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

const styles = themed(() =>
  StyleSheet.create({
    flex: { flex: 1 },
    scroller: { overflow: 'visible' },
    // Ruang atas/bawah agar bayangan kartu tidak terpotong oleh ScrollView.
    page: { paddingVertical: space[1], alignSelf: 'stretch', flexDirection: 'column' },
    track: { alignItems: 'stretch' },
    card: { gap: space[3], padding: space[4], flex: 1 },
    row: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
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
    weekOpen: { backgroundColor: color.surface, borderWidth: border.selected, borderColor: color.success },
    chip: { flexDirection: 'row', alignItems: 'center', gap: space[1] },
    pinBtn: { minHeight: size.touchMin / 1.5, justifyContent: 'center' },
    dots: { flexDirection: 'row', justifyContent: 'center', marginTop: space[1] },
    dotHit: {
      width: size.touchMin / 1.5,
      height: size.touchMin / 1.5,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dot: { width: space[2], height: space[2], borderRadius: radius.stadium, backgroundColor: color.line },
    dotOn: { width: space[5], backgroundColor: color.text },
  }),
);
