import { Fragment, useSyncExternalStore, type ReactNode } from 'react';
import { useProfile } from '@/data/hooks';
import { applyLocale, currentLang, onLangChange } from '@/i18n/locale';

/**
 * Terapkan bahasa dari profile.locale sebelum layar dirender (F-22). Saat bahasa berganti,
 * seluruh pohon di-mount ulang (key) supaya semua teks dan format ikut berganti.
 */
export function LocaleGate({ children }: { children: ReactNode }) {
  const profile = useProfile();
  if (profile.data) applyLocale(profile.data.locale);
  const lang = useSyncExternalStore(onLangChange, currentLang, currentLang);
  if (profile.isPending) return null;
  return <Fragment key={lang}>{children}</Fragment>;
}
