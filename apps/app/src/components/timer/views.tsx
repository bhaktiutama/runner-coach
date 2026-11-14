// Tampilan drill (2.3b) dan strength (2.3s) layar timer (dipisah dari app/timer/[id].tsx, tanpa perubahan perilaku).
import { type EngineMessageKey } from '@run-coach/training-engine';
import { BibTag, color, Icon, size, space, SpotIcon, Text, ToneBar, TrackRing } from '@run-coach/ui';
import { formatClock, formatDuration } from '@run-coach/ui/format';
import { Pressable, useWindowDimensions, View } from 'react-native';
import { ExerciseAnimation } from '@/components/ExerciseAnimation';
import { t } from '@/i18n/t';
import { et } from '@/lib/rationale';
import { useSpotIcons } from '@/lib/spot';
import { exerciseCue, exerciseName, segmentName } from '@/timer/labels';
import { plannedS } from '@/timer/machine';
import { useTimer } from '@/timer/useTimer';
import { dark, styles } from './styles';

export function DrillView({
  tm,
  paused,
  far,
  onToggleFar,
}: {
  tm: ReturnType<typeof useTimer>;
  paused: boolean;
  far: boolean;
  onToggleFar: () => void;
}) {
  const icons = useSpotIcons();
  const pos = tm.position!;
  const seg = pos.segment;
  if (!seg || seg.kind !== 'drill') return null;
  const group = tm.segs.filter((s) => s.group === seg.group);
  const exercises = [...new Set(group.map((s) => (s.kind === 'drill' ? s.exercise_id : '')))];
  const exIdx = exercises.indexOf(seg.exercise_id) + 1;
  const dose =
    seg.distance_m != null
      ? `${seg.distance_m} m`
      : seg.duration_s != null
        ? formatDuration(seg.duration_s)
        : `${seg.reps}x`;
  const nxt = pos.next;
  const nextLabel =
    nxt && nxt.kind === 'drill' && nxt.exercise_id !== seg.exercise_id
      ? t('timer.drillNextDose', {
          name: et(`drill.${nxt.exercise_id}.name` as EngineMessageKey),
          sets: nxt.sets,
          dose: nxt.distance_m != null ? `${nxt.distance_m} m` : '',
        })
      : nxt && nxt.kind !== 'drill'
        ? t('timer.drillNext', { name: segmentName(nxt) })
        : '';
  const cues = et(`drill.${seg.exercise_id}.cue` as EngineMessageKey)
    .split('. ')
    .map((c) => c.replace(/\.$/, ''))
    .filter(Boolean);
  const drillTimed = seg.timedS != null;
  if (far) {
    return (
      <FarView
        bib={t('timer.drillBib', { n: exIdx, total: exercises.length })}
        zone="easy"
        title={et(`drill.${seg.exercise_id}.name` as EngineMessageKey)}
        sub={t('timer.drillSet', { n: seg.set, total: seg.sets })}
        value={drillTimed ? (pos.remainingS ?? 0) : pos.elapsedInSegS}
        frac={drillTimed && seg.timedS ? pos.elapsedInSegS / seg.timedS : null}
        tint={color.primary}
        paused={paused}
        onPress={onToggleFar}
      />
    );
  }
  return (
    <View style={styles.drill} testID="timer-drill">
      <View style={styles.drillHead}>
        {icons ? (
          // UI/UX 14: ikon drill di kiri bib, tinggi baris tetap setinggi bib.
          <View style={styles.bibSpotRow}>
            <View style={styles.bibSpot}>
              <SpotIcon name="drill" size={size.spotSm} testID="spot-drill" />
            </View>
            <BibTag label={t('timer.drillBib', { n: exIdx, total: exercises.length })} zone="easy" />
          </View>
        ) : (
          <BibTag label={t('timer.drillBib', { n: exIdx, total: exercises.length })} zone="easy" />
        )}
        <Text variant="drillName" color="darkText">
          {et(`drill.${seg.exercise_id}.name` as EngineMessageKey)}
        </Text>
        <Text variant="set" color="darkText">
          {t('timer.drillSet', { n: seg.set, total: seg.sets })}
          <Text variant="set" color="darkTextMuted">
            {t('timer.drillDoseSpaced', { dose })}
          </Text>
        </Text>
        <View style={styles.lanes}>
          {Array.from({ length: seg.sets }, (_, i) => (
            <View
              key={i}
              style={[styles.lane, { backgroundColor: i < seg.set ? color.primary : dark.surfaceSunken }]}
            />
          ))}
        </View>
      </View>
      <SetClock
        value={seg.timedS != null ? (pos.remainingS ?? 0) : pos.elapsedInSegS}
        timed={seg.timedS != null}
        total={seg.timedS}
        elapsed={pos.elapsedInSegS}
        paused={paused}
        onPress={onToggleFar}
      />
      <View style={styles.cues}>
        {cues.map((c) => (
          <View key={c} style={styles.cueRow}>
            <Icon name="check" color={dark.successInk} size={space[5]} />
            <Text variant="subtitle" color="darkText" style={styles.flex}>
              {c}
            </Text>
          </View>
        ))}
      </View>
      <Text variant="controlSm" color="darkTextMuted">
        {t('timer.drillHintNext', {
          hint:
            seg.timedS == null
              ? t('timer.drillHint')
              : [
                  seg.autoTimed ? t('timer.drillAutoHint', { time: formatDuration(seg.timedS) }) : '',
                  t('timer.holdHintDrill'),
                ]
                  .filter(Boolean)
                  .join(' '),
          next: nextLabel,
        })}
      </Text>
    </View>
  );
}

