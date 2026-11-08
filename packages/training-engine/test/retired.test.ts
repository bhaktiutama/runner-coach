import { describe, expect, it } from 'vitest';
import { replaceRetiredExercises, strengthSteps, type Step } from '../src';

const ex = (id: string): Step =>
  ({ kind: 'exercise', exercise_id: id, sets: 3, reps: 10, per_side: true, rest_s: 30 }) as Step;

describe('replaceRetiredExercises', () => {
  it('dead bug di plan lama diganti bird dog', () => {
    const out = replaceRetiredExercises([ex('plank'), ex('dead_bug')]);
    expect(out.map((s) => (s as { exercise_id: string }).exercise_id)).toEqual(['plank', 'bird_dog']);
  });
  it('tidak dobel bila bird dog sudah ada', () => {
    const out = replaceRetiredExercises([ex('dead_bug'), ex('bird_dog')]);
    expect(out.map((s) => (s as { exercise_id: string }).exercise_id)).toEqual(['bird_dog']);
  });
  it('generator tidak lagi memakai dead bug', () => {
    for (const t of ['strength', 'core'] as const)
      for (const l of [1, 2, 3] as const)
        expect(JSON.stringify(strengthSteps(t, l))).not.toContain('dead_bug');
  });
});
