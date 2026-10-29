import * as SQLite from 'expo-sqlite';
import { migrate } from './migrate';
import type { Db } from './types';

const DB_NAME = 'run-coach.db';
let dbPromise: Promise<Db> | null = null;

/** Buka database lokal satu kali dan jalankan migrasi. */
export function getDb(): Promise<Db> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync(DB_NAME);
      const wrapped: Db = {
        execAsync: (sql) => db.execAsync(sql),
        runAsync: async (sql, params = []) => {
          const r = await db.runAsync(sql, params);
          return { changes: r.changes };
        },
        getAllAsync: (sql, params = []) => db.getAllAsync(sql, params),
        getFirstAsync: (sql, params = []) => db.getFirstAsync(sql, params),
        withTransactionAsync: (fn) => db.withTransactionAsync(fn),
      };
      await migrate(wrapped);
      if (process.env.EXPO_OS === 'web') {
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
