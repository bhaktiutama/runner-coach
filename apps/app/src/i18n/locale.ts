import { setFormatLocale } from '@run-coach/ui/format';

// Bahasa app (F-22, TRD 8). profile.locale menyimpan pilihan: 'system' (ikut perangkat),
// 'id-ID' atau 'en-US'. Tanpa library i18n: katalog TypeScript per bahasa + Intl untuk format.

export type Lang = 'id' | 'en';
export type LocalePref = 'system' | 'id-ID' | 'en-US';
export const LOCALE_PREFS: LocalePref[] = ['system', 'id-ID', 'en-US'];

let lang: Lang = 'id';
let listeners: (() => void)[] = [];

/** Locale perangkat dari Intl (Hermes + browser), tanpa library tambahan. */
export function deviceLocale(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().locale || 'id-ID';
  } catch {
    return 'id-ID';
  }
}

/** Pilihan -> locale format. Perangkat berbahasa Indonesia -> id-ID, selain itu -> en-US. */
export function resolveLocale(pref: string | null | undefined, device = deviceLocale()): 'id-ID' | 'en-US' {
  const p = !pref || pref === 'system' ? device : pref;
  return p.toLowerCase().startsWith('id') ? 'id-ID' : 'en-US';
}

export function currentLang(): Lang {
  return lang;
}

/** Terapkan bahasa ke katalog teks, teks engine dan format angka/tanggal. */
export function applyLocale(pref: string | null | undefined, device?: string): Lang {
  const loc = resolveLocale(pref, device);
  const next: Lang = loc === 'en-US' ? 'en' : 'id';
  setFormatLocale(loc);
  if (next !== lang) {
    lang = next;
    listeners.forEach((l) => l());
  }
  return lang;
}

export function onLangChange(fn: () => void): () => void {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}
