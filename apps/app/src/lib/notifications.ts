import * as Notifications from 'expo-notifications';
import { Linking } from 'react-native';

// Notifikasi lokal saja (TRD 9). Tidak ada token push yang dikirim ke server.

export const notificationsSupported = process.env.EXPO_OS !== 'web';

export type PermissionState = 'granted' | 'denied' | 'undetermined' | 'unsupported';

export async function getPermission(): Promise<PermissionState> {
  if (!notificationsSupported) return 'unsupported';
  const p = await Notifications.getPermissionsAsync();
  return p.granted ? 'granted' : p.canAskAgain ? 'undetermined' : 'denied';
}

/** Minta izin (dipanggil setelah 1 kalimat penjelasan tampil, FL-11). */
export async function requestPermission(): Promise<PermissionState> {
  if (!notificationsSupported) return 'unsupported';
  const p = await Notifications.requestPermissionsAsync();
  return p.granted ? 'granted' : 'denied';
}

export function openSettings() {
  void Linking.openSettings();
}

// Notifikasi timer di layar depan tidak perlu banner (suara + getar dari app sendiri).
if (notificationsSupported) {
  Notifications.setNotificationHandler({
    handleNotification: async (n) => {
      const timer = (n.request.content.data as { kind?: string } | undefined)?.kind === 'timer';
      return {
        shouldPlaySound: !timer,
        shouldSetBadge: false,
        shouldShowBanner: !timer,
        shouldShowList: true,
      };
    },
  });
}

/** Jadwalkan cue pergantian segmen timer (TRD 9: isi tanpa data kesehatan). */
export async function scheduleTimerCues(cues: { at: number; title: string; body: string }[]): Promise<void> {
  if (!notificationsSupported) return;
  await cancelTimerCues();
  if ((await getPermission()) !== 'granted') return;
  const now = Date.now();
  for (const c of cues.slice(0, 50)) {
    if (c.at <= now + 1000) continue;
    await Notifications.scheduleNotificationAsync({
      content: { title: c.title, body: c.body, sound: true, data: { kind: 'timer' } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(c.at) },
    });
  }
}

export async function cancelTimerCues(): Promise<void> {
  if (!notificationsSupported) return;
  const all = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    all
      .filter((n) => (n.content.data as { kind?: string } | undefined)?.kind === 'timer')
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
}
