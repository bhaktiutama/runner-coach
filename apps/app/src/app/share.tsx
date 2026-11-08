import { addDays, mondayOf, parseSteps, type WorkoutType } from '@run-coach/training-engine';
import {
  color,
  IconButton,
  isDark,
  logos,
  PrimaryButton,
  SecondaryButton,
  SettingsGroup,
  SettingsRow,
  size,
  space,
  spotIconSvg,
  Switch,
  Text,
  themed,
  type SpotIconName,
} from '@run-coach/ui';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { ShareCardView, type ShareCardHandle } from '@/components/ShareCardView';
import { SpotTitle } from '@/components/Spot';
import {
  useActivePlan,
  useActivities,
  useActivity,
  useProfile,
  useToday,
  useWeekWorkouts,
} from '@/data/hooks';
import { planParams } from '@/data/rows';
import { t } from '@/i18n/t';
import type { AchievementId } from '@/lib/achievements';
import { track } from '@/lib/analytics';
import { weekIndexOf } from '@/lib/planView';
import {
  achievementCard,
  activityCard,
  activityHighlight,
  cardSvg,
  planCard,
  svgInner,
  weekCard,
  weekDays,
  type CardModel,
  type CardPalette,
  type ShareKind,
} from '@/lib/shareCard';
import {
  nativeSharePng,
  shareFileName,
  webDownload,
  webFontCss,
  webSharePng,
  webSvgToPng,
  type ShareResult,
} from '@/lib/shareImage';
import { GOAL_SPOT, TYPE_SPOT } from '@/lib/spotMap';
import { localDateOf } from '@/lib/today';

const WEB = process.env.EXPO_OS === 'web';
const ACHIEVEMENTS: AchievementId[] = ['first_5k', 'streak_4', 'plan_done'];
const ACH_SPOT: Record<AchievementId, SpotIconName> = {
  first_5k: 'badge-5k',
  streak_4: 'badge-streak',
  plan_done: 'badge-plan',
};

/** Warna kartu dari token tema aktif (mode gelap ikut, F-24). */
function palette(): CardPalette {
  return {
    dark: isDark(),
    bg: color.bg,
    surface: color.surface,
    surfaceSunken: color.surfaceSunken,
    text: color.text,
    textMuted: color.textMuted,
    line: color.line,
    primary: color.primary,
    onPrimary: color.onPrimary,
    success: color.success,
    zone: color.zone,
    onZone: {
      recovery: color.zone.onRecovery,
      easy: color.zone.onEasy,
      long: color.zone.onLong,
      tempo: color.zone.onTempo,
      interval: color.zone.onInterval,
      strength: color.zone.onStrength,
    },
    phase: color.phase,
  };
}

const spot = (name: SpotIconName) => svgInner(spotIconSvg(name, color.zone.strength));

/**
 * 2.7 Bagikan (F-29, 10-SHARE.md). Kartu PNG 9:16 dibuat di HP dari data lokal, lalu lembar bagikan
 * sistem (Instagram Story, WhatsApp Status). Gratis untuk semua (keputusan pemilik 2026-11-07).
 * `kind`: activity (id = aktivitas), week (date = tanggal di minggu itu), achievement (id), plan.
 */
