import { SvgXml } from 'react-native-svg';
import icons from '../icons.json';
import { color as colors, size as sizes } from '../theme';

export type IconName = keyof typeof icons;

export type IconProps = { name: IconName; size?: number; color?: string; strokeWidth?: number };

export function Icon({ name, size = sizes.icon, color = colors.text, strokeWidth = 2 }: IconProps) {
  const body = icons[name];
  const xml = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
  return <SvgXml xml={xml} width={size} height={size} color={color} />;
}
