import { diffDays, type EngineMessageKey } from '@run-coach/training-engine';
import {
  color,
  DangerButton,
  IconButton,
  InfoBox,
  Logo,
  PrimaryButton,
  radius,
  SecondaryButton,
  SettingsGroup,
  SettingsRow,
  space,
  Switch,
  Text,
} from '@run-coach/ui';
import { formatDateLong } from '@run-coach/ui/format';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen } from '@/components/Screen';
import type { BackupFile, BackupSummary } from '@/data/backup';
import { useMeta, usePrivacyActions, useSession, useToday } from '@/data/hooks';
import { t } from '@/i18n/t';
import { setAnalyticsEnabled, track } from '@/lib/analytics';
import { startFresh } from '@/lib/nav';
import { et } from '@/lib/rationale';
import { localDateOf } from '@/lib/today';

type Sheet = null | 'signout' | 'wipe' | { file: BackupFile; summary: BackupSummary };

/** 4.5 Data & privasi (F-13, F-18, F-19, FL-8, FL-10). */
export default function Privacy() {
  const meta = useMeta();
  const session = useSession();
  const today = useToday();
  const a = usePrivacyActions();
  const [sheet, setSheet] = useState<Sheet>(null);
  const [msg, setMsg] = useState<{ tone: 'ok' | 'danger'; text: string } | null>(null);
  const back = () => (router.canGoBack() ? router.back() : router.replace('/profile'));
  if (!meta.data) return <Screen>{null}</Screen>;
  const last = meta.data.last_backup_at;
  const days = last ? diffDays(localDateOf(last), today) : null;
  const signedIn = !!session.data;

  const doBackup = async () => {
    try {
      const ok = await a.exportFile.mutateAsync(today);
      setMsg(
        ok
          ? { tone: 'ok', text: t('privacy.backupDone') }
          : { tone: 'danger', text: t('privacy.backupFailed') },
      );
      if (ok) track('backup_exported');
    } catch {
      setMsg({ tone: 'danger', text: t('privacy.backupFailed') });
    }
  };

  const doPick = async () => {
    setMsg(null);
    const r = await a.pickRestore.mutateAsync();
    if (!r) return;
    if (!r.ok)
      return setMsg({
        tone: 'danger',
        text: r.error === 'newer_version' ? t('privacy.restoreNewer') : t('privacy.restoreNotBackup'),
      });
    setSheet({ file: r.data, summary: r.summary });
  };

  return (
    <Screen testID="screen-privacy">
      <View style={styles.top}>
        <IconButton icon="back" label={t('common.back')} onPress={back} />
        <Text color="textMuted" align="center" style={styles.flex}>
          {t('privacy.header')}
        </Text>
        <View style={styles.spacer} />
      </View>
      <View style={styles.hero}>
        <View style={styles.heroHead}>
          <Logo variant="mark" dark height={space[8]} />
          <Text variant="title" color="darkText" style={styles.flex}>
            {t('privacy.heroTitle')}
          </Text>
        </View>
        <Text color="darkText">{t('privacy.heroBody')}</Text>
      </View>
      <View style={styles.row}>
        <Text variant="heading">{t('privacy.backup')}</Text>
        <Text
          variant="label"
          style={{ color: days == null || days >= 30 ? color.status.attentionInk : color.textMuted }}
          testID="last-backup"
        >
          {t('privacy.lastBackup', {
            when:
              days == null
                ? t('privacy.never')
                : days === 0
                  ? t('privacy.today')
                  : t('privacy.daysAgo', { n: days }),
          })}
        </Text>
      </View>
      <PrimaryButton
        label={t('privacy.backupCta')}
        icon="share"
        testID="backup"
        loading={a.exportFile.isPending}
        onPress={() => void doBackup()}
      />
      <SecondaryButton
        label={t('privacy.restoreCta')}
        icon="sync"
        testID="restore"
        onPress={() => void doPick()}
      />
      <Text variant="label" color="textMuted">
        {t('privacy.backupNote')}
      </Text>
      {process.env.EXPO_OS === 'web' ? (
        <Text variant="caption" color="textMuted">
          {t('privacy.webStorage')}
        </Text>
      ) : null}
      {msg ? (
        <InfoBox tone={msg.tone} testID="privacy-msg">
          <Text>{msg.text}</Text>
        </InfoBox>
      ) : null}
      {sheet && typeof sheet === 'object' ? (
        <View style={styles.sheet} testID="restore-confirm">
          <Text variant="heading">{t('privacy.restoreTitle')}</Text>
          <Text color="textMuted">
            {t('privacy.restoreSummary', {
              goal: sheet.summary.goal ? et(`distance.${sheet.summary.goal}` as EngineMessageKey) : '-',
              workouts: sheet.summary.workouts,
              activities: sheet.summary.activities,
              date: formatDateLong(sheet.summary.exportedAt.slice(0, 10)),
            })}
          </Text>
          <DangerButton
            label={t('privacy.restoreReplace')}
            testID="restore-yes"
            loading={a.restore.isPending}
            onPress={async () => {
              try {
                await a.restore.mutateAsync(sheet.file);
                track('backup_restored');
                startFresh();
              } catch {
                setSheet(null);
                setMsg({ tone: 'danger', text: t('privacy.restoreFailed') });
              }
            }}
          />
          <SecondaryButton label={t('common.cancel')} onPress={() => setSheet(null)} />
        </View>
      ) : null}
      <SettingsGroup>
        <SettingsRow
          first
          label={t('privacy.analytics')}
          sub={t('privacy.analyticsSub')}
          right={
            <Switch
              label={t('privacy.analytics')}
              value={meta.data.analytics_opt_in === 1}
              testID="analytics-switch"
              onChange={(v) => {
                setAnalyticsEnabled(v);
                a.setAnalytics.mutate(v);
              }}
            />
          }
        />
        <SettingsRow
          label={t('privacy.backupReminder')}
          right={
            <Switch
              label={t('privacy.backupReminder')}
              value={meta.data.backup_reminder_dismissed === 0}
              onChange={(v) => a.setBackupReminder.mutate(!v)}
            />
          }
        />
        <SettingsRow
          icon="profile"
          label={t('privacy.account')}
          value={signedIn ? t('privacy.accountSignedIn') : t('privacy.accountNone')}
          onPress={signedIn ? undefined : () => router.push('/sign-in')}
        />
        {signedIn ? (
          <SettingsRow
            icon="logout"
            label={t('privacy.signOut')}
            onPress={() => setSheet('signout')}
            testID="signout"
          />
        ) : null}
        <SettingsRow
          icon="trash"
          danger
          label={t('privacy.wipe')}
          onPress={() => setSheet('wipe')}
          testID="wipe"
        />
        <SettingsRow
          icon="close"
          danger
          label={t('privacy.deleteAccount')}
          onPress={() => router.push('/delete-account')}
          testID="delete-account"
        />
      </SettingsGroup>
      {sheet === 'signout' ? (
        <View style={styles.sheet}>
          <Text variant="heading">{t('privacy.signOutTitle')}</Text>
          <PrimaryButton
            label={t('privacy.signOutKeep')}
            onPress={async () => {
              await a.signOut.mutateAsync();
              setSheet(null);
            }}
          />
          <SecondaryButton label={t('privacy.backupCta')} icon="share" onPress={() => void doBackup()} />
          <DangerButton
            label={t('privacy.signOutWipe')}
            onPress={async () => {
              await a.signOut.mutateAsync();
              await a.wipe.mutateAsync();
              router.replace('/welcome');
            }}
          />
          <SecondaryButton label={t('common.cancel')} variant="ghost" onPress={() => setSheet(null)} />
        </View>
      ) : null}
      {sheet === 'wipe' ? (
        <View style={styles.sheet} testID="wipe-confirm">
          <Text variant="heading">{t('privacy.wipeTitle')}</Text>
          <Text color="textMuted">{t('privacy.wipeBody')}</Text>
          <SecondaryButton label={t('privacy.backupCta')} icon="share" onPress={() => void doBackup()} />
          <DangerButton
            label={t('privacy.wipeYes')}
            testID="wipe-yes"
            onPress={async () => {
              await a.wipe.mutateAsync();
              if (router.canDismiss()) router.dismissAll();
              router.replace('/welcome');
            }}
          />
          <SecondaryButton label={t('common.cancel')} variant="ghost" onPress={() => setSheet(null)} />
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  top: { flexDirection: 'row', alignItems: 'center' },
  spacer: { width: space[10] + space[2] },
  hero: { backgroundColor: color.text, borderRadius: radius.lg, padding: space[5], gap: space[3] },
  heroHead: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sheet: { backgroundColor: color.surface, borderRadius: radius.lg, padding: space[5], gap: space[3] },
});