/**
 * 2.3s mode gerakan (F-21, 09-VOICE bagian 6): bar sesi, animasi, nama, set, angka waktu di setiap set
 * (hitung mundur saat berwaktu/otomatis, hitung naik saat manual), cue. Istirahat: cincin hitung mundur
 * + pratinjau gerakan berikutnya.
 */
export function StrengthView({
  tm,
  paused,
  locked,
  far,
  onToggleFar,
}: {
  tm: ReturnType<typeof useTimer>;
  paused: boolean;
  locked: boolean;
  far: boolean;
  onToggleFar: () => void;
}) {
  const pos = tm.position!;
  const seg = pos.segment;
  const { width, height } = useWindowDimensions();
  // Layar pendek (mis. iPhone SE): animasi dan cincin mengecil agar angka waktu tetap terlihat tanpa gulir.
  const short = height < 700;
  const icons = useSpotIcons();
  if (!seg || (seg.kind !== 'exercise' && seg.kind !== 'rest')) return null;
  const groups = [...new Set(tm.segs.filter((s) => s.kind === 'exercise').map((s) => s.group))];
  const exIdx = groups.indexOf(seg.group) + 1;
  const nxt = tm.segs.slice(pos.index + 1).find((s) => s.kind === 'exercise');
  const doseOf = (s: { reps: number | null; duration_s: number | null; per_side: boolean }) => {
    const d =
      s.reps != null ? t('strength.reps', { n: s.reps }) : t('strength.seconds', { n: s.duration_s ?? 0 });
    return s.per_side ? t('strength.perSide', { dose: d }) : d;
  };
  if (far) {
    const rest = seg.kind === 'rest';
    const target = rest ? nxt : seg;
    return (
      <FarView
        bib={
          rest
            ? seg.prep
              ? t('timer.prepBib')
              : t('timer.restBib')
            : t('timer.exerciseBib', { n: exIdx, total: groups.length })
        }
        zone={rest ? 'recovery' : 'strength'}
        title={target && target.kind === 'exercise' ? exerciseName(target.exercise_id) : ''}
        sub={
          target && target.kind === 'exercise'
            ? `${rest ? `${t('timer.restNextLabel')} · ` : ''}${t('timer.drillSet', { n: target.set, total: target.sets })}`
            : null
        }
        value={seg.timedS != null ? (pos.remainingS ?? 0) : pos.elapsedInSegS}
        frac={seg.timedS ? pos.elapsedInSegS / seg.timedS : null}
        tint={rest ? color.zone.recovery : color.primary}
        paused={paused}
        onPress={onToggleFar}
      />
    );
  }
  if (seg.kind === 'rest') {
    const ringW = Math.min(width - space.screenX * 2, size.contentMax / 2, height * (short ? 0.34 : 0.42));
    return (
      <View style={[styles.drill, styles.restCol]} testID="timer-rest">
        <SessionBar tm={tm} />
        <TrackRing
          width={ringW}
          height={ringW}
          stroke={space[3]}
          progress={seg.timedS ? pos.elapsedInSegS / seg.timedS : 0}
          motion="linear"
          gradient
          color={color.zone.recovery}
          trackColor={dark.surfaceSunken}
        >
          <View style={styles.ringCol}>
            {icons ? (
              // UI/UX 14: ikon istirahat / siap-siap di kiri bib; tinggi baris tetap setinggi bib.
              <View style={styles.bibSpotRow}>
                <View style={styles.bibSpot}>
                  <SpotIcon name={seg.prep ? 'get-ready' : 'rest'} size={size.spotSm} testID="spot-rest" />
                </View>
                <BibTag label={seg.prep ? t('timer.prepBib') : t('timer.restBib')} zone="recovery" />
              </View>
            ) : (
              <BibTag label={seg.prep ? t('timer.prepBib') : t('timer.restBib')} zone="recovery" />
            )}
            {paused ? (
              <Text variant="statusCaps" style={{ color: color.status.attention }}>
                {t('timer.paused')}
              </Text>
            ) : null}
            <Text
              variant={short ? 'numberXl' : 'timer'}
              color="darkText"
              style={paused && styles.blink}
              testID="timer-remaining"
            >
              {formatClock(pos.remainingS ?? 0)}
            </Text>
            <Text variant="control" color="darkTextMuted">
              {t('timer.remainingOf', { total: formatDuration(seg.timedS ?? 0) })}
            </Text>
          </View>
        </TrackRing>
        {!seg.prep ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('timer.extendLabel')}
            onPress={tm.extend}
            disabled={locked}
            testID="rest-extend"
            style={[styles.extendPill, { opacity: locked ? 0.4 : 1 }]}
          >
            <Icon name="plus" size={size.iconSm} color={dark.text} />
            <Text variant="controlStrong" color="darkText">
              {t('timer.extend')}
            </Text>
          </Pressable>
        ) : null}
        {nxt && nxt.kind === 'exercise' ? (
          <View style={styles.nextCard} testID="rest-next">
            <View style={styles.nextAnim}>
              <ExerciseAnimation exerciseId={nxt.exercise_id} dark height={space[10] + space[6]} />
            </View>
            <View style={styles.flex}>
              <Text variant="captionStrong" color="darkTextMuted">
                {t('timer.restNextLabel')}
              </Text>
              <Text variant="row" color="darkText" numberOfLines={1}>
                {exerciseName(nxt.exercise_id)}
              </Text>
              <Text variant="controlSm" color="darkTextMuted">
                {t('timer.restNextSet', { n: nxt.set, total: nxt.sets, dose: doseOf(nxt) })}
              </Text>
            </View>
          </View>
        ) : null}
      </View>
    );
  }
  const cues = exerciseCue(seg.exercise_id)
    .split('. ')
    .map((c) => c.replace(/\.$/, ''))
    .filter(Boolean);
  const timed = seg.timedS != null;
  const shown = timed ? (pos.remainingS ?? 0) : pos.elapsedInSegS;
  const hint = !timed
    ? t('timer.exerciseHint')
    : [
        seg.autoTimed ? t('timer.exerciseAutoHint', { time: formatDuration(seg.timedS ?? 0) }) : '',
        t('timer.holdHint'),
      ]
        .filter(Boolean)
        .join(' ');
  return (
    <View style={styles.drill} testID="timer-exercise">
      <SessionBar tm={tm} />
      {/* Layar pendek: animasi kecil di samping nama agar angka waktu tetap terlihat tanpa gulir. */}
      <View style={short ? styles.shortHead : styles.tallHead}>
        <View style={short ? styles.animWrapShort : styles.animWrap}>
          <ExerciseAnimation exerciseId={seg.exercise_id} dark height={space[10] * 3} />
        </View>
        <View style={[styles.drillHead, short && styles.flex]}>
          <BibTag label={t('timer.exerciseBib', { n: exIdx, total: groups.length })} zone="strength" />
          <Text variant="drillName" color="darkText">
            {exerciseName(seg.exercise_id)}
          </Text>
          <Text variant="set" color="darkText">
            {t('timer.drillSet', { n: seg.set, total: seg.sets })}
            <Text variant="set" color="darkTextMuted">
              {t('timer.drillDoseSpaced', { dose: doseOf(seg) })}
            </Text>
          </Text>
          <View style={styles.lanes}>
            {Array.from({ length: seg.sets }, (_, i) => (
              <View
                key={i}
                style={[styles.lane, { backgroundColor: i < seg.set ? color.primary : dark.surfaceSunken }]}
              />
            ))}
          </View>
        </View>
      </View>
      <SetClock
        value={shown}
        timed={timed}
        total={seg.timedS}
        elapsed={pos.elapsedInSegS}
        paused={paused}
        onPress={onToggleFar}
      />
      <View style={styles.cues}>
        {cues.map((c) => (
          <View key={c} style={styles.cueRow}>
            <Icon name="check" color={dark.successInk} size={space[5]} />
            <Text variant="bodySm" color="darkText" style={styles.flex}>
              {c}
            </Text>
          </View>
        ))}
      </View>
      {hint ? (
        <Text variant="controlSm" color="darkTextMuted">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

/** Angka waktu set: hitung mundur + bar progres (berwaktu/otomatis) atau hitung naik (manual). */
export function SetClock(p: {
  value: number;
  timed: boolean;
  total: number | null;
  elapsed: number;
  paused: boolean;
  onPress: () => void;
}) {
  const frac = p.timed && p.total ? Math.min(1, p.elapsed / p.total) : 0;
  return (
    <Pressable
      style={styles.setClock}
      onPress={p.onPress}
      accessibilityRole="button"
      accessibilityLabel={t('timer.farOn')}
      testID="set-clock"
    >
      <View style={styles.setClockRow}>
        <Text
          variant="numberXl"
          color="darkText"
          style={[styles.tnum, p.paused && styles.blink]}
          testID="timer-remaining"
        >
          {formatClock(p.value)}
        </Text>
        <Text variant="control" color="darkTextMuted">
          {p.paused
            ? t('timer.paused')
            : p.timed
              ? t('timer.remainingOf', { total: formatDuration(p.total ?? 0) })
              : t('timer.elapsedSet')}
        </Text>
      </View>
      {p.timed ? (
        <ToneBar progress={frac} color={color.primary} trackColor={dark.surfaceSunken} height={space[2]} />
      ) : null}
    </Pressable>
  );
}

/**
 * U3 tampilan jarak jauh (HP di lantai): bib, nama, angka raksasa (~30% lebar layar) + bar progres.
 * Ketuk di mana saja = kembali ke tampilan biasa.
 */
export function FarView(p: {
  bib: string;
  zone: 'strength' | 'recovery' | 'easy';
  title: string;
  sub: string | null;
  value: number;
  frac: number | null;
  tint: string;
  paused: boolean;
  onPress: () => void;
}) {
  const { width } = useWindowDimensions();
  const big = Math.round(Math.min(width, size.contentMax) * 0.3);
  return (
    <Pressable
      onPress={p.onPress}
      accessibilityRole="button"
      accessibilityLabel={t('timer.farOff')}
      style={styles.far}
      testID="timer-far"
    >
      <BibTag label={p.bib} zone={p.zone} />
      {p.title ? (
        <Text variant="drillName" color="darkText" align="center">
          {p.title}
        </Text>
      ) : null}
      {p.sub ? (
        <Text variant="set" color="darkTextMuted" align="center">
          {p.sub}
        </Text>
      ) : null}
      <Text
        variant="timer"
        color="darkText"
        numberOfLines={1}
        style={[styles.tnum, { fontSize: big, lineHeight: big }, p.paused && styles.blink]}
        testID="timer-remaining"
      >
        {formatClock(p.value)}
      </Text>
      {p.paused ? (
        <Text variant="statusCaps" style={{ color: color.status.attention }}>
          {t('timer.paused')}
        </Text>
      ) : null}
      {p.frac != null ? (
        <ToneBar progress={p.frac} color={p.tint} trackColor={dark.surfaceSunken} height={space[3]} />
      ) : null}
    </Pressable>
  );
}

/** Bar sesi strength: satu lajur per gerakan, terisi sesuai waktu rencana yang sudah lewat. */
export function SessionBar({ tm }: { tm: ReturnType<typeof useTimer> }) {
  const pos = tm.position!;
  const groups = [...new Set(tm.segs.filter((s) => s.kind === 'exercise').map((s) => s.group))];
  return (
    <View style={[styles.segRow, styles.stretch]} testID="session-bar">
      {groups.map((g) => {
        let total = 0;
        let done = 0;
        tm.segs.forEach((s, i) => {
          if (s.group !== g) return;
          const ps = plannedS(s);
          total += ps;
          if (i < pos.index) done += ps;
          else if (i === pos.index) done += Math.min(pos.elapsedInSegS, ps);
        });
        return (
          <View key={g} style={[styles.segPart, styles.segFuture, styles.flex, styles.clip]}>
            <View
              style={[
                styles.segFill,
                { width: `${total ? Math.round((done / total) * 100) : 0}%`, backgroundColor: color.primary },
              ]}
            />
          </View>
        );
      })}
    </View>
  );
}

/**
 * U2: tahan di mana saja di layar set 0,5 dtk = Selesai set / Lanjut, dengan getar. Ketukan biasa dan
 * gulir tidak memicu apa pun. Isi di dalamnya tetap bisa dibaca pembaca layar (tombol tetap ada di footer).
 */
