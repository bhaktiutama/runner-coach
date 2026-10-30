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
    if (process.env.EXPO_OS === 'web') return await signInWebPopup(provider);
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

/**
 * Web: login di jendela popup yang berakhir di /auth-callback.html (halaman statis, bukan app).
 * Halaman app tidak pernah ditinggalkan, jadi database lokal (OPFS) tidak dibuka dua kali.
 * Popup dibuka sinkron sebelum await pertama agar tidak diblokir browser (Safari).
 */
async function signInWebPopup(provider: 'google' | 'apple'): Promise<AuthResult> {
  const popup = globalThis.open?.('about:blank', 'runcoach-auth', 'width=480,height=640');
  const redirectTo = `${globalThis.location.origin}/auth-callback.html`;
  const { data, error } = await supabase().auth.signInWithOAuth({
    provider,
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error || !data.url) {
    popup?.close();
    return { ok: false, error: error ? mapError(error) : 'failed' };
  }
  if (!popup) {
    // Popup diblokir: pindah di tab yang sama, sesi dibaca saat kembali (detectSessionInUrl).
    await supabase().auth.signInWithOAuth({ provider, options: { redirectTo: globalThis.location.href } });
    return { ok: false, error: 'cancelled' };
  }
  popup.location.href = data.url;
  const msg = await new Promise<{ code?: string; error?: string } | null>((resolve) => {
    const ch = new BroadcastChannel('runcoach-auth');
    const done = (v: { code?: string; error?: string } | null) => {
      clearInterval(timer);
      ch.close();
      resolve(v);
    };
    ch.onmessage = (e: MessageEvent<{ code?: string; error?: string }>) => done(e.data);
    // Popup ditutup tanpa hasil = dibatalkan (cek per detik; COOP bisa membuat `closed` selalu true
    // setelah lintas origin, jadi beri waktu sampai 10 menit sebelum menyerah).
    const started = Date.now();
    const timer = setInterval(() => {
      if (Date.now() - started > 600_000) done(null);
    }, 1000);
  });
  if (!msg) return { ok: false, error: 'cancelled' };
  if (!msg.code) return { ok: false, error: msg.error ? mapError(msg.error) : 'cancelled' };
  const ex = await supabase().auth.exchangeCodeForSession(msg.code);
  if (ex.error || !ex.data.user) return { ok: false, error: ex.error ? mapError(ex.error) : 'failed' };
  return { ok: true, userId: ex.data.user.id };
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
