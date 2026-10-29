import { paceZones, type EngineMessageKey } from '@run-coach/training-engine';
import { BarChart, BibTag, Card, color, Icon, radius, space, Text, type PhaseKey } from '@run-coach/ui';
import {
  formatDayMonth,
  formatNumber,
  formatPace,
  formatPaceRange,
  formatRaceTime,
} from '@run-coach/ui/format';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { AuthPanel } from '@/components/AuthPanel';
import { RationaleList } from '@/components/RationaleList';
import { Screen } from '@/components/Screen';
import { useActivePlan, useCompleteSignIn } from '@/data/hooks';
import { planParams } from '@/data/rows';
import { t } from '@/i18n/t';
import { et } from '@/lib/rationale';

/** 1.8 Preview plan + buat akun. Login tidak mengirim data plan (data tetap lokal). */
export default function Preview() {
  const plan = useActivePlan();
  const complete = useCompleteSignIn();
  const [whyOpen, setWhyOpen] = useState(true);
  if (!plan.data) {
    return (
      <Screen>
        <ActivityIndicator color={color.primary} />
      </Screen>
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
    <Screen testID="screen-preview">
      <Text variant="label" color="success">
        {t('preview.eyebrow')}
      </Text>
      <Text variant="display">{title}</Text>
      <View style={styles.stats}>
        <Stat
          label={t('preview.target')}
          value={pred ? formatRaceTime(pred.likelyS) : '-'}
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
      <Card>
        <Text variant="heading">{t('preview.volumeTitle')}</Text>
        <BarChart
          highlightIndex={peakIdx}
          bars={weeks.map((w) => ({
            value: w.volumeM,
            label: formatNumber(Math.round(w.volumeM / 1000)),
            phase: w.phase as PhaseKey,
          }))}
        />
        <View style={styles.legend}>
          {(['base', 'build', 'peak', 'taper'] as const)
            .filter((ph) => weeks.some((w) => w.phase === ph))
            .map((ph) => (
              <View key={ph} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: color.phase[ph] }]} />
                <Text variant="label" color="textMuted">
                  {et(`phase.${ph}` as EngineMessageKey)}
                </Text>
              </View>
            ))}
        </View>
      </Card>
      <Card>
        <Text variant="heading">{t('preview.paceTitle')}</Text>
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
      <Card>
        <Pressable onPress={() => setWhyOpen(!whyOpen)} style={styles.whyHead} accessibilityRole="button">
          <Text variant="heading" style={styles.flex}>
            {t('preview.why')}
          </Text>
          <Icon name={whyOpen ? 'minus' : 'plus'} />
        </Pressable>
        {whyOpen ? <RationaleList items={params.rationale} limit={4} /> : null}
      </Card>
      <View style={styles.sheet}>
        <Text variant="title">{t('preview.accountTitle')}</Text>
        <View style={styles.note}>
          <Icon name="lock" size={space[5]} color={color.textMuted} />
          <Text variant="label" color="textMuted" style={styles.flex}>
            {t('preview.accountNote')}
          </Text>
        </View>
        <AuthPanel
          variant="create"
          onSignedIn={async (uid) => {
            await complete.mutateAsync(uid);
            router.replace('/');
          }}
        />
      </View>
    </Screen>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <View style={styles.stat}>
      <Text variant="label" color="textMuted">
        {label}
      </Text>
      <Text variant="numberMd">{value}</Text>
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
      <Text variant="numberMd">{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  stats: { flexDirection: 'row', gap: space[3] },
  stat: {
    flex: 1,
    backgroundColor: color.surfaceSunken,
    borderRadius: radius.md,
    padding: space[3],
    gap: space[1],
  },
  legend: { flexDirection: 'row', justifyContent: 'space-between', marginTop: space[3] },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  legendDot: { width: space[3], height: space[3], borderRadius: radius.bib / 2 },
  paceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: space[2],
  },
  whyHead: { flexDirection: 'row', alignItems: 'center' },
  sheet: {
    backgroundColor: color.surface,
    borderRadius: radius.sheet,
    padding: space[5],
    gap: space[3],
    marginTop: space[4],
  },
  note: { flexDirection: 'row', gap: space[2], alignItems: 'flex-start' },
});
