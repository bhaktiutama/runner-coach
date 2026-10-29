// Logika delete-account (F-10, Schema 5.3). Dipisah dari index.ts supaya bisa diuji tanpa Deno.
// Tidak menyimpan dan tidak mencatat data apa pun; hanya menghapus user Auth pemilik JWT.

export type Deps = {
  /** Validasi JWT pengguna -> user id, atau null. */
  getUserId: (jwt: string) => Promise<string | null>;
  /** Hapus user Auth dengan service role. */
  deleteUser: (id: string) => Promise<{ error: string | null }>;
};

const json = (status: number, body: unknown) =>
  new Response(body == null ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors },
  });

export const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const err = (status: number, code: string, message: string) => json(status, { error: { code, message } });

export async function handle(req: Request, deps: Deps): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (req.method !== 'POST') return err(405, 'method_not_allowed', 'Use POST');
  const auth = req.headers.get('Authorization') ?? '';
  const jwt = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!jwt) return err(401, 'unauthorized', 'Missing bearer token');
  const userId = await deps.getUserId(jwt);
  if (!userId) return err(401, 'unauthorized', 'Invalid token');
  const { error } = await deps.deleteUser(userId);
  if (error) return err(500, 'delete_failed', 'Could not delete account');
  return new Response(null, { status: 204, headers: cors });
}
