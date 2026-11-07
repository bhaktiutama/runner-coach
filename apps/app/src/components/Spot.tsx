import { ScreenTitle, size, space, SpotIcon, type SpotIconName, Text, themed } from '@run-coach/ui';
import { StyleSheet, View } from 'react-native';
import type { ReactNode } from 'react';
import { useSpotIcons } from '@/lib/spot';

/**
 * Ikon spot untuk slot `leading` (judul layar, baris Profil, chip, kartu pilihan), atau `undefined`
 * jika ikon dimatikan di Profil, sehingga komponen kembali ke tampilan tanpa ikon (UI/UX 14).
 */
export function useSpot(): (name: SpotIconName, px?: number) => ReactNode | undefined {
  const on = useSpotIcons();
  return (name, px = size.spotSm) =>
    on ? <SpotIcon name={name} size={px} testID={`spot-${name}`} /> : undefined;
}

/**
 * Ikon spot untuk `ScreenTitle.leading`: digambar setinggi blok judul (1 atau 2 baris), atau
 * `undefined` jika ikon dimatikan.
 */
export function useSpotTitleIcon(): (
  name: SpotIconName | undefined,
) => ((px: number) => ReactNode) | undefined {
  const on = useSpotIcons();
  return (name) =>
    on && name ? (px) => <SpotIcon name={name} size={px} testID={`spot-${name}`} /> : undefined;
}

/** Judul layar dengan ikon spot setinggi judul; tanpa ikon = judul biasa seperti sebelumnya. */
export function SpotTitle({
  title,
  spot,
  subtitle,
}: {
  title: string;
  spot: SpotIconName;
  subtitle?: string;
}) {
  const icon = useSpotTitleIcon();
  return <ScreenTitle title={title} subtitle={subtitle} leading={icon(spot)} />;
}

/** Label bagian (variant `label`) dengan ikon spot kecil di kiri. */
export function SpotLabel({ label, spot }: { label: string; spot: SpotIconName }) {
  const on = useSpotIcons();
  if (!on) {
    return (
      <Text variant="label" color="textMuted">
        {label}
      </Text>
    );
  }
  return (
    <View style={labelStyles.row}>
      <View style={labelStyles.spot}>
        <SpotIcon name={spot} size={size.spotXs} testID={`spot-${spot}`} />
      </View>
      <Text variant="label" color="textMuted">
        {label}
      </Text>
    </View>
  );
}

const labelStyles = themed(() =>
  StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
    // Ikon menggantung ke jarak antarblok: tinggi label tetap seperti tanpa ikon.
    spot: { marginVertical: -space[1] - space[1] / 2 },
  }),
);

/** Ikon spot kecil sebaris teks (menggantung, tidak menambah tinggi baris); null jika ikon dimatikan. */
export function SpotInline({ name }: { name: SpotIconName }) {
  const on = useSpotIcons();
  if (!on) return null;
  return (
    <View style={labelStyles.spot}>
      <SpotIcon name={name} size={size.spotXs} testID={`spot-${name}`} />
    </View>
  );
}
