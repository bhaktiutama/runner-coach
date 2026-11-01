import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { useAnimatedNumber, type RingMotion } from '../motion';
import { size as sizes, themed } from '../theme';

type Props = {
  width: number;
  height: number;
  /** 0..1 */
  progress: number;
  color: string;
  trackColor: string;
  stroke?: number;
  /** Gerak saat progres berubah: `stride` (default), `linear` (timer, per detik), `none`. */
  motion?: RingMotion;
  /** Mulai dari 0 saat pertama tampil (perayaan minggu tuntas). */
  animateIn?: boolean;
  children?: ReactNode;
};

/** Cincin oval lintasan (2 lurus + 2 tikungan), bukan lingkaran (design system ciri 2). */
export function TrackRing({
  width,
  height,
  progress,
  color,
  trackColor,
  stroke = sizes.trackStroke,
  motion = 'stride',
  animateIn = false,
  children,
}: Props) {
  const w = width - stroke;
  const h = height - stroke;
  const r = Math.min(w, h) / 2;
  const perimeter = 2 * (w - 2 * r) + 2 * (h - 2 * r) + 2 * Math.PI * r;
  const target = Math.max(0, Math.min(1, progress));
  const shown = useAnimatedNumber(target, motion, animateIn ? 0 : undefined);
  // Easing stride boleh melewati 1 sebentar; busur dibatasi ke 0..1.
  const p = Math.max(0, Math.min(1, shown));
  const p100 = Math.round(target * 100);
  return (
    <View
      style={{ width, height }}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: p100 }}
    >
      <Svg width={width} height={height}>
        <Rect
          x={stroke / 2}
          y={stroke / 2}
          width={w}
          height={h}
          rx={r}
          ry={r}
          fill="none"
          stroke={trackColor}
          strokeWidth={stroke}
        />
        {p > 0 ? (
          <Rect
            x={stroke / 2}
            y={stroke / 2}
            width={w}
            height={h}
            rx={r}
            ry={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${perimeter * p} ${perimeter}`}
          />
        ) : null}
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]}>{children}</View>
    </View>
  );
}

const styles = themed(() =>
  StyleSheet.create({ center: { alignItems: 'center', justifyContent: 'center' } }),
);
