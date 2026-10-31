// Usulan harga Premium (docs/specs/08-MONETIZATION.md bagian 3). PLACEHOLDER: harga final
// mengikuti tier App Store / Google Play per negara dan hasil survey Van Westendorp.
export const PRICES = {
  currency: 'USD',
  monthly: 5.99,
  yearly: 39.99,
  trialDays: 14,
} as const;

/** Hemat paket tahunan dibanding 12 x bulanan, dibulatkan ke bawah (persen). */
export function yearlySavingPct(p: { monthly: number; yearly: number } = PRICES): number {
  return Math.floor((1 - p.yearly / (p.monthly * 12)) * 100);
}
