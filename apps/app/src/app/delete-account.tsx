import {
  border,
  color,
  DangerButton,
  Icon,
  IconButton,
  InfoBox,
  LinkButton,
  radius,
  ring,
  ScreenTitle,
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
    <Screen
      testID="screen-delete"
      footer={
        <>
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
        </>
      }
    >
      <IconButton icon="back" label={t('common.back')} onPress={back} />
      <ScreenTitle title={t('delete.title')} subtitle={t('delete.subtitle')} />
      <View style={styles.list}>
        {(['delete.item1', 'delete.item2', 'delete.item3'] as const).map((k) => (
          <View key={k} style={styles.item}>
            <View style={styles.itemIcon}>
              <Icon name="close" size={space[4] + space[1] / 2} color={color.status.behindInk} />
            </View>
            <Text variant="subtitle" style={styles.flex}>
              {t(k)}
            </Text>
          </View>
        ))}
      </View>
      <View style={styles.card}>
        <Text variant="boxTitle">{t('delete.backupTitle')}</Text>
        <Text variant="bodySm" color="textMuted">
          {t('delete.backupBody')}
        </Text>
        <SecondaryButton
          label={t('privacy.backupCta')}
          icon="share"
          onPress={() => void a.exportFile.mutateAsync(today)}
        />
      </View>
      {!session.data && session.isFetched ? <InfoBox tone="info">{t('delete.notSignedIn')}</InfoBox> : null}
      <TextField
        label={t('delete.typeLabel')}
        value={word}
        onChangeText={setWord}
        autoCapitalize="characters"
        numeric
        keyboardType="default"
        testID="delete-word"
      />
      <InfoBox tone="warn" icon="info">
        {t('delete.internet')}
      </InfoBox>
      {error ? (
        <InfoBox tone="danger" testID="delete-error">
          {error}
        </InfoBox>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { gap: space[3] },
  item: {
    flexDirection: 'row',
    gap: space[2] + border.selected - border.hairline / 2,
    alignItems: 'flex-start',
  },
  itemIcon: { paddingTop: border.selected - border.hairline / 2 },
  card: {
    ...ring(border.hairline, color.line),
    borderRadius: radius.lg,
    padding: space[4],
    gap: space[2] + border.selected - border.hairline / 2,
    backgroundColor: color.surface,
  },
});
