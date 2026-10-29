import {
  flattenSteps,
  runningDistance,
  segmentDuration,
  totalDistance,
  totalDuration,
  type EngineMessageKey,
  type Step,
  type WorkoutType,
} from '@run-coach/training-engine';
import { formatDistance, formatDuration, formatPace, formatPaceRange, type Unit } from '@run-coach/ui/format';
import { t } from '@/i18n/t';
import { et } from './rationale';

// Tampilan latihan untuk kartu (2.1), detail (2.2) dan kalender (3.1). Teks dari katalog.

export type ViewZone = 'recovery' | 'easy' | 'long' | 'tempo' | 'interval';

export const TYPE_ZONE: Record<WorkoutType, ViewZone> = {
  easy: 'easy',
  run_walk: 'easy',
  long: 'long',
  tempo: 'tempo',
  interval: 'interval',
  strides: 'easy',
  recovery: 'recovery',
  rest: 'recovery',
};

export const typeName = (type: WorkoutType) => et(`workout.${type}` as EngineMessageKey);

export function minutesOf(steps: Step[]): number {
  return Math.round(totalDuration(steps) / 60);
}

export function approxKm(steps: Step[], unit: Unit = 'km'): string {
  return formatDistance(Math.round(totalDistance(steps) / 100) * 100, unit);
}

export function hasDrill(steps: Step[]): boolean {
  return steps.some((s) => s.kind === 'drill');
}

export type SegmentRow = {
  key: string;
  label: string;
  sub?: string;
  durationLabel: string;
  detail: string;
  /** Ringkasan 1 baris untuk kartu 2.1. */
  summary: string;
  zone: ViewZone;
  drill: boolean;
  emphasis: boolean;
};

const mins = (s: number) => t('segment.minutesShort', { min: Math.round(s / 60) });

