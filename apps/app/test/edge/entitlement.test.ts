import { describe, expect, it } from 'vitest';
import { handle, parseWhitelist } from '../../../../supabase/functions/entitlement/handler';

// Edge Function entitlement (08-MONETIZATION bagian 7): whitelist user id dari secret, tanpa tabel.
const A = '11111111-2222-4333-8444-555555555555';
const B = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';

const req = (method: string, auth?: string) =>
  new Request('https://x.supabase.co/functions/v1/entitlement', {
    method,
    headers: auth ? { Authorization: auth } : {},
  });

describe('parseWhitelist', () => {
  it('koma, spasi, baris baru; huruf besar disamakan; entri bukan UUID diabaikan', () => {
    const s = parseWhitelist(` ${A.toUpperCase()},\n${B} ; bukan-uuid,, `);
    expect([...s].sort()).toEqual([A, B].sort());
  });
  it('kosong / tidak diisi = tidak ada yang di-whitelist', () => {
    expect(parseWhitelist(undefined).size).toBe(0);
    expect(parseWhitelist('').size).toBe(0);
  });
});

describe('Edge Function entitlement', () => {
  it('user di whitelist -> premium dari whitelist', async () => {
    const res = await handle(req('POST', 'Bearer ok'), { getUserId: async () => A, whitelist: `${B},${A}` });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ premium: true, source: 'whitelist' });
    expect(res.headers.get('Cache-Control')).toBe('no-store');
  });
  it('user lain -> tidak premium; respons tidak memuat daftar whitelist', async () => {
    const res = await handle(req('POST', 'Bearer ok'), { getUserId: async () => B, whitelist: A });
    const text = await res.text();
    expect(JSON.parse(text)).toEqual({ premium: false, source: null });
    expect(text).not.toContain(A);
  });
  it('tanpa / JWT tidak valid -> 401 (whitelist tidak bisa ditebak tanpa login)', async () => {
    const d = { getUserId: async () => null, whitelist: A };
    expect((await handle(req('POST'), d)).status).toBe(401);
    const res = await handle(req('POST', 'Bearer bad'), d);
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: { code: 'unauthorized', message: 'Invalid token' } });
  });
  it('method lain ditolak, OPTIONS untuk CORS web', async () => {
    const d = { getUserId: async () => A, whitelist: A };
    expect((await handle(req('GET', 'Bearer ok'), d)).status).toBe(405);
    const pre = await handle(req('OPTIONS'), d);
    expect(pre.status).toBe(204);
    expect(pre.headers.get('Access-Control-Allow-Origin')).toBe('*');
  });
});
