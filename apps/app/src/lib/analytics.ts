// Event analitik anonim (TRD 6, PRD 6). Tanpa data pribadi: tidak ada email/nama, nilai kesehatan
// (RPE, tag, alasan jeda, screening), jarak/pace pengguna, atau `values` rationale.
// Hanya nama event + properti teknis dari daftar di bawah. Sakelar opt-out di 4.5.

export const EVENTS = {
  onboarding_completed: ['target_type', 'platform'],
  plan_created: ['target_type', 'weeks', 'days_per_week', 'platform'],
  workout_started: ['workout_type', 'platform'],
  workout_completed: ['workout_type', 'source', 'platform'],
  workout_skipped: ['workout_type', 'platform'],
  rpe_submitted: ['workout_type', 'platform'],
  plan_paused: ['platform'],
  plan_resumed: ['platform'],
  adjustment_proposed: ['rule', 'platform'],
  adjustment_decided: ['rule', 'accepted', 'platform'],
  backup_exported: ['platform'],
  backup_restored: ['platform'],
  account_deleted: ['platform'],
} as const;

export type EventName = keyof typeof EVENTS;
type Props = Record<string, string | number | boolean>;

/** Buang properti yang tidak ada di daftar event (pertahanan berlapis). */
export function sanitize(name: EventName, props: Props): Props {
  const allowed = new Set<string>(EVENTS[name]);
  return Object.fromEntries(Object.entries(props).filter(([k]) => allowed.has(k)));
}

let enabled = true;
let distinctId: string | null = null;

export function setAnalyticsEnabled(on: boolean) {
  enabled = on;
}

/** ID anonim acak per instalasi, bukan auth.uid(). */
export function setAnonymousId(id: string) {
  distinctId = id;
}

const KEY = process.env.EXPO_PUBLIC_POSTHOG_KEY;
const HOST = process.env.EXPO_PUBLIC_POSTHOG_HOST ?? 'https://eu.i.posthog.com';

export function track(name: EventName, props: Props = {}): void {
  if (!enabled || !KEY || !distinctId || process.env.EXPO_PUBLIC_E2E === '1') return;
  const body = {
    api_key: KEY,
    event: name,
    distinct_id: distinctId,
    properties: {
      ...sanitize(name, { ...props, platform: process.env.EXPO_OS ?? 'unknown' }),
      $ip: null,
      $process_person_profile: false,
    },
  };
  void fetch(`${HOST}/capture/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).catch(() => undefined);
}
