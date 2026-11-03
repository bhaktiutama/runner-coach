import type { ImageSourcePropType } from 'react-native';
import { SQUAT_FRAME_MS } from './frameTiming';

/**
 * Animasi gerakan berupa frame gambar (D8): lembar keyframe 3x3 yang dipotong jadi 9 WebP transparan
 * berukuran sama (scripts/slice-keyframes.py), diputar bertahap oleh `ExerciseAnimation`. Statis di
 * dalam app, tanpa library baru. Gerakan yang belum punya frame tetap placeholder.
 */
export type FrameSet = { frames: ImageSourcePropType[]; ms: readonly number[]; aspect: number };

export const exerciseFrames: Record<string, FrameSet | undefined> = {
  squat: {
    frames: [
      require('../../assets/exercises/squat-1.webp'),
      require('../../assets/exercises/squat-2.webp'),
      require('../../assets/exercises/squat-3.webp'),
      require('../../assets/exercises/squat-4.webp'),
      require('../../assets/exercises/squat-5.webp'),
      require('../../assets/exercises/squat-6.webp'),
      require('../../assets/exercises/squat-7.webp'),
      require('../../assets/exercises/squat-8.webp'),
      require('../../assets/exercises/squat-9.webp'),
    ],
    ms: SQUAT_FRAME_MS,
    aspect: 295 / 420,
  },
};
