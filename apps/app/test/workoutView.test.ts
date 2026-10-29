import { paceZones, tempoRun, runWalk, easyRun, stridesRun, intervalRun } from '@run-coach/training-engine';
import { describe, expect, it } from 'vitest';
import { intensitySegments, minutesOf, segmentRows, typeName } from '../src/lib/workoutView';

const z = paceZones(30);

describe('tampilan latihan', () => {
  it('tempo: pemanasan, drill (1 baris), tempo, pendinginan (wireframe 2.2)', () => {
    const rows = segmentRows(tempoRun(14 * 60, z, true), 'tempo');
    expect(rows.map((r) => r.label)).toEqual(['Pemanasan', 'Drill ABC', 'Tempo', 'Pendinginan']);
    expect(rows[1]!.sub).toContain('A-skip');
    expect(rows[1]!.detail).toBe('2 x 20 m');
    expect(rows[2]!.durationLabel).toBe('14:00');
    expect(rows[2]!.detail).toMatch(/\/km$/);
    expect(rows[2]!.emphasis).toBe(true);
  });
  it('interval, run-walk, strides, easy', () => {
    expect(segmentRows(intervalRun(6, 800, z, false), 'interval')[1]!.detail).toContain('6 x (800 m');
    expect(segmentRows(runWalk(8, 60, 120, z), 'run_walk')[1]!.detail).toBe('8 x (1:00 lari + 2:00 jalan)');
    expect(segmentRows(stridesRun(5000, z), 'strides')[1]!.detail).toBe('4 x 20 dtk cepat');
    expect(segmentRows(easyRun(5000, z), 'easy')[0]!.label).toBe('Easy');
  });
  it('grafik intensitas menggabung segmen berurutan', () => {
    const seg = intensitySegments(tempoRun(14 * 60, z, true));
    expect(seg.map((s) => (s.drill ? 'drill' : s.zone))).toEqual(['easy', 'drill', 'tempo', 'easy']);
    expect(minutesOf(tempoRun(14 * 60, z, true))).toBe(10 + 10 + 14 + 10);
    expect(typeName('long')).toBe('Long run');
  });
});
