import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Defs, Line, Pattern, Rect } from 'react-native-svg';
import { border, color, radius, size, space } from '../theme';
import { Icon } from './Icon';
import { Text } from './Text';

export type LaneZone = 'recovery' | 'easy' | 'long' | 'tempo' | 'interval';

/** Isi lajur: warna zona; drill = arsir peach (wireframe 2.1/2.2). */
function LaneFill({ zone, drill, w, h }: { zone: LaneZone; drill?: boolean; w: number | string; h: number }) {
  if (!drill) return <View style={{ width: w as number, height: h, backgroundColor: color.zone[zone] }} />;
  return (
    <Svg width={w as number} height={h}>
      <Defs>
        <Pattern
          id="hatch"
          width={space[2]}
          height={space[2]}
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <Rect width={space[2]} height={space[2]} fill={color.surface} />
          <Line x1={0} y1={0} x2={0} y2={space[2]} stroke={color.zone.easy} strokeWidth={space[1]} />
        </Pattern>
      </Defs>
      <Rect width="100%" height={h} fill="url(#hatch)" />
    </Svg>
  );
}

/** Garis segmen horizontal proporsional durasi (kartu 2.1). */
export function SegmentBar({
  segments,
}: {
  segments: { zone: LaneZone; weight: number; drill?: boolean }[];
}) {
  return (
    <View style={styles.segBar}>
      {segments.map((s, i) => (
        <View key={i} style={[styles.segPart, { flex: Math.max(0.05, s.weight) }]}>
          <LaneFill zone={s.zone} drill={s.drill} w="100%" h={space[5]} />
        </View>
      ))}
    </View>
  );
}

/** Penanda lajur vertikal kecil di daftar segmen. */
export function LaneMark({ zone, drill, tall }: { zone: LaneZone; drill?: boolean; tall?: boolean }) {
  return (
    <View style={[styles.mark, tall && styles.markTall]}>
      <LaneFill
        zone={zone}
        drill={drill}
        w={space[2] + space[1]}
        h={tall ? space[10] + space[4] : space[6] + space[2]}
      />
    </View>
  );
}

/** Grafik intensitas sepanjang latihan (2.2): tinggi per zona. */
export function IntensityChart({
  segments,
}: {
  segments: { zone: LaneZone; weight: number; drill?: boolean }[];
}) {
  const height: Record<LaneZone, number> = {
    recovery: space[5],
    easy: space[6] + space[3],
    long: space[8],
    tempo: space[10] * 2 + space[10],
    interval: space[10] * 3,
  };
  return (
    <View style={styles.intensity}>
      {segments.map((s, i) => (
        <View key={i} style={[styles.intPart, { flex: Math.max(0.03, s.weight) }]}>
          <View style={[styles.intBar, { height: s.drill ? space[10] + space[4] : height[s.zone] }]}>
            <LaneFill
              zone={s.zone}
              drill={s.drill}
              w="100%"
              h={s.drill ? space[10] + space[4] : height[s.zone]}
            />
          </View>
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
};

/** 7 lajur minggu (2.1, 3.1). */
export function LaneWeek({ days }: { days: LaneDay[] }) {
  return (
    <View style={styles.week}>
      {days.map((d, i) => {
        const z = d.zone ? color.zone[d.zone] : color.surfaceSunken;
        const fill = d.state === 'completed' ? z : d.state === 'rest' ? color.surfaceSunken : color.surface;
        const borderColor =
          d.state === 'rest' ? color.surfaceSunken : d.state === 'missed' ? color.status.behindInk : z;
        return (
          <Pressable
            key={i}
            onPress={d.onPress}
            accessibilityLabel={d.label}
            style={styles.dayCol}
            disabled={!d.onPress}
          >
            <View style={[styles.todayRing, d.today && { borderColor: color.text }]}>
              <View
                style={[
                  styles.dayLane,
                  {
                    backgroundColor: fill,
                    borderColor,
                    borderStyle: d.state === 'missed' ? 'dashed' : 'solid',
                  },
                ]}
              >
                {d.state === 'completed' ? <Icon name="check" size={space[5]} color={color.text} /> : null}
              </View>
            </View>
            <Text variant="label" color={d.today ? 'text' : 'textMuted'} style={d.today ? styles.bold : null}>
              {d.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export type PhaseKey = 'base' | 'build' | 'peak' | 'taper' | 'return';
const phaseColor = (p: PhaseKey) => (p === 'return' ? color.status.recovery : color.phase[p]);

/** Bar fase per minggu (1.8, 3.1). */
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
          <View key={i} style={[styles.phaseCell, i + 1 === current && styles.phaseCurrent]}>
            <View style={[styles.phasePill, { backgroundColor: phaseColor(p) }]} />
          </View>
        ))}
      </View>
      <View style={styles.legend}>
        {legend.map((l) => (
          <View key={l.phase} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: phaseColor(l.phase) }]} />
            <Text variant="label" color="textMuted">
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
}: {
  bars: { value: number; label: string; phase: PhaseKey; outline?: boolean }[];
  highlightIndex?: number;
}) {
  const max = Math.max(1, ...bars.map((b) => b.value));
  const area = space[10] * 3 + space[1];
  const labelH = space[4];
  return (
    <View style={[styles.bars, { height: area }]} accessibilityRole="image">
      {bars.map((b, i) => {
        const fill = i === highlightIndex ? color.primary : phaseColor(b.phase);
        return (
          <View key={i} style={styles.barCol}>
            <Text variant="chartLabel" color="textMuted">
              {b.label}
            </Text>
            <View
              style={[
                styles.bar,
                {
                  height: Math.max(space[2], (b.value / max) * (area - labelH - space[1])),
                  backgroundColor: b.outline ? color.surface : fill,
                },
                b.outline && { borderWidth: border.selected, borderColor: fill },
              ]}
            />
          </View>
        );
      })}
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
  const bg = tone === 'neutral' ? color.surface : color.status[tone];
  return (
    <View style={[styles.status, { backgroundColor: bg }, tone === 'neutral' && styles.statusNeutral]}>
      <Text variant="heading">{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  segBar: { flexDirection: 'row', gap: space[2], height: space[5] },
  segPart: { borderRadius: radius.stadium, overflow: 'hidden' },
  mark: { borderRadius: radius.stadium, overflow: 'hidden' },
  markTall: {},
  intensity: { flexDirection: 'row', alignItems: 'flex-end', gap: space[1], height: space[10] * 3 },
  intPart: { justifyContent: 'flex-end' },
  intBar: { borderRadius: radius.sm, overflow: 'hidden' },
  week: { flexDirection: 'row', justifyContent: 'space-between' },
  dayCol: { alignItems: 'center', gap: space[2], flex: 1 },
  todayRing: {
    borderRadius: radius.stadium,
    borderWidth: border.selected,
    borderColor: 'transparent',
    padding: border.hairline,
  },
  dayLane: {
    width: size.touchMin - space[1],
    height: size.buttonPrimary + space[3],
    borderRadius: radius.stadium,
    borderWidth: border.selected,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bold: { fontWeight: '700' },
  phaseWrap: { gap: space[2] },
  phaseRow: { flexDirection: 'row', gap: space[1] },
  phaseCell: {
    flex: 1,
    borderRadius: radius.stadium,
    borderWidth: border.selected,
    borderColor: 'transparent',
    padding: border.hairline,
  },
  phaseCurrent: { borderColor: color.text },
  phasePill: { height: space[5], borderRadius: radius.stadium },
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
  statusNeutral: { borderWidth: border.control, borderColor: color.line, minHeight: size.touchMin },
});
