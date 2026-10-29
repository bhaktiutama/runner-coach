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

export type SimpleStep = z.infer<typeof simpleStepSchema>;
export type DrillStep = z.infer<typeof drillStepSchema>;
export type RepeatStep = { kind: 'repeat'; times: number; steps: (SimpleStep | DrillStep)[] };
export type Step = SimpleStep | DrillStep | RepeatStep;

export const repeatStepSchema: z.ZodType<RepeatStep> = z.object({
  kind: z.literal('repeat'),
  times: z.number().int().positive(),
  steps: z.array(z.union([simpleStepSchema, drillStepSchema])).min(1),
});

export const stepSchema: z.ZodType<Step> = z.union([simpleStepSchema, drillStepSchema, repeatStepSchema]);
export const stepsSchema = z.array(stepSchema).min(1);

export function parseSteps(value: unknown): Step[] {
  return stepsSchema.parse(value);
}

/** Estimasi waktu per set drill (gerakan + jalan kembali), detik. */
export const DRILL_SET_S = 60;

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
    };

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
  for (const s of steps) {
    if (s.kind === 'repeat') {
      for (let r = 1; r <= s.times; r++) for (const inner of s.steps) push(inner, r, s.times);
    } else push(s, null, null);
  }
  return out;
}

export function segmentDuration(seg: FlatSegment): number {
  return seg.kind === 'drill' ? seg.estimate_s : seg.duration_s;
}

export function totalDuration(steps: Step[]): number {
  return flattenSteps(steps).reduce((a, s) => a + segmentDuration(s), 0);
}

/** Jarak lari (tanpa segmen jalan dan drill), meter. Dipakai E-06 dan volume. */
export function runningDistance(steps: Step[]): number {
  return flattenSteps(steps).reduce(
    (a, s) => (s.kind !== 'drill' && !s.walk ? a + (s.distance_m ?? 0) : a),
    0,
  );
}

/** Total jarak termasuk jalan (untuk tampilan "~5,5 km"). */
export function totalDistance(steps: Step[]): number {
  return flattenSteps(steps).reduce((a, s) => (s.kind !== 'drill' ? a + (s.distance_m ?? 0) : a), 0);
}

/** Waktu lari di zona easy/long/recovery vs zona berat (E-09). */
export function intensitySplit(steps: Step[]): { easy_s: number; hard_s: number } {
  let easy = 0;
  let hard = 0;
  for (const s of flattenSteps(steps)) {
    if (s.kind === 'drill') easy += s.estimate_s;
    else if (s.zone === 'tempo' || s.zone === 'interval') hard += s.duration_s;
    else easy += s.duration_s;
  }
  return { easy_s: easy, hard_s: hard };
}
