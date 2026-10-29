import { Logo, space, Text } from '@run-coach/ui';
import { StyleSheet, View } from 'react-native';
import { t } from '@/i18n/t';

/** Mark 40 px + "run coach" (wireframe 1.1, 1.9). */
export function Brand() {
  return (
    <View style={styles.row} accessibilityRole="header" accessibilityLabel={t('app.name')}>
      <Logo variant="mark" height={space[10]} />
      <Text variant="wordmark">{t('brand.wordmark')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space[2] + space[1] / 2 },
});
