import * as SecureStore from 'expo-secure-store';

// Penyimpanan sesi Supabase (TRD 3.2). Native: expo-secure-store, dipecah per 1800 byte
// karena batas ukuran nilai secure-store. Web: localStorage browser.
const CHUNK = 1800;
const safeKey = (k: string) => k.replace(/[^A-Za-z0-9._-]/g, '_');

const web = {
  getItem: async (k: string) => globalThis.localStorage?.getItem(k) ?? null,
  setItem: async (k: string, v: string) => globalThis.localStorage?.setItem(k, v),
  removeItem: async (k: string) => globalThis.localStorage?.removeItem(k),
};

const native = {
  async getItem(key: string): Promise<string | null> {
    const k = safeKey(key);
    const n = await SecureStore.getItemAsync(`${k}.n`);
    if (!n) return null;
    const parts: string[] = [];
    for (let i = 0; i < Number(n); i++) {
      const p = await SecureStore.getItemAsync(`${k}.${i}`);
      if (p == null) return null;
      parts.push(p);
    }
    return parts.join('');
  },
  async setItem(key: string, value: string): Promise<void> {
    const k = safeKey(key);
    await native.removeItem(key);
    const count = Math.ceil(value.length / CHUNK);
    for (let i = 0; i < count; i++) {
      await SecureStore.setItemAsync(`${k}.${i}`, value.slice(i * CHUNK, (i + 1) * CHUNK));
    }
    await SecureStore.setItemAsync(`${k}.n`, String(count));
  },
  async removeItem(key: string): Promise<void> {
    const k = safeKey(key);
    const n = await SecureStore.getItemAsync(`${k}.n`);
    for (let i = 0; i < Number(n ?? 0); i++) await SecureStore.deleteItemAsync(`${k}.${i}`);
    await SecureStore.deleteItemAsync(`${k}.n`);
  },
};

export const sessionStorage = process.env.EXPO_OS === 'web' ? web : native;
