import { isRunSegment } from '@run-coach/training-engine';
import {
  BibTag,
  border,
  color,
  FadeIn,
  Icon,
  PrimaryButton,
  size,
  space,
  SpotIcon,
  Text,
  TrackRing,
  ZoomIn,
} from '@run-coach/ui';
import { formatClock, formatDuration, formatPaceValue } from '@run-coach/ui/format';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useProfile, useWorkout } from '@/data/hooks';
import { t } from '@/i18n/t';
import { getPermission, notificationsSupported, requestPermission } from '@/lib/notifications';
import { useSpotIcons } from '@/lib/spot';
import { intensitySegments } from '@/lib/workoutView';
import { countdownTick, requestWakeLock } from '@/timer/cues';
import { FEEL_KEY, segmentName } from '@/timer/labels';
import { plannedS } from '@/timer/machine';
import { useFlat } from '@/timer/useFlat';
import { useTimer } from '@/timer/useTimer';
import { AutoPill, Confirm, DarkButton, HoldToFinish, RoundButton } from '@/components/timer/controls';
import { dark, styles } from '@/components/timer/styles';
import { DrillView, StrengthView } from '@/components/timer/views';

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
  const icons = useSpotIcons();
  // U3: HP datar menghadap ke atas -> tampilan jarak jauh. Ketuk angka = paksa nyala/mati sampai posisi HP berubah.
  const flat = useFlat(tm.state?.status === 'running' || tm.state?.status === 'paused');
  const [farOverride, setFarOverride] = useState<boolean | null>(null);
  useEffect(() => setFarOverride(null), [flat]);
  const far = farOverride ?? flat;
  const toggleFar = () => setFarOverride(!far);

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
        {icons ? (
          <SpotIcon name="sound" size={size.spotLg} testID="spot-sound" />
        ) : (
          <Icon name="bell" color={dark.text} size={size.touchMin} />
        )}
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
              <DrillView tm={tm} paused={paused} far={far} onToggleFar={toggleFar} />
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
              <StrengthView tm={tm} paused={paused} locked={locked} far={far} onToggleFar={toggleFar} />
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
