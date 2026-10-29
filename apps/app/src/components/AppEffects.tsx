import { useEffect } from 'react';
import { useActivePlan, useMeta, useProfile, useToday, useWorkouts } from '@/data/hooks';
import { addDays } from '@run-coach/training-engine';
import { t } from '@/i18n/t';
import { setAnalyticsEnabled, setAnonymousId } from '@/lib/analytics';
import { sessionStorage } from '@/auth/storage';
import { newId } from '@/lib/id';
import { planReminders } from '@/lib/reminders';
import { syncReminders } from '@/lib/reminderSync';
import { minutesOf, typeName } from '@/lib/workoutView';

/** Efek tingkat app: jadwal ulang pengingat saat data berubah (TRD 9) dan sakelar analitik. */
export function AppEffects() {
  const meta = useMeta();
  const profile = useProfile();
  const plan = useActivePlan();
  const today = useToday();
  const ws = useWorkouts(plan.data?.id, today, addDays(today, 7));

  useEffect(() => {
    setAnalyticsEnabled(meta.data?.analytics_opt_in !== 0);
  }, [meta.data?.analytics_opt_in]);

  useEffect(() => {
    void (async () => {
      let id = await sessionStorage.getItem('anon-id');
      if (!id) {
        id = newId();
        await sessionStorage.setItem('anon-id', id);
      }
      setAnonymousId(id);
    })();
  }, []);

  useEffect(() => {
    if (!profile.data || !plan.data || !ws.data) return;
    const tz = profile.data.timezone;
    const nowTime = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
      timeZone: tz,
    }).format(new Date());
    const list = planReminders(
      {
        today,
        nowTime,
        reminderTime: profile.data.reminder_time,
        planStatus: plan.data.status,
        workouts: ws.data.map((w) => ({
          date: w.date,
          status: w.status,
          title: typeName(w.type),
          minutes: minutesOf(w.steps),
        })),
      },
      (title, min) => t('reminder.body', { title, min }),
    );
    void syncReminders(list, tz, t('reminder.title')).catch(() => undefined);
  }, [profile.data, plan.data, ws.data, today]);

  return null;
}
