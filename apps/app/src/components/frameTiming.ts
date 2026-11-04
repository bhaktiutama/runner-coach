/**
 * Tempo animasi gerakan (D8). Lembar 4x4 hanya menggambar satu arah (panel 1 = awal, panel terakhir =
 * puncak), jadi frame diputar bolak-balik: 1 -> n -> 1. Posisi awal dan puncak ditahan sebentar.
 */
export type Tempo = { stepMs: number; holdStartMs: number; holdEndMs: number };

export const STEP_MS = 100;
export const HOLD_START_MS = 300;

/** Lama tahan di posisi puncak per gerakan (ms), dari docs/ANIMATION_PROMPTS.md "Daftar gerakan". */
export const PEAK_HOLD_MS: Record<string, number> = {
  squat: 400,
  split_squat: 400,
  bulgarian_split_squat: 400,
  glute_bridge: 1000,
  single_leg_glute_bridge: 1000,
  single_leg_deadlift: 400,
  reverse_lunge: 400,
  step_up: 600,
  calf_raise: 1000,
  single_leg_calf_raise: 1000,
  plank: 2000,
  side_plank: 2000,
  dead_bug: 400,
  bird_dog: 2000,
  copenhagen_plank: 2000,
};

export const tempoFor = (exerciseId: string): Tempo => ({
  stepMs: STEP_MS,
  holdStartMs: HOLD_START_MS,
  holdEndMs: PEAK_HOLD_MS[exerciseId] ?? 400,
});

export type Beat = { frame: number; ms: number };

/** Urutan bolak-balik 0..n-1..1 beserta lama tiap langkah; setelah langkah terakhir kembali ke awal. */
export function pingPong(count: number, tempo: Tempo): Beat[] {
  if (count <= 1) return [{ frame: 0, ms: tempo.holdStartMs }];
  const order = [...Array(count).keys(), ...Array.from({ length: count - 2 }, (_, i) => count - 2 - i)];
  return order.map((frame) => ({
    frame,
    ms: frame === 0 ? tempo.holdStartMs : frame === count - 1 ? tempo.holdEndMs : tempo.stepMs,
  }));
}

/** Total lama satu repetisi (ms). */
export const cycleMs = (beats: readonly Beat[]): number => beats.reduce((a, b) => a + b.ms, 0);
