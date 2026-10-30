import { Fragment, type ReactNode } from 'react';
import { useProfile } from '@/data/hooks';
import { applyLocale } from '@/i18n/locale';

/**
 * Terapkan bahasa dari profile.locale sebelum layar dirender (F-22). Saat bahasa berganti
 * (profil disimpan -> query profil diperbarui), seluruh pohon di-mount ulang lewat `key` supaya
 * semua teks dan format ikut berganti.
 */
export function LocaleGate({ children }: { children: ReactNode }) {
  const profile = useProfile();
  if (profile.isPending) return null;
  const lang = applyLocale(profile.data?.locale);
  return <Fragment key={lang}>{children}</Fragment>;
}
