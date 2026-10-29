import { IconButton, InfoBox, Logo, PrimaryButton, SecondaryButton, space, Text } from '@run-coach/ui';
import { router } from 'expo-router';
import { useState } from 'react';
import { AuthPanel } from '@/components/AuthPanel';
import { Screen } from '@/components/Screen';
import { useActivePlan, useCompleteSignIn, useMeta, useSaveDraft } from '@/data/hooks';
import { emptyDraft } from '@/data/onboarding';
import { t } from '@/i18n/t';

/** 1.9 Masuk (akun lama / HP baru), FL-9 + TRD 3.4. */
export default function SignIn() {
  const meta = useMeta();
  const plan = useActivePlan();
  const complete = useCompleteSignIn();
  const saveDraft = useSaveDraft();
  const [state, setState] = useState<'form' | 'empty' | 'other_owner'>('form');

  const onSignedIn = async (uid: string | null) => {
    const owner = meta.data?.owner_id;
    if (uid && owner && owner !== uid && plan.data) return setState('other_owner');
    if (!plan.data) {
      if (uid) await complete.mutateAsync(uid);
      return setState('empty');
    }
    await complete.mutateAsync(uid);
    router.replace('/');
  };

  return (
    <Screen testID="screen-signin">
      <IconButton
        icon="back"
        label={t('common.back')}
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/welcome'))}
      />
      <Logo height={space[8]} />
      {state === 'form' ? (
        <>
          <Text variant="display">{t('signIn.title')}</Text>
          <Text color="textMuted">{t('signIn.subtitle')}</Text>
          <AuthPanel variant="signin" onSignedIn={(uid) => void onSignedIn(uid)} />
          <InfoBox tone="info" icon="sync">
            <Text>{t('signIn.newPhone')}</Text>
          </InfoBox>
        </>
      ) : state === 'empty' ? (
        <>
          <Text variant="title">{t('signIn.emptyTitle')}</Text>
          <Text color="textMuted">{t('signIn.emptyBody')}</Text>
          <PrimaryButton label={t('signIn.restore')} onPress={() => router.push('/privacy')} />
          <SecondaryButton
            label={t('signIn.newPlan')}
            onPress={async () => {
              await saveDraft.mutateAsync(emptyDraft);
              router.replace('/onboarding/goal');
            }}
          />
        </>
      ) : (
        <>
          <InfoBox tone="warn">
            <Text>{t('signIn.otherOwner')}</Text>
          </InfoBox>
          <PrimaryButton label={t('signIn.restore')} onPress={() => router.push('/privacy')} />
          <SecondaryButton label={t('common.cancel')} onPress={() => setState('form')} />
        </>
      )}
    </Screen>
  );
}
