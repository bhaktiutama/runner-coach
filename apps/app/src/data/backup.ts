import { z } from 'zod';
import { LATEST_SCHEMA_VERSION } from '@/db/migrations';
import type { Db, SqlValue } from '@/db/types';
import { nowIso } from '@/lib/id';

// File backup (F-13, F-18, Schema 4). Dibuat dan dibaca di perangkat; tidak pernah ke server.

export const BACKUP_FORMAT = 'run-coach-backup';

/** Urutan penting untuk foreign key saat import. */
export const BACKUP_TABLES = [
  'profile',
  'goals',
  'plans',
  'planned_workouts',
  'activities',
  'workout_feedback',
  'plan_adjustments',
  'fitness_snapshots',
] as const;
type Table = (typeof BACKUP_TABLES)[number];

const row = z.record(z.string(), z.union([z.string(), z.number(), z.null()]));
const withId = row.and(z.object({ id: z.string().min(1) }));

export const backupSchema = z.object({
  format: z.literal(BACKUP_FORMAT),
  schema_version: z.number().int().positive(),
  exported_at: z.string(),
  app_version: z.string(),
  tables: z.object({
    profile: z.array(row).max(1),
    goals: z.array(withId),
    plans: z.array(withId),
    planned_workouts: z.array(withId),
    activities: z.array(withId),
    workout_feedback: z.array(withId),
    plan_adjustments: z.array(withId),
    fitness_snapshots: z.array(withId),
  }),
});

export type BackupFile = z.infer<typeof backupSchema>;

export async function exportBackup(db: Db, appVersion: string): Promise<BackupFile> {
  const tables = {} as BackupFile['tables'];
  for (const t of BACKUP_TABLES) {
    const rows = await db.getAllAsync<Record<string, SqlValue>>(`SELECT * FROM ${t}`);
    // profile: kolom id internal (selalu 1) tidak perlu ikut.
    tables[t] = (t === 'profile' ? rows.map(({ id: _id, ...r }) => r) : rows) as never;
  }
  return {
    format: BACKUP_FORMAT,
    schema_version: LATEST_SCHEMA_VERSION,
    exported_at: nowIso(),
    app_version: appVersion,
    tables,
  };
}

export function backupFileName(date: string): string {
  return `run-coach-backup-${date}.json`;
}

export type ParseResult =
  | { ok: true; data: BackupFile; summary: BackupSummary }
  | { ok: false; error: 'not_backup' | 'newer_version' };

export type BackupSummary = {
  goal: string | null;
  raceDate: string | null;
  workouts: number;
  activities: number;
  exportedAt: string;
};

/** Validasi file: bukan backup / rusak -> not_backup; versi lebih baru dari app -> newer_version. */
export function parseBackup(text: string): ParseResult {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return { ok: false, error: 'not_backup' };
  }
  const head = z.object({ format: z.literal(BACKUP_FORMAT), schema_version: z.number() }).safeParse(json);
  if (!head.success) return { ok: false, error: 'not_backup' };
  if (head.data.schema_version > LATEST_SCHEMA_VERSION) return { ok: false, error: 'newer_version' };
  const full = backupSchema.safeParse(json);
  if (!full.success) return { ok: false, error: 'not_backup' };
  const d = full.data;
  const active =
    d.tables.goals.find((g) => g.status === 'active') ?? d.tables.goals[d.tables.goals.length - 1];
  return {
    ok: true,
    data: d,
    summary: {
      goal: (active?.distance as string | undefined) ?? null,
      raceDate: (active?.race_date as string | null | undefined) ?? null,
      workouts: d.tables.planned_workouts.length,
      activities: d.tables.activities.length,
      exportedAt: d.exported_at,
    },
  };
}

/**
 * Ganti seluruh data lokal dengan isi backup dalam 1 transaksi (gagal = data lama utuh).
 * owner_id dan analytics_opt_in tidak diubah (Schema 4). File versi lama diterima apa adanya
 * selama kolomnya ada di skema sekarang (migrasi hanya menambah kolom/tabel).
 */
export async function importBackup(db: Db, file: BackupFile): Promise<void> {
  await db.withTransactionAsync(async () => {
    for (const t of [...BACKUP_TABLES].reverse()) {
      if (t !== 'profile') await db.runAsync(`DELETE FROM ${t}`);
    }
    for (const t of BACKUP_TABLES) {
      const cols = new Set(
        (await db.getAllAsync<{ name: string }>(`SELECT name FROM pragma_table_info('${t}')`)).map(
          (c) => c.name,
        ),
      );
      for (const r of file.tables[t as Table] as Record<string, SqlValue>[]) {
        const keys = Object.keys(r).filter((k) => cols.has(k) && (k !== 'id' || t !== 'profile'));
        if (t === 'profile') {
          if (!keys.length) continue;
          await db.runAsync(
            `UPDATE profile SET ${keys.map((k) => `${k} = ?`).join(', ')} WHERE id = 1`,
            keys.map((k) => r[k] ?? null),
          );
          continue;
        }
        await db.runAsync(
          `INSERT INTO ${t} (${keys.join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`,
          keys.map((k) => r[k] ?? null),
        );
      }
    }
    await db.runAsync('UPDATE app_meta SET onboarding_draft = NULL, active_timer = NULL WHERE id = 1');
  });
}

/** Hapus semua data pribadi di perangkat (FL-7, FL-10). app_meta/profile kembali ke default. */
export async function wipeLocalData(db: Db): Promise<void> {
  await db.withTransactionAsync(async () => {
    for (const t of [...BACKUP_TABLES].reverse()) if (t !== 'profile') await db.runAsync(`DELETE FROM ${t}`);
    await db.runAsync('DELETE FROM profile');
    await db.runAsync('INSERT INTO profile (id) VALUES (1)');
    await db.runAsync(
      'UPDATE app_meta SET owner_id = NULL, last_backup_at = NULL, backup_reminder_dismissed = 0, onboarding_draft = NULL, active_timer = NULL WHERE id = 1',
    );
  });
}
