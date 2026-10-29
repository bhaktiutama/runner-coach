import { assessGoal, MIN_LONGEST_M, type EngineMessageKey } from '@run-coach/training-engine';
import { Chip, InfoBox, SecondaryButton, space, Stepper, Text } from '@run-coach/ui';
import { StyleSheet, View } from 'react-native';
import { OnboardingStep } from '@/components/OnboardingStep';
import { useToday } from '@/data/hooks';
import { useOnboarding } from '@/data/useOnboarding';
import { t, type MessageKey } from '@/i18n/t';
import { et } from '@/lib/rationale';

const QUICK: { key: MessageKey; km: number }[] = [
  { key: 'volume.chip.none', km: 0 },
  { key: 'volume.chip.lt10', km: 6 },
  { key: 'volume.chip.10to20', km: 15 },
  { key: 'volume.chip.20to40', km: 30 },
  { key: 'volume.chip.gt40', km: 45 },
];
const LONGEST = [0, 3, 5, 7, 10];

const bucket = (km: number) => (km === 0 ? 0 : km < 10 ? 6 : km <= 20 ? 15 : km <= 40 ? 30 : 45);

/** 1.5 Volume mingguan + lari terjauh 4 minggu. */
export default function VolumeStep() {
  const o = useOnboarding('volume');
  const today = useToday();
  const d = o.draft;
  const km = d.weeklyVolumeKm ?? 0;
  const longest = d.longestRunKm;
  const a =
    d.distance && longest != null
      ? assessGoal({ distance: d.distance, raceDate: null, startDate: today, longestRunM: longest * 1000 })
      : null;
  const shorter = a?.shorterTarget ? et(`distance.${a.shorterTarget}` as EngineMessageKey) : null;

  return (
    <OnboardingStep
      step="volume"
      title={t('volume.title')}
      subtitle={t('volume.subtitle')}
      canNext={o.ready && longest != null}
      loading={o.saving}
      onNext={() => void o.next({ weeklyVolumeKm: km })}
    >
      <Stepper
        value={km}
        unitLabel={t('volume.unit')}
        min={0}
        max={150}
        decLabel={t('volume.dec')}
        incLabel={t('volume.inc')}
        onChange={(v) => o.update({ weeklyVolumeKm: v })}
      />
      <View style={styles.chips}>
        {QUICK.map((q) => (
          <Chip
            key={q.key}
            label={t(q.key)}
            selected={bucket(km) === q.km}
            onPress={() => o.update({ weeklyVolumeKm: q.km })}
          />
        ))}
      </View>
      <Text variant="label" color="textMuted">
        {t('volume.longestLabel')}
      </Text>
      <View style={styles.chips}>
        {LONGEST.map((l) => (
          <Chip
            key={l}
            testID={`longest-${l}`}
            label={
              l === 0
                ? t('volume.longest.0')
                : l === 10
                  ? t('volume.longest.10')
                  : t('volume.longest.km', { km: l })
            }
            selected={longest === l}
            onPress={() => o.update({ longestRunKm: l })}
          />
        ))}
      </View>
      {a?.belowMinimum && d.distance ? (
        <>
          <InfoBox tone="warn" testID="below-min">
            <Text>
              {t('volume.belowMin', {
                distance: et(`distance.${d.distance}` as EngineMessageKey),
                km: MIN_LONGEST_M[d.distance] / 1000,
                shorter: shorter ?? '',
              })}
            </Text>
          </InfoBox>
          {a.shorterTarget ? (
            <SecondaryButton
              label={t('volume.switchShorter', { shorter: shorter ?? '' })}
              onPress={() => o.update({ distance: a.shorterTarget! })}
            />
          ) : null}
        </>
      ) : null}
    </OnboardingStep>
  );
}

const styles = StyleSheet.create({ chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] } });
