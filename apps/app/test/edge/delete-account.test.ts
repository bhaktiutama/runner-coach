import { describe, expect, it, vi } from 'vitest';
import { handle } from '../../../../supabase/functions/delete-account/handler';

const req = (method: string, auth?: string) =>
  new Request('https://x.supabase.co/functions/v1/delete-account', {
    method,
    headers: auth ? { Authorization: auth } : {},
  });

describe('Edge Function delete-account (F-10)', () => {
  it('JWT valid -> user Auth dihapus, 204', async () => {
    const deleteUser = vi.fn(async () => ({ error: null }));
    const res = await handle(req('POST', 'Bearer ok'), { getUserId: async () => 'u1', deleteUser });
    expect(res.status).toBe(204);
    expect(deleteUser).toHaveBeenCalledWith('u1');
  });
  it('tanpa / JWT tidak valid -> 401, tidak menghapus', async () => {
    const deleteUser = vi.fn(async () => ({ error: null }));
    expect((await handle(req('POST'), { getUserId: async () => 'u1', deleteUser })).status).toBe(401);
    expect(
      (await handle(req('POST', 'Bearer bad'), { getUserId: async () => null, deleteUser })).status,
    ).toBe(401);
    expect(deleteUser).not.toHaveBeenCalled();
  });
  it('gagal hapus -> 500 dengan format error Schema 5.3', async () => {
    const res = await handle(req('POST', 'Bearer ok'), {
      getUserId: async () => 'u1',
      deleteUser: async () => ({ error: 'x' }),
    });
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({
      error: { code: 'delete_failed', message: 'Could not delete account' },
    });
  });
  it('method lain ditolak, OPTIONS untuk CORS web', async () => {
    const d = { getUserId: async () => 'u1', deleteUser: async () => ({ error: null }) };
    expect((await handle(req('GET', 'Bearer ok'), d)).status).toBe(405);
    expect((await handle(req('OPTIONS'), d)).status).toBe(204);
  });
});
