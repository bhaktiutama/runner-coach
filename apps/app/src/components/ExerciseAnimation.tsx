import { ExerciseAnimationPlaceholder } from './ExerciseAnimationPlaceholder';

type Props = { exerciseId: string; dark?: boolean; height?: number };

/**
 * Animasi gerakan strength/core (F-21). Native masih placeholder: memutar video butuh `expo-video`
 * (library baru, perlu persetujuan spec dan development build). Web memutar video per gerakan, lihat
 * `ExerciseAnimation.web.tsx`. Layar 2.2s dan 2.3s memakai komponen ini tanpa perubahan.
 */
export function ExerciseAnimation(props: Props) {
  return <ExerciseAnimationPlaceholder {...props} />;
}
