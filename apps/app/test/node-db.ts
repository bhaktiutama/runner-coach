// Adapter node:sqlite yang meniru subset expo-sqlite (src/db/types.ts), khusus test.
import { DatabaseSync } from 'node:sqlite';
import type { Db, SqlValue } from '../src/db/types';

export function createNodeDb(path = ':memory:'): Db & { raw: DatabaseSync } {
  const raw = new DatabaseSync(path);
  const norm = <T>(row: unknown) => (row ? ({ ...(row as object) } as T) : null);
  return {
    raw,
    async execAsync(sql) {
      raw.exec(sql);
    },
    async runAsync(sql, params: SqlValue[] = []) {
      const r = raw.prepare(sql).run(...params);
      return { changes: Number(r.changes) };
    },
    async getAllAsync<T>(sql: string, params: SqlValue[] = []) {
      return raw
        .prepare(sql)
        .all(...params)
        .map((r) => norm<T>(r)!) as T[];
    },
    async getFirstAsync<T>(sql: string, params: SqlValue[] = []) {
      return norm<T>(raw.prepare(sql).get(...params));
    },
    async withTransactionAsync(fn) {
      raw.exec('BEGIN');
      try {
        await fn();
        raw.exec('COMMIT');
      } catch (e) {
        raw.exec('ROLLBACK');
        throw e;
      }
    },
  };
}
