import { isSupportType, type WorkoutType } from '@run-coach/training-engine';

// Gerbang Premium (F-23, docs/specs/08-MONETIZATION.md). Bagikan (F-29) gratis untuk semua, tidak lewat sini.
// Sejak 2026-11-07 paywall AKTIF secara bawaan;
// EXPO_PUBLIC_PAYWALL=0 mematikannya (semua terbuka). Status Premium dari Edge Function `entitlement`
// (whitelist user id, bagian 7); pembelian (RevenueCat) menyusul di Fase 3. Fungsi di file ini murni
// supaya bisa diuji; hook ada di `useEntitlement.ts`.

/** Strength + core gratis di N minggu pertama plan (08 bagian 2). */
export const FREE_STRENGTH_WEEKS = 2;

/** Asal akses Premium. `whitelist` = daftar user id di server (08 bagian 7); `store` = Fase 3. */
export type PremiumSource = 'whitelist' | 'store';
export type PremiumStatus = { premium: boolean; source: PremiumSource | null };
export const NOT_PREMIUM: PremiumStatus = { premium: false, source: null };

export type Entitlement = {
  /** Paywall aktif (feature flag). false = tidak ada fitur terkunci. */
  paywall: boolean;
  /** Pengguna punya akses Premium (whitelist atau langganan). */
  premium: boolean;
  source: PremiumSource | null;
  freeStrengthWeeks: number;
};

export function paywallEnabled(flag: string | undefined = process.env.EXPO_PUBLIC_PAYWALL): boolean {
  return flag !== '0';
}

export function entitlementFor(
  paywall: boolean,
  premium: boolean,
  source: PremiumSource | null = null,
): Entitlement {
  return { paywall, premium, source: premium ? source : null, freeStrengthWeeks: FREE_STRENGTH_WEEKS };
}

/** Latihan terkunci: hanya strength/core setelah minggu gratis, dan hanya jika paywall aktif. */
export function isLocked(w: { type: WorkoutType; week_index: number }, e: Entitlement): boolean {
  return e.paywall && !e.premium && isSupportType(w.type) && w.week_index > e.freeStrengthWeeks;
}

/** Cache status Premium terakhir di perangkat (08 bagian 4), terikat ke satu akun. */
export type PremiumCache = PremiumStatus & { user_id: string; checked_at: string };

export function parsePremiumCache(raw: string | null): PremiumCache | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as Partial<PremiumCache>;
    if (typeof v.user_id !== 'string' || typeof v.premium !== 'boolean') return null;
    const source = v.source === 'whitelist' || v.source === 'store' ? v.source : null;
    return { user_id: v.user_id, premium: v.premium, source, checked_at: String(v.checked_at ?? '') };
  } catch {
    return null;
  }
}

/**
 * Status yang dipakai app. Tanpa login: tidak Premium. Hasil server terbaru menang (termasuk dicabut
 * dari whitelist). Server tidak bisa dicek (offline, fungsi belum ter-deploy): pakai cache akun yang
 * sama, supaya Premium yang sudah terbuka tidak terkunci saat offline.
 */
export function resolvePremium(
  userId: string | null,
  fresh: PremiumStatus | null | undefined,
  cached: PremiumCache | null | undefined,
): PremiumStatus {
  if (!userId) return NOT_PREMIUM;
  if (fresh) return fresh.premium ? fresh : NOT_PREMIUM;
  if (cached && cached.user_id === userId && cached.premium) {
    return { premium: true, source: cached.source };
  }
  return NOT_PREMIUM;
}
