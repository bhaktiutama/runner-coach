import { isSupportType, type WorkoutType } from '@run-coach/training-engine';

// Gerbang Premium (F-23, docs/specs/08-MONETIZATION.md). Fase 2: paywall NONAKTIF, semua terbuka.
// Aktif hanya jika EXPO_PUBLIC_PAYWALL=1 (feature flag build). Status langganan kelak dari
// RevenueCat (entitlement per akun, tanpa tabel di server kita, Schema 5); belum dipasang.

/** Strength + core gratis di N minggu pertama plan (08 bagian 2). */
export const FREE_STRENGTH_WEEKS = 2;

export type Entitlement = {
  /** Paywall aktif (feature flag). false = tidak ada fitur terkunci. */
  paywall: boolean;
  /** Pengguna punya langganan Premium aktif. */
  premium: boolean;
  freeStrengthWeeks: number;
};

export function paywallEnabled(): boolean {
  return process.env.EXPO_PUBLIC_PAYWALL === '1';
}

export function entitlementFor(paywall: boolean, premium: boolean): Entitlement {
  return { paywall, premium, freeStrengthWeeks: FREE_STRENGTH_WEEKS };
}

export function useEntitlement(): Entitlement {
  // Belum ada sumber status langganan: premium = false. Dengan flag mati hasilnya tetap terbuka.
  return entitlementFor(paywallEnabled(), false);
}

/** Latihan terkunci: hanya strength/core setelah minggu gratis, dan hanya jika paywall aktif. */
export function isLocked(w: { type: WorkoutType; week_index: number }, e: Entitlement): boolean {
  return e.paywall && !e.premium && isSupportType(w.type) && w.week_index > e.freeStrengthWeeks;
}
