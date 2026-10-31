import { color, Icon, space } from '@run-coach/ui';
import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { helpCatalog } from '@/i18n/help';

/** Tombol (i) di samping istilah (F-20): membuka Panduan 4.7 langsung di topiknya. */
export function HelpHint({ topic, term }: { topic: string; term: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={helpCatalog().text.hintLabel.replace('{term}', term)}
      hitSlop={space[3]}
      onPress={() => router.push({ pathname: '/help', params: { topic } })}
      testID={`hint-${topic}`}
      style={({ pressed }) => [styles.hit, { opacity: pressed ? 0.6 : 1 }]}
    >
      <Icon name="info" size={space[4] + space[1] / 2} color={color.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({ hit: { alignItems: 'center', justifyContent: 'center' } });
