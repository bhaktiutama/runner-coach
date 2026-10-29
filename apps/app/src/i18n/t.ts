import { id, type MessageKey } from './id';

export type { MessageKey };
export type Params = Record<string, string | number>;

/** Ambil teks dari katalog dan isi placeholder `{nama}`. Angka diformat dulu lewat format.ts. */
export function t(key: MessageKey, params?: Params): string {
  const template: string = id[key];
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (m, name: string) => (name in params ? String(params[name]) : m));
}

export function hasKey(key: string): key is MessageKey {
  return key in id;
}