export default function ShareScreen() {
  const q = useLocalSearchParams<{ kind?: string; id?: string; date?: string }>();
  const kind = (
    ['activity', 'week', 'achievement', 'plan'].includes(q.kind ?? '') ? q.kind : null
  ) as ShareKind | null;
  const today = useToday();
  const profile = useProfile();
  const plan = useActivePlan();
  const act = useActivity(kind === 'activity' ? q.id : undefined);
  const allActs = useActivities();
  const weekDate = q.date && /^\d{4}-\d{2}-\d{2}$/.test(q.date) ? q.date : today;
  const week = useWeekWorkouts(kind === 'week' ? plan.data?.id : undefined, weekDate);
  const [showPace, setShowPace] = useState(true);
  const [showName, setShowName] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [png, setPng] = useState<Blob | null>(null);
  const cardRef = useRef<ShareCardHandle>(null);
  const { width } = useWindowDimensions();
  const back = () => (router.canGoBack() ? router.back() : router.replace('/'));

  const unit = profile.data?.unit === 'mi' ? 'mi' : 'km';
  const name = showName ? profile.data?.display_name?.trim() || null : null;
  const params = plan.data ? planParams(plan.data) : null;
  const weeks = params?.weeks ?? [];
  const goal = plan.data?.goal.distance ?? null;

  const model: CardModel | null = useMemo(() => {
    const p = palette();
    if (kind === 'activity') {
      const x = act.data;
      if (!x) return null;
      const tz = profile.data?.timezone ?? 'Asia/Jakarta';
      const date = localDateOf(x.started_at, tz);
      const steps = x.workout_steps ? parseSteps(JSON.parse(x.workout_steps)) : null;
      const type = x.workout_type as WorkoutType | null;
      return activityCard(
        {
          type,
          distanceM: x.distance_m,
          durationS: x.duration_s,
          date,
          unit,
          showPace,
          exercises: steps ? steps.filter((s) => s.kind === 'exercise').length : null,
          weekIndex: params ? weekIndexOf(params, x.workout_date ?? date) : null,
          weeksTotal: weeks.length || null,
          goal,
          highlight: activityHighlight(x, allActs.data ?? [], plan.data?.start_date ?? null),
          icon: spot(type ? TYPE_SPOT[type] : 'easy'),
          name,
        },
        p,
      );
    }
    if (kind === 'week') {
      if (!plan.data || !params) return null;
      const monday = mondayOf(weekDate);
      const ws = week.data ?? [];
      const acts = (allActs.data ?? []).filter((a) => a.date >= monday && a.date <= addDays(monday, 6));
      const idx = weekIndexOf(params, weekDate) ?? 1;
      return weekCard(
        {
          weekIndex: idx,
          weeksTotal: weeks.length,
          done: ws.filter((w) => w.status === 'completed').length,
          total: ws.length,
          distanceM: acts.reduce((s, a) => s + (a.distance_m ?? 0), 0),
          durationS: acts.reduce((s, a) => s + a.duration_s, 0),
          unit,
          phase: weeks[idx - 1]?.phase ?? null,
          goal,
          days: weekDays(monday, today, ws),
          icon: spot('week-done'),
          name,
        },
        p,
      );
    }
    if (kind === 'achievement') {
      const id = ACHIEVEMENTS.find((a) => a === q.id);
      if (!id) return null;
      return achievementCard({ id, goal, icon: spot(ACH_SPOT[id]), name }, p);
    }
    if (kind === 'plan') {
      if (!plan.data || !params) return null;
      const g = plan.data.goal;
      const raceDays =
        g.race_date && g.race_date >= today
          ? Math.round((Date.parse(g.race_date) - Date.parse(today)) / 86_400_000)
          : null;
      return planCard(
        {
          goal: g.distance,
          raceName: g.race_name,
          raceDate: g.race_date,
          daysToRace: raceDays,
          weeks: weeks.map((w) => ({ phase: w.phase })),
          currentWeek: weekIndexOf(params, today),
          daysPerWeek: params.available_days.length,
          peakM: weeks.length ? Math.max(...weeks.map((w) => w.volumeM)) : null,
          unit,
          icon: spot(GOAL_SPOT[g.distance as keyof typeof GOAL_SPOT] ?? 'goal-fitness'),
          name,
        },
        p,
      );
    }
    return null;
  }, [
    kind,
    act.data,
    allActs.data,
    plan.data,
    week.data,
    profile.data,
    showPace,
    name,
    q.id,
    weekDate,
    today,
  ]);

  const logo = useMemo(() => svgInner(isDark() ? logos.markDark : logos.mark), []);
  const xml = useMemo(() => (model ? cardSvg(model, palette(), { logo }) : null), [model, logo]);

  // Web: PNG disiapkan lebih dulu, supaya `navigator.share` dipanggil langsung saat tombol ditekan
  // (browser menolak share yang terlambat dari ketukan pengguna).
  useEffect(() => {
    if (!WEB || !model) return;
    let live = true;
    setPng(null);
    void (async () => {
      try {
        const svg = cardSvg(model, palette(), { logo, fontCss: await webFontCss() });
        const blob = await webSvgToPng(svg);
        if (live) setPng(blob);
      } catch {
        if (live) setNote(t('share.failed'));
      }
    })();
    return () => {
      live = false;
    };
  }, [model, logo]);

  const file = shareFileName(kind ?? 'card', today);
  const done = (r: ShareResult) => {
    if (r === 'shared' || r === 'downloaded') track('share_completed', { moment: kind ?? 'unknown' });
    setNote(r === 'downloaded' ? t('share.downloaded') : r === 'failed' ? t('share.failed') : null);
  };
  const onShare = async () => {
    setBusy(true);
    setNote(null);
    try {
      if (WEB) {
        if (png) done(await webSharePng(png, file));
      } else {
        const b64 = await cardRef.current?.toPngBase64();
        done(b64 ? await nativeSharePng(b64, file, t('share.title')) : 'failed');
      }
    } catch {
      done('failed');
    } finally {
      setBusy(false);
    }
  };

  const previewW = Math.min(width - space.screenX * 2, size.contentMax, space[10] * 7);
  const loading = act.isPending && kind === 'activity';
  if (loading) return <Screen>{null}</Screen>;
  if (!model || !xml) {
    return (
      <Screen testID="screen-share">
        <IconButton icon="back" label={t('common.back')} onPress={back} testID="back" />
        <Text>{t('share.notFound')}</Text>
      </Screen>
    );
  }
  const runPace =
    kind === 'activity' && !!act.data?.distance_m && !act.data.workout_type?.match(/strength|core/);
  const hasName = !!profile.data?.display_name?.trim();

  return (
    <Screen
      testID="screen-share"
      footer={
        <>
          <PrimaryButton
            label={t('share.cta')}
            icon="share"
            loading={busy || (WEB && !png)}
            onPress={onShare}
            testID="share-go"
          />
          {WEB ? (
            <SecondaryButton
              label={t('share.download')}
              disabled={!png}
              onPress={() => {
                if (!png) return;
                webDownload(png, file);
                done('downloaded');
              }}
              testID="share-download"
            />
          ) : null}
          <Text variant="caption" color="textMuted" align="center">
            {t('share.privacy')}
          </Text>
        </>
      }
    >
      <IconButton icon="back" label={t('common.back')} onPress={back} testID="back" />
      <SpotTitle title={t('share.title')} spot="finish" subtitle={t('share.subtitle')} />
      <View style={styles.preview}>
        <ShareCardView ref={cardRef} xml={xml} width={previewW} label={t('share.previewLabel')} />
      </View>
      {note ? (
        <Text variant="bodySm" color="textMuted" align="center" testID="share-note">
          {note}
        </Text>
      ) : null}
      {runPace || hasName ? (
        <SettingsGroup>
          {runPace ? (
            <SettingsRow
              label={t('share.showPace')}
              right={
                <Switch
                  label={t('share.showPace')}
                  value={showPace}
                  onChange={setShowPace}
                  testID="share-pace"
                />
              }
            />
          ) : null}
          {hasName ? (
            <SettingsRow
              label={t('share.showName')}
              right={
                <Switch
                  label={t('share.showName')}
                  value={showName}
                  onChange={setShowName}
                  testID="share-name"
                />
              }
            />
          ) : null}
        </SettingsGroup>
      ) : null}
    </Screen>
  );
}

const styles = themed(() =>
  StyleSheet.create({
    preview: { alignItems: 'center' },
  }),
);
