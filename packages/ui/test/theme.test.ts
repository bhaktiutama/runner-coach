import { afterEach, describe, expect, it } from 'vitest';
import { color, getColorScheme, setColorScheme, shadow, themed, tokens } from '../src/theme';

// Mode gelap (F-24): `color` dan `themed()` membaca tema aktif saat diakses.
describe('tema', () => {
  afterEach(() => setColorScheme('light'));

  it('terang = token dasar', () => {
    expect(getColorScheme()).toBe('light');
    expect(color.bg).toBe(tokens.color.bg);
    expect(color.text).toBe(tokens.color.text);
  });

  it('gelap = token color.dark, isian zona tetap', () => {
    setColorScheme('dark');
    expect(color.bg).toBe(tokens.color.dark.bg);
    expect(color.surface).toBe(tokens.color.dark.surface);
    expect(color.text).toBe(tokens.color.dark.text);
    expect(color.primaryInk).toBe(tokens.color.dark.primaryInk);
    expect(color.zone.strength).toBe(tokens.color.dark.zoneStrength);
    expect(color.zone.easy).toBe(tokens.color.zone.easy);
    expect(color.overlay).toBe(tokens.color.dark.overlay);
    expect(shadow.card.boxShadow).toContain(tokens.color.dark.shadowCard);
  });

  it('palet gelap punya kunci yang sama dengan terang', () => {
    const keys = (o: object): string[] =>
      Object.entries(o).flatMap(([k, v]) => (typeof v === 'object' ? keys(v).map((s) => `${k}.${s}`) : [k]));
    const light = keys({ ...color }).sort();
    setColorScheme('dark');
    expect(keys({ ...color }).sort()).toEqual(light);
  });

  it('themed() membuat gaya per tema', () => {
    const styles = themed(() => ({ box: { backgroundColor: color.bg } }));
    expect(styles.box.backgroundColor).toBe(tokens.color.bg);
    setColorScheme('dark');
    expect(styles.box.backgroundColor).toBe(tokens.color.dark.bg);
    setColorScheme('light');
    expect(styles.box.backgroundColor).toBe(tokens.color.bg);
  });
});
