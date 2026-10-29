import { StyleSheet, View } from 'react-native';
import { border, color, radius, space, type ZoneKey } from '../theme';
import { Text } from './Text';

type Zone = Exclude<ZoneKey, `on${string}`>;

const onKey = (z: Zone) => `on${z[0]!.toUpperCase()}${z.slice(1)}` as ZoneKey;

/** Label tipe latihan gaya nomor dada (design system ciri 3). */
export function BibTag({ label, zone }: { label: string; zone: Zone }) {
  const bg = color.zone[zone];
  const fg = color.zone[onKey(zone)];
  return (
    <View style={[styles.bib, { backgroundColor: bg }]} accessibilityRole="text">
      {[styles.tl, styles.tr, styles.bl, styles.br].map((pos, i) => (
        <View key={i} style={[styles.pin, pos, { backgroundColor: fg, opacity: 0.55 }]} />
      ))}
      <Text variant="bib" style={{ color: fg }}>
        {label.toUpperCase()}
      </Text>
    </View>
  );
}

const PIN = Math.round(border.selected);
const styles = StyleSheet.create({
  bib: {
    alignSelf: 'flex-start',
    borderRadius: radius.bib,
    paddingHorizontal: space[5],
    paddingVertical: space[2],
  },
  pin: { position: 'absolute', width: PIN, height: PIN, borderRadius: PIN },
  tl: { top: space[1], left: space[1] },
  tr: { top: space[1], right: space[1] },
  bl: { bottom: space[1], left: space[1] },
  br: { bottom: space[1], right: space[1] },
});
