import { isRunSegment, type EngineMessageKey } from '@run-coach/training-engine';
import {
  BibTag,
  border,
  color,
  FadeIn,
  fontFiles,
  Icon,
  type IconName,
  PrimaryButton,
  radius,
  size,
  space,
  Text,
  ToneBar,
  TrackRing,
  ZoomIn,
  themed,
} from '@run-coach/ui';
import { formatClock, formatDuration, formatPaceValue } from '@run-coach/ui/format';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { router, useLocalSearchParams } from 'expo-router';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ExerciseAnimation } from '@/components/ExerciseAnimation';
import { useProfile, useWorkout } from '@/data/hooks';
import { t } from '@/i18n/t';
import { getPermission, notificationsSupported, requestPermission } from '@/lib/notifications';
import { et } from '@/lib/rationale';
import { intensitySegments } from '@/lib/workoutView';
import { countdownTick, holdHaptic, requestWakeLock } from '@/timer/cues';
import { exerciseCue, exerciseName, FEEL_KEY, segmentName } from '@/timer/labels';
import { plannedS } from '@/timer/machine';
import { useTimer } from '@/timer/useTimer';

const dark = color.dark;
/** Lama tahan untuk Selesai set (U2). */
const HOLD_MS = 500;

/** 2.3 Timer (gelap) + 2.3b segmen drill + 2.3s mode gerakan strength. */
export default function TimerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const w = useWorkout(id);
  const profile = useProfile();
  // Timer dibuat setelah profil termuat agar mode otomatis bawaan (4.1) benar sejak awal.
  const tm = useTimer(profile.data ? w.data : undefined, profile.data?.timer_auto !== 0);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [countdown, setCountdown] = useState<number | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [locked, setLocked] = useState(false);
  const [askPerm, setAskPerm] = useState<boolean | null>(null);

  // Layar tetap menyala selama timer (native: keep-awake, web: Wake Lock).
  useEffect(() => {
    const web = process.env.EXPO_OS === 'web';
    // Web: Wake Lock API langsung (bisa ditolak browser; timer tetap jalan).
    if (!web) activateKeepAwakeAsync('timer').catch(() => undefined);
    let lock: { release: () => Promise<void> } | null = null;
    if (web) void requestWakeLock().then((l) => (lock = l));
    return () => {
      if (!web) {
        try {
          void deactivateKeepAwake('timer');
        } catch {
          /* belum aktif */
        }
      }
      void lock?.release().catch(() => undefined);
    };
  }, []);

  // FL-11: izin notifikasi diminta saat Mulai pertama kali, dengan penjelasan dulu.
  useEffect(() => {
    if (!notificationsSupported) return setAskPerm(false);
    void getPermission().then((p) => setAskPerm(p === 'undetermined'));
  }, []);

  const st = tm.state;
  const ready = st?.status === 'idle' && askPerm === false;

  // Hitung mundur 3 detik lalu mulai (idle -> running).
  useEffect(() => {
    if (!ready || countdown !== null) return;
    setCountdown(3);
  }, [ready, countdown]);
  // Getar ringan tiap angka hitung mundur.
  useEffect(() => {
    if (countdown !== null && countdown > 0) countdownTick(tm.state?.muted);
  }, [countdown]);
  const startRef = useRef(tm.start);
  startRef.current = tm.start;
  useEffect(() => {
    if (countdown === null || countdown <= 0) return;
    const h = setTimeout(() => {
      if (countdown === 1) {
        setCountdown(0);
        startRef.current();
      } else setCountdown(countdown - 1);
    }, 1000);
    return () => clearTimeout(h);
  }, [countdown]);

  // finished -> 2.4
  useEffect(() => {
    if (st?.status === 'finished') router.replace('/finish');
  }, [st?.status]);

  const bg = {
    backgroundColor: dark.bg,
    paddingTop: Math.max(space.screenTop, insets.top + space[2]),
    paddingBottom: Math.max(space.screenBottom, insets.bottom + space[2]),
  };

  if (w.isPending || (!st && !tm.restored)) return <View style={[styles.root, bg]} />;
  if (!w.data) {
    return (
      <View style={[styles.root, bg]}>
        <Text color="darkText">{t('timer.notFound')}</Text>
      </View>
    );
  }

  if (tm.restored) {
    const elapsed = Math.floor(
      ((tm.restored.pausedAt ?? Date.now()) - (tm.restored.startedAt ?? Date.now()) - tm.restored.pausedMs) /
        1000,
    );
    return (
      <View style={[styles.root, bg, styles.centerCol]} testID="timer-restored">
        <Text variant="title" color="darkText" align="center">
          {t('timer.restoredTitle')}
        </Text>
        <Text color="darkTextMuted" align="center">
          {t('timer.restoredBody', { elapsed: formatDuration(Math.max(0, elapsed)) })}
        </Text>
        <PrimaryButton label={t('timer.restoredResume')} onPress={tm.resumeRestored} />
        <DarkButton label={t('timer.restoredEnd')} onPress={tm.endRestored} />
      </View>
    );
  }

  if (askPerm) {
    return (
      <View style={[styles.root, bg, styles.centerCol]} testID="timer-perm">
        <Icon name="bell" color={dark.text} size={size.touchMin} />
        <Text variant="title" color="darkText" align="center">
          {t('timer.permTitle')}
        </Text>
        <Text color="darkTextMuted" align="center">
          {t('timer.permBody')}
        </Text>
        <PrimaryButton
          label={t('timer.permAllow')}
          onPress={async () => {
            await requestPermission();
            setAskPerm(false);
          }}
        />
        <DarkButton label={t('timer.permLater')} onPress={() => setAskPerm(false)} />
      </View>
    );
  }

  const pos = tm.position!;
  const seg = pos.segment;
  const paused = st!.status === 'paused';
  const running = st!.status === 'running';
  const isDrill = seg?.kind === 'drill';
  const zone = seg && isRunSegment(seg) ? seg.zone : 'easy';
  const ringColor = zone === 'interval' ? dark.zoneInterval : color.zone[zone];
  const ringW = Math.min(width - space.screenX * 2, size.contentMax / 1.6);
  const segs = intensitySegments(w.data.steps);
  // Pil Otomatis hanya jika ada set tanpa dosis waktu (repetisi / drill jarak).
  const hasManual = w.data.steps.some(
    (x) =>
      (x.kind === 'exercise' && x.duration_s == null) ||
      (x.kind === 'drill' && x.duration_s == null) ||
      (x.kind === 'repeat' && x.steps.some((y) => y.kind === 'drill' && y.duration_s == null)),
  );

  const top = (
    <View style={styles.top}>
      <Pressable
        onPress={() => setConfirm(true)}
        style={styles.endPill}
        accessibilityRole="button"
        testID="timer-end"
        disabled={locked}
      >
        <Text variant="controlStrong" color="darkText">
          {t('timer.end')}
        </Text>
      </Pressable>
      {/* Strength: posisi sudah di bib "Gerakan n/N" dan bar sesi, jadi bar atas tidak mengulangnya. */}
      {seg?.kind === 'exercise' || seg?.kind === 'rest' ? (
        <View style={styles.flex} />
      ) : (
        <Text variant="controlStrong" color="darkTextMuted" testID="timer-segment">
          {t('timer.segment', { n: pos.group, total: pos.groups })}
        </Text>
      )}
      <View style={styles.topRight}>
        {hasManual ? <AutoPill on={tm.auto} onPress={() => tm.setAuto(!tm.auto)} disabled={locked} /> : null}
        <RoundButton
          small
          icon={st!.muted ? 'sound-off' : 'sound-on'}
          label={st!.muted ? t('timer.unmute') : t('timer.mute')}
          onPress={tm.toggleMute}
          disabled={locked}
        />
      </View>
    </View>
  );

  if (isDrill && seg?.kind === 'drill' && !(countdown !== null && countdown > 0)) {
    return (
      <View style={[styles.root, bg]} testID="screen-timer">
        <View style={styles.inner}>
          {top}
          <ScrollView style={styles.flex} contentContainerStyle={styles.scroll}>
            <HoldToFinish enabled={!locked && running} onDone={tm.next}>
              <DrillView tm={tm} paused={paused} />
            </HoldToFinish>
          </ScrollView>
        </View>
        <View style={styles.drillFooter}>
          <PrimaryButton
            label={t('timer.next.cta')}
            icon="chevron-right"
            onPress={tm.next}
            disabled={locked}
            testID="drill-next"
          />
          <Pressable
            onPress={tm.skipGroup}
            disabled={locked}
            accessibilityRole="button"
            style={styles.textBtn}
            testID="drill-skip"
          >
            <Text variant="controlStrong" color="darkTextMuted" align="center">
              {t('timer.skipDrill')}
            </Text>
          </Pressable>
        </View>
        {confirm ? (
          <Confirm onYes={() => (setConfirm(false), tm.end())} onNo={() => setConfirm(false)} />
        ) : null}
      </View>
    );
  }

  const strengthSeg = seg?.kind === 'exercise' || seg?.kind === 'rest';
  if (strengthSeg && !(countdown !== null && countdown > 0)) {
    return (
      <View style={[styles.root, bg]} testID="screen-timer">
        <View style={styles.inner}>
          {top}
          <ScrollView style={styles.flex} contentContainerStyle={styles.scroll}>
            <HoldToFinish enabled={seg.kind === 'exercise' && !locked && running} onDone={tm.next}>
              <StrengthView tm={tm} paused={paused} locked={locked} />
            </HoldToFinish>
          </ScrollView>
        </View>
        <View style={styles.drillFooter}>
          {seg.kind === 'rest' ? (
            <PrimaryButton
              label={seg.prep ? t('timer.startNow') : t('timer.skipRest')}
              icon={seg.prep ? 'play' : 'skip'}
              onPress={tm.next}
              disabled={locked}
              testID="rest-skip"
            />
          ) : (
            <PrimaryButton
              label={t('timer.setDone')}
              icon="check"
              onPress={tm.next}
              disabled={locked}
              testID="exercise-next"
            />
          )}
          <View style={styles.strengthRow}>
            <Pressable
              onPress={paused ? tm.resume : tm.pause}
              disabled={locked}
              accessibilityRole="button"
              style={[styles.textBtn, styles.flex]}
              testID="timer-toggle"
            >
              <Text variant="controlStrong" color="darkTextMuted" align="center">
                {paused ? t('timer.resume') : t('timer.pause')}
              </Text>
            </Pressable>
            <Pressable
              onPress={tm.skipGroup}
              disabled={locked}
              accessibilityRole="button"
              style={[styles.textBtn, styles.flex]}
              testID="exercise-skip"
            >
              <Text variant="controlStrong" color="darkTextMuted" align="center">
                {t('timer.skipExercise')}
              </Text>
            </Pressable>
          </View>
        </View>
        {confirm ? (
          <Confirm onYes={() => (setConfirm(false), tm.end())} onNo={() => setConfirm(false)} />
        ) : null}
      </View>
    );
  }

  return (
    <View style={[styles.root, bg]} testID="screen-timer">
      <View style={styles.inner}>
        {top}
        {countdown !== null && countdown > 0 ? (
          <View style={styles.centerCol} testID="timer-countdown">
            <Text variant="statusCaps" color="darkTextMuted">
              {t('timer.countdown')}
            </Text>
            <ZoomIn key={countdown}>
              <Text variant="timer" color="darkText">
                {String(countdown)}
              </Text>
            </ZoomIn>
          </View>
        ) : (
          <>
            <View style={styles.ringWrap}>
              <TrackRing
                width={ringW}
                height={ringW * (300 / 350)}
                stroke={space[3] + border.selected - border.hairline / 2}
                progress={seg?.timedS ? pos.elapsedInSegS / seg.timedS : 0}
                motion="linear"
                gradient
                color={ringColor}
                trackColor={dark.surfaceSunken}
              >
                <View style={styles.ringCol}>
                  {seg ? (
                    <FadeIn k={pos.index}>
                      <BibTag label={segmentName(seg, w.data.type)} zone={zone} />
                    </FadeIn>
                  ) : null}
                  {paused ? (
                    <Text variant="statusCaps" style={{ color: color.status.attention }}>
                      {t('timer.paused')}
                    </Text>
                  ) : null}
                  <Text
                    variant="timer"
                    color="darkText"
                    style={paused && styles.blink}
                    testID="timer-remaining"
                  >
                    {formatClock(pos.remainingS ?? 0)}
                  </Text>
                  <Text variant="control" color="darkTextMuted">
                    {t('timer.remainingOf', { total: formatDuration(seg?.timedS ?? 0) })}
                  </Text>
                </View>
              </TrackRing>
            </View>
            <FadeIn k={pos.index}>
              <View style={styles.cards}>
                {profile.data?.intensity_guide !== 'rpe' &&
                seg &&
                isRunSegment(seg) &&
                seg.pace_s_per_km &&
                !seg.walk ? (
                  <View style={styles.card}>
                    <Text variant="captionStrong" color="darkTextMuted">
                      {t('timer.targetPace')}
                    </Text>
                    <Text
                      variant={zone === 'easy' || zone === 'long' || zone === 'recovery' ? 'stat' : 'title'}
                      color="darkText"
                      numberOfLines={1}
                    >
                      {zone === 'easy' || zone === 'long' || zone === 'recovery'
                        ? `${formatPaceValue(seg.pace_s_per_km.min)}-${formatPaceValue(seg.pace_s_per_km.max)}`
                        : formatPaceValue(seg.pace_s_per_km.min)}
                      <Text variant="numberRowStrong" color="darkTextMuted">
                        {t('timer.perKm')}
                      </Text>
                    </Text>
                  </View>
                ) : null}
                <View style={styles.card}>
                  <Text variant="captionStrong" color="darkTextMuted">
                    {t('timer.feel')}
                  </Text>
                  <Text variant="row" color="darkText">
                    {t(FEEL_KEY[zone])}
                  </Text>
                </View>
              </View>
            </FadeIn>
            <View style={styles.progress}>
              <View style={styles.segRow}>
                {segs.map((s2, i) => {
                  const done = i < segIndexOf(segs, pos.plannedElapsedS);
                  const cur = i === segIndexOf(segs, pos.plannedElapsedS);
                  return (
                    <View
                      key={i}
                      style={[
                        styles.segPart,
                        { flex: Math.max(0.05, s2.weight) },
                        cur || done
                          ? { backgroundColor: color.zone[s2.zone], opacity: done ? 0.45 : 1 }
                          : styles.segFuture,
                      ]}
                    />
                  );
                })}
              </View>
              <View style={styles.row}>
                <Text variant="controlSm" color="darkTextMuted" style={styles.display}>
                  {t('timer.total', {
                    elapsed: formatDuration(pos.totalElapsedS),
                    planned: formatDuration(pos.totalPlannedS),
                  })}
                </Text>
                <Text variant="controlSm" color="darkTextMuted">
                  {pos.next
                    ? t('timer.next', {
                        name: segmentName(pos.next, w.data.type),
                        duration: formatDuration(plannedS(pos.next)),
                      })
                    : t('timer.nextDone')}
                </Text>
              </View>
            </View>
          </>
        )}
      </View>
      <View style={styles.controls}>
        <RoundButton
          icon="lock"
          label={locked ? t('timer.unlock') : t('timer.lock')}
          onPress={() => setLocked(!locked)}
          active={locked}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={paused ? t('timer.resume') : t('timer.pause')}
          testID="timer-toggle"
          disabled={locked || (!running && !paused)}
          onPress={paused ? tm.resume : tm.pause}
          style={[styles.big, { opacity: locked ? 0.4 : 1 }]}
        >
          <Icon name={paused ? 'play' : 'pause'} color={color.onPrimary} size={space[8]} />
        </Pressable>
        <RoundButton
          icon="skip"
          label={t('timer.skip')}
          onPress={tm.skip}
          disabled={locked}
          testID="timer-skip"
        />
      </View>
      <Text variant="caption" color="darkTextMuted" align="center" style={styles.footnote}>
        {locked
          ? t('timer.locked')
          : process.env.EXPO_OS === 'web'
            ? t('timer.footerWeb')
            : t('timer.footer')}
      </Text>
      {confirm ? (
        <Confirm onYes={() => (setConfirm(false), tm.end())} onNo={() => setConfirm(false)} />
      ) : null}
    </View>
  );
}

