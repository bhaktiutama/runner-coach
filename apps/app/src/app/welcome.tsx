import {
  border,
  color,
  Icon,
  LinkButton,
  PrimaryButton,
  radius,
  ScreenTitle,
  size,
  space,
  Text,
} from '@run-coach/ui';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Brand } from '@/components/Brand';
import { useSaveDraft } from '@/data/hooks';
import { emptyDraft } from '@/data/onboarding';
import { t } from '@/i18n/t';

// Tangga zona (wireframe Main): lebar dan geser kiri sebagai fraksi lebar konten 350 px.
const STAIRS = [
  { zone: color.zone.recovery, width: '48%', left: '27.4%' },
  { zone: color.zone.easy, width: '66.3%', left: '20.6%' },
  { zone: color.zone.long, width: '77.1%', left: '13.7%' },
  { zone: color.zone.tempo, width: '85.7%', left: '6.9%' },
  { zone: color.zone.interval, width: '93.1%', left: '0%' },
] as const;

/** 1.1 Selamat datang. Tata letak = wireframe Main. */
export default function Welcome() {
  const save = useSaveDraft();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[styles.root, { paddingTop: Math.max(space[10] + space[6], insets.top + space[2]) }]}
      testID="screen-welcome"
    >
      <View style={styles.pad}>
        <Brand />
      </View>
      <View style={[styles.pad, styles.middle]}>
        <View style={styles.art} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {STAIRS.map((s, i) => (
            <View
              key={i}
              style={[styles.pill, { backgroundColor: s.zone, width: s.width, marginLeft: s.left }]}
            />
          ))}
        </View>
        <ScreenTitle large title={t('welcome.title')} subtitle={t('welcome.body')} />
      </View>
      <View
        style={[
          styles.pad,
          styles.footer,
          { paddingBottom: Math.max(space.screenBottom, insets.bottom + space[2]) },
        ]}
      >
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
          <Icon name="lock" size={space[4]} color={color.textMuted} />
          <Text variant="controlSm" color="textMuted">
            {t('privacy.note')}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.bg },
  pad: {
    paddingHorizontal: space.screenX,
    width: '100%',
    maxWidth: size.contentMax + space.screenX * 2,
    alignSelf: 'center',
  },
  middle: { flex: 1, justifyContent: 'center', gap: space[8] },
  art: {
    gap: space[2] + space[1] / 2,
    paddingVertical: space[4],
    borderTopWidth: border.hairline,
    borderBottomWidth: border.hairline,
    borderColor: color.lineStrong,
  },
  pill: { height: space[8] + space[1], borderRadius: radius.stadium },
  footer: { gap: space[2], paddingTop: space[3] },
  privacy: {
    flexDirection: 'row',
    gap: space[1] + space[1] / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
