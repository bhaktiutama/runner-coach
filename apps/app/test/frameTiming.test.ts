import { EXERCISES } from '@run-coach/training-engine';
import { describe, expect, it } from 'vitest';
import {
  cycleMs,
  HOLD_START_MS,
  PEAK_HOLD_MS,
  pingPong,
  STEP_MS,
  tempoFor,
} from '../src/components/frameTiming';

describe('frameTiming', () => {
  it('pingPong 16 frame: 1 -> 16 -> 2, lalu kembali ke awal (30 langkah)', () => {
    const b = pingPong(16, tempoFor('squat'));
    expect(b).toHaveLength(30);
    expect(b.map((x) => x.frame)).toEqual([
      ...Array(16).keys(),
      ...[14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
    ]);
  });
  it('posisi awal dan puncak ditahan, frame antara memakai langkah tetap', () => {
    const b = pingPong(16, tempoFor('plank'));
    expect(b[0]!.ms).toBe(HOLD_START_MS);
    expect(b[15]!.ms).toBe(2000);
    expect(b[5]!.ms).toBe(STEP_MS);
  });
  it('setiap gerakan di library punya lama tahan puncak dan satu repetisi 3 sampai 6 detik', () => {
    for (const e of EXERCISES) {
      expect(PEAK_HOLD_MS[e.id], e.id).toBeGreaterThan(0);
      const ms = cycleMs(pingPong(16, tempoFor(e.id)));
      expect(ms, e.id).toBeGreaterThanOrEqual(3000);
      expect(ms, e.id).toBeLessThanOrEqual(6000);
    }
  });
  it('frame tunggal tidak berputar', () => {
    expect(pingPong(1, tempoFor('squat'))).toEqual([{ frame: 0, ms: HOLD_START_MS }]);
  });
});
