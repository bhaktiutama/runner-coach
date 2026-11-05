import { diffDays, isSupportType } from '@run-coach/training-engine';
import {
  border,
  Card,
  color,
  duration,
  fontFiles,
  ImageHeader,
  InfoBox,
  LaneWeek,
  LinkButton,
  radius,
  ring,
  space,
  StatusChip,
  Text,
  themed,
  useAnimatedNumber,
  weekdayShortName,
} from '@run-coach/ui';
import { IMAGES } from '@/lib/imagery';
import { formatDate, formatNumber } from '@run-coach/ui/format';
import { router, usePathname } from 'expo-router';
import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { HelpHint } from '@/components/HelpHint';
import { Screen } from '@/components/Screen';
import { TodayCarousel } from '@/components/TodayCarousel';
import { StrengthCard, WorkoutCard } from '@/components/WorkoutCard';
import {
  useActivePlan,
  useActivityDistance,
  useMeta,
  usePlanOps,
  usePrivacyActions,
  useToday,
  useWeekWorkouts,
} from '@/data/hooks';
import { planParams, type MetaRow, type Workout } from '@/data/rows';
import { t } from '@/i18n/t';
import { track } from '@/lib/analytics';
import { weekDates, weekIndexOf } from '@/lib/planView';
import { localDateOf } from '@/lib/today';
import { TYPE_ZONE, typeName } from '@/lib/workoutView';

/** TRD 3.3: 30 hari tanpa backup; sebelum backup pertama dihitung dari mulai plan. */
function backupDue(m: MetaRow | undefined, planStart: string, d: string) {
  if (!m || m.backup_reminder_dismissed) return false;
  const since = m.last_backup_at ? localDateOf(m.last_backup_at) : planStart;
  return diffDays(since, d) >= 30;
}

/** 2.1 Hari ini. Tata letak = wireframe Today (jarak antarblok 18). */
/** Pembukaan Today (lajur muncul bergantian + km naik) hanya sekali per sesi app (UI/UX bagian 11, G8). */
let introPlayed = false;

