import type { EngineMessageKey } from '@run-coach/training-engine';
import {
  BibTag,
  border,
  color,
  Icon,
  type IconName,
  PrimaryButton,
  radius,
  SegmentBar,
  size,
  space,
  Text,
  TrackRing,
} from '@run-coach/ui';
import { formatDuration, formatPaceValue } from '@run-coach/ui/format';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useProfile, useWorkout } from '@/data/hooks';
import { t } from '@/i18n/t';
import { getPermission, notificationsSupported, requestPermission } from '@/lib/notifications';
import { et } from '@/lib/rationale';
import { intensitySegments } from '@/lib/workoutView';
import { requestWakeLock } from '@/timer/cues';
import { FEEL_KEY, segmentName } from '@/timer/labels';
import { plannedS } from '@/timer/machine';
import { useTimer } from '@/timer/useTimer';

const dark = color.dark;

/** 2.3 Timer (gelap) + 2.3b segmen drill. */
export default function TimerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const w = useWorkout(id);
  const profile = useProfile();
  const tm = useTimer(w.data);
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
    paddingTop: insets.top + space[4],
    paddingBottom: insets.bottom + space[4],
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
  const zone = seg && seg.kind !== 'drill' ? seg.zone : 'easy';
  const ringColor = zone === 'interval' ? dark.zoneInterval : color.zone[zone];
  const ringW = Math.min(width - space.screenX * 2, size.contentMax / 1.6);

  const top = (
    <View style={styles.top}>
      <Pressable
        onPress={() => setConfirm(true)}
        style={styles.pill}
        accessibilityRole="button"
        testID="timer-end"
        disabled={locked}
      >
        <Text variant="heading" color="darkText">
          {t('timer.end')}
        </Text>
      </Pressable>
      <Text variant="heading" color="darkTextMuted" testID="timer-segment">
        {t('timer.segment', { n: pos.group, total: pos.groups })}
      </Text>
      <RoundButton
        icon={st!.muted ? 'sound-off' : 'sound-on'}
        label={st!.muted ? t('timer.unmute') : t('timer.mute')}
        onPress={tm.toggleMute}
        disabled={locked}
      />
    </View>
  );

  return (
    <View style={[styles.root, bg]} testID="screen-timer">
      <View style={styles.inner}>
        {top}
        {countdown !== null && countdown > 0 ? (
          <View style={styles.centerCol} testID="timer-countdown">
            <Text variant="label" color="darkTextMuted">
              {t('timer.countdown')}
            </Text>
            <Text variant="timer" color="darkText">
              {String(countdown)}
            </Text>
          </View>
        ) : isDrill && seg?.kind === 'drill' ? (
          <DrillView tm={tm} locked={locked} />
        ) : (
          <>
            <View style={styles.ringWrap}>
              <TrackRing
                width={ringW}
                height={ringW * 0.86}
                progress={seg?.timedS ? pos.elapsedInSegS / seg.timedS : 0}
                color={ringColor}
                trackColor={dark.surfaceSunken}
              >
                {seg ? <BibTag label={segmentName(seg, w.data.type)} zone={zone} /> : null}
                <Text
                  variant="timer"
                  color="darkText"
                  style={paused && styles.blink}
                  testID="timer-remaining"
                >
                  {formatDuration(pos.remainingS ?? 0)}
                </Text>
                <Text color="darkTextMuted">
                  {paused
                    ? t('timer.paused')
                    : t('timer.remainingOf', { total: formatDuration(seg?.timedS ?? 0) })}
                </Text>
              </TrackRing>
            </View>
            <View style={styles.cards}>
              {profile.data?.intensity_guide !== 'rpe' && seg?.pace_s_per_km && !seg.walk ? (
                <View style={styles.card}>
                  <Text variant="label" color="darkTextMuted">
                    {t('timer.targetPace')}
                  </Text>
                  <Text variant="numberMd" color="darkText">
                    {zone === 'easy' || zone === 'long' || zone === 'recovery'
                      ? `${formatPaceValue(seg.pace_s_per_km.min)}-${formatPaceValue(seg.pace_s_per_km.max)} /km`
                      : `${formatPaceValue(seg.pace_s_per_km.min)} /km`}
                  </Text>
                </View>
              ) : null}
              <View style={styles.card}>
                <Text variant="label" color="darkTextMuted">
                  {t('timer.feel')}
                </Text>
                <Text variant="heading" color="darkText">
                  {t(FEEL_KEY[zone])}
                </Text>
              </View>
            </View>
            <SegmentBar segments={intensitySegments(w.data.steps)} />
            <View style={styles.row}>
              <Text variant="label" color="darkTextMuted">
                {t('timer.total', {
                  elapsed: formatDuration(pos.totalElapsedS),
                  planned: formatDuration(pos.totalPlannedS),
                })}
              </Text>
              <Text variant="label" color="darkTextMuted">
                {pos.next
                  ? t('timer.next', {
                      name: segmentName(pos.next, w.data.type),
                      duration: formatDuration(plannedS(pos.next)),
                    })
                  : t('timer.nextDone')}
              </Text>
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
                <Icon name={paused ? 'play' : 'pause'} color={color.onPrimary} size={size.touchMin} />
              </Pressable>
              <RoundButton
                icon="skip"
                label={t('timer.skip')}
                onPress={tm.skip}
                disabled={locked}
                testID="timer-skip"
              />
            </View>
            {locked ? (
              <Text variant="label" color="darkTextMuted" align="center">
                {t('timer.locked')}
              </Text>
            ) : (
              <Text variant="label" color="darkTextMuted" align="center">
                {process.env.EXPO_OS === 'web' ? t('timer.footerWeb') : t('timer.footer')}
              </Text>
            )}
          </>
        )}
      </View>
      {confirm ? (
        <View style={styles.overlay} testID="timer-confirm">
          <View style={styles.dialog}>
            <Text variant="title" color="darkText">
              {t('timer.confirmTitle')}
            </Text>
            <Text color="darkTextMuted">{t('timer.confirmBody')}</Text>
            <PrimaryButton
              label={t('timer.confirmYes')}
              testID="timer-confirm-yes"
              onPress={() => {
                setConfirm(false);
                tm.end();
              }}
            />
            <DarkButton label={t('common.cancel')} onPress={() => setConfirm(false)} />
          </View>
        </View>
      ) : null}
    </View>
  );
}