/** Baris segmen dari step tingkat atas; drill berurutan digabung jadi 1 baris "Drill ABC". */
export function segmentRows(steps: Step[], type: WorkoutType, unit: Unit = 'km'): SegmentRow[] {
  const rows: SegmentRow[] = [];
  for (let i = 0; i < steps.length; i++) {
    const s = steps[i]!;
    if (s.kind === 'drill') {
      const group: (Step & { kind: 'drill' })[] = [];
      while (i < steps.length && steps[i]!.kind === 'drill')
        group.push(steps[i++] as Step & { kind: 'drill' });
      i--;
      const first = group[0]!;
      const dose =
        first.distance_m != null
          ? t('segment.meters', { m: first.distance_m })
          : first.duration_s != null
            ? mins(first.duration_s)
            : String(first.reps);
      const est = group.reduce((a, g) => a + g.sets * 60, 0);
      rows.push({
        key: `d${i}`,
        label: et('step.drill'),
        sub: group.map((g) => et(`drill.${g.exercise_id}.name` as EngineMessageKey)).join(', '),
        durationLabel: mins(est),
        detail: t('segment.drillDose', { sets: first.sets, dose }),
        summary: `${group.map((g) => et(`drill.${g.exercise_id}.name` as EngineMessageKey)).join(', ')} ${t('segment.drillDose', { sets: first.sets, dose })}`,
        zone: 'easy',
        drill: true,
        emphasis: false,
      });
      continue;
    }
    if (s.kind === 'repeat') {
      const work = s.steps.find((x) => x.kind === 'work');
      const rest = s.steps.find((x) => x.kind !== 'work');
      const dur = flattenSteps([s]).reduce((a, x) => a + segmentDuration(x), 0);
      if (type === 'run_walk' && work && work.kind !== 'drill' && rest && rest.kind !== 'drill') {
        rows.push({
          key: `r${i}`,
          label: typeName('run_walk'),
          durationLabel: mins(dur),
          detail: t('segment.runWalk', {
            times: s.times,
            run: formatDuration(work.duration_s ?? 0),
            walk: formatDuration(rest.duration_s ?? 0),
          }),
          summary: t('segment.runWalk', {
            times: s.times,
            run: formatDuration(work.duration_s ?? 0),
            walk: formatDuration(rest.duration_s ?? 0),
          }),
          zone: 'easy',
          drill: false,
          emphasis: true,
        });
        continue;
      }
      if (work && work.kind !== 'drill') {
        const workLabel =
          work.distance_m != null
            ? t('segment.meters', { m: work.distance_m })
            : formatDuration(work.duration_s ?? 0);
        const restLabel = rest && rest.kind !== 'drill' ? formatDuration(rest.duration_s ?? 0) : '';
        const strides = type === 'strides';
        const detail = strides
          ? t('segment.strides', { times: s.times, sec: work.duration_s ?? 0 })
          : `${t('segment.repeat', { times: s.times, work: workLabel, rest: restLabel })}${work.pace_s_per_km ? ` @ ${formatPace(work.pace_s_per_km.min, unit)}` : ''}`;
        rows.push({
          key: `r${i}`,
          label: strides ? et('step.stride') : typeName(type),
          durationLabel: mins(dur),
          detail,
          summary: detail,
          zone: work.zone,
          drill: false,
          emphasis: !strides,
        });
      }
      continue;
    }
    const isMain = s.kind === 'work';
    const label =
      s.kind === 'warmup'
        ? et('step.warmup')
        : s.kind === 'cooldown'
          ? et('step.cooldown')
          : s.kind === 'recovery'
            ? et('step.recovery')
            : type === 'easy' || type === 'strides'
              ? typeName('easy')
              : typeName(type);
    const dur = s.duration_s ?? 0;
    const hard = s.zone === 'tempo' || s.zone === 'interval';
    const min = Math.round(dur / 60);
    const summary =
      hard && s.pace_s_per_km
        ? t('segment.paceLabel', { min, pace: formatPace(s.pace_s_per_km.min, unit) })
        : t('segment.easyLabel', {
            min,
            zone: s.walk
              ? et('step.walk').toLowerCase()
              : et(`zone.${s.zone}` as EngineMessageKey).toLowerCase(),
          });
    rows.push({
      key: `s${i}`,
      label,
      summary,
      durationLabel: formatDuration(dur),
      detail:
        hard && s.pace_s_per_km
          ? formatPace(s.pace_s_per_km.min, unit)
          : s.walk
            ? et('step.walk')
            : s.pace_s_per_km && isMain
              ? formatPaceRange(s.pace_s_per_km.min, s.pace_s_per_km.max, unit)
              : et(`zone.${s.zone}` as EngineMessageKey),
      zone: s.zone,
      drill: false,
      emphasis: isMain && hard,
    });
  }
  return rows;
}

/** Bagian grafik intensitas (2.2) dan bar segmen (2.1): bobot = durasi. */
export function intensitySegments(steps: Step[]): { zone: ViewZone; weight: number; drill?: boolean }[] {
  const flat = flattenSteps(steps);
  const out: { zone: ViewZone; weight: number; drill?: boolean }[] = [];
  for (const f of flat) {
    const zone: ViewZone = f.kind === 'drill' ? 'easy' : f.zone;
    const drill = f.kind === 'drill';
    const w = segmentDuration(f);
    const last = out[out.length - 1];
    if (last && last.zone === zone && !!last.drill === drill) last.weight += w;
    else out.push({ zone, weight: w, drill });
  }
  return out;
}

export function workoutKm(steps: Step[]): number {
  return runningDistance(steps);
}

/** Label sumbu grafik intensitas 2.2: menit di setiap batas segmen, terakhir "{n} mnt". */
export function intensityAxis(steps: Step[]): number[] {
  const segs = intensitySegments(steps);
  const out = [0];
  let acc = 0;
  for (const s of segs) {
    acc += s.weight;
    out.push(Math.round(acc / 60));
  }
  return out;
}