export default function Today() {
  const today = useToday();
  const plan = useActivePlan();
  const week = useWeekWorkouts(plan.data?.id, today);
  const dates = weekDates(today);
  const done = useActivityDistance(dates[0]!, dates[6]!);
  const visible = usePathname() === '/';
  // Diputar saat Today pertama kali terlihat dan data sudah ada.
  const playIntro = useRef(!introPlayed);
  useEffect(() => {
    if (visible && done.data !== undefined) introPlayed = true;
  }, [visible, done.data]);
  const km = useAnimatedNumber(
    Math.round((done.data ?? 0) / 100) / 10,
    playIntro.current ? 'count' : 'none',
    playIntro.current ? { from: 0, delay: duration.base } : {},
  );
  const meta = useMeta();
  const ops = usePlanOps();
  const privacy = usePrivacyActions();
  if (!plan.data) return null;
  const params = planParams(plan.data);
  const wIdx = weekIndexOf(params, today);
  const all = week.data ?? [];
  // F-21: strength/core tampil sebagai kartu kedua; lajur minggu dan sisa minggu memakai lari.
  const workouts = all.filter((w) => !isSupportType(w.type));
  const support = all.filter((w) => isSupportType(w.type));
  const todays = workouts.filter((w) => w.date === today);
  const current = todays.find((w) => w.status === 'scheduled') ?? todays[0];
  const strengthToday = support.find((w) => w.date === today);
  const paused = plan.data.status === 'paused';
  const raceDay = plan.data.goal.race_date === today;
  const target = workouts.reduce((a, w) => a + (w.target_distance_m ?? 0), 0);
  const next = workouts.find((w) => w.date > today && w.status === 'scheduled') ?? null;

  return (
    <Screen testID="screen-today" gap="today">
      <View style={styles.header}>
        <View style={styles.titleCol}>
          <Text variant="controlStrong" color="textMuted">
            {formatDate(today)}
          </Text>
          <Text variant="title">{t('today.title')}</Text>
        </View>
        {wIdx ? (
          <StatusChip tone="neutral" label={t('today.week', { n: wIdx, total: params.weeks?.length ?? 0 })} />
        ) : null}
      </View>
      {!paused && !raceDay ? (
        <TodayCarousel
          today={today}
          plan={plan.data}
          planTargetM={(params.weeks ?? []).reduce((s, w) => s + w.volumeM, 0)}
        />
      ) : null}
      {backupDue(meta.data, plan.data.start_date, today) ? (
        <Card variant="outline" testID="backup-card" style={styles.backup}>
          <Text variant="row">
            {meta.data?.last_backup_at
              ? t('today.backupTitle', { days: diffDays(localDateOf(meta.data.last_backup_at), today) })
              : t('today.backupTitleNever')}
          </Text>
          <Text variant="bodySm" color="textMuted">
            {t('today.backupBody')}
          </Text>
          <View style={styles.backupRow}>
            <LinkButton
              size="sm"
              label={t('today.backupCta')}
              onPress={() => void privacy.exportFile.mutateAsync(today)}
            />
            <LinkButton
              size="sm"
              tone="text"
              label={t('today.backupDismiss')}
              onPress={() => privacy.setBackupReminder.mutate(true)}
            />
          </View>
        </Card>
      ) : null}
      {paused ? (
        <Card testID="paused" style={styles.rest}>
          <Text variant="title">{t('today.paused')}</Text>
          <Text variant="bodySm" color="textMuted">
            {t('today.pausedBody')}
          </Text>
          <LinkButton
            size="sm"
            label={t('today.resume')}
            testID="today-resume"
            onPress={async () => {
              await ops.resume.mutateAsync(today);
              track('plan_resumed');
            }}
          />
        </Card>
      ) : raceDay ? (
        <InfoBox tone="ok">{t('today.raceDay')}</InfoBox>
      ) : current ? (
        <WorkoutCard
          workout={current}
          startLabel={current.status === 'completed' ? t('today.extra') : t('today.start')}
          onStart={() => router.push(current.status === 'completed' ? '/log' : `/timer/${current.id}`)}
          onDetails={() => router.push(`/workout/${current.id}`)}
        />
      ) : (
        <RestCard next={next} />
      )}
      {strengthToday && !paused && !raceDay ? (
        <StrengthCard
          workout={strengthToday}
          onStart={() => router.push(`/timer/${strengthToday.id}`)}
          onDetails={() => router.push(`/workout/${strengthToday.id}`)}
        />
      ) : null}
      <View style={styles.week}>
        <View style={styles.weekHead}>
          <View style={styles.hintRow}>
            <Text variant="controlStrong">{t('today.thisWeek')}</Text>
            <HelpHint topic="volume" term={t('today.thisWeek')} />
          </View>
          <Text variant="control" color="textMuted" testID="week-km">
            <Text variant="control" style={styles.weekDone}>
              {formatNumber(km, 1)}
            </Text>
            {t('today.weekKmRest', { target: formatNumber(Math.round(target / 1000)) })}
          </Text>
        </View>
        <LaneWeek
          animate={playIntro.current}
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
              badge: support.some((x) => x.date === d) ? t('strength.badge') : undefined,
              onPress: w
                ? () => router.push(`/workout/${w.id}`)
                : support.find((x) => x.date === d)
                  ? () => router.push(`/workout/${support.find((x) => x.date === d)!.id}`)
                  : undefined,
            };
          })}
        />
      </View>
      <LinkButton
        size="sm"
        tone="text"
        label={t('today.manualLog')}
        icon="edit"
        onPress={() => router.push('/log')}
        testID="manual-log"
      />
      {process.env.EXPO_OS === 'web' ? (
        <Text variant="caption" color="textMuted" align="center">
          {t('today.webWarning')}
        </Text>
      ) : null}
    </Screen>
  );
}

function RestCard({ next }: { next: Workout | null }) {
  return (
    <Card testID="rest-card" style={styles.rest}>
      <ImageHeader source={IMAGES.trackAerial} />
      <Text variant="title">{t('today.restTitle')}</Text>
      <Text variant="bodySm" color="textMuted">
        {t('today.restBody')}
      </Text>
      {next ? (
        <LinkButton
          size="sm"
          label={t('today.next', { type: typeName(next.type), date: formatDate(next.date) })}
          onPress={() => router.push(`/workout/${next.id}`)}
        />
      ) : null}
    </Card>
  );
}

const styles = themed(() =>
  StyleSheet.create({
    hintRow: { flexDirection: 'row', alignItems: 'center', gap: space[1] + space[1] / 2 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    titleCol: { gap: space[1] },
    week: {
      gap: space[3],
      padding: space[4],
      borderRadius: radius.lg,
      backgroundColor: color.surface,
      ...ring(border.hairline, color.line),
    },
    weekHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    weekDone: { fontFamily: fontFiles.display700, color: color.text },
    // UI/UX 12: gambar track-aerial menggantikan garis kiri recovery.
    rest: { gap: space[2] },
    backup: { gap: space[2] },
    backupRow: { flexDirection: 'row', gap: space[3] },
  }),
);
