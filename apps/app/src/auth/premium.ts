import { NOT_PREMIUM, parsePremiumCache, type PremiumCache, type PremiumStatus } from '@/lib/entitlement';
import { sessionStorage } from './storage';
import { isAuthConfigured, supabase } from './supabase';

// Status Premium (F-23, 08-MONETIZATION bagian 7). Server hanya menjawab "user ini Premium atau tidak"
// dari JWT; app tidak mengirim data lain. Cache di penyimpanan sesi perangkat (secure-store /
// localStorage), bukan SQLite, jadi tidak ikut file backup.

const CACHE_KEY = 'runcoach.premium.v1';

/** Tanya Edge Function `entitlement`. null = tidak bisa dicek (offline, belum login, belum ter-deploy). */
export async function fetchPremium(): Promise<PremiumStatus | null> {
  if (!isAuthConfigured) return null;
  try {
    const { data, error } = await supabase().functions.invoke('entitlement', { method: 'POST' });
    if (error || !data || typeof (data as { premium?: unknown }).premium !== 'boolean') return null;
    const d = data as { premium: boolean; source?: unknown };
    return d.premium ? { premium: true, source: d.source === 'store' ? 'store' : 'whitelist' } : NOT_PREMIUM;
  } catch {
    return null;
  }
}

export async function readPremiumCache(): Promise<PremiumCache | null> {
  try {
    return parsePremiumCache(await sessionStorage.getItem(CACHE_KEY));
  } catch {
    return null;
  }
}

export async function writePremiumCache(userId: string, s: PremiumStatus): Promise<PremiumCache> {
  const v: PremiumCache = { user_id: userId, ...s, checked_at: new Date().toISOString() };
  try {
    await sessionStorage.setItem(CACHE_KEY, JSON.stringify(v));
  } catch {
    // Cache gagal ditulis: status tetap dipakai di sesi ini.
  }
  return v;
}

export async function clearPremiumCache(): Promise<void> {
  try {
    await sessionStorage.removeItem(CACHE_KEY);
  } catch {
    // Tidak ada cache.
  }
}
