import { describe, expect, it } from 'vitest';
import {
  canShare,
  entitlementFor,
  isLocked,
  paywallEnabled,
  parsePremiumCache,
  resolvePremium,
  type PremiumCache,
} from '../src/lib/entitlement';

// Gerbang Premium aktif + whitelist (08-MONETIZATION bagian 7), bagikan = Premium (10-SHARE).
const U = 'user-1';
const cache = (p: Partial<PremiumCache> = {}): PremiumCache => ({
  user_id: U,
  premium: true,
  source: 'whitelist',
  checked_at: '2026-11-07T00:00:00Z',
  ...p,
});

describe('paywallEnabled', () => {
  it('aktif bawaan; hanya "0" yang mematikan', () => {
    expect(paywallEnabled(undefined)).toBe(true);
    expect(paywallEnabled('1')).toBe(true);
    expect(paywallEnabled('0')).toBe(false);
  });
});

describe('canShare (F-29)', () => {
  it('paywall mati: semua boleh; paywall nyala: hanya Premium', () => {
    expect(canShare(entitlementFor(false, false))).toBe(true);
    expect(canShare(entitlementFor(true, false))).toBe(false);
    expect(canShare(entitlementFor(true, true, 'whitelist'))).toBe(true);
  });
});

describe('whitelist membuka strength', () => {
  it('Premium dari whitelist tidak terkunci di minggu berapa pun', () => {
    const e = entitlementFor(true, true, 'whitelist');
    expect(isLocked({ type: 'strength', week_index: 12 }, e)).toBe(false);
    expect(isLocked({ type: 'core', week_index: 12 }, e)).toBe(false);
    expect(e.source).toBe('whitelist');
  });
  it('source dibuang jika tidak Premium', () => {
    expect(entitlementFor(true, false, 'whitelist').source).toBeNull();
  });
});

describe('resolvePremium', () => {
  it('tanpa login: tidak Premium meski ada cache', () => {
    expect(resolvePremium(null, { premium: true, source: 'whitelist' }, cache()).premium).toBe(false);
  });
  it('hasil server menang, termasuk dicabut dari whitelist', () => {
    expect(resolvePremium(U, { premium: true, source: 'whitelist' }, null)).toEqual({
      premium: true,
      source: 'whitelist',
    });
    expect(resolvePremium(U, { premium: false, source: null }, cache()).premium).toBe(false);
  });
  it('server tidak bisa dicek: cache akun yang sama dipakai, akun lain tidak', () => {
    expect(resolvePremium(U, null, cache()).premium).toBe(true);
    expect(resolvePremium(U, undefined, cache()).premium).toBe(true);
    expect(resolvePremium(U, null, cache({ user_id: 'user-2' })).premium).toBe(false);
    expect(resolvePremium(U, null, null).premium).toBe(false);
  });
});

describe('parsePremiumCache', () => {
  it('format valid dibaca; rusak / kosong = null', () => {
    expect(parsePremiumCache(JSON.stringify(cache()))).toEqual(cache());
    expect(parsePremiumCache('{bukan json')).toBeNull();
    expect(parsePremiumCache(JSON.stringify({ premium: true }))).toBeNull();
    expect(parsePremiumCache(null)).toBeNull();
  });
  it('source tak dikenal jadi null', () => {
    expect(parsePremiumCache(JSON.stringify({ ...cache(), source: 'x' }))?.source).toBeNull();
  });
});
