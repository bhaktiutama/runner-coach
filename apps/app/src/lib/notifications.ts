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
      const kind = (n.request.content.data as { kind?: string } | undefined)?.kind;
      const timer = kind === 'timer' || kind === STATUS_KIND;
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

// U5 (09-VOICE bagian 13): status timer di layar kunci / bayangan notifikasi. Satu notifikasi yang
// diperbarui (identifier tetap) tiap pergantian segmen: tanpa suara, Android = notifikasi berjalan
// (sticky, kanal prioritas rendah), iOS = notifikasi pasif. Live Activity iOS belum (butuh modul native).
const STATUS_ID = 'timer-status';
const STATUS_KIND = 'timer-status';
const STATUS_CHANNEL = 'timer-status';
let channelReady = false;

export async function showTimerStatus(title: string, body: string, channelName: string): Promise<void> {
  if (!notificationsSupported) return;
  try {
    if ((await getPermission()) !== 'granted') return;
    if (process.env.EXPO_OS === 'android' && !channelReady) {
      await Notifications.setNotificationChannelAsync(STATUS_CHANNEL, {
        name: channelName,
        importance: Notifications.AndroidImportance.LOW,
        sound: null,
        vibrationPattern: null,
        enableVibrate: false,
        showBadge: false,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      });
      channelReady = true;
    }
    await Notifications.scheduleNotificationAsync({
      identifier: STATUS_ID,
      content: {
        title,
        body,
        sound: false,
        sticky: true,
        autoDismiss: false,
        priority: Notifications.AndroidNotificationPriority.LOW,
        interruptionLevel: 'passive',
        data: { kind: STATUS_KIND },
      },
      trigger: process.env.EXPO_OS === 'android' ? { channelId: STATUS_CHANNEL } : null,
    });
  } catch {
    /* notifikasi status tidak penting untuk jalannya timer */
  }
}

export async function clearTimerStatus(): Promise<void> {
  if (!notificationsSupported) return;
  try {
    await Notifications.dismissNotificationAsync(STATUS_ID);
  } catch {
    /* sudah hilang */
  }
}
