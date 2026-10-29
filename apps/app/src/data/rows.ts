import { parseSteps, type Rationale, type Step } from '@run-coach/training-engine';

// Baris tabel lokal (Schema 2) dan konversi JSON.

export type MetaRow = {
  schema_version: number;
  owner_id: string | null;
  last_backup_at: string | null;
  analytics_opt_in: number;
  backup_reminder_dismissed: number;
  onboarding_draft: string | null;
};

export type ProfileRow = {
  display_name: string | null;
  unit: 'km' | 'mi';
  timezone: string;
  locale: string;
  reminder_time: string | null;
  intensity_guide: 'pace' | 'hr' | 'rpe';
  health_flag: number;
  disclaimer_accepted_at: string | null;
};

export type GoalRow = {
  id: string;
  created_at: string;
  updated_at: string;
  distance: '5k' | '10k' | 'hm' | 'fm' | 'fitness';
  race_date: string | null;
  race_name: string | null;
  target_time_s: number | null;
  baseline_distance: string | null;
  baseline_time_s: number | null;
  level: 'beginner' | 'recreational' | null;
  weekly_volume_m: number;
  longest_run_m: number;
  status: 'active' | 'completed' | 'abandoned';
};

export type PlanParams = {
  available_days: number[];
  long_run_day: number;
  light_mode: boolean;
  engine_version: string;
  vdot: number;
  rationale: Rationale[];
  weeks?: { weekIndex: number; phase: string; startDate: string; volumeM: number; cutback: boolean }[];
  prediction?: { likelyS: number; minS: number; maxS: number; rough: boolean } | null;
};

export type PlanRow = {
  id: string;
  created_at: string;
  updated_at: string;
  goal_id: string;
  start_date: string;
  end_date: string;
  params: string;
  version: number;
  status: 'active' | 'paused' | 'archived';
  pause_reason: 'injury' | 'sick' | 'busy' | null;
  paused_at: string | null;
  pause_expected_days: number | null;
};

export type WorkoutStatus = 'scheduled' | 'completed' | 'skipped' | 'missed';

export type WorkoutRow = {
  id: string;
  created_at: string;
  updated_at: string;
  plan_id: string;
  date: string;
  week_index: number;
  phase: 'base' | 'build' | 'peak' | 'taper' | 'return';
  type: 'easy' | 'run_walk' | 'long' | 'tempo' | 'interval' | 'strides' | 'recovery' | 'rest';
  steps: string;
  target_distance_m: number | null;
  target_duration_s: number | null;
  status: WorkoutStatus;
  original_date: string | null;
  rationale: string;
};

export type Workout = Omit<WorkoutRow, 'steps' | 'rationale'> & { steps: Step[]; rationale: Rationale[] };

export function toWorkout(r: WorkoutRow): Workout {
  return { ...r, steps: parseSteps(JSON.parse(r.steps)), rationale: JSON.parse(r.rationale) as Rationale[] };
}

export function planParams(p: PlanRow): PlanParams {
  return JSON.parse(p.params) as PlanParams;
}
