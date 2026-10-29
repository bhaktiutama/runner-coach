// Edge Function delete-account (Deno). Deploy: supabase functions deploy delete-account
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
    deleteUser: async (id) => {
      const { error } = await admin.auth.admin.deleteUser(id);
      return { error: error ? error.message : null };
    },
  }),
);
