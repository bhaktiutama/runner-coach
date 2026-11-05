// U3 (09-VOICE bagian 13). Murni, agar bisa diuji tanpa sensor.

/** Batas miring dari datar, radian (~20 derajat). */
const FLAT_RAD = 0.35;
/** Murni: datar menghadap ke atas jika sumbu X (beta) dan Y (gamma) hampir nol. */
export function isFlat(beta: number, gamma: number): boolean {
  return Math.abs(beta) < FLAT_RAD && Math.abs(gamma) < FLAT_RAD;
}
