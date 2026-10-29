import { addDays, diffDays, mondayOf, type Change, type EngineMessageKey } from '@run-coach/training-engine';
import {
  color,
  IconButton,
  InfoBox,
  PrimaryButton,
  radius,
  SecondaryButton,
  space,
  Text,
  TrackRing,
} from '@run-coach/ui';
import { formatDistance, formatTotalDuration } from '@run-coach/ui/format';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen } from '@/components/Screen';
import {
  useActivePlan,
  useActivities,
  usePlanOps,
  useProposals,
  useToday,
  useWeekWorkouts,
} from '@/data/hooks';
import { planParams } from '@/data/rows';
import { t, type MessageKey } from '@/i18n/t';
import { track } from '@/lib/analytics';
import { goHome } from '@/lib/nav';
import { weekIndexOf } from '@/lib/planView';
import { et, rationaleText } from '@/lib/rationale';

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

/** 2.5 Ringkasan minggu + usulan adaptasi (F-11, FL-4). Tombol bagikan disembunyikan di MVP. */
export default function WeekSummary() {
  const today = useToday();
  const weekStart = mondayOf(today);
  const plan = useActivePlan();
  const week = useWeekWorkouts(plan.data?.id, today);
  const acts = useActivities(addDays(weekStart, -7));
  const proposals = useProposals(today, weekStart);
  const ops = usePlanOps();
  const [decided, setDecided] = useState<Record<string, boolean>>({});
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

  return (
    <Screen testID="screen-week">
      <IconButton icon="close" label={t('week.close')} onPress={() => goHome()} />
      <View style={styles.center}>
        <TrackRing
          width={space[10] * 6}
          height={space[10] * 3 + space[8]}
          progress={ws.length ? done / ws.length : 0}
          color={color.success}
          trackColor={color.surfaceSunken}
        >
          <Text variant="numberXl">{t('week.done', { done, total: ws.length })}</Text>
          <Text color="textMuted">{t('week.doneLabel')}</Text>
        </TrackRing>
        <Text variant="title" align="center">
          {done === ws.length ? t('week.title', { n: idx }) : t('week.titlePartial', { n: idx })}
        </Text>
        {g.race_date ? (
          <Text color="textMuted" align="center">
            {t('week.toRace', {
              weeks: Math.max(0, Math.ceil(diffDays(today, g.race_date) / 7)),
              distance: et(`distance.${g.distance}` as EngineMessageKey),
            })}
          </Text>
        ) : null}
      </View>
      <View style={styles.pair}>
        <View style={styles.stat}>
          <Text variant="label" color="textMuted">
            {t('week.distance')}
          </Text>
          <Text variant="numberMd">{formatDistance(stats.dist)}</Text>
          <Text variant="label" color={delta >= 0 ? 'success' : 'textMuted'}>
            {t('week.vsLast', { delta: `${delta >= 0 ? '+' : '-'}${formatDistance(Math.abs(delta))}` })}
          </Text>
        </View>
        <View style={styles.stat}>
          <Text variant="label" color="textMuted">
            {t('week.time')}
          </Text>
          <Text variant="numberMd">{formatTotalDuration(stats.time)}</Text>
          <Text variant="label" color="textMuted">
            {t('week.target', { time: formatTotalDuration(target) })}
          </Text>
        </View>
      </View>
      {(proposals.data ?? []).map((p) =>
        p.rule in decided ? (
          <InfoBox key={p.rule} tone="ok">
            <Text>{decided[p.rule] ? t('week.applied') : t('week.kept')}</Text>
          </InfoBox>
        ) : (
          <View key={p.rule} style={styles.adjust} testID={`proposal-${p.rule}`}>
            <Text variant="heading">{t('week.adjustTitle')}</Text>
            <Text>{rationaleText(p.rationale)}</Text>
            <View style={styles.changes}>
              {p.changes.map((c, i) => {
                const r = changeRow(c);
                return r ? (
                  <View key={i} style={styles.changeRow}>
                    <Text>{t(r[0])}</Text>
                    <Text variant="heading">{r[1]}</Text>
                  </View>
                ) : null;
              })}
            </View>
            <View style={styles.pair}>
              <View style={styles.flex}>
                <PrimaryButton
                  variant="dark"
                  label={t('week.apply')}
                  testID="apply"
                  onPress={async () => {
                    await ops.decide.mutateAsync({ weekStart, proposal: p, accept: true, today });
                    track('adjustment_decided', { rule: p.rule, accepted: true });
                    setDecided((d) => ({ ...d, [p.rule]: true }));
                  }}
                />
              </View>
              <View style={styles.flex}>
                <SecondaryButton
                  label={t('week.keep')}
                  testID="keep"
                  onPress={async () => {
                    await ops.decide.mutateAsync({ weekStart, proposal: p, accept: false, today });
                    track('adjustment_decided', { rule: p.rule, accepted: false });
                    setDecided((d) => ({ ...d, [p.rule]: false }));
                  }}
                />
              </View>
            </View>
          </View>
        ),
      )}
      <PrimaryButton label={t('week.toToday')} onPress={() => goHome()} />
      <SecondaryButton label={t('week.toPlan')} onPress={() => (goHome(), router.navigate('/plan'))} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { alignItems: 'center', gap: space[3] },
  pair: { flexDirection: 'row', gap: space[3] },
  stat: {
    flex: 1,
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    padding: space[4],
    gap: space[1],
  },
  adjust: {
    backgroundColor: color.status.recovery,
    borderRadius: radius.lg,
    padding: space[5],
    gap: space[3],
  },
  changes: { backgroundColor: color.surface, borderRadius: radius.md, padding: space[4], gap: space[2] },
  changeRow: { flexDirection: 'row', justifyContent: 'space-between' },
});
