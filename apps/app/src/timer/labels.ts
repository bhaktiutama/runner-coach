import type { EngineMessageKey } from '@run-coach/training-engine';
import { formatPace } from '@run-coach/ui/format';
import { t } from '@/i18n/t';
import { et } from '@/lib/rationale';
import type { TimerSegment } from './machine';

export const exerciseName = (id: string) => et(`exercise.${id}.name` as EngineMessageKey);
export const exerciseCue = (id: string) => et(`exercise.${id}.cue` as EngineMessageKey);

/** Nama segmen untuk timer: Pemanasan, Tempo, Jalan, nama gerakan drill, dst. */
export function segmentName(seg: TimerSegment, workoutType?: string): string {
  if (seg.kind === 'drill') return et(`drill.${seg.exercise_id}.name` as EngineMessageKey);
  if (seg.kind === 'exercise') return exerciseName(seg.exercise_id);
  if (seg.kind === 'rest') return et('step.rest');
  if (seg.walk) return et('step.walk');
  if (seg.kind === 'warmup') return et('step.warmup');
  if (seg.kind === 'cooldown') return et('step.cooldown');
  if (seg.kind === 'recovery') return et('step.recovery');
  if (workoutType === 'strides' && seg.zone === 'interval') return et('step.stride');
  if (workoutType === 'progression' && seg.zone === 'tempo') return et('step.finishFast');
  return et(`zone.${seg.zone}` as EngineMessageKey);
}

/** Isi notifikasi cue: "Tempo 14 menit, 6:45 /km". Tanpa data kesehatan (TRD 9). */
export function cueText(seg: TimerSegment): string {
  const name = segmentName(seg);
  if (seg.kind === 'drill') return t('timer.cueDrill', { name });
  if (seg.kind === 'exercise') return t('timer.cueExercise', { name, n: seg.set, total: seg.sets });
  if (seg.kind === 'rest') return t('timer.cueRest', { sec: seg.duration_s });
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
