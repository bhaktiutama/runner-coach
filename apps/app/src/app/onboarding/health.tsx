import { EngineError } from '@run-coach/training-engine';
import { border, Checkbox, color, InfoBox, radius, shadow, space, Text } from '@run-coach/ui';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { OnboardingStep } from '@/components/OnboardingStep';
import { useCreatePlan, useToday } from '@/data/hooks';
import { useOnboarding } from '@/data/useOnboarding';
import { t, type MessageKey } from '@/i18n/t';

const QUESTIONS: MessageKey[] = ['health.q1', 'health.q2', 'health.q3', 'health.q4', 'health.q5'];

/** 1.7 Screening kesehatan. Jawaban hanya di memori; yang disimpan hanya flag (R5, E-12). Wireframe OB7. */
export default function HealthStep() {
  const o = useOnboarding('health');
  const today = useToday();
  const create = useCreatePlan();
  const [answers, setAnswers] = useState<boolean[]>(QUESTIONS.map(() => false));
  const [accepted, setAccepted] = useState(false);
  const anyYes = answers.some(Boolean);
  const err = create.error as EngineError | null;

  return (
    <OnboardingStep
      step="health"
      title={t('health.title')}
      subtitle={t('health.subtitle')}
      canNext={o.ready && accepted}
      nextLabel={t('health.cta')}
      loading={create.isPending}
      onNext={async () => {
        const draft = { ...o.draft, healthFlag: anyYes };
        try {
          await create.mutateAsync({ draft, today });
          router.replace('/onboarding/preview');
        } catch {
          /* pesan dari create.error */
        }
      }}
    >
      <View style={styles.card}>
        {QUESTIONS.map((q, i) => (
          <View key={q} style={[styles.q, i < QUESTIONS.length - 1 && styles.sep]}>
            <Text variant="bodyStrong" style={styles.flex}>
              {t(q)}
            </Text>
            <View style={styles.toggle} testID={`q${i + 1}`} accessibilityRole="radiogroup">
              {([true, false] as const).map((yes) => {
                const on = answers[i] === yes;
                return (
                  <Pressable
                    key={String(yes)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: on }}
                    accessibilityLabel={yes ? t('common.yes') : t('common.no')}
                    onPress={() => setAnswers((a) => a.map((x, j) => (j === i ? yes : x)))}
                    style={[styles.opt, yes ? styles.optYes : styles.optNo, on && styles.optOn]}
                  >
                    <Text variant={on ? 'controlSmStrong' : 'controlSm'} color={on ? 'text' : 'textMuted'}>
                      {yes ? t('common.yes') : t('common.no')}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
      </View>
      <InfoBox tone="warn">{t('health.warn')}</InfoBox>
      {anyYes ? (
        <InfoBox tone="info" testID="light-mode">
          {t('health.lightOn')}
        </InfoBox>
      ) : null}
      <Checkbox
        testID="disclaimer"
        checked={accepted}
        onChange={setAccepted}
        label={t('health.disclaimer')}
      />
      {err ? (
        <InfoBox tone="danger">
          {t('health.error', {
            reason: err.code ? t(`engineError.${err.code}` as MessageKey) : t('common.error'),
          })}
        </InfoBox>
      ) : null}
    </OnboardingStep>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { backgroundColor: color.surface, borderRadius: radius.lg, overflow: 'hidden', ...shadow.card },
  q: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    paddingVertical: space[3],
    paddingHorizontal: space[4],
  },
  sep: { borderBottomWidth: border.hairline, borderBottomColor: color.line },
  toggle: {
    flexDirection: 'row',
    gap: space[1],
    padding: border.selected + border.hairline / 2,
    borderRadius: radius.stadium,
    backgroundColor: color.surfaceSunken,
  },
  opt: {
    minHeight: space[10] - space[1] / 2,
    borderRadius: radius.stadium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optYes: { minWidth: space[10] + space[2] },
  optNo: { minWidth: space[10] + space[4] },
  optOn: { backgroundColor: color.surface, ...shadow.card },
});
