import { diffDays } from './dates';
import { runningDistance, type Step } from './steps';
import type { Rationale, RuleId, WorkoutType } from './types';
import { easyRun } from './workouts';
import type { PaceZones } from './vdot';
import { isHard } from './move';
import { isSupportType } from './strength';

// Adaptasi akhir minggu (F-11, TRD 4.3, layar 2.5). Engine hanya mengusulkan; plan berubah
// setelah pengguna menekan "Oke, terapkan".

export type FeedbackPoint = { date: string; type: WorkoutType; rpe: number };

export type WeekWorkout = {
  id: string;
  date: string;
  type: WorkoutType;
  steps: Step[];
  status: 'scheduled' | 'completed' | 'skipped' | 'missed';
};

export type Change =
  | { kind: 'volume'; pct: number }
  | { kind: 'hard_to_easy'; workout_id: string }
  | { kind: 'pace_up'; vdot_delta: number }
  | { kind: 'repeat_week' }
  | { kind: 'return_week' }
  | { kind: 'time_trial' };

export type Proposal = { rule: RuleId; changes: Change[]; rationale: Rationale };

export type AdaptInput = {
  /** Latihan minggu yang baru selesai. */
  week: WeekWorkout[];
  /** Latihan terjadwal minggu depan (target perubahan). */
  nextWeek: WeekWorkout[];
  /** Semua feedback urut waktu (lama -> baru). */
  feedback: FeedbackPoint[];
  /** Tanggal lari terakhir (null = belum pernah). */
  lastRunDate: string | null;
  today: string;
};

const EASY_TYPES = new Set<WorkoutType>(['easy', 'long', 'recovery', 'run_walk', 'strides']);

export function proposeAdjustments(a: AdaptInput): Proposal[] {
  const out: Proposal[] = [];

  // E-13: tidak lari >= 10 hari -> tawarkan Return to run.
  if (a.lastRunDate && diffDays(a.lastRunDate, a.today) >= 10) {
    out.push({
      rule: 'E-13',
      changes: [{ kind: 'return_week' }],
      rationale: { rule: 'E-13', values: { days: diffDays(a.lastRunDate, a.today) } },
    });
    return out;
  }

  // E-19: >= 2 latihan terlewat -> ulangi minggu.
  // Strength/core terlewat tidak dihitung: E-19 menjaga progresi lari.
  const missed = a.week.filter(
    (w) => !isSupportType(w.type) && (w.status === 'missed' || w.status === 'skipped'),
  ).length;
  if (missed >= 2) {
    out.push({
      rule: 'E-19',
      changes: [{ kind: 'repeat_week' }],
      rationale: { rule: 'E-19', values: { missed } },
    });
  }

  // E-17: RPE >= 8 pada 2 easy run terakhir berturut-turut.
  const easy = a.feedback.filter((f) => EASY_TYPES.has(f.type));
  const lastTwo = easy.slice(-2);
  if (lastTwo.length === 2 && lastTwo.every((f) => f.rpe >= 8)) {
    const hard = a.nextWeek.find((w) => isHard(w.type) && w.status === 'scheduled');
    const changes: Change[] = [{ kind: 'volume', pct: -10 }];
    if (hard) changes.push({ kind: 'hard_to_easy', workout_id: hard.id });
    out.push({
      rule: 'E-17',
      changes,
      rationale: { rule: 'E-17', values: { rpe1: lastTwo[0]!.rpe, rpe2: lastTwo[1]!.rpe } },
    });
  }

  // E-18: RPE <= 4 pada 3 sesi kualitas terakhir berturut-turut.
  const quality = a.feedback.filter((f) => isHard(f.type)).slice(-3);
  if (quality.length === 3 && quality.every((f) => f.rpe <= 4)) {
    out.push({
      rule: 'E-18',
      changes: [{ kind: 'pace_up', vdot_delta: 1 }, { kind: 'time_trial' }],
      rationale: { rule: 'E-18', values: { count: 3 } },
    });
  }
  return out;
}

/** Terapkan perubahan volume / hard->easy ke latihan minggu depan. */
export function applyChanges(
  nextWeek: WeekWorkout[],
  changes: Change[],
  zones: PaceZones,
): { id: string; type: WorkoutType; steps: Step[] }[] {
  const vol = changes.find((c) => c.kind === 'volume');
  const toEasy = new Set(
    changes.filter((c) => c.kind === 'hard_to_easy').map((c) => (c as { workout_id: string }).workout_id),
  );
  return nextWeek
    .filter((w) => w.status === 'scheduled' && !isSupportType(w.type))
    .map((w) => {
      let type = w.type;
      let steps = w.steps;
      if (toEasy.has(w.id)) {
        type = 'easy';
        steps = easyRun(runningDistance(w.steps), zones);
      }
      if (vol && vol.kind === 'volume' && !isHard(type)) {
        const factor = 1 + vol.pct / 100;
        steps = scaleEasy(steps, factor);
      }
      return { id: w.id, type, steps };
    });
}

function scaleEasy(steps: Step[], factor: number): Step[] {
  return steps.map((s) => {
    if (s.kind === 'repeat' || s.kind === 'drill' || s.duration_s == null) return s;
    return { ...s, duration_s: Math.max(60, Math.floor((s.duration_s * factor) / 60) * 60) };
  });
}
