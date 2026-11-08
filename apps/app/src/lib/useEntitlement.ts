import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchPremium, readPremiumCache, writePremiumCache } from '@/auth/premium';
import { useSession } from '@/data/hooks';
import { entitlementFor, paywallEnabled, resolvePremium, type Entitlement } from './entitlement';

/** Dicek ulang paling cepat tiap 1 jam (dan saat app kembali aktif setelah itu). */
const RECHECK_MS = 60 * 60 * 1000;

/**
 * Hak akses Premium untuk komponen (F-23). Paywall mati: semua terbuka tanpa request. Paywall aktif +
 * login: cache lokal dibaca dulu (cepat, offline), lalu server `entitlement` (whitelist user id).
 */
export function useEntitlement(): Entitlement {
  const paywall = paywallEnabled();
  const qc = useQueryClient();
  const userId = useSession().data ?? null;
  const on = paywall && !!userId;
  const cached = useQuery({
    queryKey: ['premiumCache', userId],
    enabled: on,
    queryFn: readPremiumCache,
  });
  const fresh = useQuery({
    queryKey: ['premium', userId],
    enabled: on,
    staleTime: RECHECK_MS,
    queryFn: async () => {
      const s = await fetchPremium();
      if (s && userId) qc.setQueryData(['premiumCache', userId], await writePremiumCache(userId, s));
      return s;
    },
  });
  const status = resolvePremium(userId, fresh.data, cached.data);
  return entitlementFor(paywall, status.premium, status.source);
}
