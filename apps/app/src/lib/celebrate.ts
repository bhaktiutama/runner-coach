// Latihan yang baru selesai disimpan: kartu Today memutar animasi centang "Selesai" sekali saat layar
// terlihat lagi (UI/UX bagian 11, G3). Penanda ini hanya ada di memori, tidak disimpan.
let pendingId: string | null = null;

export function markCelebrate(workoutId: string): void {
  pendingId = workoutId;
}

/** True sekali untuk latihan yang ditandai; setelah itu false. */
export function consumeCelebrate(workoutId: string): boolean {
  if (pendingId !== workoutId) return false;
  pendingId = null;
  return true;
}
