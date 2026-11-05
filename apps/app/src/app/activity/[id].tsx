import { isSupportType, parseSteps } from '@run-coach/training-engine';
import {
  border,
  color,
  Icon,
  IconButton,
  LaneMark,
  radius,
  ring,
  shadow,
  size,
  space,
  Text,
  themed,
} from '@run-coach/ui';
import { formatDate, formatDistance, formatDuration, formatPaceValue } from '@run-coach/ui/format';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { useActivity, useProfile } from '@/data/hooks';
import { t, type MessageKey } from '@/i18n/t';
import { averagePace, rpeVerdict } from '@/lib/progress';
import { localDateOf } from '@/lib/today';
import { segmentRows, TYPE_ZONE, typeName } from '@/lib/workoutView';
import { buildSegments, decodeResults, exerciseSummary } from '@/timer/machine';
import { ExerciseSummaryList } from '@/components/ExerciseSummaryList';
import { IMAGES, workoutImage } from '@/lib/imagery';

/** 3.4 Detail aktivitas (F-14). Split per km hanya jika ada data (fase 2); tidak dikarang. */
export default function ActivityDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const a = useActivity(id);
  const tz = useProfile().data?.timezone ?? 'Asia/Jakarta';
  const { width } = useWindowDimensions();
  const back = () => (router.canGoBack() ? router.back() : router.replace('/progress'));
  if (a.isPending) return <Screen>{null}</Screen>;
  if (!a.data) {
    return (
      <Screen>
        <IconButton icon="back" label={t('activity.back')} onPress={back} />
        <Text>{t('activity.notFound')}</Text>
      </Screen>
    );
  }
  const x = a.data;
  // Kolom stat sempit (layar 320 px): angka satu ukuran lebih kecil agar tidak terpotong.
  const narrow = (Math.min(width, size.contentMax) - space.screenX * 2) / 3 < space[10] * 2 + space[5];
  const date = localDateOf(x.started_at, tz);
  const time = new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: tz }).format(
    new Date(x.started_at),
  );
  const pace = averagePace(x.distance_m, x.duration_s);
  const steps = x.workout_steps ? parseSteps(JSON.parse(x.workout_steps)) : null;
  const decoded = decodeResults(x.segments);
  const results = decoded.results;
  const support = !!x.workout_type && isSupportType(x.workout_type);
  const rows = steps && x.workout_type && !support ? segmentRows(steps, x.workout_type) : [];
  const segs = steps ? buildSegments(steps, { prep: decoded.prep }) : [];
  const perExercise = support && x.source === 'timer' ? exerciseSummary(segs, results) : [];
  // Jarak dan pace dari timer = perkiraan dari pace target (tanpa GPS); dijelaskan di catatan bawah stat.
  const approx = x.source === 'timer';
  const stats = support
    ? [
        { label: t('activity.duration'), value: formatDuration(x.duration_s) },
        ...(perExercise.length
          ? [
              {
                label: t('activity.exercises'),
                value: t('activity.ofTotal', {
                  done: perExercise.filter((e) => !e.skipped && e.setsDone === e.sets).length,
                  total: perExercise.length,
                }),
              },
              {
                label: t('activity.sets'),
                value: t('activity.ofTotal', {
                  done: perExercise.reduce((n, e) => n + e.setsDone, 0),
                  total: perExercise.reduce((n, e) => n + e.sets, 0),
                }),
              },
            ]
          : []),
      ]
    : [
        { label: t('activity.distance'), value: x.distance_m ? formatDistance(x.distance_m) : '-' },
        { label: t('activity.duration'), value: formatDuration(x.duration_s) },
        // Satuan di label agar angka muat di kolom sempit (3 kolom di layar 320 px).
        { label: t('activity.paceShort'), value: pace ? formatPaceValue(pace) : '-' },
        ...(x.avg_hr ? [{ label: t('activity.hr'), value: t('activity.hrValue', { bpm: x.avg_hr }) }] : []),
      ];
  const hero =
    (x.workout_type ? workoutImage(x.workout_type, date) : null) ??
    (support ? IMAGES.trackSide : IMAGES.roadSunriseM);
  const groupStatus = (g: number): 'done' | 'skipped' | 'none' => {
    const idx = segs.map((s, i) => (s.group === g ? i : -1)).filter((i) => i >= 0);
    const rs = results.filter((r) => idx.includes(r.index));
    if (!rs.length) return 'none';
    return rs.every((r) => !r.skipped) && rs.length === idx.length ? 'done' : 'skipped';
  };
  return (
    // Hero bergambar seperti 2.5 (UI/UX 12); judul = nama tipe sekali saja (tanpa bib yang sama).
    <Screen testID="screen-activity" hero={{ source: hero, keepFirst: true }}>
      <View style={styles.top}>
        <IconButton icon="back" label={t('activity.back')} onPress={back} />
        <View style={styles.flex} />
        <View style={styles.sourcePill}>
          <Text variant="captionStrong">
            {t(`activity.source.${x.source === 'timer' ? 'timer' : 'manual'}` as MessageKey)}
          </Text>
        </View>
      </View>
      <View style={styles.head}>
        <View style={styles.titleRow}>
          <LaneMark zone={x.workout_type ? TYPE_ZONE[x.workout_type] : 'easy'} tall />
          <Text variant="title" style={styles.flexShrink} testID="activity-title">
            {x.workout_type ? typeName(x.workout_type) : t('progress.extraRun')}
          </Text>
        </View>
        <Text variant="controlSm" color="textMuted">
          {t('activity.dateTime', { date: formatDate(date), time })}
        </Text>
      </View>
      {/* Satu kartu, kolom dipisah garis tipis (tanpa slot kosong); 4 nilai = 2 baris x 2. */}
      <View style={styles.statCard} testID="activity-stats">
        {(stats.length === 4 ? pairs(stats) : [stats]).map((row, i) => (
          <View key={i} style={[styles.gridRow, i > 0 && styles.statRowSep]}>
            {row.map((st, j) => (
              <Stat key={st.label} {...st} first={j === 0} compact={narrow} />
            ))}
          </View>
        ))}
      </View>
      {approx && !support && x.distance_m ? (
        <Text variant="caption" color="textMuted">
          {t('activity.approxNote')}
        </Text>
      ) : null}
      {perExercise.length ? (
        <View style={styles.section}>
          <Text variant="label" color="textMuted">
            {t('summary.perExercise')}
          </Text>
          <ExerciseSummaryList items={perExercise} />
        </View>
      ) : null}
      {rows.length ? (
        <View style={styles.section}>
          <Text variant="label" color="textMuted">
            {t('activity.segments')}
          </Text>
          <View style={styles.table}>
            {rows.map((r, i) => {
              const s = x.source === 'timer' ? groupStatus(i + 1) : 'none';
              return (
                <View key={r.key} style={[styles.segRow, i < rows.length - 1 && styles.sep]}>
                  <LaneMark zone={r.zone} drill={r.drill} tall />
                  <Text variant="controlStrong" style={styles.flex} numberOfLines={1}>
                    {/* Satu segmen: namanya sama dengan judul, jadi cukup "Target". */}
                    {rows.length === 1 ? t('activity.targetOnly') : r.label}
                  </Text>
                  <Text variant="note" color="textMuted">
                    {r.detail}
                  </Text>
                  {s !== 'none' ? (
                    <View style={styles.status}>
                      <Icon
                        name={s === 'done' ? 'check' : 'skip'}
                        color={s === 'done' ? color.success : color.textMuted}
                        size={space[4]}
                        strokeWidth={s === 'done' ? 3 : 2}
                      />
                      <Text
                        variant="numberRowStrong"
                        style={{ color: s === 'done' ? color.success : color.textMuted }}
                      >
                        {s === 'done' ? t('activity.segDone') : t('activity.segSkipped')}
                      </Text>
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        </View>
      ) : null}
      {x.rpe ? (
        <View style={styles.rpe}>
          <Text variant="controlStrong" color="textMuted">
            {t('activity.rpe')}
          </Text>
          <Text variant="row">
            {t('activity.rpeValue', {
              rpe: x.rpe,
              verdict: t(`rpe.short.${rpeVerdict(x.rpe, x.workout_type)}` as MessageKey),
            })}
          </Text>
        </View>
      ) : null}
      {x.load_feel ? (
        <View style={styles.rpe}>
          <Text variant="controlStrong" color="textMuted">
            {t('activity.loadFeel')}
          </Text>
          <Text variant="row">{t(`finish.loadFeel.${x.load_feel}` as MessageKey)}</Text>
        </View>
      ) : null}
      {x.tags.length ? (
        <Text variant="bodySm" color="textMuted">
          {t('activity.tagsValue', { tags: x.tags.map((tg) => t(`tag.${tg}` as MessageKey)).join(', ') })}
        </Text>
      ) : null}
    </Screen>
  );
}

function pairs<T>(xs: T[]): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < xs.length; i += 2) out.push(xs.slice(i, i + 2));
  return out;
}

function Stat({
  label,
  value,
  first,
  compact,
}: {
  label: string;
  value: string;
  first: boolean;
  compact: boolean;
}) {
  return (
    <View style={[styles.stat, compact && styles.statCompact, !first && styles.statSep]}>
      <Text variant="captionStrong" color="textMuted" numberOfLines={1}>
        {label}
      </Text>
      <Text variant={compact ? 'numberSm' : 'stat'} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = themed(() =>
  StyleSheet.create({
    flex: { flex: 1 },
    flexShrink: { flexShrink: 1 },
    top: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
    section: { gap: space[2] },
    sourcePill: {
      backgroundColor: color.surface,
      borderRadius: radius.stadium,
      paddingHorizontal: space[3],
      paddingVertical: space[1] + space[1] / 2,
      ...shadow.card,
    },
    head: { gap: space[1] + space[1] / 2, alignItems: 'flex-start' },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[2] + border.selected - border.hairline / 2,
    },
    grid: { gap: space[2] },
    gridRow: { flexDirection: 'row', gap: space[2] },
    statCard: { backgroundColor: color.surface, borderRadius: radius.md, ...shadow.card },
    statRowSep: { borderTopWidth: border.hairline, borderTopColor: color.line },
    statCompact: { paddingHorizontal: space[2] },
    statSep: { borderLeftWidth: border.hairline, borderLeftColor: color.line },
    stat: {
      flex: 1,
      minWidth: 0,
      borderRadius: radius.md,
      paddingVertical: space[3],
      paddingHorizontal: space[3],
      gap: border.selected - border.hairline / 2,
    },
    table: { backgroundColor: color.surface, borderRadius: radius.md, ...shadow.card },
    segRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[3],
      minHeight: size.buttonSecondary,
      paddingHorizontal: space[3] + border.selected - border.hairline / 2,
    },
    sep: { borderBottomWidth: border.hairline, borderBottomColor: color.line },
    status: { flexDirection: 'row', alignItems: 'center', gap: space[1] },
    rpe: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: space[3] + border.selected - border.hairline / 2,
      paddingHorizontal: space[4],
      borderRadius: radius.md,
      backgroundColor: color.surface,
      ...ring(border.hairline, color.line),
    },
  }),
);
