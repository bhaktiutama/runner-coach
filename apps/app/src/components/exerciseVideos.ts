/**
 * Video animasi gerakan per `exercise_id` (D8). Native belum memutar video (butuh `expo-video`,
 * library baru yang perlu persetujuan spec), jadi peta ini kosong dan `ExerciseAnimation` tetap
 * menampilkan placeholder. Versi web ada di `exerciseVideos.web.ts`.
 */
/** URL video (web: `require` aset mp4 mengembalikan string URL). */
export type ExerciseVideo = { light: string; dark: string };

export const exerciseVideos: Record<string, ExerciseVideo | undefined> = {};
