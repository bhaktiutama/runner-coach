import { addDays, diffDays, type EngineMessageKey } from '@run-coach/training-engine';
import { Card, color, space, Text, themed, ToneBar } from '@run-coach/ui';
import { formatDateLong, formatDistance, formatNumber } from '@run-coach/ui/format';
import { type ReactNode, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useActivityDistance } from '@/data/hooks';
import { t } from '@/i18n/t';
import { countdownTo, RACE_START_HOUR } from '@/lib/progress';
import { et } from '@/lib/rationale';

/** Tinggi kartu geser tetap: semua kartu sama tinggi, layar tidak bergeser saat kartu utama diganti. */
export const CARD_H = space[10] * 4 + space[2];

type Props = {
  today: string;
  distance: '5k' | '10k' | 'hm' | 'fm' | 'fitness';
  raceDate: string | null;
  planStart: string;
  planEnd: string;
  /** Total volume target semua minggu plan (meter). */
  planTargetM: number;
  /** Tombol "Jadikan utama" / chip "Utama" dari carousel. */
  pin?: ReactNode;
};

/**
 * 2.1 (review 2026-11-05): hitung mundur hari + jam ke race. Tanpa tanggal race (Bugar, atau race
 * belum ditentukan): sisa hari plan + jarak yang sudah dikumpulkan dari target plan.
 */
export function CountdownCard({ today, distance, raceDate, planStart, planEnd, planTargetM, pin }: Props) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);
  const doneM = useActivityDistance(planStart, today).data ?? 0;
  const total = Math.max(1, diffDays(planStart, planEnd));
  const elapsed = Math.min(1, Math.max(0, diffDays(planStart, today) / total));
  const race = raceDate ? countdownTo(raceDate, now) : null;
  const dist = et(`distance.${distance}` as EngineMessageKey);

  if (race) {
    return (
      <Card style={styles.card} testID="countdown-race">
        <View style={styles.row}>
          <Text variant="captionStrong" color="textMuted" style={styles.flex}>
            {t('today.countdownRace', { distance: dist })}
          </Text>
          {pin}
        </View>
        {/* Isi di tengah ruang antara judul dan titik penanda: jarak atas-bawah seimbang. */}
        <View style={styles.body}>
          <View style={styles.row}>
            <View style={styles.flex}>
              <Text variant="row">
                {t('today.countdownRaceDate', { date: formatDateLong(raceDate!), hour: RACE_START_HOUR })}
              </Text>
            </View>
            <View style={styles.nums}>
              <Unit value={race.days} label={t('today.countdownDays')} />
              <Unit value={race.hours} label={t('today.countdownHours')} />
            </View>
          </View>
          <ToneBar
            progress={elapsed}
            color={color.primary}
            trackColor={color.surfaceSunken}
            height={space[2]}
          />
          <Text variant="caption" color="textMuted">
            {t('today.countdownRaceSub', { km: formatDistance(doneM) })}
          </Text>
        </View>
      </Card>
    );
  }
  const left = Math.max(0, diffDays(today, addDays(planEnd, 0)));
  return (
    <Card style={styles.card} testID="countdown-plan">
      <View style={styles.row}>
        <Text variant="captionStrong" color="textMuted" style={styles.flex}>
          {t('today.countdownPlan')}
        </Text>
        {pin}
      </View>
      {/* Isi di tengah ruang antara judul dan titik penanda: jarak atas-bawah seimbang. */}
      <View style={styles.body}>
        <View style={styles.row}>
          <View style={styles.flex}>
            <Text variant="row">{t('today.countdownPlanEnd', { date: formatDateLong(planEnd) })}</Text>
          </View>
          <Unit value={left} label={t('today.countdownDays')} />
        </View>
        <ToneBar
          progress={planTargetM ? doneM / planTargetM : elapsed}
          color={color.success}
          trackColor={color.surfaceSunken}
          height={space[2]}
        />
        <Text variant="caption" color="textMuted">
          {t('today.countdownPlanSub', { km: formatDistance(doneM), target: formatDistance(planTargetM) })}
        </Text>
      </View>
    </Card>
  );
}

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.unit}>
      <Text variant="numberMd">{formatNumber(value)}</Text>
      <Text variant="caption" color="textMuted">
        {label}
      </Text>
    </View>
  );
}

const styles = themed(() =>
  StyleSheet.create({
    card: { gap: space[2], padding: space[4], paddingBottom: space[6] + space[1], height: CARD_H },
    row: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
    flex: { flex: 1, gap: space[1] },
    body: { flex: 1, justifyContent: 'center', gap: space[2] },
    nums: { flexDirection: 'row', gap: space[4] },
    unit: { alignItems: 'center', minWidth: space[10] },
  }),
);
