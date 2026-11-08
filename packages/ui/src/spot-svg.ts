import spot from './spot-icons.json';
import { tokens } from './tokens';

export type SpotIconName = keyof typeof spot;

/**
 * Isi SVG ikon spot (grid 48) dengan placeholder `$nama$` diganti warna token. Murni (tanpa React),
 * dipakai `SpotIcon` dan kartu bagikan (F-29). `strength` = warna ubin strength tema aktif.
 */
export function spotIconSvg(name: SpotIconName, strength: string = tokens.color.zone.strength): string {
  const p = tokens.color.palette;
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
}
