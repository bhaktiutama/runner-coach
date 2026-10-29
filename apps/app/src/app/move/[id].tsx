import { addDays, checkMove, mondayOf, weekday } from '@run-coach/training-engine';
import {
  BibTag,
  border,
  color,
  IconButton,
  LinkButton,
  PrimaryButton,
  radius,
  shadow,
  ring,
  size,
  space,
  Text,
  weekdayLongName,
  weekdayShortName,
} from '@run-coach/ui';
import { formatDate, formatDistance } from '@run-coach/ui/format';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useActivePlan,
  useLongest30,
  useToday,
  useWeekWorkouts,
  useWorkout,
  useWorkoutActions,
} from '@/data/hooks';
import { t, type MessageKey } from '@/i18n/t';
import { minutesOf, TYPE_ZONE, typeName } from '@/lib/workoutView';

/** 3.2 Pindahkan latihan (sheet). Pilihan: hari di minggu yang sama, mulai hari ini. */
export default function MoveSheet() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const today = useToday();
  const plan = useActivePlan();
  const w = useWorkout(id);
  const week = useWeekWorkouts(plan.data?.id, w.data?.date ?? today);
  const longest = useLongest30(today, plan.data?.goal.longest_run_m ?? 0);
  const actions = useWorkoutActions();
  const [target, setTarget] = useState<string | null>(null);
  const close = () => (router.canGoBack() ? router.back() : router.replace('/plan'));
  if (!w.data || !week.data) return null;
  const wk = w.data;
  const monday = mondayOf(wk.date);
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i)).filter((d) => d >= today);
  const sel = target ?? wk.date;
  const check = checkMove(wk, sel, week.data, longest.data ?? 0);
  const merged = check.verdict === 'occupied' ? check.rationale[0]?.values : null;
  const busy = actions.move.isPending || actions.merge.isPending || actions.skip.isPending;

  const apply = async () => {
    if (check.verdict === 'occupied' && check.mergeWith) {
      await actions.merge.mutateAsync({ id: wk.id, intoId: check.mergeWith, longestM: longest.data ?? 0 });
    } else {
      await actions.move.mutateAsync({ id: wk.id, toDate: sel });
    }
    close();
  };

  const tone =
    check.verdict === 'safe' || check.verdict === 'origin'
      ? color.status.onTrack
      : check.verdict === 'hard_adjacent'
        ? color.status.behind
        : color.status.attention;
  const dayLabel = t('move.day', { wd: weekdayShortName(weekday(sel)), d: Number(sel.slice(8)) });

  return (
    <View style={styles.backdrop}>
      <Pressable style={styles.flex} onPress={close} accessibilityLabel={t('move.close')} />
      <View
        style={[styles.sheet, { paddingBottom: Math.max(space.screenBottom, insets.bottom + space[2]) }]}
        testID="move-sheet"
      >
        <View style={styles.handle} />
        <View style={styles.head}>
          <View style={styles.headText}>
            <Text variant="stat">{t('move.title')}</Text>
            <View style={styles.row}>
              <BibTag label={typeName(wk.type)} zone={TYPE_ZONE[wk.type]} />
              <Text variant="control">
                {t('move.summary', { type: typeName(wk.type), min: minutesOf(wk.steps) })}
              </Text>
            </View>
            <Text variant="note" color="textMuted">
              {t('move.original', { date: formatDate(wk.original_date ?? wk.date) })}
            </Text>
          </View>
          <IconButton icon="close" label={t('move.close')} onPress={close} />
        </View>
        {days.length === 0 ? <Text variant="bodySm">{t('move.noDays')}</Text> : null}
        <View style={styles.days}>
          {days.map((d) => {
            const other = week.data!.find((x) => x.date === d && x.id !== wk.id);
            const on = d === sel;
            return (
              <Pressable
                key={d}
                testID={`move-${d}`}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                accessibilityLabel={weekdayLongName(weekday(d))}
                onPress={() => setTarget(d)}
                style={[styles.day, on ? styles.dayOn : styles.dayOff]}
              >
                <Text variant="captionStrong" style={{ color: on ? color.bg : color.text }}>
                  {weekdayShortName(weekday(d))}
                </Text>
                <Text variant="numberSm" style={{ color: on ? color.bg : color.text }}>
                  {String(Number(d.slice(8)))}
                </Text>
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: other ? color.zone[TYPE_ZONE[other.type]] : color.surfaceSunken },
                  ]}
                />
              </Pressable>
            );
          })}
        </View>
        <View style={[styles.msg, { backgroundColor: tone }]} testID="move-verdict">
          <Text variant="bodySm">{t(`move.verdict.${check.verdict}` as MessageKey)}</Text>
          {merged ? (
            <Text variant="note">
              {t('move.mergeCap', {
                total: formatDistance(Number(merged.distance_m)),
                cap: formatDistance(Number(merged.cap_m)),
              })}
            </Text>
          ) : null}
        </View>
        <View style={styles.actions}>
          <PrimaryButton
            testID="move-apply"
            label={
              check.verdict === 'occupied'
                ? t('move.merge', { day: dayLabel })
                : t('move.cta', { day: dayLabel })
            }
            disabled={check.verdict === 'origin' || check.verdict === 'hard_adjacent'}
            loading={busy}
            onPress={() => void apply()}
          />
          <LinkButton
            label={t('move.skip')}
            testID="move-skip"
            onPress={async () => {
              await actions.skip.mutateAsync(wk.id);
              close();
            }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  backdrop: { flex: 1, backgroundColor: color.overlay },
  sheet: {
    backgroundColor: color.bg,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    paddingTop: space[3],
    paddingHorizontal: space.screenX,
    gap: space[4] + space[1] / 2,
    width: '100%',
    maxWidth: size.contentMax + space.screenX * 2,
    alignSelf: 'center',
    ...shadow.raised,
  },
  handle: {
    alignSelf: 'center',
    width: space[10],
    height: space[1] + border.hairline,
    borderRadius: radius.stadium,
    backgroundColor: color.lineStrong,
  },
  head: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: space[3] },
  headText: { flex: 1, gap: space[1] },
  row: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  days: { flexDirection: 'row', gap: space[1] + space[1] / 2 },
  day: {
    flex: 1,
    height: space[10] * 2 + space[1],
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[1],
    borderRadius: radius.stadium,
  },
  dayOn: { backgroundColor: color.text },
  dayOff: { backgroundColor: color.surface, ...ring(border.control, color.line) },
  dot: {
    width: space[2] + border.selected - border.hairline / 2,
    height: space[2] + border.selected - border.hairline / 2,
    borderRadius: radius.stadium,
  },
  msg: {
    paddingVertical: space[3] + space[1] / 2,
    paddingHorizontal: space[4],
    borderRadius: radius.md,
    gap: space[1],
  },
  actions: { gap: space[1] },
});
