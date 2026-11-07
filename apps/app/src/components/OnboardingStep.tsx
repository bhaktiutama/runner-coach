import { OnboardingHeader, PrimaryButton, ScreenTitle, type SpotIconName } from '@run-coach/ui';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Screen } from '@/components/Screen';
import { t } from '@/i18n/t';
import { useSpotTitleIcon } from './Spot';

const ORDER = ['goal', 'race', 'ability', 'volume', 'days', 'health'] as const;

/** Ikon spot di kiri judul (UI/UX 14). 1.2 tidak: kartu target sudah membawa ikon. */
const STEP_SPOT: Partial<Record<(typeof ORDER)[number], SpotIconName>> = {
  race: 'finish',
  ability: 'get-ready',
  volume: 'distance',
  days: 'days',
  health: 'health',
};

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
  /** Jarak antarblok 24 (wireframe 1.2, 1.5) atau 20. */
  gap?: 'normal' | 'loose';
};

/** Kerangka layar 1.2-1.7: header progres 6 lajur, judul, isi, 1 tombol primary di bawah. */
export function OnboardingStep(p: Props) {
  const n = ORDER.indexOf(p.step) + 1;
  const titleIcon = useSpotTitleIcon();
  return (
    <Screen
      gap={p.gap}
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
      <ScreenTitle title={p.title} subtitle={p.subtitle} leading={titleIcon(STEP_SPOT[p.step])} />
      {p.children}
    </Screen>
  );
}
