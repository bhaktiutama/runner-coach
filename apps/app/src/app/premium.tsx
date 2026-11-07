import {
  border,
  Card,
  color,
  Icon,
  IconButton,
  InfoBox,
  PrimaryButton,
  radius,
  space,
  Text,
  themed,
} from '@run-coach/ui';
import { formatPrice } from '@run-coach/ui/format';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { t, type MessageKey } from '@/i18n/t';
import { track } from '@/lib/analytics';
import { FREE_STRENGTH_WEEKS } from '@/lib/entitlement';
import { useEntitlement } from '@/lib/useEntitlement';
import { PRICES, yearlySavingPct } from '@/lib/pricing';
import { IMAGES } from '@/lib/imagery';
import { SpotTitle } from '@/components/Spot';

const FREE: MessageKey[] = [
  'premium.free.plan',
  'premium.free.timer',
  'premium.free.progress',
  'premium.free.strength',
];
const PAID: MessageKey[] = [
  'premium.paid.strength',
  'premium.paid.nextGoal',
  'premium.paid.share',
  'premium.paid.history',
  'premium.paid.future',
];

/**
 * 4.4 Premium (F-23, 08-MONETIZATION). Pembelian belum tersambung (RevenueCat, Fase 3), jadi tombol
 * beli nonaktif dengan keterangan. Sudah Premium (mis. whitelist, bagian 7): status aktif, tanpa harga.
 */
export default function Premium() {
  const ent = useEntitlement();
  const [plan, setPlan] = useState<'yearly' | 'monthly'>('yearly');
  const back = () => (router.canGoBack() ? router.back() : router.replace('/profile'));
  useEffect(() => {
    if (ent.paywall) track('paywall_viewed');
  }, [ent.paywall]);
  const price = (p: 'yearly' | 'monthly') => formatPrice(PRICES[p], PRICES.currency);
  return (
    <Screen
      testID="screen-premium"
      hero={{ source: IMAGES.riversideCityM, keepFirst: true }}
      footer={
        ent.premium ? (
          <InfoBox tone="ok" icon="premium" testID="premium-active">
            {t(ent.source === 'whitelist' ? 'premium.activeWhitelist' : 'premium.active')}
          </InfoBox>
        ) : (
          <>
            <PrimaryButton
              label={t('premium.cta', { days: PRICES.trialDays })}
              icon="premium"
              disabled
              testID="premium-buy"
              onPress={() => undefined}
            />
            <Text variant="caption" color="textMuted" align="center">
              {t('premium.soon')}
            </Text>
          </>
        )
      }
    >
      <IconButton icon="back" label={t('common.back')} onPress={back} testID="back" />
      <View style={styles.head}>
        <Text variant="statusCaps" color="primaryInk">
          {t('premium.kicker')}
        </Text>
        <SpotTitle title={t('premium.title')} spot="premium" />
        <Text color="textMuted">{t('premium.subtitle', { weeks: FREE_STRENGTH_WEEKS })}</Text>
      </View>
      <Card style={styles.list}>
        <Text variant="cardTitle">{t('premium.freeTitle')}</Text>
        {FREE.map((k) => (
          <Row key={k} text={t(k, { weeks: FREE_STRENGTH_WEEKS })} />
        ))}
      </Card>
      <Card style={[styles.list, styles.paid]}>
        <Text variant="cardTitle">{t('premium.paidTitle')}</Text>
        {PAID.map((k) => (
          <Row key={k} text={t(k)} premium />
        ))}
      </Card>
      {ent.premium ? null : (
        <View style={styles.prices}>
          {(['yearly', 'monthly'] as const).map((p) => (
            <Pressable
              key={p}
              accessibilityRole="radio"
              accessibilityState={{ selected: plan === p }}
              onPress={() => setPlan(p)}
              testID={`price-${p}`}
              style={[styles.price, plan === p && styles.priceOn]}
            >
              <Text variant="controlStrong">{t(`premium.${p}` as MessageKey)}</Text>
              <Text variant="stat">{price(p)}</Text>
              <Text variant="caption" color="textMuted">
                {p === 'yearly'
                  ? t('premium.yearlySub', {
                      perMonth: formatPrice(PRICES.yearly / 12, PRICES.currency),
                      pct: yearlySavingPct(),
                    })
                  : t('premium.monthlySub')}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
      <InfoBox tone="info">{t('premium.privacy')}</InfoBox>
      <Text variant="caption" color="textMuted">
        {t('premium.cancel')}
      </Text>
    </Screen>
  );
}

function Row({ text, premium }: { text: string; premium?: boolean }) {
  return (
    <View style={styles.row}>
      <Icon
        name={premium ? 'premium' : 'check'}
        size={space[5]}
        color={premium ? color.primaryInk : color.success}
      />
      <Text variant="bodySm" style={styles.flex}>
        {text}
      </Text>
    </View>
  );
}

const styles = themed(() =>
  StyleSheet.create({
    flex: { flex: 1 },
    head: { gap: space[2] },
    list: { gap: space[3] },
    paid: { borderLeftWidth: space[2], borderLeftColor: color.primary },
    row: { flexDirection: 'row', gap: space[3], alignItems: 'flex-start' },
    prices: { flexDirection: 'row', gap: space[2] },
    price: {
      flex: 1,
      gap: space[1],
      padding: space[4],
      borderRadius: radius.lg,
      backgroundColor: color.surface,
      borderWidth: border.selected,
      borderColor: color.line,
    },
    priceOn: { borderColor: color.text },
  }),
);
