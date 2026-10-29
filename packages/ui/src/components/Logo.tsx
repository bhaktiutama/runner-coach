import { SvgXml } from 'react-native-svg';
import { logos } from '../logos';

export type LogoProps = { variant?: 'mark' | 'horizontal'; dark?: boolean; height?: number };

export function Logo({ variant = 'horizontal', dark = false, height = 40 }: LogoProps) {
  const key = variant === 'mark' ? (dark ? 'markDark' : 'mark') : dark ? 'horizontalDark' : 'horizontal';
  const xml = logos[key];
  const vb = xml.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  // Lebar mengikuti rasio viewBox file SVG.
  const r = vb ? Number(vb[1]) / Number(vb[2]) : 1;
  return <SvgXml xml={xml} height={height} width={height * r} />;
}
