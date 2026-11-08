import {
  color,
  Icon,
  ImageHero,
  LinkButton,
  PrimaryButton,
  radius,
  ScreenTitle,
  size,
  space,
  Text,
  themed,
} from '@run-coach/ui';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollViewInstance,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Brand } from '@/components/Brand';
import { useSaveDraft } from '@/data/hooks';
import { emptyDraft } from '@/data/onboarding';
import { t, type MessageKey } from '@/i18n/t';
import { IMAGES, type ImageKey } from '@/lib/imagery';

/** Tiga halaman keunggulan app (UI/UX 13): riset, privasi, teman Strava. */
// fx = titik fokus horizontal subjek di gambar; rasio gambar 658 x 732.
const SLIDES: { image: ImageKey; key: 's1' | 's2' | 's3'; fx: number }[] = [
  { image: 'promoScience', key: 's1', fx: 0.24 },
  { image: 'promoPrivacy', key: 's2', fx: 0.5 },
  { image: 'promoCompanion', key: 's3', fx: 0.42 },
];
const PROMO_ASPECT = 658 / 732;
/** Gambar layar penuh memudar ke `bg` di bawah (teks di atas latar polos, ikut tema). */
const FADE: [number, number] = [0.36, 0.66];

/**
 * 1.1 Selamat datang (hanya saat belum ada plan): carousel 3 halaman penuh yang digeser manual.
 * Logo, tombol "Buat plan saya", "Masuk" dan catatan privasi tetap di setiap halaman.
 */
export default function Welcome() {
  const save = useSaveDraft();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [page, setPage] = useState(0);
  const [footerH, setFooterH] = useState(0);
  const scroller = useRef<ScrollViewInstance>(null);
  const total = SLIDES.length;

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const p = Math.round(e.nativeEvent.contentOffset.x / Math.max(1, width));
    if (p !== page) setPage(Math.min(total - 1, Math.max(0, p)));
  };
  const goTo = (p: number) => scroller.current?.scrollTo({ x: p * width, animated: true });

  return (
    <View style={styles.root} testID="screen-welcome">
      <StatusBar style="light" />
      <ScrollView
        ref={scroller}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={StyleSheet.absoluteFill}
        testID="welcome-carousel"
      >
        {SLIDES.map((s, i) => (
          <View
            key={s.key}
            style={[styles.page, { width, height, paddingBottom: footerH }]}
            testID={`welcome-slide-${i + 1}`}
            accessibilityElementsHidden={i !== page}
            importantForAccessibility={i === page ? 'auto' : 'no-hide-descendants'}
          >
            <ImageHero
              source={IMAGES[s.image]}
              height={height}
              fade={FADE}
              focus={{ x: s.fx, aspect: PROMO_ASPECT }}
            />
            <View style={[styles.pad, styles.copy]}>
              <View style={styles.kicker}>
                <Text variant="statusCaps" style={styles.kickerText}>
                  {t(`welcome.${s.key}.kicker` as MessageKey)}
                </Text>
              </View>
              <ScreenTitle
                large
                title={t(`welcome.${s.key}.title` as MessageKey)}
                subtitle={t(`welcome.${s.key}.body` as MessageKey)}
              />
            </View>
          </View>
        ))}
      </ScrollView>
      <View pointerEvents="box-none" style={[styles.overlay, styles.overlayTop]}>
        <View
          pointerEvents="box-none"
          style={[
            styles.pad,
            styles.top,
            { paddingTop: Math.max(space[10] + space[6], insets.top + space[2]) },
          ]}
        >
          <Brand onImage />
          <Text variant="controlSmStrong" color="onImage">
            {t('welcome.page', { n: page + 1, total })}
          </Text>
        </View>
      </View>
      <View
        onLayout={(e) => setFooterH(e.nativeEvent.layout.height)}
        style={[styles.overlay, styles.overlayBottom]}
      >
        <View
          style={[
            styles.pad,
            styles.footer,
            { paddingBottom: Math.max(space.screenBottom, insets.bottom + space[2]) },
          ]}
        >
          <View style={styles.dots}>
            {SLIDES.map((s, i) => (
              <Pressable
                key={s.key}
                onPress={() => goTo(i)}
                accessibilityRole="button"
                accessibilityLabel={t('welcome.goTo', { n: i + 1, total })}
                accessibilityState={{ selected: i === page }}
                hitSlop={space[3]}
                testID={`welcome-dot-${i + 1}`}
              >
                <View style={[styles.dot, i === page && styles.dotOn]} />
              </Pressable>
            ))}
          </View>
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
    page: { justifyContent: 'flex-end', overflow: 'hidden' },
    copy: { gap: space[3], paddingBottom: space[4] },
    kicker: {
      alignSelf: 'flex-start',
      backgroundColor: color.primary,
      borderRadius: radius.stadium,
      paddingHorizontal: space[2] + space[1] / 2,
      paddingVertical: space[1],
    },
    kickerText: { color: color.onPrimary },
    overlay: { position: 'absolute', left: 0, right: 0 },
    overlayTop: { top: 0 },
    overlayBottom: { bottom: 0 },
    top: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    footer: { gap: space[2], paddingTop: space[2] },
    dots: { flexDirection: 'row', gap: space[2], paddingBottom: space[2] },
    dot: {
      width: space[2],
      height: space[2],
      borderRadius: radius.stadium,
      backgroundColor: color.lineStrong,
    },
    dotOn: { width: space[6], backgroundColor: color.text },
    privacy: {
      flexDirection: 'row',
      gap: space[1] + space[1] / 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
  }),
);
