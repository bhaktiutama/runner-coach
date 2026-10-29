import { addDays, diffDays, mondayOf, type EngineMessageKey } from '@run-coach/training-engine';
import {
  border,
  color,
  IconButton,
  LaneMark,
  PhaseBar,
  radius,
  ring,
  shadow,
  size,
  space,
  Text,
  weekdayShortName,
  type PhaseKey,
} from '@run-coach/ui';
import { formatDateFull, formatDayMonth, formatNumber } from '@run-coach/ui/format';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { useActivePlan, useToday, useWorkouts } from '@/data/hooks';
import { planParams } from '@/data/rows';
import { t } from '@/i18n/t';
import { weekIndexOf } from '@/lib/planView';
import { et } from '@/lib/rationale';
import { approxKm, hasDrill, minutesOf, TYPE_ZONE, typeName } from '@/lib/workoutView';

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
  if (!plan.data || !params) return null;
  const g = plan.data.goal;
  const workouts = ws.data ?? [];
  const weekKm = workouts.reduce((a, w) => a + (w.target_distance_m ?? 0), 0);

  return (
    <Screen testID="screen-plan" gap="plan">
      <View style={styles.head}>
        <Text variant="title">
          {g.distance === 'fitness'
            ? t('plan.titleFitness')
            : t('plan.title', { distance: et(`distance.${g.distance}` as EngineMessageKey) })}
        </Text>
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
          const w = workouts.find((x) => x.date === date);
          const isToday = date === today;
          const struck = w && (w.status === 'skipped' || w.status === 'missed');
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
              {w ? <LaneMark zone={TYPE_ZONE[w.type]} stretch /> : <View style={styles.restMark} />}
              <View style={styles.body}>
                <Text variant="row" color={w ? 'text' : 'textMuted'} style={struck ? styles.strike : null}>
                  {w ? typeName(w.type) : t('plan.rest')}
                </Text>
                {w || i === 0 ? (
                  <Text variant="caption" color="textMuted">
                    {w
                      ? `${t('plan.cardSub', { min: minutesOf(w.steps), km: approxKm(w.steps) })}${hasDrill(w.steps) ? t('plan.cardDrill') : ''}`
                      : t('plan.restSub')}
                  </Text>
                ) : null}
              </View>
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

const styles = StyleSheet.create({
  head: { gap: space[1] },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
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
  tag: {
    backgroundColor: color.text,
    borderRadius: radius.stadium,
    paddingHorizontal: space[2],
    paddingVertical: space[1],
  },
});
