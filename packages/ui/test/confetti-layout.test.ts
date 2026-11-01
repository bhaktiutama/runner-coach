import { describe, expect, it } from 'vitest';
import { confettiPieces } from '../src/confetti-layout';

// Konfeti minggu tuntas (UI/UX bagian Gerak): sekali putar, tata letak deterministik.
describe('confettiPieces', () => {
  it('menghasilkan jumlah potongan yang diminta, 0 untuk jumlah tidak valid', () => {
    expect(confettiPieces(16)).toHaveLength(16);
    expect(confettiPieces(0)).toHaveLength(0);
    expect(confettiPieces(-3)).toHaveLength(0);
  });
  it('deterministik: panggilan berulang menghasilkan data identik', () => {
    expect(confettiPieces(16)).toEqual(confettiPieces(16));
  });
  it('potongan menyebar ke berbagai arah dan memakai semua 6 warna', () => {
    const p = confettiPieces(16);
    expect(p.some((x) => x.dx > 0)).toBe(true);
    expect(p.some((x) => x.dx < 0)).toBe(true);
    expect(p.some((x) => x.dy < 0)).toBe(true);
    expect(new Set(p.map((x) => x.colorIndex)).size).toBe(6);
  });
  it('jarak sebar terbatas (tidak keluar jauh dari kartu)', () => {
    for (const x of confettiPieces(16)) expect(Math.hypot(x.dx, x.dy + 7)).toBeLessThanOrEqual(22.01);
  });
});
