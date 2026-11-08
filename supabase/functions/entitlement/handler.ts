// Logika entitlement (F-23, 08-MONETIZATION bagian 7). Dipisah dari index.ts supaya bisa diuji tanpa Deno.
// Whitelist = daftar user id Auth di secret PREMIUM_WHITELIST (bukan tabel; schema public tetap kosong,
// Schema 5.1). Tidak menyimpan dan tidak mencatat data apa pun, termasuk user id.

export type Deps = {
  /** Validasi JWT pengguna -> user id, atau null. */
  getUserId: (jwt: string) => Promise<string | null>;
  /** Isi secret PREMIUM_WHITELIST (boleh kosong). */
  whitelist: string | undefined;
};

export type EntitlementBody = { premium: boolean; source: 'whitelist' | null };

export const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/** Pisah daftar user id (koma, spasi atau baris baru). Entri yang bukan UUID diabaikan. */
export function parseWhitelist(raw: string | undefined): Set<string> {
  return new Set(
    (raw ?? '')
      .split(/[\s,;]+/)
      .map((s) => s.trim().toLowerCase())
      .filter((s) => UUID.test(s)),
  );
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...cors },
  });

const err = (status: number, code: string, message: string) => json(status, { error: { code, message } });

export async function handle(req: Request, deps: Deps): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (req.method !== 'POST') return err(405, 'method_not_allowed', 'Use POST');
  const auth = req.headers.get('Authorization') ?? '';
  const jwt = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!jwt) return err(401, 'unauthorized', 'Missing bearer token');
  const userId = await deps.getUserId(jwt);
  if (!userId) return err(401, 'unauthorized', 'Invalid token');
  const listed = parseWhitelist(deps.whitelist).has(userId.toLowerCase());
  const body: EntitlementBody = { premium: listed, source: listed ? 'whitelist' : null };
  return json(200, body);
}
