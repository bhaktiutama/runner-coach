import { paceZones, type EngineMessageKey } from '@run-coach/training-engine';
import { BibTag, Card, IconButton, space, Text } from '@run-coach/ui';
import { formatNumber, formatPaceRange } from '@run-coach/ui/format';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { useActivePlan } from '@/data/hooks';
import { planParams } from '@/data/rows';
import { t } from '@/i18n/t';
import { et } from '@/lib/rationale';

const ROWS = [
  { key: 'easy', zone: 'easy', label: 'zone.easy' },
  { key: 'marathon', zone: 'long', label: 'zone.marathon' },
  { key: 'threshold', zone: 'tempo', label: 'zone.threshold' },
  { key: 'interval', zone: 'interval', label: 'zone.interval' },
  { key: 'repetition', zone: 'interval', label: 'zone.repetition' },
] as const;

/** Ringkasan zona pace (4.1 -> Zona pace). */
export default function Zones() {
  const plan = useActivePlan();
  if (!plan.data) return <Screen>{null}</Screen>;
  const params = planParams(plan.data);
  const z = paceZones(params.vdot);
  return (
    <Screen>
      <IconButton
        icon="back"
        label={t('common.back')}
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/profile'))}
      />
      <Text variant="title">{t('zones.title')}</Text>
      <Text color="textMuted">{t('zones.subtitle', { vdot: formatNumber(params.vdot, 1) })}</Text>
      <Card>
        {ROWS.map((r) => (
          <View key={r.key} style={styles.row}>
            <BibTag label={et(r.label as EngineMessageKey)} zone={r.zone} />
            <Text variant="numberMd">{formatPaceRange(z[r.key].min, z[r.key].max)}</Text>
          </View>
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: space[2],
  },
});
