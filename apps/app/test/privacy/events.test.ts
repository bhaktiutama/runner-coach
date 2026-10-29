import { describe, expect, it } from 'vitest';
import { EVENTS, sanitize } from '../../src/lib/analytics';

// PV-5 / TRD 6: daftar properti event tidak memuat field pribadi.
const FORBIDDEN =
  /email|name|nama|rpe|tag|note|catatan|pause_reason|reason|health|screen|answer|distance|pace|duration|hr|weight|race_date|race_name|values|user_id|owner/i;

describe('event analitik tanpa data pribadi', () => {
  it.each(Object.entries(EVENTS))('%s hanya properti teknis', (_name, props) => {
    for (const p of props) expect(p).not.toMatch(FORBIDDEN);
  });
  it('properti di luar daftar dibuang', () => {
    expect(sanitize('rpe_submitted', { workout_type: 'tempo', rpe: 8, email: 'a@b.c' } as never)).toEqual({
      workout_type: 'tempo',
    });
  });
});
