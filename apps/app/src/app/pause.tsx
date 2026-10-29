import { Chip, IconButton, InfoBox, PrimaryButton, space, Text } from '@run-coach/ui';
import { formatDateLong } from '@run-coach/ui/format';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { useActivePlan, usePlanOps, useToday } from '@/data/hooks';
import { t, type MessageKey } from '@/i18n/t';
import { track } from '@/lib/analytics';
import { goHome } from '@/lib/nav';

const REASONS = ['injury', 'sick', 'busy'] as const;
const DUR = [
  { v: '3', label: 'pause.d3', days: 3 },
  { v: '7', label: 'pause.d7', days: 7 },
  { v: '14', label: 'pause.d14', days: 14 },
  { v: 'x', label: 'pause.dUnknown', days: null },
] as const;
const PARTS: MessageKey[] = ['pause.knee', 'pause.shin', 'pause.foot', 'pause.hip', 'pause.other'];

/** 4.3 Jeda plan (F-09, FL-6). Bagian nyeri hanya untuk saran dan tidak disimpan. */
export default function Pause() {
  const plan = useActivePlan();
  const ops = usePlanOps();
  const today = useToday();
  const [reason, setReason] = useState<(typeof REASONS)[number]>('injury');
  const [dur, setDur] = useState<string>('7');
  const [parts, setParts] = useState<MessageKey[]>([]);
  const back = () => (router.canGoBack() ? router.back() : router.replace('/profile'));
  const p = plan.data;
  if (!p) return <Screen>{null}</Screen>;

  if (p.status === 'paused') {
    return (
      <Screen testID="screen-pause">
        <IconButton icon="back" label={t('common.back')} onPress={back} />
        <Text variant="display">{t('pause.pausedTitle')}</Text>
        <Text color="textMuted">
          {t('pause.pausedBody', { date: formatDateLong((p.paused_at ?? today).slice(0, 10)) })}
        </Text>
        <PrimaryButton
          label={t('pause.resume')}
          testID="resume"
          onPress={async () => {
            await ops.resume.mutateAsync(today);
            track('plan_resumed');
            goHome();
          }}
        />
      </Screen>
    );
  }

  const d = DUR.find((x) => x.v === dur)!;
  return (
    <Screen
      testID="screen-pause"
      footer={
        <PrimaryButton
          testID="pause-confirm"
          label={d.days ? t('pause.cta', { label: t(d.label).toLowerCase() }) : t('pause.ctaUnknown')}
          loading={ops.pause.isPending}
          onPress={async () => {
            await ops.pause.mutateAsync({ reason, days: d.days });
            track('plan_paused');
            goHome();
          }}
        />
      }
    >
      <IconButton icon="back" label={t('common.back')} onPress={back} />
      <Text variant="display">{t('pause.title')}</Text>
      <Text color="textMuted">{t('pause.subtitle')}</Text>
      <Text variant="label" color="textMuted">
        {t('pause.reason')}
      </Text>
      <View style={styles.row}>
        {REASONS.map((r) => (
          <Chip
            key={r}
            testID={`reason-${r}`}
            label={t(`pause.${r}` as MessageKey)}
            selected={reason === r}
            onPress={() => setReason(r)}
          />
        ))}
      </View>
      <Text variant="label" color="textMuted">
        {t('pause.duration')}
      </Text>
      <View style={styles.row}>
        {DUR.map((x) => (
          <Chip key={x.v} label={t(x.label)} selected={dur === x.v} onPress={() => setDur(x.v)} />
        ))}
      </View>
      {reason === 'injury' ? (
        <>
          <Text variant="label" color="textMuted">
            {t('pause.bodyPart')}
          </Text>
          <View style={styles.row}>
            {PARTS.map((k) => (
              <Chip
                key={k}
                label={t(k)}
                selected={parts.includes(k)}
                onPress={() => setParts(parts.includes(k) ? parts.filter((x) => x !== k) : [...parts, k])}
              />
            ))}
          </View>
          <InfoBox tone="danger">
            <Text>{t('pause.warn')}</Text>
          </InfoBox>
        </>
      ) : null}
      <InfoBox tone="info" icon="sync">
        <Text variant="heading">{t('pause.returnTitle')}</Text>
        <Text>{t('pause.returnBody')}</Text>
      </InfoBox>
    </Screen>
  );
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] } });
