import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { formatNumber } from '../format';
import { duration, easing, ScaleIn, STAGGER_BAR, useAnimatedNumber, useEntrance } from '../motion';
import Svg, { Defs, Pattern, Rect } from 'react-native-svg';
import { border, color, fontFiles, radius, ring, size, space, themed } from '../theme';
import { Icon } from './Icon';
import { Text } from './Text';

export type LaneZone = 'recovery' | 'easy' | 'long' | 'tempo' | 'interval' | 'strength';

/** Arsir drill: garis peach 5 px, celah putih 3 px, miring 135 derajat (wireframe 2.1/2.2). */
const HATCH = space[2];
const HATCH_LINE = space[1] + border.hairline;
let hatchSeq = 0;

/** Isi lajur: warna zona atau arsir drill. Sudut dibulatkan oleh pembungkus. */
function LaneFill({ zone, drill }: { zone: LaneZone; drill?: boolean }) {
  if (!drill) return <View style={[StyleSheet.absoluteFill, { backgroundColor: color.zone[zone] }]} />;
  const id = `hatch${hatchSeq++}`;
  return (
    <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
      <Defs>
        <Pattern
          id={id}
          width={HATCH}
          height={HATCH}
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <Rect width={HATCH} height={HATCH} fill={color.surface} />
          <Rect width={HATCH_LINE} height={HATCH} fill={color.zone.easy} />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}

/** Garis segmen horizontal proporsional durasi (kartu 2.1): tinggi 12, jarak 3. */
export function SegmentBar({
  segments,
  height = space[3],
}: {
  segments: { zone: LaneZone; weight: number; drill?: boolean }[];
  height?: number;
}) {
  return (
    <View style={[styles.segBar, { height }]}>
      {segments.map((s, i) => (
        <View key={i} style={[styles.segPart, { flex: Math.max(0.05, s.weight) }]}>
          <LaneFill zone={s.zone} drill={s.drill} />
        </View>
      ))}
    </View>
  );
}

/** Penanda lajur vertikal 6 px: pendek 20 (daftar kartu), 24 (`tall`) atau mengisi tinggi baris (`stretch`). */
export function LaneMark({
  zone,
  drill,
  stretch,
  tall,
}: {
  zone: LaneZone;
  drill?: boolean;
  stretch?: boolean;
  /** Tinggi 24 (tabel segmen 3.4). */
  tall?: boolean;
}) {
  return (
    <View style={[styles.mark, stretch ? styles.markStretch : tall ? styles.markTall : styles.markShort]}>
      <LaneFill zone={zone} drill={drill} />
    </View>
  );
}

/** Grafik intensitas (2.2): tinggi 64, jarak 3, easy 30%, drill 45%, tempo/interval 100%. */
export function IntensityChart({
  segments,
}: {
  segments: { zone: LaneZone; weight: number; drill?: boolean }[];
}) {
  const pct: Record<LaneZone, number> = {
    recovery: 0.2,
    easy: 0.3,
    long: 0.4,
    tempo: 1,
    interval: 1,
    strength: 0.6,
  };
  const h = space[10] + space[6];
  return (
    <View style={[styles.intensity, { height: h }]}>
      {segments.map((s, i) => (
        <View
          key={i}
          style={[
            styles.intBar,
            { flex: Math.max(0.03, s.weight), height: h * (s.drill ? 0.45 : pct[s.zone]) },
          ]}
        >
          <LaneFill zone={s.zone} drill={s.drill} />
        </View>
      ))}
    </View>
  );
}

export type LaneDay = {
  label: string;
  zone: LaneZone | null;
  state: 'rest' | 'scheduled' | 'completed' | 'missed';
  today: boolean;
  onPress?: () => void;
  /** Penanda kecil di sudut lajur, mis. "S" untuk hari dengan strength (F-21). */
  badge?: string;
};

const ON_ZONE = {
  recovery: 'onRecovery',
  easy: 'onEasy',
  long: 'onLong',
  tempo: 'onTempo',
  interval: 'onInterval',
  strength: 'onStrength',
} as const;

/** Warna isi (ikon/teks) di atas warna zona; tanpa zona = warna teks biasa. */
export const onZone = (z: LaneZone | null | undefined) => (z ? color.zone[ON_ZONE[z]] : color.text);

/** 7 lajur minggu (2.1): tinggi 44, cincin 2.5 warna zona, hari ini garis luar 2 px. */
/** `animate`: lajur muncul membesar bergantian saat tampil (UI/UX bagian 11, G8). */
export function LaneWeek({ days, animate = false }: { days: LaneDay[]; animate?: boolean }) {
  return (
    <View style={styles.week}>
      {days.map((d, i) => {
        const z = d.zone ? color.zone[d.zone] : color.surfaceSunken;
        const lane =
          d.state === 'rest'
            ? { backgroundColor: color.surfaceSunken }
            : d.state === 'completed'
              ? { backgroundColor: z }
              : d.state === 'missed'
                ? {
                    backgroundColor: color.surface,
                    borderWidth: border.selected,
                    borderStyle: 'dashed' as const,
                    borderColor: color.status.behindInk,
                  }
                : { backgroundColor: color.surface, ...ring(border.selected, z) };
        return (
          <Pressable
            key={i}
            onPress={d.onPress}
            accessibilityLabel={d.label}
            style={styles.dayCol}
            disabled={!d.onPress}
          >
            <ScaleIn index={i} enabled={animate} style={styles.stretch}>
              <View style={[styles.dayLane, lane, d.today && styles.todayOutline]}>
                {d.state === 'completed' ? (
                  <Icon name="check" size={space[4]} color={onZone(d.zone)} strokeWidth={3} />
                ) : null}
                {d.badge ? <LaneBadge label={d.badge} /> : null}
              </View>
            </ScaleIn>
            <Text
              variant="caption"
              color={d.today ? 'text' : 'textMuted'}
              style={d.today ? styles.bold : null}
            >
              {d.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Penanda bulat charcoal (strength) di sudut kanan atas lajur atau baris kalender. */
export function LaneBadge({ label }: { label: string }) {
  return (
    <View style={styles.laneBadge}>
      <Text variant="captionStrong" style={styles.laneBadgeText}>
        {label}
      </Text>
    </View>
  );
}

export type PhaseKey = 'base' | 'build' | 'peak' | 'taper' | 'return';
const phaseColor = (p: PhaseKey) => (p === 'return' ? color.status.recovery : color.phase[p]);

/** Bar fase per minggu (3.1): pil 14 px jarak 4, minggu ini garis luar 2 px; legenda kotak 10. */
export function PhaseBar({
  weeks,
  current,
  legend,
}: {
  weeks: PhaseKey[];
  current?: number;
  legend: { phase: PhaseKey; label: string }[];
}) {
  return (
    <View style={styles.phaseWrap}>
      <View style={styles.phaseRow}>
        {weeks.map((p, i) => (
          <View
            key={i}
            style={[
              styles.phasePill,
              { backgroundColor: phaseColor(p) },
              i + 1 === current && styles.todayOutline,
            ]}
          />
        ))}
      </View>
      <View style={styles.legend}>
        {legend.map((l) => (
          <View key={l.phase} style={styles.legendItem}>
            <View style={[styles.legendDotSm, { backgroundColor: phaseColor(l.phase) }]} />
            <Text variant="caption" color="textMuted">
              {l.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/** Grafik batang volume per minggu (1.8, 3.3): tinggi area 124, jarak 6, label angka di atas batang. */
export function BarChart({
  bars,
  highlightIndex,
  height,
  animate = false,
}: {
  bars: { value: number; label: string; phase: PhaseKey; outline?: boolean }[];
  highlightIndex?: number;
  /** Tinggi area grafik; default 124 (1.8), 96 untuk 3.3. */
  height?: number;
  /** Batang tumbuh dari dasar bergantian + angka naik dari 0 saat tampil (UI/UX bagian 11, G7). */
  animate?: boolean;
}) {
  const max = Math.max(1, ...bars.map((b) => b.value));
  const area = height ?? space[10] * 3 + space[1];
  const labelH = space[4];
  return (
    <View
      style={[
        styles.bars,
        { height: area, gap: bars.length > 10 ? space[1] : height ? space[2] : space[1] + space[1] / 2 },
      ]}
      accessibilityRole="image"
    >
      {bars.map((b, i) => (
        <Bar
          key={i}
          bar={b}
          index={i}
          animate={animate}
          fill={i === highlightIndex ? color.primary : phaseColor(b.phase)}
          barHeight={Math.max(space[2], (b.value / max) * (area - labelH - space[1]))}
        />
      ))}
    </View>
  );
}

const NUMERIC = /^(-?\d+)(?:[.,](\d+))?$/;

function Bar({
  bar,
  index,
  animate,
  fill,
  barHeight,
}: {
  bar: { value: number; label: string; outline?: boolean };
  index: number;
  animate: boolean;
  fill: string;
  barHeight: number;
}) {
  const delay = index * STAGGER_BAR;
  const grow = useEntrance({ delay, durationMs: duration.slow, ease: easing.stride, enabled: animate });
  const m = NUMERIC.exec(bar.label);
  const target = m ? parseFloat(`${m[1]}.${m[2] ?? '0'}`) : 0;
  const counted = useAnimatedNumber(target, animate && m ? 'count' : 'none', {
    from: animate && m ? 0 : undefined,
    delay,
    durationMs: duration.slow,
  });
  return (
    <View style={styles.barCol}>
      <Text variant="chartLabel" color="textMuted">
        {animate && m ? formatNumber(counted, m[2]?.length ?? 0) : bar.label}
      </Text>
      <Animated.View
        style={[
          styles.bar,
          {
            height: barHeight,
            backgroundColor: bar.outline ? color.surface : fill,
            transformOrigin: 'bottom',
            transform: [{ scaleY: grow }],
          },
          bar.outline && { borderWidth: border.selected, borderColor: fill },
        ]}
      />
    </View>
  );
}

/** Legenda fase: kotak 12 px radius 4 + label 12/600, rata kiri-kanan. */
export function PhaseLegend({ items }: { items: { phase: PhaseKey; label: string }[] }) {
  return (
    <View style={styles.legend}>
      {items.map((l) => (
        <View key={l.phase} style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: phaseColor(l.phase) }]} />
          <Text variant="caption" color="textMuted">
            {l.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

/** Chip status plan (stadium, teks + ikon). */
export function StatusChip({
  label,
  tone,
}: {
  label: string;
  tone: 'onTrack' | 'attention' | 'behind' | 'recovery' | 'neutral';
}) {
  if (tone === 'neutral') {
    return (
      <View style={[styles.badge, styles.statusNeutral]}>
        <Text variant="badge">{label}</Text>
      </View>
    );
  }
  return (
    <View style={[styles.status, { backgroundColor: color.status[tone] }]}>
      <Text variant="controlSmStrong" color="onStatus">
        {label}
      </Text>
    </View>
  );
}

const styles = themed(() =>
  StyleSheet.create({
    laneBadge: {
      position: 'absolute',
      top: -space[1] - border.hairline,
      right: -space[1] - border.hairline,
      minWidth: space[4] + space[1],
      height: space[4] + space[1],
      paddingHorizontal: space[1],
      borderRadius: radius.stadium,
      backgroundColor: color.zone.strength,
      alignItems: 'center',
      justifyContent: 'center',
    },
    laneBadgeText: { color: color.zone.onStrength },
    segBar: { flexDirection: 'row', gap: border.selected + border.hairline / 2 },
    segPart: { borderRadius: radius.stadium, overflow: 'hidden' },
    mark: { width: space[1] + space[1] / 2, borderRadius: radius.stadium, overflow: 'hidden' },
    markShort: { height: space[5] },
    markTall: { height: space[6] },
    markStretch: { alignSelf: 'stretch' },
    intensity: { flexDirection: 'row', alignItems: 'flex-end', gap: border.selected + border.hairline / 2 },
    intBar: {
      overflow: 'hidden',
      borderTopLeftRadius: space[2],
      borderTopRightRadius: space[2],
      borderBottomLeftRadius: space[1],
      borderBottomRightRadius: space[1],
    },
    week: { flexDirection: 'row', gap: space[2] },
    stretch: { alignSelf: 'stretch' },
    dayCol: { alignItems: 'center', gap: space[1] + space[1] / 2, flex: 1 },
    todayOutline: {
      outlineWidth: border.selected - border.hairline / 2,
      outlineColor: color.text,
      outlineStyle: 'solid',
      outlineOffset: border.selected - border.hairline / 2,
    },
    dayLane: {
      width: '100%',
      height: size.touchMin,
      borderRadius: radius.stadium,
      alignItems: 'center',
      justifyContent: 'center',
    },
    bold: { fontFamily: fontFiles.ui800 },
    phaseWrap: { gap: space[2] },
    phaseRow: { flexDirection: 'row', gap: space[1] },
    phasePill: {
      flex: 1,
      height: space[3] + border.selected - border.hairline / 2,
      borderRadius: radius.stadium,
    },
    legendDotSm: {
      width: space[2] + border.selected - border.hairline / 2,
      height: space[2] + border.selected - border.hairline / 2,
      borderRadius: border.selected + border.hairline / 2,
    },
    legend: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: space[2] },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: space[1] + space[1] / 2 },
    legendDot: { width: space[3], height: space[3], borderRadius: space[1] },
    bars: { flexDirection: 'row', alignItems: 'flex-end', gap: space[1] + space[1] / 2 },
    barCol: { flex: 1, alignItems: 'center', gap: space[1], justifyContent: 'flex-end' },
    bar: {
      width: '100%',
      borderTopLeftRadius: radius.sm,
      borderTopRightRadius: radius.sm,
      borderBottomLeftRadius: radius.bib,
      borderBottomRightRadius: radius.bib,
    },
    status: {
      minHeight: size.touchMin - space[4],
      paddingHorizontal: space[4],
      borderRadius: radius.stadium,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'flex-start',
    },
    statusNeutral: { ...ring(border.hairline, color.line) },
    badge: {
      paddingVertical: space[1] + space[1] / 2,
      paddingHorizontal: space[3],
      borderRadius: radius.stadium,
      backgroundColor: color.surface,
      alignSelf: 'flex-start',
    },
  }),
);
