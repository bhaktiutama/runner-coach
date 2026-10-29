import { describe, expect, it } from 'vitest';
import { rationaleText, rationaleView } from '../src/lib/rationale';

describe('teks rationale', () => {
  it('E-06 memformat jarak', () => {
    const t = rationaleText({
      rule: 'E-06',
      values: { distance_m: 13000, longest_30d_m: 12000, cap_m: 13200 },
    });
    expect(t).toContain('13 km');
    expect(t).toContain('12 km');
    expect(t).not.toMatch(/\{\w+\}/);
  });
  it('E-01 memformat waktu race, E-02 pace, E-03 kode jarak', () => {
    expect(
      rationaleText({
        rule: 'E-01',
        values: { range_min_s: 3900, range_max_s: 4080, likely_s: 3990, baseline_s: 1950 },
      }),
    ).toContain('1:05 - 1:08');
    expect(
      rationaleText({ rule: 'E-02', values: { vdot: 30.5, easy_min_pace: 440, easy_max_pace: 523 } }),
    ).toContain('7:20 /km');
    expect(rationaleText({ rule: 'E-03', values: { weeks: 10, distance_code: '10k' } })).toContain('10K');
  });
  it('label bukti + sumber', () => {
    const v = rationaleView({ rule: 'E-11', values: { pct: 50, weeks: 1 } });
    expect(v.gradeLabel).toBe('Bukti kuat');
    expect(v.refs[0]!.short).toContain('Bosquet');
  });
});
