import { color, ImageHero, size, space, themed } from '@run-coach/ui';
import { StatusBar } from 'expo-status-bar';
import { Children, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ImageSourcePropType } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  children: ReactNode;
  footer?: ReactNode;
  scroll?: boolean;
  dark?: boolean;
  testID?: string;
  /** Jarak antarblok: 20 (default) atau 24 (wireframe 1.2, 1.5). */
  gap?: keyof typeof GAP;
  /**
   * Gambar hero di atas layar (UI/UX 12). Isi digeser ke bawah gambar; `keepFirst` = anak pertama
   * (tombol kembali/tutup) tetap di atas gambar.
   */
  hero?: { source: ImageSourcePropType; keepFirst?: boolean };
};

/** Kerangka layar: padding 20, konten maks 640 di tengah (UI/UX 5), footer tombol di bawah. */
/** Jarak antarblok per layar wireframe: 20 umum, 24 (1.2, 1.5), 18 (2.1), 22 (2.4), 16 (3.1), 14 (3.3). */
const GAP = {
  normal: space[5],
  loose: space[6],
  today: space[4] + space[1] / 2,
  finish: space[5] + space[1] / 2,
  plan: space[4],
  progress: space[3] + space[1] / 2,
} as const;

export function Screen({
  children,
  footer,
  scroll = true,
  dark = false,
  testID,
  gap = 'normal',
  hero,
}: Props) {
  const insets = useSafeAreaInsets();
  const bg = dark ? color.dark.bg : color.bg;
  const top = Math.max(space.screenTop, insets.top + space[2]);
  let kids: ReactNode = children;
  if (hero) {
    // Judul jatuh di bagian hero yang sudah hampir pudar (sekitar 90% tinggi gambar).
    const above = hero.keepFirst ? size.touchMin + GAP[gap] : 0;
    const gapH = Math.max(0, size.hero - top - above - GAP[gap] - space[6]);
    const spacer = <View key="hero-gap" style={{ height: gapH }} />;
    const list = Children.toArray(children);
    kids = hero.keepFirst ? [list[0], spacer, ...list.slice(1)] : [spacer, ...list];
  }
  const body = <View style={[styles.inner, { gap: GAP[gap] }]}>{kids}</View>;
  const content = (
    <>
      {hero ? <ImageHero source={hero.source} /> : null}
      {body}
    </>
  );
  return (
    <View testID={testID} style={[styles.root, { backgroundColor: bg, paddingTop: hero ? 0 : top }]}>
      {hero ? <StatusBar style="light" /> : null}
      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.scroll, hero && { paddingTop: top }]}
          keyboardShouldPersistTaps="handled"
        >
          {content}
        </ScrollView>
      ) : (
        <View style={[styles.scroll, styles.fill, hero && { paddingTop: top }]}>{content}</View>
      )}
      {footer ? (
        <View
          style={[styles.footer, { paddingBottom: Math.max(space.screenBottom, insets.bottom + space[2]) }]}
        >
          <View style={[styles.inner, styles.footerInner]}>{footer}</View>
        </View>
      ) : null}
    </View>
  );
}

const styles = themed(() =>
  StyleSheet.create({
    root: { flex: 1 },
    fill: { flex: 1 },
    scroll: { paddingHorizontal: space.screenX, paddingBottom: space[4] },
    inner: { width: '100%', maxWidth: size.contentMax, alignSelf: 'center' },
    footerInner: { gap: space[2] },
    footer: { paddingHorizontal: space.screenX, paddingTop: space[3] },
  }),
);
