import { color, size, space } from '@run-coach/ui';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  children: ReactNode;
  footer?: ReactNode;
  scroll?: boolean;
  dark?: boolean;
  testID?: string;
  /** Jarak antarblok: 20 (default) atau 24 (wireframe 1.2, 1.5). */
  gap?: keyof typeof GAP;
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

export function Screen({ children, footer, scroll = true, dark = false, testID, gap = 'normal' }: Props) {
  const insets = useSafeAreaInsets();
  const bg = dark ? color.dark.bg : color.bg;
  const body = <View style={[styles.inner, { gap: GAP[gap] }]}>{children}</View>;
  return (
    <View
      testID={testID}
      style={[
        styles.root,
        { backgroundColor: bg, paddingTop: Math.max(space.screenTop, insets.top + space[2]) },
      ]}
    >
      {scroll ? (
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {body}
        </ScrollView>
      ) : (
        <View style={[styles.scroll, styles.fill]}>{body}</View>
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

const styles = StyleSheet.create({
  root: { flex: 1 },
  fill: { flex: 1 },
  scroll: { paddingHorizontal: space.screenX, paddingBottom: space[4] },
  inner: { width: '100%', maxWidth: size.contentMax, alignSelf: 'center' },
  footerInner: { gap: space[2] },
  footer: { paddingHorizontal: space.screenX, paddingTop: space[3] },
});
