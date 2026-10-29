import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { sessionStorage } from './storage';

// Supabase hanya untuk Auth + Edge Function delete-account (TRD 2-3).
// Jangan pernah memakai client ini untuk tabel data (schema public harus kosong).
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isAuthConfigured = Boolean(url && anonKey);

let client: SupabaseClient | null = null;

export function supabase(): SupabaseClient {
  if (!isAuthConfigured) throw new Error('auth_not_configured');
  if (!client) {
    client = createClient(url!, anonKey!, {
      auth: {
        storage: sessionStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: process.env.EXPO_OS === 'web',
        flowType: 'pkce',
      },
    });
  }
  return client;
}
