import {
  Card,
  color,
  InfoBox,
  LaneWeek,
  LinkButton,
  space,
  StatusChip,
  Text,
  weekdayShortName,
} from '@run-coach/ui';
import { formatDate, formatNumber } from '@run-coach/ui/format';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { WorkoutCard } from '@/components/WorkoutCard';
import { diffDays } from '@run-coach/training-engine';
import {
  useActivePlan,
  useActivityDistance,
  useMeta,
  usePlanOps,
  usePrivacyActions,
  useToday,
  useWeekWorkouts,
} from '@/data/hooks';
import { localDateOf } from '@/lib/today';
import { track } from '@/lib/analytics';
import { planParams, type Workout } from '@/data/rows';
import { t } from '@/i18n/t';
import { weekDates, weekIndexOf } from '@/lib/planView';
import { TYPE_ZONE, typeName } from '@/lib/workoutView';

/** 2.1 Hari ini. */
export default function Today() {
  const today = useToday();
  const plan = useActivePlan();
  const week = useWeekWorkouts(plan.data?.id, today);
  const dates = weekDates(today);
  const done = useActivityDistance(dates[0]!, dates[6]!);
  const meta = useMeta();
  const ops = usePlanOps();
  const privacy = usePrivacyActions();
  if (!plan.data) return null;
  const params = planParams(plan.data);
  const wIdx = weekIndexOf(params, today);
  const workouts = week.data ?? [];
  const todays = workouts.filter((w) => w.date === today);
  const current = todays.find((w) => w.status === 'scheduled') ?? todays[0];
  const paused = plan.data.status === 'paused';
  const raceDay = plan.data.goal.race_date === today;
  const target = workouts.reduce((a, w) => a + (w.target_distance_m ?? 0), 0);

  return (
    <Screen testID="screen-today">
      <View style={styles.header}>
        <View style={styles.flex}>
          <Text color="textMuted">{formatDate(today)}</Text>
          <Text variant="title">{t('today.title')}</Text>
        </View>
        {wIdx ? (
          <StatusChip tone="neutral" label={t('today.week', { n: wIdx, total: params.weeks?.length ?? 0 })} />
        ) : null}
      </View>
      {process.env.EXPO_OS === 'web' ? (
        <Text variant="caption" color="textMuted">
          {t('today.webWarning')}
        </Text>
      ) : null}
      {backupDue(meta.data, today) ? (
        <Card variant="outline" testID="backup-card" style={styles.backup}>
          <Text variant="heading">
            {meta.data?.last_backup_at
              ? t('today.backupTitle', { days: diffDays(localDateOf(meta.data.last_backup_at), today) })
              : t('today.backupTitleNever')}
          </Text>
          <Text color="textMuted">{t('today.backupBody')}</Text>
          <View style={styles.backupRow}>
            <LinkButton
              label={t('today.backupCta')}
              onPress={() => void privacy.exportFile.mutateAsync(today)}
            />
            <LinkButton
              label={t('today.backupDismiss')}
              onPress={() => privacy.setBackupReminder.mutate(true)}
            />
          </View>
        </Card>
      ) : null}
      {paused ? (
        <Card testID="paused" style={styles.rest}>
          <Text variant="title">{t('today.paused')}</Text>
          <Text color="textMuted">{t('today.pausedBody')}</Text>
          <LinkButton
            label={t('today.resume')}
            testID="today-resume"
            onPress={async () => {
              await ops.resume.mutateAsync(today);
              track('plan_resumed');
            }}
          />
        </Card>
      ) : raceDay ? (
        <InfoBox tone="ok">
          <Text>{t('today.raceDay')}</Text>
        </InfoBox>
      ) : current ? (
        <WorkoutCard
          workout={current}
          startLabel={current.status === 'completed' ? t('today.extra') : t('today.start')}
          onStart={() => router.push(current.status === 'completed' ? '/log' : `/timer/${current.id}`)}
          onDetails={() => router.push(`/workout/${current.id}`)}
        />
      ) : (
        <RestCard next={nextWorkout(workouts, today)} />
      )}
      <Card variant="outline" style={styles.week}>
        <View style={styles.weekHead}>
          <Text variant="heading">{t('today.thisWeek')}</Text>
          <Text variant="numberMd" testID="week-km">
            {t('today.weekKm', {
              done: formatNumber(Math.round((done.data ?? 0) / 100) / 10, 1),
              target: formatNumber(Math.round(target / 1000)),
            })}
          </Text>
        </View>
        <LaneWeek
          days={dates.map((d, i) => {
            const w = workouts.find((x) => x.date === d);
            return {
              label: weekdayShortName(i),
              zone: w ? TYPE_ZONE[w.type] : null,
              state: !w
                ? 'rest'
                : w.status === 'completed'
                  ? 'completed'
                  : w.status === 'missed' || w.status === 'skipped'
                    ? 'missed'
                    : 'scheduled',
              today: d === today,
              onPress: w ? () => router.push(`/workout/${w.id}`) : undefined,
            };
          })}
        />
      </Card>
      <LinkButton
        label={t('today.manualLog')}
        icon="edit"
        onPress={() => router.push('/log')}
        testID="manual-log"
      />
    </Screen>
  );

  function backupDue(m: typeof meta.data, d: string) {
    if (!m || m.backup_reminder_dismissed) return false;
    // TRD 3.3: 30 hari tanpa backup; sebelum backup pertama dihitung dari mulai plan.
    const since = m.last_backup_at ? localDateOf(m.last_backup_at) : plan.data!.start_date;
    return diffDays(since, d) >= 30;
  }

  function nextWorkout(ws: typeof workouts, from: string) {
    return ws.find((w) => w.date > from && w.status === 'scheduled') ?? null;
  }
}

function RestCard({ next }: { next: Workout | null }) {
  return (
    <Card testID="rest-card" style={styles.rest}>
      <Text variant="title">{t('today.restTitle')}</Text>
      <Text color="textMuted">{t('today.restBody')}</Text>
      {next ? (
        <LinkButton
          label={t('today.next', { type: typeName(next.type), date: formatDate(next.date) })}
          onPress={() => router.push(`/workout/${next.id}`)}
        />
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: space[3] },
  week: { gap: space[4] },
  weekHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rest: { gap: space[2], borderLeftWidth: space[2], borderLeftColor: color.status.recovery },
  backup: { gap: space[2] },
  backupRow: { flexDirection: 'row', gap: space[3] },
});
