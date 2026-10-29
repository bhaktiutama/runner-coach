import { predictRange, type EngineMessageKey, type RaceDistance } from '@run-coach/training-engine';
import { Card, ChoiceCard, Chip, Field, SegmentedControl, space, Text, TimeField } from '@run-coach/ui';
import { formatRaceRange } from '@run-coach/ui/format';
import { StyleSheet, View } from 'react-native';
import { OnboardingStep } from '@/components/OnboardingStep';
import { useOnboarding } from '@/data/useOnboarding';
import { t, type MessageKey } from '@/i18n/t';
import { et } from '@/lib/rationale';

const DISTANCES: RaceDistance[] = ['5k', '10k', 'hm', 'fm'];

/** 1.4 Kemampuan: waktu acuan (Riegel) atau level. Tata letak = wireframe OB4-Kemampuan. */
export default function AbilityStep() {
  const o = useOnboarding('ability');
  const d = o.draft;
  const mode = d.abilityMode ?? 'known';
  const base = d.baselineDistance ?? '5k';
  const seconds = d.baselineTimeS ?? null;
  const validTime = seconds != null && seconds >= 600 && seconds < 8 * 3600;
  const target = d.distance && d.distance !== 'fitness' ? d.distance : null;
  const pred = validTime && target ? predictRange(base, seconds, target) : null;
  const canNext = o.ready && (mode === 'known' ? validTime : !!d.level);

  return (
    <OnboardingStep
      step="ability"
      title={t('ability.title')}
      subtitle={t('ability.subtitle')}
      canNext={canNext}
      loading={o.saving}
      onNext={() =>
        void o.next(
          mode === 'known'
            ? { abilityMode: 'known', baselineDistance: base, baselineTimeS: seconds ?? undefined }
            : { abilityMode: 'unknown', baselineTimeS: undefined, baselineDistance: undefined },
        )
      }
    >
      <SegmentedControl
        testID="ability-mode"
        value={mode}
        onChange={(v) => o.update({ abilityMode: v })}
        items={[
          { value: 'known', label: t('ability.known') },
          { value: 'unknown', label: t('ability.unknown') },
        ]}
      />
      {mode === 'known' ? (
        <>
          <View style={styles.group}>
            <Field label={t('ability.bestLabel')} gap="group">
              <View style={styles.chips}>
                {DISTANCES.map((x) => (
                  <Chip
                    key={x}
                    fill
                    testID={`base-${x}`}
                    label={t(`goal.${x}.title` as MessageKey)}
                    selected={base === x}
                    onPress={() => o.update({ baselineDistance: x })}
                  />
                ))}
              </View>
            </Field>
            {o.ready ? (
              <TimeField
                testID="time"
                label={t('ability.timeLabel')}
                seconds={seconds}
                onChange={(s) => o.update({ baselineTimeS: s ?? undefined })}
              />
            ) : null}
          </View>
          {pred && target ? (
            <Card testID="estimate" style={styles.card}>
              <Text variant="label" color="textMuted">
                {t('ability.estimateTitle', { distance: et(`distance.${target}` as EngineMessageKey) })}
              </Text>
              <Text variant="estimate">{formatRaceRange(pred.minS, pred.maxS)}</Text>
              <Text variant="note" color="textMuted">
                {pred.rough
                  ? t('ability.estimateRough')
                  : t('ability.estimateNote', { baseline: et(`distance.${base}` as EngineMessageKey) })}
              </Text>
            </Card>
          ) : null}
        </>
      ) : (
        <Field label={t('ability.levelLabel')} gap="group">
          <ChoiceCard
            wide
            testID="level-beginner"
            title={t('ability.beginner.title')}
            subtitle={t('ability.beginner.sub')}
            selected={d.level === 'beginner'}
            onPress={() => o.update({ level: 'beginner' })}
          />
          <ChoiceCard
            wide
            testID="level-recreational"
            title={t('ability.recreational.title')}
            subtitle={t('ability.recreational.sub')}
            selected={d.level === 'recreational'}
            onPress={() => o.update({ level: 'recreational' })}
          />
        </Field>
      )}
    </OnboardingStep>
  );
}

const styles = StyleSheet.create({
  group: { gap: space[3] },
  chips: { flexDirection: 'row', gap: space[2] },
  card: { gap: space[2] },
});
