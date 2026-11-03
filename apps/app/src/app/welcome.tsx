import {
  color,
  Icon,
  ImageHero,
  LinkButton,
  PrimaryButton,
  ScreenTitle,
  size,
  space,
  Text,
  themed,
} from '@run-coach/ui';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Brand } from '@/components/Brand';
import { useSaveDraft } from '@/data/hooks';
import { emptyDraft } from '@/data/onboarding';
import { t } from '@/i18n/t';
import { IMAGES } from '@/lib/imagery';

/** 1.1 Selamat datang. Tata letak = wireframe Main; tangga zona diganti gambar hero (UI/UX 12). */
export default function Welcome() {
  const save = useSaveDraft();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[styles.root, { paddingTop: Math.max(space[10] + space[6], insets.top + space[2]) }]}
      testID="screen-welcome"
    >
      <StatusBar style="light" />
      <ImageHero source={IMAGES.roadSunriseM} tall />
      <View style={styles.pad}>
        <Brand onImage />
      </View>
      <ScrollView style={styles.flex} contentContainerStyle={[styles.pad, styles.middle]}>
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

const styles = themed(() =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: color.bg },
    pad: {
      paddingHorizontal: space.screenX,
      width: '100%',
      maxWidth: size.contentMax + space.screenX * 2,
      alignSelf: 'center',
    },
    flex: { flex: 1 },
    // Bisa di-scroll: di layar pendek atau Ukuran Teks besar, judul tidak tertutup footer.
    // Judul di bawah gambar hero (memudar ke bg), bukan di tengah.
    middle: { flexGrow: 1, justifyContent: 'flex-end', paddingVertical: space[4] },
    footer: { gap: space[2], paddingTop: space[3] },
    privacy: {
      flexDirection: 'row',
      gap: space[1] + space[1] / 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
  }),
);
