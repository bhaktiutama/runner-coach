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

import { digitsToSeconds, formatTimeDigits, secondsToDigits } from '../src/format';
describe('input waktu 1.4', () => {
  it('digit diisi dari kanan', () => {
    expect(formatTimeDigits('')).toBe('0 : 00 : 00');
    expect(formatTimeDigits('3230')).toBe('0 : 32 : 30');
    expect(formatTimeDigits('10530')).toBe('1 : 05 : 30');
    expect(digitsToSeconds('3230')).toBe(1950);
    expect(secondsToDigits(1950)).toBe('3230');
    expect(secondsToDigits(3930)).toBe('10530');
  });
});

import { nextTimeDigits } from '../src/format';
describe('ketik di input waktu', () => {
  it('ketik, hapus, tempel', () => {
    expect(nextTimeDigits('', '3')).toBe('3');
    expect(nextTimeDigits('3', '0 : 00 : 032')).toBe('32');
    expect(nextTimeDigits('3230', '0 : 32 : 3')).toBe('323');
    expect(nextTimeDigits('', '3230')).toBe('3230');
    expect(nextTimeDigits('', '0:32:30')).toBe('3230');
    expect(nextTimeDigits('12345', '1 : 23 : 456')).toBe('12345');
  });
});

import { formatClock } from '../src/format';
describe('jam timer', () => {
  it('menit 2 digit', () => {
    expect(formatClock(522)).toBe('08:42');
    expect(formatClock(3725)).toBe('1:02:05');
  });
});
