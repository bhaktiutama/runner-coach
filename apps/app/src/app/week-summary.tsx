import { addDays, diffDays, mondayOf, type Change, type EngineMessageKey } from '@run-coach/training-engine';
import {
  color,
  Confetti,
  Icon,
  IconButton,
  InfoBox,
  radius,
  SecondaryButton,
  shadow,
  size,
  space,
  SpotIcon,
  Text,
  TextColorContext,
  TrackRing,
  themed,
} from '@run-coach/ui';
import { formatDistance, formatTotalDuration } from '@run-coach/ui/format';
import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { StatLabel } from '@/components/StatLabel';
import { useSpotIcons } from '@/lib/spot';
import { PHASE_SPOT } from '@/lib/spotMap';
import { achievements } from '@/lib/achievements';
import {
  useActivePlan,
  useActivities,
  usePlanOps,
  useProposals,
  useToday,
  useWeekWorkouts,
  useWorkoutStatuses,
} from '@/data/hooks';
import { planParams } from '@/data/rows';
import { t, type MessageKey } from '@/i18n/t';
import { track } from '@/lib/analytics';
import { goHome } from '@/lib/nav';
import { weekIndexOf } from '@/lib/planView';
import { et, rationaleText } from '@/lib/rationale';
import { IMAGES } from '@/lib/imagery';

function changeRow(c: Change): [MessageKey, string] | null {
  switch (c.kind) {
    case 'volume':
      return ['week.change.volume', t('week.change.volumeValue', { pct: Math.abs(c.pct) })];
    case 'hard_to_easy':
      return ['week.change.hardToEasy', t('week.change.hardToEasyValue')];
    case 'pace_up':
      return ['week.change.paceUp', t('week.change.paceUpValue')];
    case 'repeat_week':
      return ['week.change.repeat', t('week.change.repeatValue')];
    case 'return_week':
      return ['week.change.return', t('week.change.returnValue')];
    case 'time_trial':
      return ['week.change.timeTrial', t('week.change.timeTrialValue')];
  }
}

