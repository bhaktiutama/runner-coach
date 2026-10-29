import { addDays, diffDays, mondayOf, type EngineMessageKey } from '@run-coach/training-engine';
import {
  border,
  color,
  IconButton,
  LaneMark,
  PhaseBar,
  radius,
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

/** 3.1 Kalender plan. */
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
    <Screen testID="screen-plan">
      <Text variant="title">
        {g.distance === 'fitness'
          ? t('plan.titleFitness')
          : t('plan.title', { distance: et(`distance.${g.distance}` as EngineMessageKey) })}
      </Text>
      <Text color="textMuted">
        {g.race_date
          ? g.race_date === today
            ? t('plan.raceToday')
            : t('plan.raceIn', {
                date: formatDateFull(g.race_date),
                days: Math.max(0, diffDays(today, g.race_date)),
              })
          : t('plan.noRace', { weeks: weeks.length })}
      </Text>
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
        <View style={styles.flex}>
          <Text variant="heading" align="center">
            {t('plan.weekTitle', { n: idx })}
          </Text>
          <Text color="textMuted" align="center">
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
      {Array.from({ length: 7 }, (_, i) => {
        const date = addDays(from, i);
        const w = workouts.find((x) => x.date === date);
        const isToday = date === today;
        return (
          <Pressable
            key={date}
            testID={`plan-day-${date}`}
            disabled={!w}
            onPress={() => w && router.push(`/workout/${w.id}`)}
            style={[styles.day, w ? styles.dayWorkout : styles.dayRest, isToday && styles.dayToday]}
          >
            <View style={styles.date}>
              <Text variant="label" color="textMuted">
                {weekdayShortName(i)}
              </Text>
              <Text variant="numberMd">{String(Number(date.slice(8)))}</Text>
            </View>
            {w ? <LaneMark zone={TYPE_ZONE[w.type]} tall /> : <View style={styles.restMark} />}
            <View style={styles.flex}>
              <Text
                variant="heading"
                color={w ? 'text' : 'textMuted'}
                style={w && w.status !== 'scheduled' && w.status !== 'completed' ? styles.strike : null}
              >
                {w ? typeName(w.type) : t('plan.rest')}
              </Text>
              <Text variant="label" color="textMuted">
                {w
                  ? `${t('plan.cardSub', { min: minutesOf(w.steps), km: approxKm(w.steps) })}${hasDrill(w.steps) ? t('plan.cardDrill') : ''}`
                  : i === 0
                    ? t('plan.restSub')
                    : ''}
              </Text>
            </View>
            {isToday ? (
              <View style={styles.todayBadge}>
                <Text variant="caption" style={{ color: color.palette.cream }}>
                  {t('plan.today')}
                </Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  nav: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  day: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[4],
    padding: space[4],
    borderRadius: radius.lg,
    borderWidth: border.control,
  },
  dayWorkout: { backgroundColor: color.surface, borderColor: color.surface },
  dayRest: { borderColor: color.line },
  dayToday: { borderWidth: border.selected, borderColor: color.text },
  date: { width: space[10], alignItems: 'center' },
  restMark: {
    width: space[2] + space[1],
    height: space[10] + space[4],
    borderRadius: radius.stadium,
    backgroundColor: color.surfaceSunken,
  },
  strike: { textDecorationLine: 'line-through' },
  todayBadge: {
    backgroundColor: color.text,
    borderRadius: radius.stadium,
    paddingHorizontal: space[3],
    paddingVertical: space[1],
  },
});
