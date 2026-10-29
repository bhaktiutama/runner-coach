import type { EngineMessageKey, Weekday } from '@run-coach/training-engine';
import {
  border,
  Chip,
  color,
  Icon,
  InfoBox,
  radius,
  SegmentedControl,
  size,
  space,
  Text,
  weekdayShortName,
} from '@run-coach/ui';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { OnboardingStep } from '@/components/OnboardingStep';
import { useOnboarding } from '@/data/useOnboarding';
import { t } from '@/i18n/t';
import { notificationsSupported, requestPermission } from '@/lib/notifications';
import { et } from '@/lib/rationale';

const TIMES = ['05:00', '05:30', '06:00', '06:30', '17:00', '18:00'];

/** 1.6 Hari tersedia (3-6), hari long run, jam pengingat (FL-11). */
export default function DaysStep() {
  const o = useOnboarding('days');
  const d = o.draft;
  const days = (d.availableDays ?? []) as Weekday[];
  const longDay = d.longRunDay ?? 6;
  const [picking, setPicking] = useState(false);
  const [explained, setExplained] = useState(false);
  const n = days.length;

  const toggle = (wd: Weekday) => {
    const next = days.includes(wd) ? days.filter((x) => x !== wd) : [...days, wd].sort((a, b) => a - b);
    o.update({ availableDays: next });
  };

  const chooseTime = async (time: string | null) => {
    o.update({ reminderTime: time });
    setPicking(false);
    if (time && notificationsSupported) {
      setExplained(true);
      // Izin ditolak tidak menghalangi: reminder_time tetap disimpan (FL-11).
      await requestPermission();
    }
  };

  // Hari long run selalu termasuk hari lari.
  const withLong = days.includes(longDay as Weekday)
    ? days
    : [...days, longDay as Weekday].sort((a, b) => a - b);
  const valid = withLong.length >= 3 && withLong.length <= 6;

  return (
    <OnboardingStep
      step="days"
      title={t('days.title')}
      subtitle={t('days.subtitle')}
      canNext={o.ready && valid}
      loading={o.saving}
      onNext={() => void o.next({ availableDays: withLong, longRunDay: longDay })}
    >
      <View style={styles.days}>
        {Array.from({ length: 7 }, (_, i) => {
          const on = withLong.includes(i as Weekday);
          return (
            <Pressable
              key={i}
              testID={`wd-${i}`}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: on }}
              accessibilityLabel={weekdayShortName(i)}
              onPress={() => toggle(i as Weekday)}
              style={[styles.day, on && styles.dayOn]}
            >
              <Text variant="heading" style={{ color: on ? color.palette.cream : color.text }}>
                {weekdayShortName(i)}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {n > 0 ? (
        <InfoBox tone={valid ? 'ok' : 'warn'} testID="days-fit">
          <Text>
            {valid
              ? t('days.fit', {
                  n: withLong.length,
                  distance: d.distance ? et(`distance.${d.distance}` as EngineMessageKey) : '',
                })
              : withLong.length < 3
                ? t('days.tooFew')
                : t('days.tooMany')}
          </Text>
        </InfoBox>
      ) : null}
      <Text variant="label" color="textMuted">
        {t('days.longRunLabel')}
      </Text>
      <SegmentedControl
        value={String(longDay)}
        onChange={(v) => o.update({ longRunDay: Number(v) as 5 | 6 })}
        items={[
          { value: '5', label: t('days.saturday') },
          { value: '6', label: t('days.sunday') },
        ]}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('days.reminder')}
        disabled={!notificationsSupported}
        onPress={() => setPicking((p) => !p)}
        style={[styles.reminder, !notificationsSupported && styles.off]}
        testID="reminder"
      >
        <Icon name="bell" />
        <Text variant="heading" style={styles.flex}>
          {t('days.reminder')}
        </Text>
        <Text variant="numberMd">{d.reminderTime ?? t('days.reminderOff')}</Text>
      </Pressable>
      {!notificationsSupported ? (
        <Text variant="label" color="textMuted">
          {t('days.reminderWeb')}
        </Text>
      ) : null}
      {picking ? (
        <View style={styles.times}>
          {TIMES.map((tm) => (
            <Chip key={tm} label={tm} selected={d.reminderTime === tm} onPress={() => void chooseTime(tm)} />
          ))}
          <Chip
            label={t('days.reminderOff')}
            selected={!d.reminderTime}
            onPress={() => void chooseTime(null)}
          />
        </View>
      ) : null}
      {picking || explained ? (
        <Text variant="label" color="textMuted">
          {t('days.reminderExplain')}
        </Text>
      ) : null}
    </OnboardingStep>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  days: { flexDirection: 'row', gap: space[1], justifyContent: 'space-between' },
  day: {
    flex: 1,
    minHeight: size.buttonPrimary + space[3],
    borderRadius: radius.stadium,
    borderWidth: border.control,
    borderColor: color.line,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayOn: { backgroundColor: color.text, borderColor: color.text },
  reminder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    padding: space[5],
    borderRadius: radius.lg,
    borderWidth: border.control,
    borderColor: color.line,
    backgroundColor: color.surface,
  },
  off: { opacity: 0.4 },
  times: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
});
