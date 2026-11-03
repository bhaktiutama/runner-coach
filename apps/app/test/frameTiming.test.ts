import { describe, expect, it } from 'vitest';
import { cycleMs, nextFrame, SQUAT_FRAME_MS } from '../src/components/frameTiming';

describe('frameTiming', () => {
  it('squat: 9 frame, semua positif, satu putaran 3 sampai 6 detik', () => {
    expect(SQUAT_FRAME_MS).toHaveLength(9);
    expect(SQUAT_FRAME_MS.every((n) => n > 0)).toBe(true);
    expect(cycleMs(SQUAT_FRAME_MS)).toBeGreaterThanOrEqual(3000);
    expect(cycleMs(SQUAT_FRAME_MS)).toBeLessThanOrEqual(6000);
  });
  it('titik terendah (frame 5) ditahan lebih lama dari frame antara', () => {
    expect(SQUAT_FRAME_MS[4]!).toBeGreaterThan(SQUAT_FRAME_MS[2]!);
  });
  it('nextFrame berputar kembali ke 0 setelah frame terakhir', () => {
    expect(nextFrame(0, 9)).toBe(1);
    expect(nextFrame(8, 9)).toBe(0);
  });
});
