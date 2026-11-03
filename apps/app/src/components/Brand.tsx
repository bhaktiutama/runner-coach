import { Logo, space, Text, themed } from '@run-coach/ui';
import { StyleSheet, View } from 'react-native';
import { t } from '@/i18n/t';

/** Mark 40 px + "run coach" (wireframe 1.1, 1.9). `onImage`: di atas gambar hero (UI/UX 12). */
export function Brand({ onImage = false }: { onImage?: boolean }) {
  return (
    <View style={styles.row} accessibilityRole="header" accessibilityLabel={t('app.name')}>
      <Logo variant="mark" height={space[10]} dark={onImage || undefined} />
      <Text variant="wordmark" color={onImage ? 'onImage' : undefined}>
        {t('brand.wordmark')}
      </Text>
    </View>
  );
}

const styles = themed(() =>
  StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: space[2] + space[1] / 2 },
  }),
);
