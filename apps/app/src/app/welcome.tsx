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
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
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
  // Layar pendek (mis. iPhone SE 667 pt): tangga zona dipadatkan agar judul + teks tetap terlihat.
  const short = useWindowDimensions().height < 760;
  return (
    <View
      style={[styles.root, { paddingTop: Math.max(space[10] + space[6], insets.top + space[2]) }]}
      testID="screen-welcome"
    >
      <View style={styles.pad}>
        <Brand />
      </View>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.pad, styles.middle, short && styles.middleShort]}
      >
        <View
          style={[styles.art, short && styles.artShort]}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          {STAIRS.map((s, i) => (
            <View
              key={i}
              style={[
                styles.pill,
                short && styles.pillShort,
                { backgroundColor: s.zone, width: s.width, marginLeft: s.left },
              ]}
            />
          ))}
        </View>
        <ScreenTitle large title={t('welcome.title')} subtitle={t('welcome.body')} />
      </ScrollView>
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
  flex: { flex: 1 },
  // Bisa di-scroll: di layar pendek atau Ukuran Teks besar, judul tidak tertutup footer.
  middle: { flexGrow: 1, justifyContent: 'center', gap: space[8], paddingVertical: space[4] },
  art: {
    gap: space[2] + space[1] / 2,
    paddingVertical: space[4],
    borderTopWidth: border.hairline,
    borderBottomWidth: border.hairline,
    borderColor: color.lineStrong,
  },
  pill: { height: space[8] + space[1], borderRadius: radius.stadium },
  pillShort: { height: space[5] },
  artShort: { gap: space[2], paddingVertical: space[3] },
  middleShort: { gap: space[5] },
  footer: { gap: space[2], paddingTop: space[3] },
  privacy: {
    flexDirection: 'row',
    gap: space[1] + space[1] / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