function DrillView({ tm, locked }: { tm: ReturnType<typeof useTimer>; locked: boolean }) {
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
      <BibTag label={t('timer.drillBib', { n: exIdx, total: exercises.length })} zone="easy" />
      <Text variant="display" color="darkText">
        {et(`drill.${seg.exercise_id}.name` as EngineMessageKey)}
      </Text>
      <View style={styles.row}>
        <Text variant="heading" color="darkText">
          {t('timer.drillSet', { n: seg.set, total: seg.sets })}
        </Text>
        <Text variant="heading" color="darkTextMuted">
          {t('timer.drillDose', { dose })}
        </Text>
      </View>
      <View style={styles.lanes}>
        {Array.from({ length: seg.sets }, (_, i) => (
          <View
            key={i}
            style={[styles.lane, { backgroundColor: i < seg.set ? color.primary : dark.surfaceSunken }]}
          />
        ))}
      </View>
      <View style={styles.cueBox}>
        {cues.map((c) => (
          <View key={c} style={styles.cueRow}>
            <Icon name="check" color={dark.successInk} size={space[5]} />
            <Text color="darkText" style={styles.flex}>
              {c}
            </Text>
          </View>
        ))}
      </View>
      <Text variant="label" color="darkTextMuted">
        {t('timer.drillHintNext', { hint: t('timer.drillHint'), next: nextLabel })}
      </Text>
      <View style={styles.flex} />
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
        <Text variant="heading" color="darkTextMuted" align="center">
          {t('timer.skipDrill')}
        </Text>
      </Pressable>
    </View>
  );
}

function RoundButton(p: {
  icon: IconName;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  active?: boolean;
  testID?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={p.label}
      onPress={p.onPress}
      disabled={p.disabled}
      testID={p.testID}
      style={[
        styles.round,
        { opacity: p.disabled ? 0.4 : 1, backgroundColor: p.active ? dark.text : dark.surface },
      ]}
    >
      <Icon name={p.icon} color={p.active ? dark.bg : dark.text} />
    </Pressable>
  );
}

function DarkButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.pill, styles.darkBtn]}>
      <Text variant="button" color="darkText" align="center">
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: space.screenX },
  inner: { flex: 1, width: '100%', maxWidth: size.contentMax, alignSelf: 'center', gap: space[4] },
  centerCol: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space[4] },
  flex: { flex: 1 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pill: {
    backgroundColor: dark.surface,
    borderRadius: radius.stadium,
    minHeight: size.touchMin,
    paddingHorizontal: space[5],
    justifyContent: 'center',
  },
  darkBtn: { alignSelf: 'stretch', minHeight: size.buttonSecondary },
  round: {
    width: size.touchMin + space[4],
    height: size.touchMin + space[4],
    borderRadius: radius.stadium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringWrap: { alignItems: 'center', marginVertical: space[2] },
  blink: { opacity: 0.6 },
  cards: { flexDirection: 'row', gap: space[3] },
  card: { flex: 1, backgroundColor: dark.surface, borderRadius: radius.md, padding: space[4], gap: space[1] },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: space[2],
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: space[8],
    marginTop: space[4],
  },
  big: {
    width: size.buttonPrimary * 1.5,
    height: size.buttonPrimary * 1.5,
    borderRadius: radius.stadium,
    backgroundColor: color.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  drill: { flex: 1, gap: space[3] },
  lanes: { flexDirection: 'row', gap: space[2] },
  lane: { width: space[10] * 2, height: space[2], borderRadius: radius.stadium },
  cueBox: {
    backgroundColor: dark.surface,
    borderRadius: radius.lg,
    borderWidth: border.hairline,
    borderColor: dark.line,
    padding: space[5],
    gap: space[3],
  },
  cueRow: { flexDirection: 'row', gap: space[3], alignItems: 'flex-start' },
  textBtn: { minHeight: size.touchMin, justifyContent: 'center' },
});
