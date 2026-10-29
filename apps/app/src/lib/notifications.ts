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
