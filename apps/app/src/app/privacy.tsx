import { diffDays, type EngineMessageKey } from '@run-coach/training-engine';
import {
  ConfirmDialog,
  border,
  color,
  IconButton,
  InfoBox,
  Logo,
  PrimaryButton,
  radius,
  SecondaryButton,
  SettingsGroup,
  SettingsRow,
  size,
  space,
  SpotIcon,
  Switch,
  Text,
  themed,
  isDark,
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
import { useSpotIcons } from '@/lib/spot';
import { SpotInline } from '@/components/Spot';

type Sheet = null | 'signout' | 'wipe' | { file: BackupFile; summary: BackupSummary };

/** 4.5 Data & privasi (F-13, F-18, F-19, FL-8, FL-10). */
export default function Privacy() {
  const meta = useMeta();
  const session = useSession();
  const today = useToday();
  const a = usePrivacyActions();
  const icons = useSpotIcons();
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
        <Text variant="controlStrong" color="textMuted" align="center" style={styles.flex}>
          {t('privacy.header')}
        </Text>
        <View style={styles.spacer} />
      </View>
      <View style={styles.hero}>
        <View style={styles.heroHead}>
          {icons ? (
            <SpotIcon name="privacy" size={size.spotMd} testID="spot-privacy" />
          ) : (
            <Logo variant="mark" dark={!isDark()} height={space[8] + space[1]} />
          )}
          <Text variant="stat" style={[styles.flex, { color: color.bg }]}>
            {t('privacy.heroTitle')}
          </Text>
        </View>
        <Text variant="bodySm" style={[styles.heroBody, { color: color.bg }]}>
          {t('privacy.heroBody')}
        </Text>
      </View>
      <View style={styles.group}>
        <View style={[styles.row, styles.rowCenter]}>
          <View style={styles.headRow}>
            <SpotInline name="backup" />
            <Text variant="subheading">{t('privacy.backup')}</Text>
          </View>
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
          tall
          label={t('privacy.restoreCta')}
          icon="sync"
          testID="restore"
          onPress={() => void doPick()}
        />
        <Text variant="note" color="textMuted">
          {t('privacy.backupNote')}
        </Text>
      </View>
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
      <ConfirmDialog
        visible={!!sheet && typeof sheet === 'object'}
        danger
        title={t('privacy.restoreTitle')}
        body={
          sheet && typeof sheet === 'object'
            ? t('privacy.restoreSummary', {
                goal: sheet.summary.goal ? et(`distance.${sheet.summary.goal}` as EngineMessageKey) : '-',
                workouts: sheet.summary.workouts,
                activities: sheet.summary.activities,
                date: formatDateLong(sheet.summary.exportedAt.slice(0, 10)),
              })
            : undefined
        }
        confirmLabel={t('privacy.restoreReplace')}
        cancelLabel={t('common.cancel')}
        loading={a.restore.isPending}
        testID="restore-confirm"
        confirmTestID="restore-yes"
        onConfirm={async () => {
          if (!sheet || typeof sheet !== 'object') return;
          try {
            await a.restore.mutateAsync(sheet.file);
            track('backup_restored');
            startFresh();
          } catch {
            setSheet(null);
            setMsg({ tone: 'danger', text: t('privacy.restoreFailed') });
          }
        }}
        onCancel={() => setSheet(null)}
      />
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
      <ConfirmDialog
        visible={sheet === 'signout'}
        title={t('privacy.signOutTitle')}
        body={t('privacy.signOutBody')}
        confirmLabel={t('privacy.signOutYes')}
        cancelLabel={t('common.cancel')}
        confirmTestID="signout-yes"
        onConfirm={async () => {
          await a.signOut.mutateAsync();
          setSheet(null);
          // FL-10: setelah keluar app kembali ke 1.9; data di HP tetap ada untuk masuk lagi.
          if (router.canDismiss()) router.dismissAll();
          router.replace('/sign-in');
        }}
        onCancel={() => setSheet(null)}
      />
      <ConfirmDialog
        visible={sheet === 'wipe'}
        danger
        title={t('privacy.wipeTitle')}
        body={t('privacy.wipeBody')}
        confirmLabel={t('privacy.wipeYes')}
        cancelLabel={t('common.cancel')}
        extra={{ label: t('privacy.backupCta'), onPress: () => void doBackup() }}
        testID="wipe-confirm"
        confirmTestID="wipe-yes"
        onConfirm={async () => {
          await a.wipe.mutateAsync();
          setSheet(null);
          if (router.canDismiss()) router.dismissAll();
          router.replace('/welcome');
        }}
        onCancel={() => setSheet(null)}
      />
    </Screen>
  );
}

const styles = themed(() =>
  StyleSheet.create({
    flex: { flex: 1 },
    headRow: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
    top: { flexDirection: 'row', alignItems: 'center' },
    spacer: { width: space[10] + space[2] },
    hero: { backgroundColor: color.text, borderRadius: radius.lg, padding: space[5], gap: space[3] },
    heroHead: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[2] + border.selected - border.hairline / 2,
    },
    heroBody: { lineHeight: space[5] + border.hairline, opacity: 0.85 },
    group: { gap: space[2] + border.selected - border.hairline / 2 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
    rowCenter: { alignItems: 'center' },
  }),
);
