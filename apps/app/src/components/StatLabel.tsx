import { size, space, SpotIcon, type SpotIconName, Text, themed } from '@run-coach/ui';
import { StyleSheet, View } from 'react-native';
import { useSpotIcons } from '@/lib/spot';

/**
 * Label kotak statistik (2.5, 3.3, 3.4) dengan ikon spot kecil di kanan (UI/UX 14). Ikon menggantung
 * ke padding (margin negatif) sehingga tinggi kotak sama dengan mode tanpa ikon.
 */
export function StatLabel({ label, spot }: { label: string; spot: SpotIconName }) {
  const icons = useSpotIcons();
  if (!icons) {
    return (
      <Text variant="captionStrong" color="textMuted">
        {label}
      </Text>
    );
  }
  return (
    <View style={styles.row}>
      <Text variant="captionStrong" color="textMuted" style={styles.flex}>
        {label}
      </Text>
      <View style={styles.spot}>
        <SpotIcon name={spot} size={size.spotSm - space[1]} testID={`spot-${spot}`} />
      </View>
    </View>
  );
}

const styles = themed(() =>
  StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
    flex: { flex: 1 },
    spot: { marginVertical: -space[2], marginRight: -space[1] },
  }),
);
