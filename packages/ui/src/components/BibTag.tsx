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
// Titik di tengah kotak 6 px yang berjarak 4 px dari tepi (wireframe .ln-bib::after).
const PIN_INSET = space[1] + (space[1] + space[1] / 2 - PIN) / 2;
const styles = StyleSheet.create({
  bib: {
    alignSelf: 'flex-start',
    justifyContent: 'center',
    minHeight: space[6] + space[1],
    borderRadius: radius.bib,
    paddingHorizontal: space[4] + space[1] / 2,
  },
  pin: { position: 'absolute', width: PIN, height: PIN, borderRadius: PIN },
  tl: { top: PIN_INSET, left: PIN_INSET },
  tr: { top: PIN_INSET, right: PIN_INSET },
  bl: { bottom: PIN_INSET, left: PIN_INSET },
  br: { bottom: PIN_INSET, right: PIN_INSET },
});
