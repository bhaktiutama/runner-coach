import { OnboardingHeader, PrimaryButton, Text } from '@run-coach/ui';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Screen } from '@/components/Screen';
import { t } from '@/i18n/t';

const ORDER = ['goal', 'race', 'ability', 'volume', 'days', 'health'] as const;

type Props = {
  step: (typeof ORDER)[number];
  title: string;
  subtitle?: string;
  children: ReactNode;
  canNext: boolean;
  onNext: () => void;
  nextLabel?: string;
  loading?: boolean;
  onBack?: () => void;
  extraFooter?: ReactNode;
};

/** Kerangka layar 1.2-1.7: header progres 6 lajur, judul, isi, 1 tombol primary di bawah. */
export function OnboardingStep(p: Props) {
  const n = ORDER.indexOf(p.step) + 1;
  return (
    <Screen
      testID={`screen-${p.step}`}
      footer={
        <>
          <PrimaryButton
            label={p.nextLabel ?? t('common.next')}
            disabled={!p.canNext}
            loading={p.loading}
            onPress={p.onNext}
            testID="next"
          />
          {p.extraFooter}
        </>
      }
    >
      <OnboardingHeader
        step={n}
        total={ORDER.length}
        backLabel={t('common.back')}
        counter={t('onboarding.counter', { step: n, total: ORDER.length })}
        onBack={p.onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/welcome')))}
      />
      <Text variant="title">{p.title}</Text>
      {p.subtitle ? <Text color="textMuted">{p.subtitle}</Text> : null}
      {p.children}
    </Screen>
  );
}
