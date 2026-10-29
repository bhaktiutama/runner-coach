import { color, size, space } from '@run-coach/ui';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = { children: ReactNode; footer?: ReactNode; scroll?: boolean; dark?: boolean; testID?: string };

/** Kerangka layar: padding 20, konten maks 640 di tengah (UI/UX 5), footer tombol di bawah. */
export function Screen({ children, footer, scroll = true, dark = false, testID }: Props) {
  const insets = useSafeAreaInsets();
  const bg = dark ? color.dark.bg : color.bg;
  const body = <View style={styles.inner}>{children}</View>;
  return (
    <View testID={testID} style={[styles.root, { backgroundColor: bg, paddingTop: insets.top + space[4] }]}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {body}
        </ScrollView>
      ) : (
        <View style={[styles.scroll, styles.fill]}>{body}</View>
      )}
      {footer ? (
        <View style={[styles.footer, { paddingBottom: insets.bottom + space[4] }]}>
          <View style={styles.inner}>{footer}</View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  fill: { flex: 1 },
  scroll: { paddingHorizontal: space.screenX, paddingBottom: space[6] },
  inner: { width: '100%', maxWidth: size.contentMax, alignSelf: 'center', gap: space[4] },
  footer: { paddingHorizontal: space.screenX, paddingTop: space[3], gap: space[2] },
});
