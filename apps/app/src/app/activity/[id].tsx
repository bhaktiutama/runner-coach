import { parseSteps } from '@run-coach/training-engine';
import {
  BibTag,
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
} from '@run-coach/ui';
import { formatDate, formatDistance, formatDuration, formatPace } from '@run-coach/ui/format';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { useActivity, useProfile } from '@/data/hooks';
import { t, type MessageKey } from '@/i18n/t';
import { averagePace, rpeVerdict } from '@/lib/progress';
import { localDateOf } from '@/lib/today';
import { segmentRows, TYPE_ZONE, typeName } from '@/lib/workoutView';
import { buildSegments, type SegmentResult } from '@/timer/machine';

/** 3.4 Detail aktivitas (F-14). Split per km hanya jika ada data (fase 2); tidak dikarang. */
export default function ActivityDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const a = useActivity(id);
  const tz = useProfile().data?.timezone ?? 'Asia/Jakarta';
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
  const date = localDateOf(x.started_at, tz);
  const time = new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: tz }).format(
    new Date(x.started_at),
  );
  const pace = averagePace(x.distance_m, x.duration_s);
  const steps = x.workout_steps ? parseSteps(JSON.parse(x.workout_steps)) : null;
  const results: SegmentResult[] = x.segments ? (JSON.parse(x.segments) as SegmentResult[]) : [];
  const rows = steps && x.workout_type ? segmentRows(steps, x.workout_type) : [];
  const segs = steps ? buildSegments(steps) : [];
  const stats = [
    { label: t('activity.distance'), value: x.distance_m ? formatDistance(x.distance_m) : '-' },
    { label: t('activity.duration'), value: formatDuration(x.duration_s) },
    { label: t('activity.pace'), value: pace ? formatPace(pace) : '-' },
    ...(x.avg_hr ? [{ label: t('activity.hr'), value: t('activity.hrValue', { bpm: x.avg_hr }) }] : []),
  ];
  const groupStatus = (g: number): 'done' | 'skipped' | 'none' => {
    const idx = segs.map((s, i) => (s.group === g ? i : -1)).filter((i) => i >= 0);
    const rs = results.filter((r) => idx.includes(r.index));
    if (!rs.length) return 'none';
    return rs.every((r) => !r.skipped) && rs.length === idx.length ? 'done' : 'skipped';
  };
  return (
    <Screen testID="screen-activity">
      <View style={styles.top}>
        <IconButton icon="back" label={t('activity.back')} onPress={back} />
        <View style={styles.flex} />
        <Text variant="captionStrong" color="textMuted">
          {t(`activity.source.${x.source === 'timer' ? 'timer' : 'manual'}` as MessageKey)}
        </Text>
      </View>
      <View style={styles.head}>
        <Text variant="controlSm" color="textMuted">
          {t('activity.dateTime', { date: formatDate(date), time })}
        </Text>
        <View style={styles.titleRow}>
          {x.workout_type ? (
            <BibTag label={typeName(x.workout_type)} zone={TYPE_ZONE[x.workout_type]} />
          ) : null}
          <Text variant="title" style={styles.flexShrink}>
            {x.workout_type ? typeName(x.workout_type) : t('progress.extraRun')}
          </Text>
        </View>
      </View>
      <View style={styles.grid}>
        {pairs(stats).map((pair, i) => (
          <View key={i} style={styles.gridRow}>
            {pair.map((st) => (
              <Stat key={st.label} {...st} />
            ))}
            {pair.length === 1 ? <View style={styles.flex} /> : null}
          </View>
        ))}
      </View>
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
                    {r.label}
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text variant="captionStrong" color="textMuted">
        {label}
      </Text>
      <Text variant="stat">{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  flexShrink: { flexShrink: 1 },
  top: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  head: { gap: space[1] + space[1] / 2, alignItems: 'flex-start' },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2] + border.selected - border.hairline / 2,
  },
  grid: { gap: space[2] },
  gridRow: { flexDirection: 'row', gap: space[2] },
  stat: {
    flex: 1,
    backgroundColor: color.surfaceSunken,
    borderRadius: radius.md,
    paddingVertical: space[3],
    paddingHorizontal: space[3] + border.selected - border.hairline / 2,
    gap: border.selected - border.hairline / 2,
  },
  section: { gap: space[2] },
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
});
