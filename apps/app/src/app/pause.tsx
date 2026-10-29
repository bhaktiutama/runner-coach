import {
  border,
  Chip,
  color,
  IconButton,
  InfoBox,
  PrimaryButton,
  radius,
  ScreenTitle,
  SegmentedControl,
  space,
  Text,
} from '@run-coach/ui';
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
        <ScreenTitle
          title={t('pause.pausedTitle')}
          subtitle={t('pause.pausedBody', { date: formatDateLong((p.paused_at ?? today).slice(0, 10)) })}
        />
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
      <ScreenTitle title={t('pause.title')} subtitle={t('pause.subtitle')} />
      <View style={styles.group}>
        <Text variant="label" color="textMuted">
          {t('pause.reason')}
        </Text>
        <View style={styles.row}>
          {REASONS.map((r) => (
            <Chip
              key={r}
              fill
              size="large"
              testID={`reason-${r}`}
              label={t(`pause.${r}` as MessageKey)}
              selected={reason === r}
              onPress={() => setReason(r)}
            />
          ))}
        </View>
      </View>
      <View style={styles.group}>
        <Text variant="label" color="textMuted">
          {t('pause.duration')}
        </Text>
        <SegmentedControl
          items={DUR.map((x) => ({ value: x.v, label: t(x.label) }))}
          value={dur}
          onChange={setDur}
        />
      </View>
      {reason === 'injury' ? (
        <View style={styles.group}>
          <Text variant="label" color="textMuted">
            {t('pause.bodyPart')}{' '}
            <Text variant="note" color="textMuted">
              {t('pause.bodyPartNote')}
            </Text>
          </Text>
          <View style={styles.wrap}>
            {PARTS.map((k) => (
              <Chip
                key={k}
                size="quick"
                label={t(k)}
                selected={parts.includes(k)}
                onPress={() => setParts(parts.includes(k) ? parts.filter((x) => x !== k) : [...parts, k])}
              />
            ))}
          </View>
          <InfoBox tone="danger">{t('pause.warn')}</InfoBox>
        </View>
      ) : null}
      <View style={styles.returnBox}>
        <Text variant="boxTitle">{t('pause.returnTitle')}</Text>
        <Text variant="bodySm">{t('pause.returnBody')}</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: { gap: space[2] + border.selected - border.hairline / 2 },
  row: { flexDirection: 'row', gap: space[2] },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
  returnBox: {
    gap: space[1] + space[1] / 2,
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: color.status.recovery,
  },
});
