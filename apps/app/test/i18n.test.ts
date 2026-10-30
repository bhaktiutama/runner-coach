import { engineEn, engineId } from '@run-coach/training-engine';
import { formatDate, formatNumber, formatTotalDuration } from '@run-coach/ui/format';
import { afterEach, describe, expect, it } from 'vitest';
import { en } from '../src/i18n/en';
import { HELP } from '../src/i18n/help';
import { HELP_EN } from '../src/i18n/help.en';
import { id } from '../src/i18n/id';
import { applyLocale, currentLang, resolveLocale } from '../src/i18n/locale';
import { languageLabel, t } from '../src/i18n/t';
import { et, rationaleText } from '../src/lib/rationale';

const holes = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

// F-22: bahasa Inggris. Katalog harus lengkap dan placeholder sama persis dengan versi Indonesia.
describe('katalog bahasa (F-22)', () => {
  afterEach(() => void applyLocale('id-ID'));

  it('app: kunci dan placeholder EN = ID', () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(id).sort());
    for (const k of Object.keys(id) as (keyof typeof id)[])
      expect([k, holes(en[k])]).toEqual([k, holes(id[k])]);
  });

  it('engine: kunci dan placeholder EN = ID', () => {
    expect(Object.keys(engineEn).sort()).toEqual(Object.keys(engineId).sort());
    for (const k of Object.keys(engineId) as (keyof typeof engineId)[])
      expect([k, holes(engineEn[k])]).toEqual([k, holes(engineId[k])]);
  });

  it('Panduan: grup, topik dan aturan EN = ID', () => {
    const shape = (g: typeof HELP) => g.map((x) => [x.id, x.topics.map((y) => [y.id, y.rule ?? null])]);
    expect(shape(HELP_EN)).toEqual(shape(HELP));
    for (const x of HELP_EN.flatMap((g) => g.topics)) expect(x.body.length).toBeGreaterThan(40);
  });

  it('bahasa awal dari perangkat: Indonesia -> id-ID, selain itu -> en-US', () => {
    expect(resolveLocale('system', 'id-ID')).toBe('id-ID');
    expect(resolveLocale('system', 'en-GB')).toBe('en-US');
    expect(resolveLocale('system', 'ms-MY')).toBe('en-US');
    expect(resolveLocale('id-ID', 'en-US')).toBe('id-ID');
    expect(resolveLocale('en-US', 'id-ID')).toBe('en-US');
  });

  it('ganti bahasa: teks app, engine, rationale dan format ikut', () => {
    applyLocale('en-US');
    expect(currentLang()).toBe('en');
    expect(t('tabs.today')).toBe('Today');
    expect(et('workout.strength')).toBe('Strength');
    expect(rationaleText({ rule: 'E-25', values: { level: 1, scope: 'down' } })).toContain('level 1');
    expect(formatNumber(1.5, 1)).toBe('1.5');
    expect(formatDate('2026-11-03')).toMatch(/Tue/);
    expect(formatTotalDuration(8460)).toBe('2h 21m');
    expect(languageLabel('system')).toBe('Use device language');
    applyLocale('id-ID');
    expect(t('tabs.today')).toBe('Hari ini');
    expect(formatNumber(1.5, 1)).toBe('1,5');
    expect(formatTotalDuration(8460)).toBe('2j 21m');
  });
});
