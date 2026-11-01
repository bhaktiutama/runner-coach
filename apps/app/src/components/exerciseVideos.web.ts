import type { ExerciseVideo } from './exerciseVideos';

/**
 * Video gerakan (web). Latar tiap video sudah diisi warna token `surfaceSunken` terang / gelap
 * (hijau diganti lewat chroma key), jadi menyatu dengan kotak tanpa channel alpha. Sumber dan
 * langkah pembuatan: apps/app/assets/exercises/README.md.
 */
export const exerciseVideos: Record<string, ExerciseVideo | undefined> = {
  squat: {
    light: require('../../assets/exercises/squat.light.mp4'),
    dark: require('../../assets/exercises/squat.dark.mp4'),
  },
};
