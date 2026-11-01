import { color, getColorScheme, radius, space } from '@run-coach/ui';
import { useEffect, useState } from 'react';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';
import { t } from '@/i18n/t';
import { exerciseName } from '@/timer/labels';
import { ExerciseAnimationPlaceholder } from './ExerciseAnimationPlaceholder';
import { exerciseVideos } from './exerciseVideos';

type Props = { exerciseId: string; dark?: boolean; height?: number };

/** Tinggi minimum kotak saat memutar video (potret 400x624), supaya gerakan terbaca. */
const VIDEO_MIN_HEIGHT = space[10] * 4;

/**
 * Animasi gerakan strength/core (F-21, web). Gerakan yang punya video diputar berulang, tanpa
 * suara; yang belum punya tetap placeholder. Reduce motion: berhenti di frame pertama.
 */
export function ExerciseAnimation({ exerciseId, dark, height = space[10] * 4 }: Props) {
  const video = exerciseVideos[exerciseId];
  const [still, setStill] = useState(false);
  useEffect(() => {
    let live = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((v) => live && setStill(v));
    return () => {
      live = false;
    };
  }, []);
  const isDark = dark ?? getColorScheme() === 'dark';
  const src = video ? (isDark ? video.dark : video.light) : undefined;
  if (!video || !src)
    return <ExerciseAnimationPlaceholder exerciseId={exerciseId} dark={dark} height={height} />;
  return (
    <View
      testID={`exercise-animation-${exerciseId}`}
      accessibilityRole="image"
      accessibilityLabel={t('strength.animationLabel', { name: exerciseName(exerciseId) })}
      style={[
        styles.box,
        {
          height: Math.max(height, VIDEO_MIN_HEIGHT),
          backgroundColor: isDark ? color.dark.surfaceSunken : color.surfaceSunken,
        },
      ]}
    >
      <video
        key={src}
        src={still ? `${src}#t=0.1` : src}
        autoPlay={!still}
        loop
        muted
        playsInline
        preload="auto"
        aria-hidden
        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  box: { width: '100%', borderRadius: radius.md, overflow: 'hidden' },
});