/** Indeks bagian grafik tempat waktu berjalan berada. */
function segIndexOf(segs: { weight: number }[], elapsedS: number): number {
  let acc = 0;
  for (let i = 0; i < segs.length; i++) {
    acc += segs[i]!.weight;
    if (elapsedS < acc) return i;
  }
  return segs.length - 1;
}

function Confirm({ onYes, onNo }: { onYes: () => void; onNo: () => void }) {
  return (
    <View style={styles.overlay} testID="timer-confirm">
      <View style={styles.dialog}>
        <Text variant="title" color="darkText">
          {t('timer.confirmTitle')}
        </Text>
        <Text variant="bodySm" color="darkTextMuted">
          {t('timer.confirmBody')}
        </Text>
        <PrimaryButton label={t('timer.confirmYes')} testID="timer-confirm-yes" onPress={onYes} />
        <DarkButton label={t('common.cancel')} onPress={onNo} />
      </View>
    </View>
  );
}

/** 2.3b segmen drill (wireframe TimerDrill). */
function DrillView({ tm, paused }: { tm: ReturnType<typeof useTimer>; paused: boolean }) {
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
  return (
    <View style={styles.drill} testID="timer-drill">
      <View style={styles.drillHead}>
        <BibTag label={t('timer.drillBib', { n: exIdx, total: exercises.length })} zone="easy" />
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
function StrengthView({
  tm,
  paused,
  locked,
}: {
  tm: ReturnType<typeof useTimer>;
  paused: boolean;
  locked: boolean;
}) {
  const pos = tm.position!;
  const seg = pos.segment;
  const { width, height } = useWindowDimensions();
  // Layar pendek (mis. iPhone SE): animasi dan cincin mengecil agar angka waktu tetap terlihat tanpa gulir.
  const short = height < 700;
  if (!seg || (seg.kind !== 'exercise' && seg.kind !== 'rest')) return null;
  const groups = [...new Set(tm.segs.filter((s) => s.kind === 'exercise').map((s) => s.group))];
  const exIdx = groups.indexOf(seg.group) + 1;
  const nxt = tm.segs.slice(pos.index + 1).find((s) => s.kind === 'exercise');
  const doseOf = (s: { reps: number | null; duration_s: number | null; per_side: boolean }) => {
    const d =
      s.reps != null ? t('strength.reps', { n: s.reps }) : t('strength.seconds', { n: s.duration_s ?? 0 });
    return s.per_side ? t('strength.perSide', { dose: d }) : d;
  };
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
            <BibTag label={seg.prep ? t('timer.prepBib') : t('timer.restBib')} zone="recovery" />
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
      <SetClock value={shown} timed={timed} total={seg.timedS} elapsed={pos.elapsedInSegS} paused={paused} />
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
function SetClock(p: {
  value: number;
  timed: boolean;
  total: number | null;
  elapsed: number;
  paused: boolean;
}) {
  const frac = p.timed && p.total ? Math.min(1, p.elapsed / p.total) : 0;
  return (
    <View style={styles.setClock}>
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
    </View>
  );
}

/** Bar sesi strength: satu lajur per gerakan, terisi sesuai waktu rencana yang sudah lewat. */
function SessionBar({ tm }: { tm: ReturnType<typeof useTimer> }) {
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
function HoldToFinish({
  enabled,
  onDone,
  children,
}: {
  enabled: boolean;
  onDone: () => void;
  children: ReactNode;
}) {
  const [holding, setHolding] = useState(false);
  return (
    <Pressable
      // Tanpa `disabled`: di web itu menandai semua isi (termasuk tombol +15 dtk) sebagai nonaktif.
      accessible={false}
      delayLongPress={HOLD_MS}
      onPressIn={enabled ? () => setHolding(true) : undefined}
      onPressOut={() => setHolding(false)}
      onLongPress={
        enabled
          ? () => {
              setHolding(false);
              holdHaptic();
              onDone();
            }
          : undefined
      }
      style={[styles.flex, holding && styles.holding]}
      testID="hold-to-finish"
    >
      {children}
    </Pressable>
  );
}

/** Pil mode otomatis/manual di bar atas (09-VOICE bagian 6). */
function AutoPill({ on, onPress, disabled }: { on: boolean; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: on, disabled }}
      accessibilityLabel={t('timer.autoLabel')}
      onPress={onPress}
      disabled={disabled}
      testID="timer-auto"
      style={[
        styles.autoPill,
        { backgroundColor: on ? dark.text : dark.surface, opacity: disabled ? 0.4 : 1 },
      ]}
    >
      <Icon name={on ? 'sync' : 'move'} size={size.iconSm} color={on ? dark.bg : dark.text} />
      <Text variant="controlSmStrong" style={{ color: on ? dark.bg : dark.text }}>
        {on ? t('timer.autoOn') : t('timer.autoOff')}
      </Text>
    </Pressable>
  );
}

function RoundButton(p: {
  icon: IconName;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  active?: boolean;
  testID?: string;
  small?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={p.label}
      onPress={p.onPress}
      disabled={p.disabled}
      testID={p.testID}
      style={[
        p.small ? styles.roundSm : styles.round,
        { opacity: p.disabled ? 0.4 : 1, backgroundColor: p.active ? dark.text : dark.surface },
      ]}
    >
      <Icon name={p.icon} size={size.iconSm} color={p.active ? dark.bg : dark.text} />
    </Pressable>
  );
}

function DarkButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.endPill, styles.darkBtn]}>
      <Text variant="row" color="darkText" align="center">
        {label}
      </Text>
    </Pressable>
  );
}

