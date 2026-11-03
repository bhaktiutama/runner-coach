import {
  border,
  color,
  Icon,
  paletteFor,
  radius,
  space,
  Text,
  themed,
  useReducedMotion,
} from '@run-coach/ui';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { t } from '@/i18n/t';
import { exerciseName } from '@/timer/labels';
import { exerciseFrames, type FrameSet } from './exerciseFrames';
import { nextFrame } from './frameTiming';

type Props = { exerciseId: string; dark?: boolean; height?: number };

/** Tinggi minimum kotak saat memutar frame (figur potret), supaya gerakan terbaca. */
const FRAME_BOX_MIN_HEIGHT = space[10] * 5;

/**
 * Animasi gerakan strength/core (F-21, D8). Gerakan yang punya frame (`exerciseFrames`) diputar
 * bertahap; yang belum tetap placeholder. Web dan native memakai komponen yang sama. Layar 2.2s dan
 * 2.3s tidak berubah.
 */
export function ExerciseAnimation({ exerciseId, dark, height = space[10] * 4 }: Props) {
  const set = exerciseFrames[exerciseId];
  if (set) return <FrameAnimation exerciseId={exerciseId} set={set} height={height} />;
  return <Placeholder exerciseId={exerciseId} dark={dark} height={height} />;
}

/**
 * Memutar frame satu per satu, berulang. Reduce motion: berhenti di frame pertama. Semua frame
 * dirender sejak awal (hanya satu yang terlihat) agar tidak berkedip saat berganti.
 */
function FrameAnimation({ exerciseId, set, height }: { exerciseId: string; set: FrameSet; height: number }) {
  const reduced = useReducedMotion();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduced) {
      setI(0);
      return;
    }
    const id = setTimeout(() => setI((v) => nextFrame(v, set.frames.length)), set.ms[i] ?? 500);
    return () => clearTimeout(id);
  }, [i, reduced, set]);

  return (
    <View
      testID={`exercise-animation-${exerciseId}`}
      accessibilityRole="image"
      accessibilityLabel={t('strength.animationLabel', { name: exerciseName(exerciseId) })}
      // Ilustrasi digambar untuk latar terang (rambut dan celana hitam): selalu di atas surface-sunken terang.
      style={[
        styles.frameBox,
        {
          height: Math.max(height, FRAME_BOX_MIN_HEIGHT),
          backgroundColor: paletteFor('light').surfaceSunken,
        },
      ]}
    >
      {set.frames.map((src, k) => (
        <Image
          key={k}
          source={src}
          accessible={false}
          testID={k === i ? `exercise-frame-${exerciseId}-${k + 1}` : undefined}
          style={[styles.frame, { opacity: k === i ? 1 : 0 }]}
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
    frameBox: { width: '100%', borderRadius: radius.md, overflow: 'hidden' },
    // Ukuran eksplisit: di web gambar lokal membawa ukuran aslinya sebagai style bawaan.
    frame: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', resizeMode: 'contain' },
  }),
);
