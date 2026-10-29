import { ChoiceCard, space } from '@run-coach/ui';
import type { GoalDistance } from '@run-coach/training-engine';
import { StyleSheet, View } from 'react-native';
import { OnboardingStep } from '@/components/OnboardingStep';
import { useOnboarding } from '@/data/useOnboarding';
import { t, type MessageKey } from '@/i18n/t';

const GRID: Exclude<GoalDistance, 'fitness'>[][] = [
  ['5k', '10k'],
  ['hm', 'fm'],
];

/** 1.2 Pilih target. */
export default function GoalStep() {
  const o = useOnboarding('goal');
  const sel = o.draft.distance;
  return (
    <OnboardingStep
      step="goal"
      gap="loose"
      title={t('goal.title')}
      subtitle={t('goal.subtitle')}
      canNext={!!sel && o.ready}
      loading={o.saving}
      onNext={() => void o.next()}
    >
      <View style={styles.grid}>
        {GRID.map((row, i) => (
          <View key={i} style={styles.row}>
            {row.map((d) => (
              <ChoiceCard
                key={d}
                testID={`goal-${d}`}
                title={t(`goal.${d}.title` as MessageKey)}
                subtitle={t(`goal.${d}.sub` as MessageKey)}
                selected={sel === d}
                onPress={() => o.update({ distance: d })}
              />
            ))}
          </View>
        ))}
      </View>
      <ChoiceCard
        wide
        testID="goal-fitness"
        title={t('goal.fitness')}
        selected={sel === 'fitness'}
        onPress={() => o.update({ distance: 'fitness', raceDate: null })}
      />
    </OnboardingStep>
  );
}

const styles = StyleSheet.create({ grid: { gap: space[3] }, row: { flexDirection: 'row', gap: space[3] } });
