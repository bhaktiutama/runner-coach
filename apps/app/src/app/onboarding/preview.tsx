import { paceZones, type EngineMessageKey } from '@run-coach/training-engine';
import {
  BarChart,
  BibTag,
  Card,
  color,
  Icon,
  PhaseLegend,
  radius,
  size,
  space,
  Text,
  type PhaseKey,
} from '@run-coach/ui';
import {
  formatDayMonth,
  formatDuration,
  formatNumber,
  formatPace,
  formatPaceRange,
} from '@run-coach/ui/format';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CreateAccountButtons, useAuthFlow } from '@/components/AuthPanel';
import { RationaleList } from '@/components/RationaleList';
import { useActivePlan, useCompleteSignIn } from '@/data/hooks';
import { planParams } from '@/data/rows';
import { t } from '@/i18n/t';
import { startFresh } from '@/lib/nav';
import { et } from '@/lib/rationale';

/** 1.8 Preview plan + buat akun (wireframe OB8). Login tidak mengirim data plan. */
export default function Preview() {
  const plan = useActivePlan();
  const complete = useCompleteSignIn();
  const insets = useSafeAreaInsets();
  const [whyOpen, setWhyOpen] = useState(true);
  const flow = useAuthFlow(async (uid) => {
    await complete.mutateAsync(uid);
    startFresh();
  });
  if (!plan.data) {
    return (
      <View style={styles.root}>
        <ActivityIndicator color={color.primary} />
      </View>
    );
  }
  const p = plan.data;
  const params = planParams(p);
  const weeks = params.weeks ?? [];
  const zones = paceZones(params.vdot);
  const distance = p.goal.distance;
  const title =
    distance === 'fitness'
      ? t('preview.titleFitness', { weeks: weeks.length })
      : t('preview.title', { distance: et(`distance.${distance}` as EngineMessageKey), weeks: weeks.length });
  const pred = params.prediction;
  const peakIdx = weeks.reduce((best, w, i, arr) => (w.volumeM > (arr[best]?.volumeM ?? 0) ? i : best), 0);

  return (
    <View style={styles.root} testID="screen-preview">
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.inner, { paddingTop: Math.max(space.screenTop, insets.top + space[2]) }]}>
          <View style={styles.head}>
            <Text variant="eyebrow" color="success">
              {t('preview.eyebrow')}
            </Text>
            <Text variant="titleLg">{title}</Text>
          </View>
          <View style={styles.stats}>
            <Stat
              label={t('preview.target')}
              value={pred ? formatDuration(pred.likelyS) : '-'}
              note={pred?.rough ? t('preview.rough') : undefined}
            />
            <Stat
              label={t('preview.perWeek')}
              value={t('preview.daysValue', { n: params.available_days.length })}
            />
            <Stat
              label={t('preview.race')}
              value={p.goal.race_date ? formatDayMonth(p.goal.race_date) : t('preview.noRace')}
            />
          </View>
          {params.light_mode ? <BibTag label={t('preview.light')} zone="recovery" /> : null}
          <Card style={styles.card}>
            <Text variant="label" color="textMuted">
              {t('preview.volumeTitle')}
            </Text>
            <BarChart
              highlightIndex={peakIdx}
              bars={weeks.map((w) => ({
                value: w.volumeM,
                label: formatNumber(Math.round(w.volumeM / 1000)),
                phase: w.phase as PhaseKey,
              }))}
            />
            <PhaseLegend
              items={(['base', 'build', 'peak', 'taper'] as const)
                .filter((ph) => weeks.some((w) => w.phase === ph))
                .map((ph) => ({ phase: ph, label: et(`phase.${ph}` as EngineMessageKey) }))}
            />
          </Card>
          <Card style={styles.card}>
            <Text variant="label" color="textMuted">
              {t('preview.paceTitle')}
            </Text>
            <PaceRow
              label={et('zone.easy')}
              zone="easy"
              value={formatPaceRange(zones.easy.min, zones.easy.max)}
            />
            {!params.light_mode ? (
              <>
                <PaceRow label={et('zone.tempo')} zone="tempo" value={formatPace(zones.threshold.min)} />
                <PaceRow label={et('zone.interval')} zone="interval" value={formatPace(zones.interval.min)} />
              </>
            ) : null}
          </Card>
          <Card style={styles.why}>
            <Pressable onPress={() => setWhyOpen(!whyOpen)} style={styles.whyHead} accessibilityRole="button">
              <Text variant="cardTitle">{t('preview.why')}</Text>
              <Icon name={whyOpen ? 'minus' : 'plus'} size={space[5]} />
            </Pressable>
            {whyOpen ? <RationaleList items={params.rationale} limit={4} /> : null}
          </Card>
        </View>
        <View
          style={[styles.sheet, { paddingBottom: Math.max(space.screenBottom, insets.bottom + space[2]) }]}
        >
          <View style={styles.sheetInner}>
            <Text variant="subheading">{t('preview.accountTitle')}</Text>
            <View style={styles.note}>
              <Icon name="lock" size={space[4]} color={color.textMuted} />
              <Text variant="note" color="textMuted" style={styles.flex}>
                {t('preview.accountNote')}
              </Text>
            </View>
            <CreateAccountButtons flow={flow} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <View style={styles.stat}>
      <Text variant="captionStrong" color="textMuted">
        {label}
      </Text>
      <Text variant="stat" numberOfLines={1}>
        {value}
      </Text>
      {note ? (
        <Text variant="caption" color="textMuted">
          {note}
        </Text>
      ) : null}
    </View>
  );
}

function PaceRow({
  label,
  zone,
  value,
}: {
  label: string;
  zone: 'easy' | 'tempo' | 'interval';
  value: string;
}) {
  return (
    <View style={styles.paceRow}>
      <BibTag label={label} zone={zone} />
      <Text variant="pace">{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.bg },
  flex: { flex: 1 },
  scroll: { flexGrow: 1 },
  inner: {
    width: '100%',
    maxWidth: size.contentMax + space.screenX * 2,
    alignSelf: 'center',
    gap: space[5],
    paddingHorizontal: space.screenX,
    paddingBottom: space[4],
    flex: 1,
  },
  head: { gap: space[2] },
  stats: { flexDirection: 'row', gap: space[2] },
  stat: {
    flex: 1,
    backgroundColor: color.surfaceSunken,
    borderRadius: radius.md,
    padding: space[3],
    gap: space[1],
  },
  card: { gap: space[3] },
  paceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  why: { gap: space[3] + space[1] / 2 },
  whyHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sheet: {
    backgroundColor: color.surface,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    paddingTop: space[5],
    paddingHorizontal: space.screenX,
    boxShadow: `0px -2px 0px 0px ${color.line}`,
  },
  sheetInner: { width: '100%', maxWidth: size.contentMax, alignSelf: 'center', gap: space[2] + space[1] / 2 },
  note: { flexDirection: 'row', gap: space[2], alignItems: 'flex-start' },
});
