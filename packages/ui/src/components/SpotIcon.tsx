import { useMemo } from 'react';
import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { spotIconSvg, type SpotIconName } from '../spot-svg';
import { color, size as sizes } from '../theme';

export type { SpotIconName };

/**
 * Ikon spot berwarna (design system, assets/spot-icons): ubin 48 grid dengan glyph garis 1.75.
 * Isi dibuat oleh docs/design-system/assets/_build/spot_icons.py; placeholder `$nama$` diganti
 * warna token di sini. Dekoratif: selalu disertai teks, jadi disembunyikan dari pembaca layar.
 * Bisa dimatikan pengguna (Profil, `profile.spot_icons`); pemanggil yang memutuskan tampil atau tidak.
 */
export function SpotIcon({
  name,
  size = sizes.spotMd,
  testID,
}: {
  name: SpotIconName;
  size?: number;
  testID?: string;
}) {
  // Ubin pastel sama di dua tema; hanya ubin strength mengikuti tema (charcoal menyatu dengan bg gelap).
  const strength = color.zone.strength;
  const xml = useMemo(() => spotIconSvg(name, strength), [name, strength]);
  return (
    <View
      style={{ width: size, height: size }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      aria-hidden
      testID={testID}
    >
      <SvgXml xml={xml} width={size} height={size} />
    </View>
  );
}
