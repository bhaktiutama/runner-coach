import Svg, { Circle, Polyline } from 'react-native-svg';
import { duration, useAnimatedNumber } from '../motion';
import { color as colors, space } from '../theme';

/** Garis tren sederhana (3.3). Nilai lebih kecil = lebih baik (pace) jika `invert`. */
export function LineTrend({
  values,
  width,
  height = space[10] * 2,
  color = colors.success,
  invert = false,
  animate = false,
}: {
  values: number[];
  width: number;
  height?: number;
  color?: string;
  invert?: boolean;
  /** Garis tergambar dari kiri ke kanan saat tampil (UI/UX bagian 11, G7). */
  animate?: boolean;
}) {
  const drawn = useAnimatedNumber(1, animate ? 'count' : 'none', {
    from: animate ? 0 : undefined,
    delay: duration.base + duration.fast,
  });
  if (values.length === 0) return null;
  const pad = space[2];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => {
    const x =
      pad + (values.length === 1 ? (width - 2 * pad) / 2 : (i / (values.length - 1)) * (width - 2 * pad));
    const norm = (v - min) / span;
    const y = pad + (invert ? norm : 1 - norm) * (height - 2 * pad);
    return { x, y };
  });
  const last = pts[pts.length - 1]!;
  const length = pts.reduce(
    (a, p, i) => (i ? a + Math.hypot(p.x - pts[i - 1]!.x, p.y - pts[i - 1]!.y) : 0),
    0,
  );
  return (
    <Svg width={width} height={height} accessibilityRole="image">
      <Polyline
        points={pts.map((p) => `${p.x},${p.y}`).join(' ')}
        fill="none"
        stroke={color}
        strokeWidth={3}
        strokeLinejoin="round"
        strokeLinecap="round"
        strokeDasharray={animate ? `${length} ${length}` : undefined}
        strokeDashoffset={animate ? length * (1 - drawn) : undefined}
      />
      <Circle cx={last.x} cy={last.y} r={space[2] / 1.5} fill={color} />
    </Svg>
  );
}
