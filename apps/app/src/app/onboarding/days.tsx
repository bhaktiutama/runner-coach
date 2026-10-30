import type { EngineMessageKey, Weekday } from '@run-coach/training-engine';
import {
  border,
  Chip,
  color,
  Field,
  Icon,
  InfoBox,
  radius,
  ring,
  SegmentedControl,
  space,
  Text,
  weekdayShortName,
} from '@run-coach/ui';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { LeadText } from '@/components/LeadText';
import { OnboardingStep } from '@/components/OnboardingStep';
import { useOnboarding } from '@/data/useOnboarding';
import { t } from '@/i18n/t';
import { notificationsSupported, requestPermission } from '@/lib/notifications';
import { et } from '@/lib/rationale';

const TIMES = ['05:00', '05:30', '06:00', '06:30', '17:00', '18:00'];

/** 1.6 Hari tersedia (3-6), hari long run, jam pengingat (FL-11). Tata letak = wireframe OB6-Hari. */
export default function DaysStep() {
  const o = useOnboarding('days');
  const d = o.draft;
  const days = (d.availableDays ?? []) as Weekday[];
  const longDay = d.longRunDay ?? 6;
  const [picking, setPicking] = useState(false);
  const [explained, setExplained] = useState(false);

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
              style={[styles.day, on ? styles.dayOn : styles.dayOff]}
            >
              <Text variant="controlSmStrong" style={{ color: on ? color.bg : color.text }}>
                {weekdayShortName(i)}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {days.length > 0 ? (
        <InfoBox tone={valid ? 'ok' : 'warn'} testID="days-fit">
          {valid ? (
            <LeadText
              text={t('days.fit', {
                n: withLong.length,
                distance: d.distance ? et(`distance.${d.distance}` as EngineMessageKey) : '',
              })}
            />
          ) : withLong.length < 3 ? (
            t('days.tooFew')
          ) : (
            t('days.tooMany')
          )}
        </InfoBox>
      ) : null}
      <Field label={t('days.longRunLabel')} gap="group">
        <SegmentedControl
          value={String(longDay)}
          onChange={(v) => o.update({ longRunDay: Number(v) as 5 | 6 })}
          items={[
            { value: '5', label: t('days.saturday') },
            { value: '6', label: t('days.sunday') },
          ]}
        />
      </Field>
      <Field label={t('days.strengthLabel')} gap="group" hint={t('days.strengthNote')}>
        <SegmentedControl
          value={d.strength ? 'yes' : 'later'}
          onChange={(v) => o.update({ strength: v === 'yes' })}
          items={[
            { value: 'yes', label: t('days.strengthYes') },
            { value: 'later', label: t('days.strengthLater') },
          ]}
        />
      </Field>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('days.reminder')}
        disabled={!notificationsSupported}
        onPress={() => setPicking((p) => !p)}
        style={[styles.reminder, !notificationsSupported && styles.off]}
        testID="reminder"
      >
        <View style={styles.reminderLabel}>
          <Icon name="bell" size={space[5]} />
          <Text variant="row">{t('days.reminder')}</Text>
        </View>
        <Text variant="numberSm">{d.reminderTime ?? t('days.reminderOff')}</Text>
      </Pressable>
      {!notificationsSupported ? (
        <Text variant="note" color="textMuted">
          {t('days.reminderWeb')}
        </Text>
      ) : null}
      {picking ? (
        <View style={styles.times}>
          {TIMES.map((tm) => (
            <Chip
              key={tm}
              size="quick"
              label={tm}
              selected={d.reminderTime === tm}
              onPress={() => void chooseTime(tm)}
            />
          ))}
          <Chip
            size="quick"
            label={t('days.reminderOff')}
            selected={!d.reminderTime}
            onPress={() => void chooseTime(null)}
          />
        </View>
      ) : null}
      {picking || explained ? (
        <Text variant="note" color="textMuted">
          {t('days.reminderExplain')}
        </Text>
      ) : null}
    </OnboardingStep>
  );
}

const styles = StyleSheet.create({
  days: { flexDirection: 'row', gap: space[1] + space[1] / 2 },
  day: {
    flex: 1,
    height: space[10] + space[6],
    borderRadius: radius.stadium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayOn: { backgroundColor: color.text },
  dayOff: { backgroundColor: color.surface, ...ring(border.control, color.line) },
  reminder: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: space[10] + space[5],
    paddingHorizontal: space[4],
    borderRadius: radius.lg,
    ...ring(border.hairline, color.line),
    backgroundColor: color.surface,
  },
  reminderLabel: { flexDirection: 'row', alignItems: 'center', gap: space[2] + space[1] / 2 },
  off: { opacity: 0.5 },
  times: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
});
