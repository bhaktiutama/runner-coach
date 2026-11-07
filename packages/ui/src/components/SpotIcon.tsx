import { useMemo } from 'react';
import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import spot from '../spot-icons.json';
import { color, size as sizes, tokens } from '../theme';

export type SpotIconName = keyof typeof spot;

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
  const p = tokens.color.palette;
  // Ubin pastel sama di dua tema; hanya ubin strength mengikuti tema (charcoal menyatu dengan bg gelap).
  const strength = color.zone.strength;
  const xml = useMemo(() => {
    const map: Record<string, string> = {
      charcoal: p.charcoal,
      cream: p.cream,
      white: p.white,
      orange: p.orange,
      peach: p.peach,
      mint: p.mint,
      sand: p.sand,
      coral: p.coral,
      lavender: p.lavender,
      long: tokens.color.zone.long,
      interval: tokens.color.zone.interval,
      sunken: tokens.color.surfaceSunken,
      strength,
    };
    const body = spot[name].replace(/\$([a-z]+)\$/g, (_m, k: string) => map[k] ?? p.charcoal);
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" stroke-width="1.75" ' +
      `stroke-linecap="round" stroke-linejoin="round">${body}</svg>`
    );
  }, [name, strength, p]);
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
