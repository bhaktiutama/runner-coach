import { addDays, diffDays, mondayOf, type EngineMessageKey } from '@run-coach/training-engine';
import { border, Card, color, radius, space, Text, themed, ToneBar } from '@run-coach/ui';
import { formatDateLong, formatDistance, formatNumber } from '@run-coach/ui/format';
import { type ReactNode, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useActivityDistance } from '@/data/hooks';
import { t } from '@/i18n/t';
import { countdownTo, RACE_START_HOUR } from '@/lib/progress';
import { et } from '@/lib/rationale';

/** Tinggi kartu geser tetap: semua kartu sama tinggi, layar tidak bergeser saat kartu utama diganti. */
export const CARD_H = space[10] * 4 + space[5];

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
  /** Minggu plan untuk lajur fase (warna fase, minggu ini ditandai). */
  weeks?: { startDate: string; phase: string }[];
};

/**
 * 2.1 (review 2026-11-05): hitung mundur hari + jam ke race. Tanpa tanggal race (Bugar, atau race
 * belum ditentukan): sisa hari plan + jarak yang sudah dikumpulkan dari target plan.
 */
export function CountdownCard({
  today,
  distance,
  raceDate,
  planStart,
  planEnd,
  planTargetM,
  pin,
  weeks = [],
}: Props) {
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
  const monday = mondayOf(today);
  const ci = weeks.findIndex((w) => mondayOf(w.startDate) === monday);
  const cur = ci >= 0 ? { i: ci, phase: weeks[ci]!.phase } : null;

  if (race) {
    return (
      <Card style={styles.card} testID="countdown-race">
        <View style={styles.row}>
          <Text variant="captionStrong" color="textMuted" style={styles.flex}>
            {t('today.countdownRace', { distance: dist })}
          </Text>
          {pin}
        </View>
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
        {weeks.length ? (
          <PhaseStrip weeks={weeks} today={today} />
        ) : (
          <ToneBar
            progress={elapsed}
            color={color.primary}
            trackColor={color.surfaceSunken}
            height={space[2]}
          />
        )}
        <View style={styles.row}>
          <Text variant="caption" color="textMuted" style={styles.flex}>
            {t('today.countdownRaceSub', { km: formatDistance(doneM) })}
          </Text>
          {cur ? (
            <Text variant="captionStrong" color="textMuted">
              {t('today.countdownPhase', {
                n: cur.i + 1,
                total: weeks.length,
                phase: et(`phase.${cur.phase}` as EngineMessageKey),
              })}
            </Text>
          ) : null}
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
    </Card>
  );
}

/** Lajur minggu plan berwarna fase; minggu yang lewat pudar, minggu ini lebih tinggi + garis. */
function PhaseStrip({ weeks, today }: { weeks: { startDate: string; phase: string }[]; today: string }) {
  const monday = mondayOf(today);
  return (
    <View style={styles.strip} accessibilityRole="image" testID="phase-strip">
      {weeks.map((w) => {
        const m = mondayOf(w.startDate);
        const fill =
          w.phase === 'return'
            ? color.status.recovery
            : ((color.phase as Record<string, string>)[w.phase] ?? color.line);
        return (
          <View
            key={m}
            style={[
              styles.stripPart,
              { backgroundColor: fill, opacity: m < monday ? 0.45 : 1 },
              m === monday && styles.stripNow,
            ]}
          />
        );
      })}
    </View>
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
    strip: { flexDirection: 'row', gap: space[1] / 2, alignItems: 'center', marginTop: 'auto' },
    stripPart: { flex: 1, height: space[2], borderRadius: radius.stadium },
    stripNow: { height: space[3] + space[1], borderWidth: border.selected, borderColor: color.text },
    nums: { flexDirection: 'row', gap: space[4] },
    unit: { alignItems: 'center', minWidth: space[10] },
  }),
);
