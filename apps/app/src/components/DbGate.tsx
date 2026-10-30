import { color, PrimaryButton, space, Text } from '@run-coach/ui';
import { useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { DbLockedError, getDb } from '@/db/client';
import { t } from '@/i18n/t';

/** Tahan render sampai database lokal terbuka dan migrasi selesai. */
export function DbGate({ children }: { children: ReactNode }) {
  const q = useQuery({ queryKey: ['db'], queryFn: getDb, retry: false });
  if (q.isPending) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={color.primary} />
      </View>
    );
  }
  if (q.isError) {
    return (
      <View style={styles.center}>
        <Text align="center">
          {q.error instanceof DbLockedError ? t('common.dbLocked') : t('common.error')}
        </Text>
        <PrimaryButton label={t('common.retry')} onPress={() => void q.refetch()} />
      </View>
    );
  }
  return <>{children}</>;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[4],
    backgroundColor: color.bg,
    padding: space[5],
  },
});
