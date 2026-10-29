import * as AppleAuthentication from 'expo-apple-authentication';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { isAuthConfigured, supabase } from './supabase';

// Login (F-01). Hanya data Auth yang ke server: email/provider. Tidak ada data plan yang dikirim.

export type AuthResult = { ok: true; userId: string } | { ok: false; error: AuthError };
export type AuthError =
  'not_configured' | 'offline' | 'invalid' | 'provider_unavailable' | 'cancelled' | 'failed';

/** Mode uji (E2E/dev): login boleh dilewati. Tidak pernah aktif di build produksi. */
export const authBypassAllowed = process.env.EXPO_PUBLIC_E2E === '1';

function mapError(e: unknown): AuthError {
  const msg = String((e as { message?: string })?.message ?? e).toLowerCase();
  if (msg.includes('network') || msg.includes('fetch')) return 'offline';
  if (msg.includes('provider is not enabled') || msg.includes('unsupported provider'))
    return 'provider_unavailable';
  if (msg.includes('token') || msg.includes('otp') || msg.includes('invalid')) return 'invalid';
  return 'failed';
}

export async function currentUserId(): Promise<string | null> {
  if (!isAuthConfigured) return null;
  const { data } = await supabase().auth.getSession();
  return data.session?.user.id ?? null;
}

export async function sendEmailCode(email: string): Promise<{ ok: true } | { ok: false; error: AuthError }> {
  if (!isAuthConfigured) return { ok: false, error: 'not_configured' };
  try {
    const redirect = process.env.EXPO_OS === 'web' ? globalThis.location?.href : Linking.createURL('/');
    const { error } = await supabase().auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true, emailRedirectTo: redirect },
    });
    if (error) return { ok: false, error: mapError(error) };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: mapError(e) };
  }
}

export async function verifyEmailCode(email: string, token: string): Promise<AuthResult> {
  if (!isAuthConfigured) return { ok: false, error: 'not_configured' };
  try {
    const { data, error } = await supabase().auth.verifyOtp({ email, token, type: 'email' });
    if (error || !data.user) return { ok: false, error: error ? mapError(error) : 'failed' };
    return { ok: true, userId: data.user.id };
  } catch (e) {
    return { ok: false, error: mapError(e) };
  }
}

export async function signInWithProvider(provider: 'google' | 'apple'): Promise<AuthResult> {
  if (!isAuthConfigured) return { ok: false, error: 'not_configured' };
  try {
    if (provider === 'apple' && process.env.EXPO_OS === 'ios') {
      const cred = await AppleAuthentication.signInAsync({
        requestedScopes: [AppleAuthentication.AppleAuthenticationScope.EMAIL],
      });
      if (!cred.identityToken) return { ok: false, error: 'failed' };
      const { data, error } = await supabase().auth.signInWithIdToken({
        provider: 'apple',
        token: cred.identityToken,
      });
      if (error || !data.user) return { ok: false, error: error ? mapError(error) : 'failed' };
      return { ok: true, userId: data.user.id };
    }
    if (process.env.EXPO_OS === 'web') {
      const { error } = await supabase().auth.signInWithOAuth({
        provider,
        options: { redirectTo: globalThis.location?.href },
      });
      if (error) return { ok: false, error: mapError(error) };
      // Browser pindah halaman; sesi dibaca saat kembali (detectSessionInUrl).
      return { ok: false, error: 'cancelled' };
    }
    const redirectTo = Linking.createURL('/auth-callback');
    const { data, error } = await supabase().auth.signInWithOAuth({
      provider,
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (error || !data.url) return { ok: false, error: error ? mapError(error) : 'failed' };
    const res = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (res.type !== 'success') return { ok: false, error: 'cancelled' };
    const code = new URL(res.url).searchParams.get('code');
    if (!code) return { ok: false, error: 'failed' };
    const ex = await supabase().auth.exchangeCodeForSession(code);
    if (ex.error || !ex.data.user) return { ok: false, error: 'failed' };
    return { ok: true, userId: ex.data.user.id };
  } catch (e) {
    const code = (e as { code?: string })?.code;
    if (code === 'ERR_REQUEST_CANCELED') return { ok: false, error: 'cancelled' };
    return { ok: false, error: mapError(e) };
  }
}

export async function signOut(): Promise<void> {
  if (!isAuthConfigured) return;
  await supabase().auth.signOut();
}

/** Hapus akun Auth di server lewat Edge Function delete-account (F-10). */
export async function deleteAccount(): Promise<{ ok: true } | { ok: false; error: AuthError }> {
  if (!isAuthConfigured) return { ok: false, error: 'not_configured' };
  try {
    const { error } = await supabase().functions.invoke('delete-account', { method: 'POST' });
    if (error) return { ok: false, error: mapError(error) };
    await supabase().auth.signOut({ scope: 'local' });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: mapError(e) };
  }
}
