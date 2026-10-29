import { generatePlan } from '@run-coach/training-engine';
import { describe, expect, it } from 'vitest';
import { migrate } from '../src/db/migrate';
import { draftToPlanInput, nextStep, parseDraft, prevStep, type Draft } from '../src/data/onboarding';
import {
  getActivePlan,
  getMeta,
  getProfile,
  getWorkout,
  getWorkouts,
  markMissed,
  savePlanFromOnboarding,
  setDraft,
  setOwner,
  setWorkoutStatus,
  updateWorkout,
  deleteWorkout,
} from '../src/data/repo';
import { createNodeDb } from './node-db';

const draft: Draft = {
  step: 'preview',
  distance: '10k',
  raceDate: '2027-01-09',
  raceName: 'Race Lokal',
  abilityMode: 'known',
  baselineDistance: '5k',
  baselineTimeS: 1950,
  weeklyVolumeKm: 14,
  longestRunKm: 6,
  availableDays: [1, 3, 5, 6],
  longRunDay: 6,
  reminderTime: '05:30',
  healthFlag: false,
};

async function setup() {
  const db = createNodeDb();
  await migrate(db);
  return db;
}

describe('draft onboarding', () => {
  it('tersimpan dan bisa dilanjutkan (FL-1 keluar di tengah)', async () => {
    const db = await setup();
    await setDraft(db, { step: 'volume', distance: '5k' });
    const meta = await getMeta(db);
    expect(parseDraft(meta.onboarding_draft)).toEqual({ step: 'volume', distance: '5k' });
    await setDraft(db, null);
    expect((await getMeta(db)).onboarding_draft).toBeNull();
  });
  it('JSON rusak diabaikan', () => {
    expect(parseDraft('{bukan json')).toBeNull();
    expect(parseDraft(JSON.stringify({ step: 'x' }))).toBeNull();
  });
  it('Bugar melewati tanggal race', () => {
    expect(nextStep({ step: 'goal', distance: 'fitness' }, 'goal')).toBe('ability');
    expect(prevStep({ step: 'ability', distance: 'fitness' }, 'ability')).toBe('goal');
    expect(nextStep({ step: 'goal', distance: '5k' }, 'goal')).toBe('race');
    expect(prevStep({ step: 'goal' }, 'goal')).toBeNull();
  });
  it('draft -> input engine dalam meter', () => {
    const i = draftToPlanInput(draft, '2026-11-02');
    expect(i.goal.weeklyVolumeM).toBe(14000);
    expect(i.goal.baselineTimeS).toBe(1950);
    expect(i.goal.level).toBeNull();
    const u = draftToPlanInput({ ...draft, abilityMode: 'unknown', level: 'recreational' }, '2026-11-02');
    expect(u.goal.baselineTimeS).toBeNull();
    expect(u.goal.level).toBe('recreational');
  });
});

describe('repository plan', () => {
  it('simpan plan dari onboarding: goal, plan, latihan, profil (tanpa jawaban kesehatan)', async () => {
    const db = await setup();
    const input = draftToPlanInput(draft, '2026-11-02');
    const plan = generatePlan(input);
    const id = await savePlanFromOnboarding(db, draft, input, plan);
    const active = await getActivePlan(db);
    expect(active?.id).toBe(id);
    expect(active?.goal.race_name).toBe('Race Lokal');
    const ws = await getWorkouts(db, id);
    expect(ws.length).toBe(plan.workouts.length);
    expect(ws[0]!.steps.length).toBeGreaterThan(0);
    const prof = await getProfile(db);
    expect(prof.reminder_time).toBe('05:30');
    expect(prof.health_flag).toBe(0);
    expect(prof.disclaimer_accepted_at).not.toBeNull();
    const cols = await db.getAllAsync<{ name: string }>("SELECT name FROM pragma_table_info('profile')");
    expect(cols.map((c) => c.name).some((n) => /answer|question|heart|pregnan/.test(n))).toBe(false);
  });

  it('plan baru mengarsipkan plan lama (1 goal aktif)', async () => {
    const db = await setup();
    const input = draftToPlanInput(draft, '2026-11-02');
    await savePlanFromOnboarding(db, draft, input, generatePlan(input));
    const second = await savePlanFromOnboarding(db, draft, input, generatePlan(input));
    expect((await getActivePlan(db))?.id).toBe(second);
    const n = await db.getFirstAsync<{ n: number }>("SELECT count(*) n FROM goals WHERE status = 'active'");
    expect(n?.n).toBe(1);
  });

  it('missed otomatis, update, hapus, status', async () => {
    const db = await setup();
    const input = draftToPlanInput(draft, '2026-11-02');
    const id = await savePlanFromOnboarding(db, draft, input, generatePlan(input));
    const ws = await getWorkouts(db, id, '2026-11-02', '2026-11-08');
    expect(ws.length).toBeGreaterThan(0);
    expect(await markMissed(db, '2026-11-06')).toBe(ws.filter((w) => w.date < '2026-11-06').length);
    await setWorkoutStatus(db, ws[0]!.id, 'completed');
    expect((await getWorkout(db, ws[0]!.id))?.status).toBe('completed');
    await updateWorkout(db, ws[1]!.id, { date: '2026-11-07', original_date: ws[1]!.date });
    expect((await getWorkout(db, ws[1]!.id))?.original_date).toBe(ws[1]!.date);
    await deleteWorkout(db, ws[1]!.id);
    expect(await getWorkout(db, ws[1]!.id)).toBeNull();
  });

  it('owner_id diisi setelah login, data tetap lokal', async () => {
    const db = await setup();
    await setOwner(db, 'user-1');
    expect((await getMeta(db)).owner_id).toBe('user-1');
  });
});