const styles = themed(() =>
  StyleSheet.create({
    root: { flex: 1 },
    inner: {
      flex: 1,
      width: '100%',
      maxWidth: size.contentMax,
      alignSelf: 'center',
      gap: space[5],
      paddingHorizontal: space.screenX,
    },
    centerCol: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: space[4],
      paddingHorizontal: space.screenX,
    },
    flex: { flex: 1 },
    top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    endPill: {
      backgroundColor: dark.surface,
      borderRadius: radius.stadium,
      minHeight: size.touchMin,
      paddingHorizontal: space[4],
      justifyContent: 'center',
    },
    darkBtn: { alignSelf: 'stretch', minHeight: size.buttonSecondary },
    round: {
      width: space[10] + space[4],
      height: space[10] + space[4],
      borderRadius: radius.stadium,
      alignItems: 'center',
      justifyContent: 'center',
    },
    roundSm: {
      width: size.touchMin,
      height: size.touchMin,
      borderRadius: radius.stadium,
      alignItems: 'center',
      justifyContent: 'center',
    },
    ringWrap: { alignItems: 'center' },
    ringCol: { alignItems: 'center', gap: space[1] + space[1] / 2 },
    blink: { opacity: 0.6 },
    cards: { flexDirection: 'row', gap: space[2] },
    card: {
      flex: 1,
      backgroundColor: dark.surface,
      borderRadius: radius.md,
      paddingVertical: space[3],
      paddingHorizontal: space[4],
      gap: space[1],
    },
    progress: { gap: space[2] },
    segRow: { flexDirection: 'row', gap: space[1] },
    segPart: { height: space[2], borderRadius: radius.stadium },
    segFuture: {
      backgroundColor: dark.surface,
      boxShadow: `inset 0px 0px 0px ${border.hairline}px ${dark.line}`,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: space[2],
    },
    display: { fontFamily: fontFiles.display700 },
    controls: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: space[6] + space[1],
      paddingTop: space[2],
      paddingBottom: space[3],
      paddingHorizontal: space.screenX,
    },
    big: {
      width: size.touchMin * 2,
      height: size.touchMin * 2,
      borderRadius: radius.stadium,
      backgroundColor: color.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    footnote: { paddingHorizontal: space[8] },
    overlay: {
      ...StyleSheet.absoluteFill,
      backgroundColor: color.overlay,
      justifyContent: 'center',
      padding: space[5],
    },
    dialog: {
      backgroundColor: dark.surface,
      borderRadius: radius.lg,
      padding: space[5],
      gap: space[3],
      maxWidth: size.contentMax,
      alignSelf: 'center',
      width: '100%',
    },
    drill: { flex: 1, gap: space[5] },
    drillHead: { gap: space[2] + space[1] / 2, alignItems: 'flex-start' },
    lanes: { flexDirection: 'row', gap: space[1] + space[1] / 2 },
    lane: { width: space[10], height: space[2], borderRadius: radius.stadium },
    cues: { gap: space[2] + space[1] / 2 },
    cueRow: { flexDirection: 'row', gap: space[2] + space[1] / 2, alignItems: 'flex-start' },
    drillFooter: {
      gap: space[2],
      paddingTop: space[2],
      paddingHorizontal: space.screenX,
      width: '100%',
      maxWidth: size.contentMax + space.screenX * 2,
      alignSelf: 'center',
    },
    textBtn: { minHeight: size.touchMin, justifyContent: 'center' },
    strengthRow: { flexDirection: 'row', gap: space[2] },
    restCol: { alignItems: 'center', gap: space[4] },
    scroll: { flexGrow: 1, paddingBottom: space[4] },
    stretch: { alignSelf: 'stretch' },
    topRight: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
    autoPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[1] + space[1] / 2,
      minHeight: size.touchMin,
      paddingHorizontal: space[3],
      borderRadius: radius.stadium,
    },
    animWrap: { alignSelf: 'center', width: '60%', maxWidth: space[10] * 4 },
    animWrapShort: { width: '30%' },
    tallHead: { gap: space[5] },
    shortHead: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
    setClock: { gap: space[2], alignSelf: 'stretch' },
    setClockRow: { flexDirection: 'row', alignItems: 'baseline', gap: space[3], flexWrap: 'wrap' },
    tnum: { fontVariant: ['tabular-nums'] },
    segFill: { height: '100%', borderRadius: radius.stadium },
    clip: { overflow: 'hidden' },
    nextCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[3],
      alignSelf: 'stretch',
      backgroundColor: dark.surface,
      borderRadius: radius.md,
      padding: space[3],
    },
    holding: { opacity: 0.85 },
    extendPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[1] + space[1] / 2,
      minHeight: size.touchMin,
      paddingHorizontal: space[4],
      borderRadius: radius.stadium,
      backgroundColor: dark.surface,
    },
    nextAnim: { width: space[10] + space[6] },
    center: { alignItems: 'center', alignSelf: 'stretch' },
  }),
);
