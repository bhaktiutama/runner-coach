import { border, color, Icon, radius, space, Text, themed, useReducedMotion } from '@run-coach/ui';
import { useEffect, useMemo, useState } from 'react';
import { Image, type ImageSourcePropType, StyleSheet, View } from 'react-native';
import { t } from '@/i18n/t';
import { exerciseName } from '@/timer/labels';
import { exerciseFrames } from './exerciseFrames';
import { pingPong, tempoFor } from './frameTiming';

type Props = { exerciseId: string; dark?: boolean; height?: number };

/** Sisi kotak animasi: persegi, cukup untuk gerakan berdiri maupun berbaring. */
const FRAME_BOX_MAX = space[10] * 6;

/**
 * Animasi gerakan strength/core (F-21, D8). Gerakan yang punya frame (`exerciseFrames`) diputar
 * bolak-balik di kotak persegi; yang belum tetap placeholder. Web dan native memakai komponen yang sama.
 */
export function ExerciseAnimation({ exerciseId, dark, height = space[10] * 4 }: Props) {
  const frames = exerciseFrames[exerciseId];
  if (frames) return <FrameAnimation exerciseId={exerciseId} frames={frames} />;
  return <Placeholder exerciseId={exerciseId} dark={dark} height={height} />;
}

/**
 * Memutar frame 1 -> n -> 1 berulang, menahan posisi awal dan puncak. Reduce motion: diam di frame
 * puncak (pose yang paling menjelaskan gerakan). Semua frame dirender sejak awal (hanya satu yang
 * terlihat) agar tidak berkedip saat berganti.
 */
function FrameAnimation({ exerciseId, frames }: { exerciseId: string; frames: ImageSourcePropType[] }) {
  const reduced = useReducedMotion();
  const beats = useMemo(() => pingPong(frames.length, tempoFor(exerciseId)), [frames.length, exerciseId]);
  const [p, setP] = useState(0);
  useEffect(() => {
    if (reduced) return;
    const id = setTimeout(() => setP((v) => (v + 1) % beats.length), beats[p]?.ms ?? 100);
    return () => clearTimeout(id);
  }, [p, reduced, beats]);
  const shown = reduced ? frames.length - 1 : (beats[p]?.frame ?? 0);

  return (
    <View
      testID={`exercise-animation-${exerciseId}`}
      accessibilityRole="image"
      accessibilityLabel={t('strength.animationLabel', { name: exerciseName(exerciseId) })}
      // Tanpa kotak: frame transparan langsung di atas warna latar layar.
      style={styles.frameBox}
    >
      {frames.map((src, k) => (
        <Image
          key={k}
          source={src}
          accessible={false}
          testID={k === shown ? `exercise-frame-${exerciseId}-${k + 1}` : undefined}
          style={[styles.frame, { opacity: k === shown ? 1 : 0 }]}
        />
      ))}
    </View>
  );
}

/** Tempat animasi kosong untuk gerakan yang belum punya frame. */
function Placeholder({ exerciseId, dark, height }: Props & { height: number }) {
  const line = dark ? color.dark.line : color.lineStrong;
  const ink = dark ? color.dark.textMuted : color.textMuted;
  return (
    <View
      testID={`exercise-animation-${exerciseId}`}
      accessibilityLabel={t('strength.animationSoon')}
      style={[
        styles.box,
        { height, borderColor: line, backgroundColor: dark ? color.dark.surfaceSunken : color.surfaceSunken },
      ]}
    >
      <Icon name="strength" size={space[6]} color={ink} />
      <Text variant="caption" style={{ color: ink }} align="center">
        {t('strength.animationSoon')}
      </Text>
    </View>
  );
}

const styles = themed(() =>
  StyleSheet.create({
    box: {
      width: '100%',
      borderRadius: radius.md,
      borderWidth: border.selected,
      borderStyle: 'dashed',
      alignItems: 'center',
      justifyContent: 'center',
      gap: space[2],
    },
    frameBox: {
      width: '100%',
      maxWidth: FRAME_BOX_MAX,
      aspectRatio: 1,
      alignSelf: 'center',
    },
    // Ukuran eksplisit: di web gambar lokal membawa ukuran aslinya sebagai style bawaan.
    frame: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', resizeMode: 'contain' },
  }),
);
