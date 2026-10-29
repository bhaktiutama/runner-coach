import type { EngineMessageKey } from '@run-coach/training-engine';
import { paceZones } from '@run-coach/training-engine';
import {
  color,
  PrimaryButton,
  radius,
  SecondaryButton,
  SettingsGroup,
  SettingsRow,
  space,
  Text,
  TextField,
} from '@run-coach/ui';
import { formatDateLong, formatPaceRange } from '@run-coach/ui/format';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { useActivePlan, usePlanOps, useProfile, useUpdateProfile } from '@/data/hooks';
import { planParams } from '@/data/rows';
import { t } from '@/i18n/t';
import {
  getPermission,
  notificationsSupported,
  openSettings,
  type PermissionState,
} from '@/lib/notifications';
import { et } from '@/lib/rationale';

/** 4.1 Profil (F-16). Kartu Premium dan Integrasi disembunyikan di MVP (PRD 5). */
export default function ProfileTab() {
  const plan = useActivePlan();
  const profile = useProfile();
  const update = useUpdateProfile();
  const ops = usePlanOps();
  const [perm, setPerm] = useState<PermissionState>('unsupported');
  const [editName, setEditName] = useState(false);
  const [name, setName] = useState('');
  const [confirmGoal, setConfirmGoal] = useState(false);

  useEffect(() => {
    void getPermission().then(setPerm);
  }, []);
  useEffect(() => setName(profile.data?.display_name ?? ''), [profile.data?.display_name]);

  if (!plan.data || !profile.data) return null;
  const p = plan.data;
  const params = planParams(p);
  const z = paceZones(params.vdot);
  const g = p.goal;
  const dist = et(`distance.${g.distance}` as EngineMessageKey);
  const display = profile.data.display_name || t('profile.nameEmpty');
  const reminder = profile.data.reminder_time;

  return (
    <Screen testID="screen-profile">
      <View style={styles.head}>
        <View style={styles.avatar}>
          <Text variant="title">{display.slice(0, 1).toUpperCase()}</Text>
        </View>
        <View style={styles.flex}>
          {editName ? (
            <TextField
              value={name}
              onChangeText={setName}
              placeholder={t('profile.namePlaceholder')}
              maxLength={40}
              autoFocus
              onBlur={() => {
                update.mutate({ display_name: name.trim() || null });
                setEditName(false);
              }}
            />
          ) : (
            <Text
              variant="title"
              onPress={() => setEditName(true)}
              accessibilityRole="button"
              accessibilityHint={t('profile.editName')}
            >
              {display}
            </Text>
          )}
          <Text variant="label" color="textMuted">
            {t('profile.nameSub')}
          </Text>
        </View>
      </View>
      <SettingsGroup title={t('profile.sectionTraining')}>
        <SettingsRow
          first
          label={t('profile.goal')}
          value={
            g.race_date
              ? t('profile.goalValue', { distance: dist, date: formatDateLong(g.race_date) })
              : t('profile.goalValueNoRace', { distance: dist })
          }
          onPress={() => setConfirmGoal(true)}
          testID="row-goal"
        />
        <SettingsRow
          label={t('profile.zones')}
          value={t('profile.zonesValue', {
            pace: formatPaceRange(z.easy.min, z.easy.max).replace(' /km', ''),
          })}
          onPress={() => router.push('/zones')}
        />
        <SettingsRow
          label={t('profile.days')}
          value={t('profile.daysValue', {
            n: params.available_days.length,
            time: reminder ?? t('profile.reminderOff'),
          })}
          sub={
            notificationsSupported && reminder && perm === 'denied' ? t('profile.reminderDenied') : undefined
          }
          onPress={() => router.push('/settings-days')}
          testID="row-days"
        />
        {notificationsSupported && reminder && perm === 'denied' ? (
          <SettingsRow label={t('profile.openSettings')} onPress={openSettings} />
        ) : null}
        <SettingsRow
          label={t('profile.pause')}
          danger
          value={p.status === 'paused' ? t('profile.paused') : t('profile.pauseValue')}
          onPress={() => router.push('/pause')}
          testID="row-pause"
        />
      </SettingsGroup>
      {confirmGoal ? (
        <View style={styles.confirm}>
          <Text variant="heading">{t('profile.newGoalTitle')}</Text>
          <Text color="textMuted">{t('profile.newGoalBody')}</Text>
          <PrimaryButton
            label={t('profile.newGoalYes')}
            testID="new-goal"
            onPress={async () => {
              await ops.newGoal.mutateAsync();
              router.replace('/onboarding/goal');
            }}
          />
          <SecondaryButton label={t('common.cancel')} onPress={() => setConfirmGoal(false)} />
        </View>
      ) : null}
      <SettingsGroup title={t('profile.sectionData')}>
        <SettingsRow
          first
          icon="lock"
          label={t('profile.privacy')}
          value={t('profile.privacyValue')}
          onPress={() => router.push('/privacy')}
          testID="row-privacy"
        />
        <SettingsRow icon="distance" label={t('profile.unit')} value={t('profile.unitValue')} />
      </SettingsGroup>
      <Text variant="caption" color="textMuted" align="center">
        {t('profile.version', { v: Constants.expoConfig?.version ?? '' })}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  head: { flexDirection: 'row', alignItems: 'center', gap: space[4] },
  avatar: {
    width: space[10] * 2,
    height: space[10] * 2,
    borderRadius: radius.stadium,
    backgroundColor: color.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirm: { backgroundColor: color.surface, borderRadius: radius.lg, padding: space[5], gap: space[3] },
});
