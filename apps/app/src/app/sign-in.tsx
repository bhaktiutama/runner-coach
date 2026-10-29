import {
  IconButton,
  InfoBox,
  Logo,
  PrimaryButton,
  ScreenTitle,
  SecondaryButton,
  space,
  Text,
} from '@run-coach/ui';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  AuthError,
  CodeInput,
  EmailInput,
  OrDivider,
  SignInButtons,
  SkipLogin,
  useAuthFlow,
} from '@/components/AuthPanel';
import { LeadText } from '@/components/LeadText';
import { Screen } from '@/components/Screen';
import { useActivePlan, useCompleteSignIn, useMeta, useSaveDraft } from '@/data/hooks';
import { emptyDraft } from '@/data/onboarding';
import { t } from '@/i18n/t';
import { startFresh } from '@/lib/nav';

/** 1.9 Masuk (akun lama / HP baru), FL-9 + TRD 3.4. Tata letak = wireframe OB9-Masuk. */
export default function SignIn() {
  const meta = useMeta();
  const plan = useActivePlan();
  const complete = useCompleteSignIn();
  const saveDraft = useSaveDraft();
  const [state, setState] = useState<'form' | 'empty' | 'other_owner'>('form');

  const flow = useAuthFlow(async (uid) => {
    const owner = meta.data?.owner_id;
    if (uid && owner && owner !== uid && plan.data) return setState('other_owner');
    if (!plan.data) {
      if (uid) await complete.mutateAsync(uid);
      return setState('empty');
    }
    await complete.mutateAsync(uid);
    startFresh();
  });
  const back = () => (router.canGoBack() ? router.back() : router.replace('/welcome'));

  const footer =
    state === 'form' ? (
      <>
        {flow.mode === 'code' ? (
          <PrimaryButton
            label={t('auth.verify')}
            loading={flow.busy}
            disabled={flow.code.length < 6}
            onPress={() => void flow.verify()}
          />
        ) : (
          <PrimaryButton
            label={t('auth.sendCode')}
            testID="send-code"
            loading={flow.busy}
            onPress={() => void flow.send()}
          />
        )}
        <Text variant="caption" color="textMuted" align="center">
          {t('auth.onlyEmail')}
        </Text>
        <SkipLogin flow={flow} />
      </>
    ) : undefined;

  return (
    <Screen testID="screen-signin" footer={footer}>
      <IconButton icon="back" label={t('common.back')} onPress={back} />
      <View style={styles.brand}>
        <Logo variant="mark" height={space[8] + space[1]} />
        <Text variant="numberSm">{t('brand.wordmark')}</Text>
      </View>
      {state === 'form' ? (
        <>
          <ScreenTitle title={t('signIn.title')} subtitle={t('signIn.subtitle')} />
          <SignInButtons flow={flow} />
          <OrDivider />
          {flow.mode === 'code' ? <CodeInput flow={flow} /> : <EmailInput flow={flow} />}
          <AuthError flow={flow} />
          <InfoBox tone="info" icon="sync">
            <LeadText text={t('signIn.newPhone')} separator="? " />
          </InfoBox>
        </>
      ) : state === 'empty' ? (
        <>
          <ScreenTitle title={t('signIn.emptyTitle')} subtitle={t('signIn.emptyBody')} />
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
          <InfoBox tone="warn">{t('signIn.otherOwner')}</InfoBox>
          <PrimaryButton label={t('signIn.restore')} onPress={() => router.push('/privacy')} />
          <SecondaryButton label={t('common.cancel')} onPress={() => setState('form')} />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: { flexDirection: 'row', alignItems: 'center', gap: space[2] + space[1] / 2 },
});
