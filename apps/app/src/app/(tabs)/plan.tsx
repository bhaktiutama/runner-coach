import {
  addDays,
  diffDays,
  isSupportType,
  mondayOf,
  type EngineMessageKey,
} from '@run-coach/training-engine';
import {
  border,
  color,
  Icon,
  IconButton,
  LaneMark,
  onZone,
  PhaseBar,
  radius,
  ring,
  shadow,
  size,
  space,
  SpotIcon,
  Text,
  typography,
  weekdayShortName,
  type PhaseKey,
  themed,
} from '@run-coach/ui';
import { formatDateFull, formatDayMonth, formatDayRange, formatNumber } from '@run-coach/ui/format';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { HelpHint } from '@/components/HelpHint';
import { Screen } from '@/components/Screen';
import { useActivePlan, useToday, useWorkouts } from '@/data/hooks';
import { planParams } from '@/data/rows';
import { t } from '@/i18n/t';
import { weekIndexOf } from '@/lib/planView';
import { et } from '@/lib/rationale';
import { approxKm, hasDrill, minutesOf, TYPE_ZONE, typeName } from '@/lib/workoutView';
import { TYPE_SPOT, useSpotIcons } from '@/lib/spot';
import { PHASE_SPOT } from '@/lib/spotMap';

/** 3.1 Kalender plan. Tata letak = wireframe Plan (jarak antarblok 16). */
export default function PlanTab() {
  const today = useToday();
  const plan = useActivePlan();
  const params = plan.data ? planParams(plan.data) : null;
  const weeks = params?.weeks ?? [];
  const currentIdx = params ? (weekIndexOf(params, today) ?? 1) : 1;
  const [sel, setSel] = useState<number | null>(null);
  const idx = sel ?? currentIdx;
  const wk = weeks[idx - 1];
  const from = wk?.startDate ?? mondayOf(today);
  const to = addDays(from, 6);
  const ws = useWorkouts(plan.data?.id, from, to);
  const icons = useSpotIcons();
  const narrow = useWindowDimensions().width < NARROW_W;
  if (!plan.data || !params) return null;
  const g = plan.data.goal;
  const workouts = ws.data ?? [];
  const weekKm = workouts.reduce((a, w) => a + (w.target_distance_m ?? 0), 0);

  return (
    <Screen testID="screen-plan" gap="plan">
      <View style={styles.head}>
        <View style={styles.hintRow}>
          <Text variant="title">
            {g.distance === 'fitness'
              ? t('plan.titleFitness')
              : t('plan.title', { distance: et(`distance.${g.distance}` as EngineMessageKey) })}
          </Text>
          <HelpHint topic="fase" term={t('help.phases')} />
          <View style={styles.flexFill} />
          <IconButton
            icon="share"
            label={t('share.open.plan')}
            onPress={() => router.push({ pathname: '/share', params: { kind: 'plan' } })}
            testID="share-open"
          />
        </View>
        <Text variant="control" color="textMuted">
          {g.race_date
            ? g.race_date === today
              ? t('plan.raceToday')
              : t('plan.raceIn', {
                  date: formatDateFull(g.race_date),
                  days: Math.max(0, diffDays(today, g.race_date)),
                })
            : t('plan.noRace', { weeks: weeks.length })}
        </Text>
      </View>
      <PhaseBar
        weeks={weeks.map((w) => w.phase as PhaseKey)}
        current={idx}
        legend={(['base', 'build', 'peak', 'taper'] as const)
          .filter((p) => weeks.some((w) => w.phase === p))
          .map((p) => ({ phase: p, label: et(`phase.${p}` as EngineMessageKey) }))}
      />
      <View style={styles.nav}>
        <IconButton
          icon="back"
          label={t('plan.prevWeek')}
          disabled={idx <= 1}
          onPress={() => setSel(idx - 1)}
          testID="prev-week"
        />
        {icons && wk ? (
          // Review 2026-11-07: ikon fase di kiri setinggi dua baris; judul + tanggal rata kiri di kanannya.
          <View style={styles.navLead}>
            <SpotIcon
              name={PHASE_SPOT[wk.phase as keyof typeof PHASE_SPOT] ?? 'phase-base'}
              size={NAV_ICON}
              testID="week-phase-icon"
            />
            <View style={styles.navText}>
              {/* Layar sempit (< 360 px): nama fase tidak ditulis, ikon fase sudah mewakili. */}
              <Text variant="subheading" numberOfLines={1} testID="week-phase">
                {narrow
                  ? t('plan.weekTitle', { n: idx })
                  : t('plan.weekTitlePhase', { n: idx, phase: et(`phase.${wk.phase}` as EngineMessageKey) })}
              </Text>
              <Text variant="controlSm" color="textMuted" numberOfLines={1}>
                {t('plan.weekRangeShort', {
                  range: formatDayRange(from, to),
                  km: formatNumber(Math.round(weekKm / 1000)),
                })}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.navCenter}>
            <Text variant="subheading" align="center">
              {t('plan.weekTitle', { n: idx })}
            </Text>
            <Text variant="controlSm" color="textMuted" align="center">
              {t('plan.weekRange', {
                from: formatDayMonth(from),
                to: formatDayMonth(to),
                km: formatNumber(Math.round(weekKm / 1000)),
              })}
            </Text>
          </View>
        )}
        <IconButton
          icon="chevron-right"
          label={t('plan.nextWeek')}
          disabled={idx >= weeks.length}
          onPress={() => setSel(idx + 1)}
          testID="next-week"
        />
      </View>
      <View style={styles.days}>
        {Array.from({ length: 7 }, (_, i) => {
          const date = addDays(from, i);
          // F-21: lari jadi baris utama; strength/core di tanggal yang sama jadi baris tambahan.
          const run = workouts.find((x) => x.date === date && !isSupportType(x.type));
          const sup = workouts.find((x) => x.date === date && isSupportType(x.type));
          const w = run ?? sup;
          const isToday = date === today;
          const struck = w && (w.status === 'skipped' || w.status === 'missed');
          // Selesai: centang di lingkaran warna zona, sama dengan lajur minggu di 2.1 (LaneWeek).
          const done = w?.status === 'completed';
          return (
            <Pressable
              key={date}
              testID={`plan-day-${date}`}
              disabled={!w}
              onPress={() => w && router.push(`/workout/${w.id}`)}
              style={[styles.day, w ? styles.dayWorkout : styles.dayRest, isToday && styles.dayToday]}
            >
              <View style={styles.date}>
                <Text variant="dow" color="textMuted">
                  {weekdayShortName(i)}
                </Text>
                <Text variant="subheading">{String(Number(date.slice(8)))}</Text>
              </View>
              {icons ? (
                // UI/UX 14: ikon jenis latihan menggantikan garis warna; terlewat = pudar.
                <View style={struck ? styles.dim : null}>
                  <SpotIcon name={w ? TYPE_SPOT[w.type] : 'rest-day'} size={size.spotSm} />
                </View>
              ) : w ? (
                <LaneMark zone={TYPE_ZONE[w.type]} stretch />
              ) : (
                <View style={styles.restMark} />
              )}
              <View style={styles.body}>
                {/* Review 2026-11-07: sesi strength tambahan sebaris judul, agar setiap hari tetap 2 baris. */}
                <View style={styles.titleRow}>
                  <Text variant="row" color={w ? 'text' : 'textMuted'} style={struck ? styles.strike : null}>
                    {w ? typeName(w.type) : t('plan.rest')}
                  </Text>
                  {run && sup ? (
                    <Pressable
                      onPress={() => router.push(`/workout/${sup.id}`)}
                      accessibilityRole="button"
                      testID={`plan-strength-${date}`}
                      style={styles.supRow}
                    >
                      <LaneMark zone="strength" />
                      <Text variant="caption" color="text">
                        {t('plan.strengthLine', { type: typeName(sup.type), min: minutesOf(sup.steps) })}
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
                {w || i === 0 ? (
                  <Text variant="caption" color="textMuted">
                    {w
                      ? isSupportType(w.type)
                        ? t('plan.strengthSub', {
                            min: minutesOf(w.steps),
                            n: w.steps.filter((x) => x.kind === 'exercise').length,
                          })
                        : `${t('plan.cardSub', { min: minutesOf(w.steps), km: approxKm(w.steps) })}${hasDrill(w.steps) ? t('plan.cardDrill') : ''}`
                      : t('plan.restSub')}
                  </Text>
                ) : null}
              </View>
              {done && w ? (
                <View
                  testID={`plan-done-${date}`}
                  accessible
                  accessibilityLabel={t('detail.status.completed')}
                  style={[styles.doneMark, { backgroundColor: color.zone[TYPE_ZONE[w.type]] }]}
                >
                  <Icon name="check" size={space[4]} color={onZone(TYPE_ZONE[w.type])} strokeWidth={3} />
                </View>
              ) : null}
              {isToday ? (
                <View style={styles.tag}>
                  <Text variant="tag" style={{ color: color.bg }}>
                    {t('plan.today')}
                  </Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

/** Lebar layar yang dianggap sempit (iPhone SE 320). */
const NARROW_W = space[10] * 9;
const NAV_GAP = border.selected - border.hairline / 2;
/** Ikon fase setinggi judul minggu + baris tanggal. */
const NAV_ICON =
  (typography.subheading.lineHeight ?? space[5]) + (typography.controlSm.lineHeight ?? space[4]) + NAV_GAP;

const styles = themed(() =>
  StyleSheet.create({
    navLead: { flexShrink: 1, flexDirection: 'row', alignItems: 'center', gap: space[3] },
    navText: { flexShrink: 1, gap: NAV_GAP },
    supRow: { flexDirection: 'row', alignItems: 'center', gap: space[1] + space[1] / 2 },
    titleRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: space[2] },
    hintRow: { flexDirection: 'row', alignItems: 'center', gap: space[1] + space[1] / 2 },
    flexFill: { flex: 1 },
    head: { gap: space[1] },
    nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space[2] },
    navCenter: { alignItems: 'center', gap: border.selected - border.hairline / 2 },
    days: { gap: space[2] },
    day: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[3],
      minHeight: size.dayRow,
      paddingVertical: space[2],
      paddingLeft: space[2] + space[1] / 2,
      paddingRight: space[3] + space[1] / 2,
      borderRadius: radius.md,
    },
    dayWorkout: { backgroundColor: color.surface, ...shadow.card },
    dayRest: ring(border.control, color.line),
    dayToday: { backgroundColor: color.surface, ...ring(border.selected, color.text) },
    date: { width: space[10], alignItems: 'center' },
    body: { flex: 1, gap: border.selected - border.hairline / 2 },
    restMark: {
      width: space[1] + space[1] / 2,
      alignSelf: 'stretch',
      borderRadius: radius.stadium,
      backgroundColor: color.surfaceSunken,
    },
    strike: { textDecorationLine: 'line-through' },
    dim: { opacity: 0.45 },
    doneMark: {
      width: space[6],
      height: space[6],
      borderRadius: radius.stadium,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tag: {
      backgroundColor: color.text,
      borderRadius: radius.stadium,
      paddingHorizontal: space[2],
      paddingVertical: space[1],
    },
  }),
);
