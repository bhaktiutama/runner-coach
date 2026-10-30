import { LATEST_SCHEMA_VERSION, migrations } from './migrations';
import type { Db } from './types';

/** Jalankan semua migrasi yang belum diterapkan, masing-masing dalam 1 transaksi. */
export async function migrate(db: Db): Promise<number> {
  await db.execAsync('PRAGMA foreign_keys = ON;');
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let current = row?.user_version ?? 0;
  if (current > LATEST_SCHEMA_VERSION) {
    throw new Error(`Database versi ${current} lebih baru dari app (${LATEST_SCHEMA_VERSION})`);
  }
  for (const m of migrations) {
    if (m.version <= current) continue;
    // PRAGMA foreign_keys tidak bisa diubah di dalam transaksi.
    if (m.foreignKeysOff) await db.execAsync('PRAGMA foreign_keys = OFF;');
    try {
      await db.withTransactionAsync(async () => {
        await db.execAsync(m.sql);
        if (m.foreignKeysOff) {
          const broken = await db.getAllAsync('PRAGMA foreign_key_check');
          if (broken.length > 0) throw new Error(`Migrasi ${m.version}: relasi rusak`);
        }
        await db.runAsync('UPDATE app_meta SET schema_version = ? WHERE id = 1', [m.version]);
        await db.execAsync(`PRAGMA user_version = ${m.version}`);
      });
    } finally {
      if (m.foreignKeysOff) await db.execAsync('PRAGMA foreign_keys = ON;');
    }
    current = m.version;
  }
  return current;
}
