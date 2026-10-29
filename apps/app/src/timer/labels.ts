import type { EngineMessageKey } from '@run-coach/training-engine';
import { formatPace } from '@run-coach/ui/format';
import { t } from '@/i18n/t';
import { et } from '@/lib/rationale';
import type { TimerSegment } from './machine';

/** Nama segmen untuk timer: Pemanasan, Tempo, Jalan, nama gerakan drill, dst. */
export function segmentName(seg: TimerSegment, workoutType?: string): string {
  if (seg.kind === 'drill') return et(`drill.${seg.exercise_id}.name` as EngineMessageKey);
  if (seg.walk) return et('step.walk');
  if (seg.kind === 'warmup') return et('step.warmup');
  if (seg.kind === 'cooldown') return et('step.cooldown');
  if (seg.kind === 'recovery') return et('step.recovery');
  if (workoutType === 'strides' && seg.zone === 'interval') return et('step.stride');
  return et(`zone.${seg.zone}` as EngineMessageKey);
}

/** Isi notifikasi cue: "Tempo 14 menit, 6:45 /km". Tanpa data kesehatan (TRD 9). */
export function cueText(seg: TimerSegment): string {
  const name = segmentName(seg);
  if (seg.kind === 'drill') return t('timer.cueDrill', { name });
  const min = Math.round((seg.timedS ?? 0) / 60);
  const hard = seg.zone === 'tempo' || seg.zone === 'interval';
  return hard && seg.pace_s_per_km
    ? t('timer.cuePace', { name, min: min || 1, pace: formatPace(seg.pace_s_per_km.min) })
    : t('timer.cue', { name, min: min || 1 });
}

export const FEEL_KEY = {
  recovery: 'timer.feel.recovery',
  easy: 'timer.feel.easy',
  long: 'timer.feel.long',
  tempo: 'timer.feel.tempo',
  interval: 'timer.feel.interval',
} as const;
