// Edge Function entitlement (Deno). Deploy: supabase functions deploy entitlement --no-verify-jwt
// (JWT divalidasi di fungsi; tanpa flag itu preflight CORS dari web ditolak, sama seperti delete-account).
// Whitelist: supabase secrets set PREMIUM_WHITELIST="<uuid>,<uuid>" (08-MONETIZATION bagian 7).
// Service role key disediakan otomatis oleh Supabase (TRD 6 aturan 3); tidak ada di repo.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { handle } from './handler.ts';

const url = Deno.env.get('SUPABASE_URL')!;
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

Deno.serve((req) =>
  handle(req, {
    getUserId: async (jwt) => {
      const { data, error } = await admin.auth.getUser(jwt);
      return error ? null : (data.user?.id ?? null);
    },
    // Dibaca setiap request: perubahan secret langsung berlaku tanpa deploy ulang kode.
    whitelist: Deno.env.get('PREMIUM_WHITELIST'),
  }),
);