/** 2.5 Ringkasan minggu + usulan adaptasi (F-11, FL-4). "Bagikan kartu ringkasan" -> 2.7 (F-29, wireframe WeekDone). */
export default function WeekSummary() {
  const today = useToday();
  const weekStart = mondayOf(today);
  const plan = useActivePlan();
  const week = useWeekWorkouts(plan.data?.id, today);
  const acts = useActivities(addDays(weekStart, -7));
  const proposals = useProposals(today, weekStart);
  const ops = usePlanOps();
  const [decided, setDecided] = useState<Record<string, boolean>>({});
  const icons = useSpotIcons();
  const statuses = useWorkoutStatuses(plan.data?.id);
  const allActs = useActivities();
  const fresh = useMemo(() => {
    if (!plan.data) return [];
    const st = statuses.data ?? [];
    const as = allActs.data ?? [];
    const now = achievements({ acts: as, statuses: st, today, planEnd: plan.data.end_date });
    const before = achievements({
      acts: as.filter((a) => a.date < weekStart),
      statuses: st.filter((x) => x.date < weekStart),
      today: addDays(weekStart, -1),
      planEnd: plan.data.end_date,
    });
    return now.filter((a, i) => a.earned && !before[i]!.earned);
  }, [plan.data, statuses.data, allActs.data, today, weekStart]);
  const stats = useMemo(() => {
    const list = acts.data ?? [];
    const sum = (from: string, to: string, f: 'distance_m' | 'duration_s') =>
      list.filter((a) => a.date >= from && a.date <= to).reduce((s, a) => s + (a[f] ?? 0), 0);
    return {
      dist: sum(weekStart, addDays(weekStart, 6), 'distance_m'),
      prev: sum(addDays(weekStart, -7), addDays(weekStart, -1), 'distance_m'),
      time: sum(weekStart, addDays(weekStart, 6), 'duration_s'),
    };
  }, [acts.data, weekStart]);
  if (!plan.data) return <Screen>{null}</Screen>;
  const ws = week.data ?? [];
  const done = ws.filter((w) => w.status === 'completed').length;
  const params = planParams(plan.data);
  const idx = weekIndexOf(params, today) ?? 1;
  const g = plan.data.goal;
  const target = ws.reduce((s, w) => s + (w.target_duration_s ?? 0), 0);
  const delta = stats.dist - stats.prev;
  const phase = params.weeks?.[idx - 1]?.phase;

  return (
    <Screen
      testID="screen-week"
      hero={{ source: IMAGES.trackOverhead, keepFirst: true }}
      footer={
        <SecondaryButton
          label={t('share.open.week')}
          icon="share"
          onPress={() => router.push({ pathname: '/share', params: { kind: 'week', date: today } })}
          testID="share-open"
        />
      }
    >
      <IconButton
        icon="close"
        label={t('week.close')}
        onPress={() => (router.canGoBack() ? router.back() : goHome())}
      />
      <View style={styles.center}>
        <View>
          <TrackRing
            width={space[10] * 5 + space[5]}
            height={space[10] * 3 + space[2]}
            stroke={space[3] + space[1] / 2}
            progress={ws.length ? done / ws.length : 0}
            animateIn
            color={color.success}
            trackColor={color.surfaceSunken}
          >
            <Text variant="display">{t('week.done', { done, total: ws.length })}</Text>
            <Text variant="controlSm" color="textMuted">
              {t('week.doneLabel')}
            </Text>
          </TrackRing>
          {ws.length > 0 && done === ws.length ? <Confetti /> : null}
        </View>
        <Text variant="title" align="center">
          {done === ws.length ? t('week.title', { n: idx }) : t('week.titlePartial', { n: idx })}
        </Text>
        {icons && phase ? (
          <View style={styles.phaseRow} testID="week-phase">
            <SpotIcon
              name={PHASE_SPOT[phase as keyof typeof PHASE_SPOT] ?? 'phase-base'}
              size={size.spotXs}
            />
            <Text variant="controlStrong">
              {t('week.phase', { phase: et(`phase.${phase}` as EngineMessageKey) })}
            </Text>
          </View>
        ) : null}
        {g.race_date ? (
          <Text variant="control" color="textMuted" align="center">
            {t('week.toRace', {
              weeks: Math.max(0, Math.ceil(diffDays(today, g.race_date) / 7)),
              distance: et(`distance.${g.distance}` as EngineMessageKey),
            })}
          </Text>
        ) : null}
      </View>
      {icons && fresh.length ? (
        // F-28: badge yang baru didapat minggu ini (belum didapat sebelum Senin).
        <View style={styles.fresh} testID="week-badges">
          <Text variant="label" color="textMuted" align="center">
            {t('week.newBadges')}
          </Text>
          <View style={styles.freshRow}>
            {fresh.map((a) => (
              <View key={a.id} style={styles.freshItem}>
                <SpotIcon name={a.spot} size={size.spotLg} />
                <Text variant="controlSmStrong" align="center">
                  {t(`achv.${a.id}` as MessageKey)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}
      <View style={styles.pair}>
        <View style={styles.stat}>
          <StatLabel label={t('week.distance')} spot="distance" />
          <Text variant="statLg">{formatDistance(stats.dist)}</Text>
          <Text variant="captionStrong" color={delta >= 0 ? 'success' : 'textMuted'}>
            {t('week.vsLast', { delta: `${delta >= 0 ? '+' : '-'}${formatDistance(Math.abs(delta))}` })}
          </Text>
        </View>
        <View style={styles.stat}>
          <StatLabel label={t('week.time')} spot="get-ready" />
          <Text variant="statLg">{formatTotalDuration(stats.time)}</Text>
          <Text variant="caption" color="textMuted">
            {t('week.target', { time: formatTotalDuration(target) })}
          </Text>
        </View>
      </View>
      {(proposals.data ?? []).map((p) =>
        p.rule in decided ? (
          <InfoBox key={p.rule} tone="ok">
            {decided[p.rule] ? t('week.applied') : t('week.kept')}
          </InfoBox>
        ) : (
          <View key={p.rule} style={styles.adjust} testID={`proposal-${p.rule}`}>
            <TextColorContext.Provider value="onStatus">
              <View style={styles.adjustHead}>
                <Icon name="sync" size={space[5]} color={color.status.onStatus} />
                <Text variant="cardTitle">{t('week.adjustTitle')}</Text>
              </View>
              <Text variant="bodySm">{rationaleText(p.rationale)}</Text>
              <View style={styles.changes}>
                <TextColorContext.Provider value="text">
                  {p.changes.map((c, i) => {
                    const r = changeRow(c);
                    return r ? (
                      <View key={i} style={styles.changeRow}>
                        <Text variant="bodySm">{t(r[0])}</Text>
                        <Text variant="controlStrong">{r[1]}</Text>
                      </View>
                    ) : null;
                  })}
                </TextColorContext.Provider>
              </View>
              {/* Tombol bertumpuk lebar penuh: label panjang (EN "Keep the original plan") tidak terpotong. */}
              <View style={styles.actions}>
                <Pressable
                  accessibilityRole="button"
                  testID="apply"
                  style={[styles.btn, styles.btnDark]}
                  onPress={async () => {
                    await ops.decide.mutateAsync({ weekStart, proposal: p, accept: true, today });
                    track('adjustment_decided', { rule: p.rule, accepted: true });
                    setDecided((d) => ({ ...d, [p.rule]: true }));
                  }}
                >
                  <Text variant="row" style={{ color: color.bg }}>
                    {t('week.apply')}
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  testID="keep"
                  style={[styles.btn, styles.btnLight]}
                  onPress={async () => {
                    await ops.decide.mutateAsync({ weekStart, proposal: p, accept: false, today });
                    track('adjustment_decided', { rule: p.rule, accepted: false });
                    setDecided((d) => ({ ...d, [p.rule]: false }));
                  }}
                >
                  <Text variant="row" color="text">
                    {t('week.keep')}
                  </Text>
                </Pressable>
              </View>
            </TextColorContext.Provider>
          </View>
        ),
      )}
    </Screen>
  );
}

const styles = themed(() =>
  StyleSheet.create({
    center: { alignItems: 'center', gap: space[3] },
    pair: { flexDirection: 'row', gap: space[2] },
    phaseRow: { flexDirection: 'row', alignItems: 'center', gap: space[2], marginTop: -space[1] },
    fresh: { gap: space[2] },
    freshRow: { flexDirection: 'row', justifyContent: 'center', gap: space[6] },
    freshItem: { alignItems: 'center', gap: space[1], maxWidth: space[10] * 3 },
    stat: {
      flex: 1,
      backgroundColor: color.surface,
      borderRadius: radius.lg,
      padding: space[3] + space[1] / 2,
      gap: space[1],
      ...shadow.card,
    },
    adjust: {
      backgroundColor: color.status.recovery,
      borderRadius: radius.lg,
      padding: space[4] + space[1] / 2,
      gap: space[3],
    },
    adjustHead: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
    changes: { backgroundColor: color.surface, borderRadius: radius.md, padding: space[3], gap: space[2] },
    changeRow: { flexDirection: 'row', justifyContent: 'space-between' },
    actions: { gap: space[2] },
    btn: {
      alignSelf: 'stretch',
      minHeight: size.buttonSecondary,
      paddingHorizontal: space[4],
      borderRadius: radius.stadium,
      alignItems: 'center',
      justifyContent: 'center',
    },
    btnDark: { backgroundColor: color.text },
    btnLight: { backgroundColor: color.surface },
  }),
);
