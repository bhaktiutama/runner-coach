/** Tata letak konfeti: fungsi murni (tanpa React Native) supaya bisa dites. Jarak dalam satuan, dikali `space[1]` di komponen. */
export type ConfettiPiece = {
  /** Selisih horizontal dari pusat (satuan). */
  dx: number;
  /** Selisih vertikal dari pusat (satuan); negatif = ke atas. */
  dy: number;
  /** Putaran akhir (derajat). */
  rotate: number;
  /** Indeks warna di daftar warna konfeti. */
  colorIndex: number;
};

const MIN_RADIUS = 12;
const RADIUS_STEPS = 10;
const LIFT = 7;
const COLORS = 6;

/** Deterministik: indeks yang sama selalu menghasilkan potongan yang sama (tanpa Math.random). */
export function confettiPieces(count: number): ConfettiPiece[] {
  return Array.from({ length: Math.max(0, Math.floor(count)) }, (_, i) => {
    const angle = (i / count) * Math.PI * 2;
    const radius = MIN_RADIUS + ((i * 7) % RADIUS_STEPS);
    return {
      dx: Math.round(Math.cos(angle) * radius * 100) / 100,
      dy: Math.round((Math.sin(angle) * radius - LIFT) * 100) / 100,
      rotate: (i * 47) % 360,
      colorIndex: i % COLORS,
    };
  });
}
