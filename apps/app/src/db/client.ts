import * as SQLite from 'expo-sqlite';
import { migrate } from './migrate';
import type { Db } from './types';

const DB_NAME = 'run-coach.db';
const isWeb = process.env.EXPO_OS === 'web';
let dbPromise: Promise<Db> | null = null;
let raw: SQLite.SQLiteDatabase | null = null;

/** Di web file database (OPFS) hanya boleh dipegang satu halaman. */
export class DbLockedError extends Error {
  constructor() {
    super('db_locked');
  }
}

const isLockError = (e: unknown) =>
  /NoModificationAllowed|InvalidState|VFS state|lock|access handle|SQLITE_BUSY|SQLITE_CANTOPEN/i.test(
    String((e as { name?: string })?.name) + ' ' + String((e as { message?: string })?.message ?? e),
  );

/**
 * Buka file database. Di web, halaman sebelumnya (mis. sebelum redirect login Google) bisa
 * masih memegang file sesaat, jadi dicoba ulang sampai sekitar 6 detik.
 */
async function open(): Promise<SQLite.SQLiteDatabase> {
  const tries = isWeb ? 12 : 1;
  for (let i = 0; ; i++) {
    try {
      return await SQLite.openDatabaseAsync(DB_NAME);
    } catch (e) {
      if (!isWeb || !isLockError(e)) throw e;
      if (i >= tries - 1) throw new DbLockedError();
      await new Promise((r) => setTimeout(r, 500));
    }
  }
}

async function conn(): Promise<SQLite.SQLiteDatabase> {
  if (!raw) raw = await open();
  return raw;
}

const wrapped: Db = {
  execAsync: async (sql) => (await conn()).execAsync(sql),
  runAsync: async (sql, params = []) => {
    const r = await (await conn()).runAsync(sql, params);
    return { changes: r.changes };
  },
  getAllAsync: async (sql, params = []) => (await conn()).getAllAsync(sql, params),
  getFirstAsync: async (sql, params = []) => (await conn()).getFirstAsync(sql, params),
  withTransactionAsync: async (fn) => (await conn()).withTransactionAsync(fn),
};

if (isWeb && typeof globalThis.addEventListener === 'function') {
  // Lepas file saat halaman ditinggalkan (redirect login, tutup tab) agar halaman berikutnya
  // bisa membukanya. Dibuka lagi otomatis saat dipakai (kembali dari bfcache).
  globalThis.addEventListener('pagehide', () => {
    const db = raw;
    raw = null;
    void db?.closeAsync().catch(() => undefined);
  });
}

/** Buka database lokal satu kali dan jalankan migrasi. */
export function getDb(): Promise<Db> {
  if (!dbPromise) {
    dbPromise = (async () => {
      await conn();
      await migrate(wrapped);
      if (isWeb) {
        // TRD 3.1: minta penyimpanan persisten di browser.
        void globalThis.navigator?.storage?.persist?.();
      }
      return wrapped;
    })();
    dbPromise.catch(() => {
      dbPromise = null;
    });
  }
  return dbPromise;
}
