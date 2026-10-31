import { z } from 'zod';

// Format `steps` (Schema 3). Tipe + validator ini satu-satunya sumber kebenaran.

export const zoneSchema = z.enum(['recovery', 'easy', 'long', 'tempo', 'interval']);
export type Zone = z.infer<typeof zoneSchema>;

const paceRange = z.object({ min: z.number().int().positive(), max: z.number().int().positive() });

const timedBase = {
  duration_s: z.number().int().positive().optional(),
  distance_m: z.number().int().positive().optional(),
  zone: zoneSchema,
  pace_s_per_km: paceRange.optional(),
  /** true = segmen jalan kaki (run-walk); jaraknya tidak dihitung sebagai jarak lari (E-06). */
  walk: z.boolean().optional(),
};

const timedKinds = ['warmup', 'work', 'recovery', 'cooldown'] as const;

export const simpleStepSchema = z
  .object({ kind: z.enum(timedKinds), ...timedBase })
  .refine((s) => s.duration_s != null || s.distance_m != null, {
    message: 'step butuh duration_s atau distance_m',
  });

export const drillStepSchema = z
  .object({
    kind: z.literal('drill'),
    exercise_id: z.string().min(1),
    sets: z.number().int().positive(),
    distance_m: z.number().int().positive().optional(),
    duration_s: z.number().int().positive().optional(),
    reps: z.number().int().positive().optional(),
  })
  .refine((s) => s.distance_m != null || s.duration_s != null || s.reps != null, {
    message: 'drill butuh distance_m, duration_s atau reps',
  });

/** Gerakan strength/core (F-21): set x repetisi atau set x detik, istirahat antar set. */
export const exerciseStepSchema = z
  .object({
    kind: z.literal('exercise'),
    exercise_id: z.string().min(1),
    sets: z.number().int().positive(),
    reps: z.number().int().positive().optional(),
    duration_s: z.number().int().positive().optional(),
    /** true = dosis berlaku untuk tiap sisi (kiri lalu kanan). */
    per_side: z.boolean().optional(),
    rest_s: z.number().int().nonnegative(),
  })
  .refine((s) => (s.reps != null) !== (s.duration_s != null), {
    message: 'exercise butuh tepat satu dari reps atau duration_s',
  });

export type SimpleStep = z.infer<typeof simpleStepSchema>;
export type DrillStep = z.infer<typeof drillStepSchema>;
export type ExerciseStep = z.infer<typeof exerciseStepSchema>;
export type RepeatStep = { kind: 'repeat'; times: number; steps: (SimpleStep | DrillStep)[] };
export type Step = SimpleStep | DrillStep | ExerciseStep | RepeatStep;

export const repeatStepSchema: z.ZodType<RepeatStep> = z.object({
  kind: z.literal('repeat'),
  times: z.number().int().positive(),
  steps: z.array(z.union([simpleStepSchema, drillStepSchema])).min(1),
});

export const stepSchema: z.ZodType<Step> = z.union([
  simpleStepSchema,
  drillStepSchema,
  exerciseStepSchema,
  repeatStepSchema,
]);
export const stepsSchema = z.array(stepSchema).min(1);

export function parseSteps(value: unknown): Step[] {
  return stepsSchema.parse(value);
}

/** Estimasi waktu per set drill (gerakan + jalan kembali), detik. */
export const DRILL_SET_S = 60;
/** Estimasi waktu per repetisi gerakan strength (tempo terkontrol), detik. */
export const REP_S = 3;

/** Satu segmen datar untuk timer dan grafik intensitas. */
export type FlatSegment =
  | {
      kind: SimpleStep['kind'];
      zone: Zone;
      duration_s: number;
      distance_m: number | null;
      pace_s_per_km: { min: number; max: number } | null;
      walk: boolean;
      /** Indeks ulangan (1-based) jika berasal dari repeat. */
      rep: number | null;
      reps: number | null;
    }
  | {
      kind: 'drill';
      exercise_id: string;
      set: number;
      sets: number;
      distance_m: number | null;
      duration_s: number | null;
      reps: number | null;
      /** Estimasi lama, untuk total durasi. */
      estimate_s: number;
    }
  | {
      kind: 'exercise';
      exercise_id: string;
      set: number;
      sets: number;
      reps: number | null;
      duration_s: number | null;
      per_side: boolean;
      estimate_s: number;
    }
  | {
      /** Istirahat antar set/gerakan strength (countdown). */
      kind: 'rest';
      duration_s: number;
    };

/** Lama satu set gerakan (kedua sisi jika per_side), detik. */
export function exerciseSetS(s: Pick<ExerciseStep, 'reps' | 'duration_s' | 'per_side'>): number {
  const one = s.duration_s ?? (s.reps ?? 0) * REP_S;
  return s.per_side ? one * 2 : one;
}

