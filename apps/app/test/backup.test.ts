import { generatePlan } from '@run-coach/training-engine';
import { describe, expect, it } from 'vitest';
import { saveActivity } from '../src/data/activities';
import { BACKUP_TABLES, exportBackup, importBackup, parseBackup, wipeLocalData } from '../src/data/backup';
import { draftToPlanInput, type Draft } from '../src/data/onboarding';
import { getMeta, getWorkouts, savePlanFromOnboarding, setOwner, updateMeta } from '../src/data/repo';
import { migrate } from '../src/db/migrate';
import { LATEST_SCHEMA_VERSION } from '../src/db/migrations';
import { createNodeDb } from './node-db';

const draft: Draft = {
  step: 'preview',
  distance: 'hm',
  raceDate: '2027-02-07',
  abilityMode: 'known',
  baselineDistance: '10k',
  baselineTimeS: 3300,
  weeklyVolumeKm: 25,
  longestRunKm: 10,
  availableDays: [0, 2, 4, 6],
  longRunDay: 6,
  reminderTime: '05:30',
};

async function filledDb() {
  const db = createNodeDb();
  await migrate(db);
  const input = draftToPlanInput(draft, '2026-11-02');
  const planId = await savePlanFromOnboarding(db, draft, input, generatePlan(input));
  const ws = await getWorkouts(db, planId);
  for (const w of ws.slice(0, 3)) {
    await saveActivity(db, {
      plannedWorkoutId: w.id,
      source: 'timer',
      startedAt: `${w.date}T22:30:00.000Z`,
      distanceM: 6100,
      durationS: 2400,
      rpe: 5,
      tags: ['hot'],
      segments: [{ index: 0, activeS: 600, skipped: false }],
    });
  }
  await setOwner(db, 'owner-a');
  return db;
}

async function dump(db: ReturnType<typeof createNodeDb>) {
  const out: Record<string, unknown[]> = {};
  for (const t of BACKUP_TABLES)
    out[t] = await db.getAllAsync(`SELECT * FROM ${t} ORDER BY ${t === 'profile' ? 'id' : 'id'}`);
  return out;
}

describe('backup (F-13) dan pulihkan (F-18)', () => {
  it('export -> import di HP lain menghasilkan data identik (round-trip)', async () => {
    const a = await filledDb();
    const file = await exportBackup(a, '0.1.0');
    const text = JSON.stringify(file);
    const parsed = parseBackup(text);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.summary).toMatchObject({ goal: 'hm', raceDate: '2027-02-07', activities: 3 });
    const b = createNodeDb();
    await migrate(b);
    await setOwner(b, 'owner-b');
    await importBackup(b, parsed.data);
    expect(await dump(b)).toEqual(await dump(a));
    // owner_id tidak ikut backup
    expect((await getMeta(b)).owner_id).toBe('owner-b');
    expect(text).not.toContain('owner-a');
  });

  it('file rusak / bukan backup ditolak, data lama utuh', async () => {
    const db = await filledDb();
    const before = await dump(db);
    expect(parseBackup('bukan json')).toEqual({ ok: false, error: 'not_backup' });
    expect(parseBackup(JSON.stringify({ hello: 1 }))).toEqual({ ok: false, error: 'not_backup' });
    const file = await exportBackup(db, '0.1.0');
    const broken = { ...file, tables: { ...file.tables, goals: 'x' } };
    expect(parseBackup(JSON.stringify(broken))).toEqual({ ok: false, error: 'not_backup' });
    expect(await dump(db)).toEqual(before);
  });

  it('file dari versi app lebih baru ditolak', async () => {
    const db = await filledDb();
    const file = await exportBackup(db, '9.9.9');
    expect(parseBackup(JSON.stringify({ ...file, schema_version: LATEST_SCHEMA_VERSION + 1 }))).toEqual({
      ok: false,
      error: 'newer_version',
    });
  });

  it('import gagal di tengah = rollback, data lama utuh', async () => {
    const db = await filledDb();
    const before = await dump(db);
    const file = await exportBackup(db, '0.1.0');
    const bad = {
      ...file,
      tables: { ...file.tables, workout_feedback: [{ ...file.tables.workout_feedback[0]!, rpe: 99 }] },
    };
    await expect(importBackup(db, bad)).rejects.toThrow();
    expect(await dump(db)).toEqual(before);
  });

  it('hapus data di HP: semua tabel kosong, profil default, owner dihapus', async () => {
    const db = await filledDb();
    await updateMeta(db, { last_backup_at: '2026-11-01T00:00:00Z' });
    await wipeLocalData(db);
    for (const t of BACKUP_TABLES.filter((x) => x !== 'profile'))
      expect(await db.getAllAsync(`SELECT * FROM ${t}`)).toEqual([]);
    const meta = await getMeta(db);
    expect(meta.owner_id).toBeNull();
    expect(meta.last_backup_at).toBeNull();
    const p = await db.getFirstAsync<{ reminder_time: string | null }>('SELECT reminder_time FROM profile');
    expect(p?.reminder_time).toBeNull();
  });

  it('export 1 tahun data < 5 detik (TRD 7, di Node)', async () => {
    const db = await filledDb();
    const ws = await getWorkouts(db, (await db.getFirstAsync<{ id: string }>('SELECT id FROM plans'))!.id);
    for (let i = 0; i < 300; i++) {
      await saveActivity(db, {
        plannedWorkoutId: null,
        source: 'manual',
        startedAt: `2026-0${(i % 9) + 1}-1${i % 9}T06:00:00Z`,
        distanceM: 5000,
        durationS: 1800,
        rpe: 4,
        tags: [],
      });
    }
    void ws;
    const t0 = Date.now();
    const f = await exportBackup(db, '0.1.0');
    const b = createNodeDb();
    await migrate(b);
    await importBackup(b, parseBackup(JSON.stringify(f)).ok ? f : f);
    expect(Date.now() - t0).toBeLessThan(5000);
  });
});
