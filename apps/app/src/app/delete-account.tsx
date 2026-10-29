import {
  border,
  color,
  DangerButton,
  Icon,
  IconButton,
  InfoBox,
  LinkButton,
  radius,
  SecondaryButton,
  space,
  Text,
  TextField,
} from '@run-coach/ui';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { usePrivacyActions, useSession, useToday } from '@/data/hooks';
import { t, type MessageKey } from '@/i18n/t';
import { track } from '@/lib/analytics';

const REASON: Record<string, MessageKey> = { offline: 'auth.offline', not_configured: 'auth.notConfigured' };

/** 4.6 Hapus akun (F-10, FL-7). Data lokal dihapus hanya jika server berhasil. */
export default function DeleteAccount() {
  const a = usePrivacyActions();
  const session = useSession();
  const today = useToday();
  const [word, setWord] = useState('');
  const [error, setError] = useState<string | null>(null);
  const back = () => (router.canGoBack() ? router.back() : router.replace('/privacy'));
  const ok = word.trim().toUpperCase() === t('delete.confirmWord');

  return (
    <Screen testID="screen-delete">
      <IconButton icon="back" label={t('common.back')} onPress={back} />
      <Text variant="display">{t('delete.title')}</Text>
      <Text color="textMuted">{t('delete.subtitle')}</Text>
      {(['delete.item1', 'delete.item2', 'delete.item3'] as const).map((k) => (
        <View key={k} style={styles.item}>
          <Icon name="close" color={color.status.behindInk} />
          <Text style={styles.flex}>{t(k)}</Text>
        </View>
      ))}
      <View style={styles.card}>
        <Text variant="heading">{t('delete.backupTitle')}</Text>
        <Text color="textMuted">{t('delete.backupBody')}</Text>
        <SecondaryButton
          label={t('privacy.backupCta')}
          icon="share"
          onPress={() => void a.exportFile.mutateAsync(today)}
        />
      </View>
      {!session.data && session.isFetched ? (
        <InfoBox tone="info">
          <Text>{t('delete.notSignedIn')}</Text>
        </InfoBox>
      ) : null}
      <TextField
        label={t('delete.typeLabel')}
        value={word}
        onChangeText={setWord}
        autoCapitalize="characters"
        testID="delete-word"
      />
      <InfoBox tone="warn" icon="info">
        <Text>{t('delete.internet')}</Text>
      </InfoBox>
      {error ? (
        <InfoBox tone="danger" testID="delete-error">
          <Text>{error}</Text>
        </InfoBox>
      ) : null}
      <DangerButton
        label={t('delete.cta')}
        testID="delete-confirm"
        disabled={!ok || !session.data}
        loading={a.deleteAccount.isPending}
        onPress={async () => {
          setError(null);
          try {
            await a.deleteAccount.mutateAsync();
            track('account_deleted');
            if (router.canDismiss()) router.dismissAll();
            router.replace('/welcome');
          } catch (e) {
            const code = String((e as Error).message);
            setError(t('delete.failed', { reason: t(REASON[code] ?? 'auth.failed') }));
          }
        }}
      />
      <LinkButton label={t('common.cancel')} onPress={back} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  item: { flexDirection: 'row', gap: space[3], alignItems: 'flex-start' },
  card: {
    borderWidth: border.hairline,
    borderColor: color.line,
    borderRadius: radius.lg,
    padding: space[5],
    gap: space[3],
    backgroundColor: color.surface,
  },
});
