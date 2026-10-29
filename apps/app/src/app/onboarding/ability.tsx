import { predictRange, type EngineMessageKey, type RaceDistance } from '@run-coach/training-engine';
import { Card, ChoiceCard, Chip, SegmentedControl, space, Text, TextField } from '@run-coach/ui';
import { formatRaceRange } from '@run-coach/ui/format';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { OnboardingStep } from '@/components/OnboardingStep';
import { useOnboarding } from '@/data/useOnboarding';
import { t, type MessageKey } from '@/i18n/t';
import { et } from '@/lib/rationale';

const DISTANCES: RaceDistance[] = ['5k', '10k', 'hm', 'fm'];

const split = (s?: number) => ({
  h: s ? String(Math.floor(s / 3600)) : '',
  m: s ? String(Math.floor((s % 3600) / 60)) : '',
  s: s ? String(s % 60) : '',
});

/** 1.4 Kemampuan: waktu acuan (Riegel) atau level. */
export default function AbilityStep() {
  const o = useOnboarding('ability');
  const d = o.draft;
  const mode = d.abilityMode ?? 'known';
  const [hms, setHms] = useState(split(d.baselineTimeS));
  const base = d.baselineDistance ?? '5k';
  const seconds = Number(hms.h || 0) * 3600 + Number(hms.m || 0) * 60 + Number(hms.s || 0);
  const validTime =
    seconds >= 600 && seconds < 8 * 3600 && Number(hms.m || 0) < 60 && Number(hms.s || 0) < 60;
  const target = d.distance && d.distance !== 'fitness' ? d.distance : null;
  const pred = validTime && target ? predictRange(base, seconds, target) : null;

  const setPart = (k: 'h' | 'm' | 's', v: string) => {
    const next = { ...hms, [k]: v.replace(/\D/g, '').slice(0, 2) };
    setHms(next);
  };

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
            ? { abilityMode: 'known', baselineDistance: base, baselineTimeS: seconds }
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
          <Text variant="label" color="textMuted">
            {t('ability.bestLabel')}
          </Text>
          <View style={styles.chips}>
            {DISTANCES.map((x) => (
              <Chip
                key={x}
                testID={`base-${x}`}
                label={t(`goal.${x}.title` as MessageKey)}
                selected={base === x}
                onPress={() => o.update({ baselineDistance: x })}
              />
            ))}
          </View>
          <Text variant="label" color="textMuted">
            {t('ability.timeLabel')}
          </Text>
          <View style={styles.time}>
            {(['h', 'm', 's'] as const).map((k) => (
              <View key={k} style={styles.timeField}>
                <TextField
                  testID={`time-${k}`}
                  accessibilityLabel={t(
                    k === 'h' ? 'ability.hours' : k === 'm' ? 'ability.minutes' : 'ability.seconds',
                  )}
                  placeholder={k === 'h' ? '0' : '00'}
                  keyboardType="number-pad"
                  value={hms[k]}
                  onChangeText={(v) => setPart(k, v)}
                />
              </View>
            ))}
          </View>
          {pred && target ? (
            <Card testID="estimate">
              <Text variant="label" color="textMuted">
                {t('ability.estimateTitle', { distance: et(`distance.${target}` as EngineMessageKey) })}
              </Text>
              <Text variant="numberXl">{formatRaceRange(pred.minS, pred.maxS)}</Text>
              <Text variant="label" color="textMuted">
                {pred.rough
                  ? t('ability.estimateRough')
                  : t('ability.estimateNote', { baseline: et(`distance.${base}` as EngineMessageKey) })}
              </Text>
            </Card>
          ) : null}
        </>
      ) : (
        <>
          <Text variant="label" color="textMuted">
            {t('ability.levelLabel')}
          </Text>
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
        </>
      )}
    </OnboardingStep>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', gap: space[2], flexWrap: 'wrap' },
  time: { flexDirection: 'row', gap: space[3] },
  timeField: { flex: 1 },
});
