import { type ReactNode, useId } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { duration, useAnimatedNumber, type RingMotion } from '../motion';
import { mixHex, size as sizes, themed, toneRamp } from '../theme';

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
  /** Busur bergradasi satu tone di sepanjang lintasan: ekor terang -> kepala pekat (`toneRamp`). Timer. */
  gradient?: boolean;
  children?: ReactNode;
};

/** Jumlah potongan busur untuk gradasi di sepanjang lintasan (SVG tidak punya gradasi mengikuti garis). */
const SLICES = 48;

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
  gradient = false,
  children,
}: Props) {
  const w = width - stroke;
  const h = height - stroke;
  const r = Math.min(w, h) / 2;
  const perimeter = 2 * (w - 2 * r) + 2 * (h - 2 * r) + 2 * Math.PI * r;
  const target = Math.max(0, Math.min(1, progress));
  const shown = useAnimatedNumber(target, motion, animateIn ? { from: 0, delay: duration.base } : {});
  // Easing stride boleh melewati 1 sebentar; busur dibatasi ke 0..1.
  const p = Math.max(0, Math.min(1, shown));
  const p100 = Math.round(target * 100);
  const rect = { x: stroke / 2, y: stroke / 2, width: w, height: h, rx: r, ry: r, fill: 'none' };
  const len = perimeter * p;
  const [tail, head] = toneRamp(color);
  return (
    <View
      style={{ width, height }}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: p100 }}
    >
      <Svg width={width} height={height}>
        <Rect {...rect} stroke={trackColor} strokeWidth={stroke} />
        {p > 0 && !gradient ? (
          <Rect
            {...rect}
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${len} ${perimeter}`}
          />
        ) : null}
        {p > 0 && gradient ? (
          <>
            {/* Ujung bulat: titik di ekor dan kepala, lalu potongan busur bersambung (sedikit tumpang tindih). */}
            <Rect
              {...rect}
              stroke={tail}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={`0.01 ${perimeter}`}
            />
            {Array.from({ length: SLICES }, (_, k) => {
              const a = (len * k) / SLICES;
              return (
                <Rect
                  key={k}
                  {...rect}
                  stroke={mixHex(tail, head, (k + 0.5) / SLICES)}
                  strokeWidth={stroke}
                  strokeDasharray={`${len / SLICES + 0.6} ${perimeter}`}
                  strokeDashoffset={-a}
                />
              );
            })}
            <Rect
              {...rect}
              stroke={head}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={`0.01 ${perimeter}`}
              strokeDashoffset={-Math.max(0, len - 0.01)}
            />
          </>
        ) : null}
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]}>{children}</View>
    </View>
  );
}

/** Bar progres lurus bergradasi satu tone (set timer strength/drill), pasangan `TrackRing gradient`. */
export function ToneBar({
  progress,
  color,
  trackColor,
  height = sizes.trackStroke / 2,
}: {
  progress: number;
  color: string;
  trackColor: string;
  height?: number;
}) {
  const frac = Math.max(0, Math.min(1, progress));
  const [tail, head] = toneRamp(color);
  const id = `tone${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <View
      style={[styles.bar, { height, borderRadius: height / 2, backgroundColor: trackColor }]}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(frac * 100) }}
    >
      {frac > 0 ? (
        <View style={{ width: `${frac * 100}%`, height, borderRadius: height / 2, overflow: 'hidden' }}>
          <Svg width="100%" height={height}>
            <Defs>
              <LinearGradient id={id} x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor={tail} />
                <Stop offset="1" stopColor={head} />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height={height} fill={`url(#${id})`} />
          </Svg>
        </View>
      ) : null}
    </View>
  );
}

const styles = themed(() =>
  StyleSheet.create({
    center: { alignItems: 'center', justifyContent: 'center' },
    bar: { alignSelf: 'stretch', overflow: 'hidden' },
  }),
);
