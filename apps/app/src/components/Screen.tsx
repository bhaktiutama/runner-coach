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
  gap?: 'normal' | 'loose' | 'today';
};

/** Kerangka layar: padding 20, konten maks 640 di tengah (UI/UX 5), footer tombol di bawah. */
export function Screen({ children, footer, scroll = true, dark = false, testID, gap = 'normal' }: Props) {
  const insets = useSafeAreaInsets();
  const bg = dark ? color.dark.bg : color.bg;
  const body = (
    <View
      style={[
        styles.inner,
        { gap: gap === 'loose' ? space[6] : gap === 'today' ? space[4] + space[1] / 2 : space[5] },
      ]}
    >
      {children}
    </View>
  );
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
