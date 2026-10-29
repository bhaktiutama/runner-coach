import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { size as sizes } from '../theme';

type Props = {
  width: number;
  height: number;
  /** 0..1 */
  progress: number;
  color: string;
  trackColor: string;
  stroke?: number;
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
  children,
}: Props) {
  const w = width - stroke;
  const h = height - stroke;
  const r = Math.min(w, h) / 2;
  const perimeter = 2 * (w - 2 * r) + 2 * (h - 2 * r) + 2 * Math.PI * r;
  const p = Math.max(0, Math.min(1, progress));
  return (
    <View
      style={{ width, height }}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(p * 100) }}
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

const styles = StyleSheet.create({ center: { alignItems: 'center', justifyContent: 'center' } });
