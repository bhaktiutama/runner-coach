import { describe, expect, it } from 'vitest';
import {
  formatDate,
  formatDistance,
  formatDuration,
  formatPace,
  formatPaceRange,
  formatPercent,
  formatRaceRange,
  formatTotalDuration,
} from '../src/format';

// Snapshot format id-ID wajib (TRD 8, UI/UX 6).
describe('format id-ID', () => {
  it('jarak memakai koma desimal', () => {
    expect(formatDistance(5200)).toBe('5,2 km');
    expect(formatDistance(10000)).toBe('10 km');
  });
  it('pace m:ss /km', () => {
    expect(formatPace(405)).toBe('6:45 /km');
    expect(formatPaceRange(370, 380)).toBe('6:10 - 6:20 /km');
  });
  it('durasi', () => {
    expect(formatDuration(2325)).toBe('38:45');
    expect(formatDuration(3930)).toBe('1:05:30');
    expect(formatTotalDuration(8460)).toBe('2j 21m');
    expect(formatTotalDuration(2700)).toBe('45m');
  });
  it('tanggal', () => {
    expect(formatDate('2026-10-27')).toBe('Selasa, 27 Okt');
  });
  it('rentang prediksi', () => {
    expect(formatRaceRange(3900, 4080)).toBe('1:05 - 1:08');
  });
  it('persen', () => {
    expect(formatPercent(0.8)).toBe('80%');
  });
});
