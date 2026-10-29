import { EngineError } from '@run-coach/training-engine';
import { border, Card, Checkbox, color, InfoBox, SegmentedControl, space, Text } from '@run-coach/ui';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { OnboardingStep } from '@/components/OnboardingStep';
import { useCreatePlan, useToday } from '@/data/hooks';
import { useOnboarding } from '@/data/useOnboarding';
import { t, type MessageKey } from '@/i18n/t';

const QUESTIONS: MessageKey[] = ['health.q1', 'health.q2', 'health.q3', 'health.q4', 'health.q5'];

/** 1.7 Screening kesehatan. Jawaban hanya di memori; yang disimpan hanya flag (R5, E-12). */
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
      <Card style={styles.card}>
        {QUESTIONS.map((q, i) => (
          <View key={q} style={[styles.q, i > 0 && styles.sep]}>
            <Text style={styles.flex}>{t(q)}</Text>
            <View style={styles.toggle}>
              <SegmentedControl
                testID={`q${i + 1}`}
                value={answers[i] ? 'yes' : 'no'}
                onChange={(v) => setAnswers((a) => a.map((x, j) => (j === i ? v === 'yes' : x)))}
                items={[
                  { value: 'yes', label: t('common.yes') },
                  { value: 'no', label: t('common.no') },
                ]}
              />
            </View>
          </View>
        ))}
      </Card>
      <InfoBox tone="warn">
        <Text>{t('health.warn')}</Text>
      </InfoBox>
      {anyYes ? (
        <InfoBox tone="info" testID="light-mode">
          <Text>{t('health.lightOn')}</Text>
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
          <Text>
            {t('health.error', {
              reason: err.code ? t(`engineError.${err.code}` as MessageKey) : t('common.error'),
            })}
          </Text>
        </InfoBox>
      ) : null}
    </OnboardingStep>
  );
}

const styles = StyleSheet.create({
  card: { paddingVertical: 0 },
  flex: { flex: 1 },
  q: { flexDirection: 'row', alignItems: 'center', gap: space[3], paddingVertical: space[4] },
  sep: { borderTopWidth: border.hairline, borderTopColor: color.line },
  toggle: { width: space[10] * 4 },
});