/** Pace rata-rata untuk mengubah jarak ke durasi jika step hanya punya jarak. */
function durationOf(s: SimpleStep): number {
  if (s.duration_s != null) return s.duration_s;
  const pace = s.pace_s_per_km ? (s.pace_s_per_km.min + s.pace_s_per_km.max) / 2 : 420;
  return Math.round(((s.distance_m ?? 0) / 1000) * pace);
}

function distanceOf(s: SimpleStep): number | null {
  if (s.distance_m != null) return s.distance_m;
  if (s.duration_s != null && s.pace_s_per_km) {
    const pace = (s.pace_s_per_km.min + s.pace_s_per_km.max) / 2;
    return Math.round((s.duration_s / pace) * 1000);
  }
  return null;
}

export function flattenSteps(steps: Step[]): FlatSegment[] {
  const out: FlatSegment[] = [];
  const pushExercise = (s: ExerciseStep, last: boolean) => {
    for (let i = 1; i <= s.sets; i++) {
      out.push({
        kind: 'exercise',
        exercise_id: s.exercise_id,
        set: i,
        sets: s.sets,
        reps: s.reps ?? null,
        duration_s: s.duration_s ?? null,
        per_side: !!s.per_side,
        estimate_s: exerciseSetS(s),
      });
      // Tanpa istirahat setelah set terakhir gerakan terakhir.
      if (s.rest_s > 0 && !(last && i === s.sets)) out.push({ kind: 'rest', duration_s: s.rest_s });
    }
  };
  const push = (s: SimpleStep | DrillStep, rep: number | null, reps: number | null) => {
    if (s.kind === 'drill') {
      for (let i = 1; i <= s.sets; i++) {
        out.push({
          kind: 'drill',
          exercise_id: s.exercise_id,
          set: i,
          sets: s.sets,
          distance_m: s.distance_m ?? null,
          duration_s: s.duration_s ?? null,
          reps: s.reps ?? null,
          estimate_s: s.duration_s ?? DRILL_SET_S,
        });
      }
      return;
    }
    out.push({
      kind: s.kind,
      zone: s.zone,
      duration_s: durationOf(s),
      distance_m: distanceOf(s),
      pace_s_per_km: s.pace_s_per_km ?? null,
      walk: !!s.walk,
      rep,
      reps,
    });
  };
  const lastExercise = steps.reduce((a, s, i) => (s.kind === 'exercise' ? i : a), -1);
  steps.forEach((s, i) => {
    if (s.kind === 'exercise') pushExercise(s, i === lastExercise);
    else if (s.kind === 'repeat') {
      for (let r = 1; r <= s.times; r++) for (const inner of s.steps) push(inner, r, s.times);
    } else push(s, null, null);
  });
  return out;
}

export function segmentDuration(seg: FlatSegment): number {
  return seg.kind === 'drill' || seg.kind === 'exercise' ? seg.estimate_s : seg.duration_s;
}

/** Segmen lari (punya zona dan jarak); drill, gerakan dan istirahat strength bukan lari. */
export type RunSegment = Extract<FlatSegment, { zone: Zone }>;
export function isRunSegment(seg: FlatSegment): seg is RunSegment {
  return seg.kind !== 'drill' && seg.kind !== 'exercise' && seg.kind !== 'rest';
}

export function totalDuration(steps: Step[]): number {
  return flattenSteps(steps).reduce((a, s) => a + segmentDuration(s), 0);
}

/** Jarak lari (tanpa segmen jalan dan drill), meter. Dipakai E-06 dan volume. */
export function runningDistance(steps: Step[]): number {
  return flattenSteps(steps).reduce((a, s) => (isRunSegment(s) && !s.walk ? a + (s.distance_m ?? 0) : a), 0);
}

/** Total jarak termasuk jalan (untuk tampilan "~5,5 km"). */
export function totalDistance(steps: Step[]): number {
  return flattenSteps(steps).reduce((a, s) => (isRunSegment(s) ? a + (s.distance_m ?? 0) : a), 0);
}

/** Waktu lari di zona easy/long/recovery vs zona berat (E-09). */
export function intensitySplit(steps: Step[]): { easy_s: number; hard_s: number } {
  let easy = 0;
  let hard = 0;
  for (const s of flattenSteps(steps)) {
    // Strength bukan bagian distribusi intensitas lari (E-09).
    if (s.kind === 'exercise' || s.kind === 'rest') continue;
    if (s.kind === 'drill') easy += s.estimate_s;
    else if (s.zone === 'tempo' || s.zone === 'interval') hard += s.duration_s;
    else easy += s.duration_s;
  }
  return { easy_s: easy, hard_s: hard };
}
