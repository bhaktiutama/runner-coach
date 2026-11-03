import { describe, expect, it } from 'vitest';
import { workoutImageKey } from '../src/lib/imageryKeys';

// UI/UX 12: gambar header kartu 2.1 per jenis latihan.
describe('workoutImageKey', () => {
  it('memetakan latihan kualitas ke gambar lintasan', () => {
    expect(workoutImageKey('tempo', '2026-10-27')).toBe('trackBack');
    expect(workoutImageKey('interval', '2026-10-27')).toBe('trackSide');
    expect(workoutImageKey('rest', '2026-10-27')).toBe('trackAerial');
  });

  it('easy dan long bergantian f/m per tanggal', () => {
    expect(workoutImageKey('easy', '2026-10-28')).toBe('riversideCityF');
    expect(workoutImageKey('easy', '2026-10-29')).toBe('riversideCityM');
    expect(workoutImageKey('long', '2026-11-01')).toBe('roadSunriseM');
    expect(workoutImageKey('long', '2026-11-08')).toBe('roadSunriseF');
  });

  it('strength dan core belum punya gambar', () => {
    expect(workoutImageKey('strength', '2026-10-27')).toBeNull();
    expect(workoutImageKey('core', '2026-10-27')).toBeNull();
  });
});
