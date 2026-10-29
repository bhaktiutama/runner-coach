import { addDays, checkMove, mondayOf, weekday } from '@run-coach/training-engine';
import {
  BibTag,
  border,
  color,
  IconButton,
  InfoBox,
  LinkButton,
  PrimaryButton,
  radius,
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

  return (
    <View style={styles.backdrop}>
      <Pressable style={styles.flex} onPress={close} accessibilityLabel={t('move.close')} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + space[5] }]} testID="move-sheet">
        <View style={styles.handle} />
        <View style={styles.head}>
          <Text variant="title" style={styles.flex}>
            {t('move.title')}
          </Text>
          <IconButton icon="close" label={t('move.close')} onPress={close} />
        </View>
        <View style={styles.row}>
          <BibTag label={typeName(wk.type)} zone={TYPE_ZONE[wk.type]} />
          <Text variant="heading">
            {t('move.summary', { type: typeName(wk.type), min: minutesOf(wk.steps) })}
          </Text>
        </View>
        <Text variant="label" color="textMuted">
          {t('move.original', { date: formatDate(wk.original_date ?? wk.date) })}
        </Text>
        {days.length === 0 ? <Text>{t('move.noDays')}</Text> : null}
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
                style={[styles.day, on && styles.dayOn]}
              >
                <Text variant="label" style={{ color: on ? color.palette.cream : color.text }}>
                  {weekdayShortName(weekday(d))}
                </Text>
                <Text variant="numberMd" style={{ color: on ? color.palette.cream : color.text }}>
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
        <InfoBox
          tone={
            check.verdict === 'safe' || check.verdict === 'origin'
              ? 'ok'
              : check.verdict === 'hard_adjacent'
                ? 'danger'
                : 'warn'
          }
          testID="move-verdict"
        >
          <Text>{t(`move.verdict.${check.verdict}` as MessageKey)}</Text>
          {merged ? (
            <Text variant="label">
              {t('move.mergeCap', {
                total: formatDistance(Number(merged.distance_m)),
                cap: formatDistance(Number(merged.cap_m)),
              })}
            </Text>
          ) : null}
        </InfoBox>
        <PrimaryButton
          testID="move-apply"
          label={
            check.verdict === 'occupied'
              ? t('move.merge', {
                  day: t('move.day', { wd: weekdayShortName(weekday(sel)), d: Number(sel.slice(8)) }),
                })
              : t('move.cta', {
                  day: t('move.day', { wd: weekdayShortName(weekday(sel)), d: Number(sel.slice(8)) }),
                })
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
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  backdrop: { flex: 1, backgroundColor: color.overlay },
  sheet: {
    backgroundColor: color.bg,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    padding: space[5],
    gap: space[3],
    width: '100%',
    maxWidth: size.contentMax,
    alignSelf: 'center',
  },
  handle: {
    alignSelf: 'center',
    width: space[10] * 2,
    height: space[1],
    borderRadius: radius.stadium,
    backgroundColor: color.lineStrong,
  },
  head: { flexDirection: 'row', alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  days: { flexDirection: 'row', gap: space[2] },
  day: {
    flex: 1,
    alignItems: 'center',
    gap: space[1],
    paddingVertical: space[4],
    borderRadius: radius.stadium,
    borderWidth: border.control,
    borderColor: color.line,
    backgroundColor: color.surface,
  },
  dayOn: { backgroundColor: color.text, borderColor: color.text },
  dot: { width: space[3], height: space[3], borderRadius: radius.stadium },
});
