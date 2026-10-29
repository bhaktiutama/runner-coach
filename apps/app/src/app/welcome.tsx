import { border, color, Icon, LinkButton, Logo, PrimaryButton, radius, space, Text } from '@run-coach/ui';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { useSaveDraft } from '@/data/hooks';
import { emptyDraft } from '@/data/onboarding';
import { t } from '@/i18n/t';

const STACK = [
  { zone: color.zone.recovery, w: '48%' },
  { zone: color.zone.easy, w: '66%' },
  { zone: color.zone.long, w: '77%' },
  { zone: color.zone.tempo, w: '86%' },
  { zone: color.zone.interval, w: '93%' },
] as const;

/** 1.1 Selamat datang. */
export default function Welcome() {
  const save = useSaveDraft();
  return (
    <Screen
      testID="screen-welcome"
      footer={
        <>
          <PrimaryButton
            label={t('welcome.cta')}
            testID="welcome-start"
            onPress={async () => {
              await save.mutateAsync(emptyDraft);
              router.push('/onboarding/goal');
            }}
          />
          <LinkButton label={t('welcome.signIn')} onPress={() => router.push('/sign-in')} />
          <View style={styles.privacy}>
            <Icon name="lock" size={space[5]} color={color.textMuted} />
            <Text variant="label" color="textMuted">
              {t('privacy.note')}
            </Text>
          </View>
        </>
      }
    >
      <Logo height={space[10]} />
      <View style={styles.art}>
        {STACK.map((s, i) => (
          <View key={i} style={[styles.pill, { backgroundColor: s.zone, width: s.w }]} />
        ))}
      </View>
      <Text variant="display">{t('welcome.title')}</Text>
      <Text color="textMuted">{t('welcome.body')}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  art: {
    borderTopWidth: border.hairline,
    borderBottomWidth: border.hairline,
    borderColor: color.lineStrong,
    paddingVertical: space[4],
    gap: space[3],
    alignItems: 'center',
    marginVertical: space[6],
  },
  pill: { height: space[10] + space[3], borderRadius: radius.stadium },
  privacy: { flexDirection: 'row', gap: space[2], alignItems: 'center', justifyContent: 'center' },
});
