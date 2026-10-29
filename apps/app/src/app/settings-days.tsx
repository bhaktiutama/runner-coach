import type { Weekday } from '@run-coach/training-engine';
import {
  Chip,
  IconButton,
  InfoBox,
  PrimaryButton,
  SegmentedControl,
  space,
  Text,
  weekdayShortName,
} from '@run-coach/ui';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { useActivePlan, usePlanOps, useProfile, useToday, useUpdateProfile } from '@/data/hooks';
import { planParams } from '@/data/rows';
import { t } from '@/i18n/t';
import { notificationsSupported, requestPermission } from '@/lib/notifications';

const TIMES = ['05:00', '05:30', '06:00', '06:30', '17:00', '18:00'];

/** 4.1 -> Hari & pengingat (1.6 versi edit). */
export default function SettingsDays() {
  const plan = useActivePlan();
  const profile = useProfile();
  const today = useToday();
  const ops = usePlanOps();
  const update = useUpdateProfile();
  const params = plan.data ? planParams(plan.data) : null;
  const [days, setDays] = useState<Weekday[] | null>(null);
  const [longDay, setLongDay] = useState<Weekday | null>(null);
  const [time, setTime] = useState<string | null | undefined>(undefined);
  if (!params || !profile.data) return <Screen>{null}</Screen>;
  const d = days ?? (params.available_days as Weekday[]);
  const ld = longDay ?? (params.long_run_day as Weekday);
  const tm = time === undefined ? profile.data.reminder_time : time;
  const withLong = d.includes(ld) ? d : ([...d, ld].sort((a, b) => a - b) as Weekday[]);
  const valid = withLong.length >= 3 && withLong.length <= 6;
  const daysChanged =
    JSON.stringify(withLong) !== JSON.stringify(params.available_days) || ld !== params.long_run_day;

  return (
    <Screen
      footer={
        <PrimaryButton
          label={t('daysEdit.save')}
          disabled={!valid}
          loading={ops.regenerate.isPending}
          testID="days-save"
          onPress={async () => {
            if (tm !== profile.data!.reminder_time) {
              await update.mutateAsync({ reminder_time: tm ?? null });
              if (tm) await requestPermission();
            }
            if (daysChanged) await ops.regenerate.mutateAsync({ today, days: withLong, longRunDay: ld });
            router.back();
          }}
        />
      }
    >
      <IconButton icon="back" label={t('common.back')} onPress={() => router.back()} />
      <Text variant="title">{t('daysEdit.title')}</Text>
      <View style={styles.row}>
        {Array.from({ length: 7 }, (_, i) => (
          <Chip
            key={i}
            label={weekdayShortName(i)}
            selected={withLong.includes(i as Weekday)}
            onPress={() =>
              setDays(
                d.includes(i as Weekday)
                  ? d.filter((x) => x !== i)
                  : ([...d, i].sort((a, b) => a - b) as Weekday[]),
              )
            }
          />
        ))}
      </View>
      {!valid ? (
        <InfoBox tone="warn">
          <Text>{withLong.length < 3 ? t('days.tooFew') : t('days.tooMany')}</Text>
        </InfoBox>
      ) : null}
      <Text variant="label" color="textMuted">
        {t('days.longRunLabel')}
      </Text>
      <SegmentedControl
        value={String(ld)}
        onChange={(v) => setLongDay(Number(v) as Weekday)}
        items={[
          { value: '5', label: t('days.saturday') },
          { value: '6', label: t('days.sunday') },
        ]}
      />
      {daysChanged ? (
        <Text variant="label" color="textMuted">
          {t('daysEdit.note')}
        </Text>
      ) : null}
      <Text variant="label" color="textMuted">
        {t('days.reminder')}
      </Text>
      {notificationsSupported ? (
        <>
          <View style={styles.row}>
            {TIMES.map((x) => (
              <Chip key={x} label={x} selected={tm === x} onPress={() => setTime(x)} />
            ))}
            <Chip label={t('days.reminderOff')} selected={!tm} onPress={() => setTime(null)} />
          </View>
          <Text variant="label" color="textMuted">
            {t('days.reminderExplain')}
          </Text>
        </>
      ) : (
        <Text variant="label" color="textMuted">
          {t('days.reminderWeb')}
        </Text>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] } });
