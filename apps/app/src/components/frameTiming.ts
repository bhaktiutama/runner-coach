/**
 * Lama tiap frame (ms) animasi gerakan, urut sesuai file `<id>-1..9`. Frame 1 = berdiri, 5 = titik
 * terendah (ditahan), 9 = hampir berdiri supaya putaran 9 -> 1 mulus. Total satu repetisi ~4,5 dtk.
 */
export const SQUAT_FRAME_MS = [700, 450, 450, 450, 700, 450, 450, 450, 350] as const;

/** Indeks frame berikutnya (berputar). */
export const nextFrame = (i: number, count: number): number => (i + 1) % count;

/** Total lama satu putaran (ms). */
export const cycleMs = (ms: readonly number[]): number => ms.reduce((a, b) => a + b, 0);
