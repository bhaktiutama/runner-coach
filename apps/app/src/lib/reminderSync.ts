import * as Notifications from 'expo-notifications';
import { getPermission, notificationsSupported } from './notifications';
import type { Reminder } from './reminders';
import { isoAtLocal } from './today';

// Penjadwalan pengingat lokal (TRD 9). Dijadwalkan ulang saat app dibuka dan saat plan berubah.

export async function cancelReminders(): Promise<void> {
  if (!notificationsSupported) return;
  const all = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    all
      .filter((n) => (n.content.data as { kind?: string } | undefined)?.kind === 'reminder')
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
}

export async function syncReminders(list: Reminder[], timezone: string, title: string): Promise<void> {
  if (!notificationsSupported) return;
  await cancelReminders();
  if ((await getPermission()) !== 'granted') return;
  for (const r of list) {
    const at = new Date(isoAtLocal(r.date, r.time, timezone));
    if (at.getTime() <= Date.now()) continue;
    await Notifications.scheduleNotificationAsync({
      content: { title, body: r.body, data: { kind: 'reminder' } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at },
    });
  }
}
