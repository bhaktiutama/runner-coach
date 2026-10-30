import type { GoalDistance, Level, PlanInput, RaceDistance, Weekday } from '@run-coach/training-engine';
import { z } from 'zod';

// Draft onboarding 1.2-1.7, disimpan lokal di app_meta.onboarding_draft agar bisa dilanjutkan.
// Jawaban screening kesehatan TIDAK disimpan (R5): hanya flag.

export const STEPS = ['goal', 'race', 'ability', 'volume', 'days', 'health', 'preview'] as const;
export type Step = (typeof STEPS)[number];

export const draftSchema = z.object({
  step: z.enum(STEPS),
  distance: z.enum(['5k', '10k', 'hm', 'fm', 'fitness']).optional(),
  raceDate: z.string().nullable().optional(),
  raceName: z.string().nullable().optional(),
  abilityMode: z.enum(['known', 'unknown']).optional(),
  baselineDistance: z.enum(['5k', '10k', 'hm', 'fm']).optional(),
  baselineTimeS: z.number().int().positive().optional(),
  level: z.enum(['beginner', 'recreational']).optional(),
  weeklyVolumeKm: z.number().int().min(0).max(200).optional(),
  longestRunKm: z.number().min(0).max(60).optional(),
  availableDays: z.array(z.number().int().min(0).max(6)).optional(),
  longRunDay: z.union([z.literal(5), z.literal(6)]).optional(),
  reminderTime: z.string().nullable().optional(),
  healthFlag: z.boolean().optional(),
  /** F-21: tambah strength + core (layar 1.6). */
  strength: z.boolean().optional(),
});

export type Draft = z.infer<typeof draftSchema>;

export const emptyDraft: Draft = { step: 'goal' };

export function parseDraft(json: string | null): Draft | null {
  if (!json) return null;
  try {
    return draftSchema.parse(JSON.parse(json));
  } catch {
    return null;
  }
}

/** Langkah berikut; target Bugar melewati 1.3. */
export function nextStep(d: Draft, from: Step): Step {
  const i = STEPS.indexOf(from);
  const n = STEPS[i + 1] ?? 'preview';
  if (n === 'race' && d.distance === 'fitness') return 'ability';
  return n;
}

export function prevStep(d: Draft, from: Step): Step | null {
  const i = STEPS.indexOf(from);
  if (i <= 0) return null;
  const p = STEPS[i - 1]!;
  if (p === 'race' && d.distance === 'fitness') return 'goal';
  return p;
}

export function draftToPlanInput(d: Draft, startDate: string): PlanInput {
  const known = d.abilityMode === 'known' && d.baselineDistance && d.baselineTimeS;
  return {
    goal: {
      distance: d.distance as GoalDistance,
      raceDate: d.distance === 'fitness' ? null : (d.raceDate ?? null),
      baselineDistance: known ? (d.baselineDistance as RaceDistance) : null,
      baselineTimeS: known ? d.baselineTimeS! : null,
      level: known ? null : ((d.level ?? 'beginner') as Level),
      weeklyVolumeM: Math.round((d.weeklyVolumeKm ?? 0) * 1000),
      longestRunM: Math.round((d.longestRunKm ?? 0) * 1000),
    },
    availableDays: (d.availableDays ?? []) as Weekday[],
    longRunDay: (d.longRunDay ?? 6) as Weekday,
    lightMode: !!d.healthFlag,
    startDate,
    strength: !!d.strength,
  };
}
