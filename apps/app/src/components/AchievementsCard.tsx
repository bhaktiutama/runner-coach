import { Card, radius, size, space, SpotIcon, Text, themed } from '@run-coach/ui';
import { formatNumber } from '@run-coach/ui/format';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { t, type MessageKey } from '@/i18n/t';
import type { Achievement } from '@/lib/achievements';

/**
 * Pencapaian di Progres 3.3 (F-28, UI/UX 14): tiga badge, yang belum didapat tampil pudar dengan
 * kemajuan. Hanya tampil saat ikon ilustrasi nyala (badge adalah ikon spot). Badge didapat = tombol
 * bagikan ke 2.7 (F-29).
 */
export function AchievementsCard({ items }: { items: Achievement[] }) {
  return (
    <View style={styles.section} testID="achievements">
      <Text variant="label" color="textMuted">
        {t('progress.achievements')}
      </Text>
      <Card style={styles.card}>
        {items.map((a) => {
          const name = t(`achv.${a.id}` as MessageKey);
          const state = a.earned
            ? t('achv.earned')
            : t(`achv.progress.${a.id}` as MessageKey, {
                done: a.id === 'first_5k' ? formatNumber(Math.floor(a.done / 100) / 10, 1) : a.done,
                total: a.id === 'first_5k' ? formatNumber(a.total / 1000) : a.total,
              });
          // Badge yang sudah didapat bisa dibagikan (F-29) -> 2.7.
          return (
            <Pressable
              key={a.id}
              style={styles.item}
              accessible
              accessibilityRole={a.earned ? 'button' : undefined}
              accessibilityLabel={
                a.earned ? t('share.open.achievement', { name }) : t('achv.label', { name, state })
              }
              disabled={!a.earned}
              onPress={() => router.push({ pathname: '/share', params: { kind: 'achievement', id: a.id } })}
              testID={`achv-${a.id}${a.earned ? '-earned' : ''}`}
            >
              <View style={a.earned ? null : styles.locked}>
                <SpotIcon name={a.spot} size={size.spotLg} />
              </View>
              <Text variant="controlSmStrong" align="center" numberOfLines={2}>
                {name}
              </Text>
              <Text variant="caption" color={a.earned ? 'success' : 'textMuted'} align="center">
                {state}
              </Text>
            </Pressable>
          );
        })}
      </Card>
    </View>
  );
}

const styles = themed(() =>
  StyleSheet.create({
    section: { gap: space[2] },
    card: { flexDirection: 'row', gap: space[2], paddingVertical: space[4], borderRadius: radius.lg },
    item: { flex: 1, minWidth: 0, alignItems: 'center', gap: space[1] },
    locked: { opacity: 0.35 },
  }),
);
