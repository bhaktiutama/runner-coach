import { assessGoal, type EngineMessageKey } from '@run-coach/training-engine';
import { InfoBox, LinkButton, SecondaryButton, TextField } from '@run-coach/ui';
import { formatDateFull } from '@run-coach/ui/format';
import { useState } from 'react';
import { Calendar } from '@/components/Calendar';
import { LeadText } from '@/components/LeadText';
import { OnboardingStep } from '@/components/OnboardingStep';
import { useToday } from '@/data/hooks';
import { useOnboarding } from '@/data/useOnboarding';
import { t } from '@/i18n/t';
import { et } from '@/lib/rationale';

/** 1.3 Tanggal race + nama race (opsional). */
export default function RaceStep() {
  const o = useOnboarding('race');
  const today = useToday();
  const d = o.draft;
  const initial = d.raceDate ?? today;
  const [ym, setYm] = useState({ y: Number(initial.slice(0, 4)), m: Number(initial.slice(5, 7)) - 1 });
  const distanceName = d.distance ? et(`distance.${d.distance}` as EngineMessageKey) : '';
  const a =
    d.raceDate && d.distance
      ? assessGoal({ distance: d.distance, raceDate: d.raceDate, startDate: today, longestRunM: 0 })
      : null;
  const shorter = a?.shorterTarget ? et(`distance.${a.shorterTarget}` as EngineMessageKey) : null;

  return (
    <OnboardingStep
      step="race"
      title={t('race.title', { distance: distanceName })}
      subtitle={t('race.subtitle')}
      canNext={o.ready && !!d.raceDate && a?.fit !== 'too_short'}
      loading={o.saving}
      onNext={() => void o.next()}
      extraFooter={
        <LinkButton
          label={t('race.noRace')}
          testID="no-race"
          onPress={() => void o.next({ raceDate: null, raceName: null })}
        />
      }
    >
      <Calendar
        year={ym.y}
        month0={ym.m}
        selected={d.raceDate ?? null}
        minDate={today}
        onSelect={(date) => o.update({ raceDate: date })}
        onMonth={(y, m) => setYm({ y, m })}
      />
      {a && d.raceDate ? (
        <InfoBox tone={a.fit === 'ok' ? 'ok' : a.fit === 'compressed' ? 'warn' : 'danger'} testID="race-fit">
          <LeadText
            text={
              a.fit === 'ok'
                ? t('race.fitOk', {
                    date: formatDateFull(d.raceDate),
                    weeks: a.weeksUntilRace ?? 0,
                    distance: distanceName,
                  })
                : a.fit === 'compressed'
                  ? shorter
                    ? t('race.fitCompressed', {
                        date: formatDateFull(d.raceDate),
                        weeks: a.weeksUntilRace ?? 0,
                        distance: distanceName,
                        defaultWeeks: a.defaultWeeks,
                        shorter,
                      })
                    : t('race.fitCompressedNoShorter', {
                        date: formatDateFull(d.raceDate),
                        weeks: a.weeksUntilRace ?? 0,
                        distance: distanceName,
                        defaultWeeks: a.defaultWeeks,
                      })
                  : shorter
                    ? t('race.tooShort', {
                        date: formatDateFull(d.raceDate),
                        weeks: a.weeksUntilRace ?? 0,
                        distance: distanceName,
                        minWeeks: a.minWeeks,
                        shorter,
                      })
                    : t('race.tooShortNoShorter', { date: formatDateFull(d.raceDate), minWeeks: a.minWeeks })
            }
          />
        </InfoBox>
      ) : null}
      {a && a.fit !== 'ok' && a.shorterTarget ? (
        <SecondaryButton
          label={t('race.switchShorter', { shorter: shorter ?? '' })}
          onPress={() => o.update({ distance: a.shorterTarget! })}
        />
      ) : null}
      <TextField
        label={t('race.nameLabel')}
        placeholder={t('race.namePlaceholder')}
        value={d.raceName ?? ''}
        onChangeText={(v) => o.update({ raceName: v })}
        maxLength={80}
      />
    </OnboardingStep>
  );
}
