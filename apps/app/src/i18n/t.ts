import { en } from './en';
import { id, type MessageKey } from './id';
import { currentLang } from './locale';

export type { MessageKey };
export type Params = Record<string, string | number>;

/** Katalog bahasa aktif (F-22). Katalog EN wajib lengkap: tipenya Record<MessageKey, string>. */
function catalog(): Record<MessageKey, string> {
  return currentLang() === 'en' ? en : id;
}

/** Ambil teks dari katalog dan isi placeholder `{nama}`. Angka diformat dulu lewat format.ts. */
export function t(key: MessageKey, params?: Params): string {
  const template: string = catalog()[key];
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (m, name: string) => (name in params ? String(params[name]) : m));
}

export function hasKey(key: string): key is MessageKey {
  return key in id;
}

/** Nama pilihan bahasa untuk 4.1 / 4.8. Nama bahasa ditulis dalam bahasanya sendiri. */
export function languageLabel(pref: string | null | undefined): string {
  if (pref === 'id-ID') return t('language.id');
  if (pref === 'en-US') return t('language.en');
  return t('language.system');
}
