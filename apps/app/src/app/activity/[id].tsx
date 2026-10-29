import { parseSteps } from '@run-coach/training-engine';
import { BibTag, border, Card, color, Icon, IconButton, LaneMark, radius, space, Text } from '@run-coach/ui';
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
        <Text variant="label" color="textMuted">
          {t(`activity.source.${x.source === 'timer' ? 'timer' : 'manual'}` as MessageKey)}
        </Text>
      </View>
      <Text color="textMuted">{t('activity.dateTime', { date: formatDate(date), time })}</Text>
      <View style={styles.titleRow}>
        {x.workout_type ? <BibTag label={typeName(x.workout_type)} zone={TYPE_ZONE[x.workout_type]} /> : null}
        <Text variant="title">{x.workout_type ? typeName(x.workout_type) : t('progress.extraRun')}</Text>
      </View>
      <View style={styles.grid}>
        <Stat label={t('activity.distance')} value={x.distance_m ? formatDistance(x.distance_m) : '-'} />
        <Stat label={t('activity.duration')} value={formatDuration(x.duration_s)} />
        <Stat label={t('activity.pace')} value={pace ? formatPace(pace) : '-'} />
        {x.avg_hr ? <Stat label={t('activity.hr')} value={t('activity.hrValue', { bpm: x.avg_hr })} /> : null}
      </View>
      {rows.length ? (
        <>
          <Text variant="label" color="textMuted">
            {t('activity.segments')}
          </Text>
          <Card style={styles.segCard}>
            {rows.map((r, i) => {
              const s = x.source === 'timer' ? groupStatus(i + 1) : 'none';
              return (
                <View key={r.key} style={[styles.segRow, i > 0 && styles.sep]}>
                  <LaneMark zone={r.zone} drill={r.drill} />
                  <Text variant="heading" style={styles.flex}>
                    {r.label}
                  </Text>
                  <Text color="textMuted">{r.detail}</Text>
                  {s !== 'none' ? (
                    <View style={styles.status}>
                      <Icon
                        name={s === 'done' ? 'check' : 'skip'}
                        color={s === 'done' ? color.success : color.textMuted}
                        size={space[5]}
                      />
                      <Text variant="label" color={s === 'done' ? 'success' : 'textMuted'}>
                        {s === 'done' ? t('activity.segDone') : t('activity.segSkipped')}
                      </Text>
                    </View>
                  ) : null}
                </View>
              );
            })}
          </Card>
        </>
      ) : null}
      <Text variant="label" color="textMuted">
        {t('activity.splits')}
      </Text>
      <Text variant="label" color="textMuted">
        {t('activity.splitsNone')}
      </Text>
      {x.rpe ? (
        <Card variant="outline" style={styles.rpe}>
          <Text color="textMuted">{t('activity.rpe')}</Text>
          <Text variant="heading">
            {t('activity.rpeValue', {
              rpe: x.rpe,
              verdict: t(`rpe.short.${rpeVerdict(x.rpe, x.workout_type)}` as MessageKey),
            })}
          </Text>
        </Card>
      ) : null}
      {x.tags.length ? (
        <Text color="textMuted">
          {t('activity.tagsValue', { tags: x.tags.map((tg) => t(`tag.${tg}` as MessageKey)).join(', ') })}
        </Text>
      ) : null}
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text variant="label" color="textMuted">
        {label}
      </Text>
      <Text variant="numberMd">{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: space[3], flexWrap: 'wrap' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space[3] },
  stat: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: color.surfaceSunken,
    borderRadius: radius.md,
    padding: space[4],
    gap: space[1],
  },
  segCard: { paddingVertical: 0 },
  segRow: { flexDirection: 'row', alignItems: 'center', gap: space[3], paddingVertical: space[4] },
  sep: { borderTopWidth: border.hairline, borderTopColor: color.line },
  status: { flexDirection: 'row', alignItems: 'center', gap: space[1] },
  rpe: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
