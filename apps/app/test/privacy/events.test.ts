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

describe('adjustment_proposed', () => {
  it('sekali per minggu + aturan, hanya properti rule', async () => {
    const { vi } = await import('vitest');
    vi.resetModules();
    vi.stubEnv('EXPO_PUBLIC_POSTHOG_KEY', 'phc_test');
    vi.stubEnv('EXPO_PUBLIC_E2E', '0');
    const fetchMock = vi.fn(() => Promise.resolve(new Response()));
    vi.stubGlobal('fetch', fetchMock);
    const a = await import('../../src/lib/analytics');
    a.setAnonymousId('anon');
    // Opt-in (TRD 6 aturan 5): tanpa persetujuan tidak ada yang dikirim.
    a.track('plan_paused');
    expect(fetchMock).not.toHaveBeenCalled();
    a.setAnalyticsEnabled(true);
    a.trackProposalsShown('2026-11-02', ['E-10', 'E-11']);
    a.trackProposalsShown('2026-11-02', ['E-10']);
    a.trackProposalsShown('2026-11-09', ['E-10']);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    const body = JSON.parse((fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].body as string);
    expect(body.event).toBe('adjustment_proposed');
    expect(Object.keys(body.properties).sort()).toEqual([
      '$ip',
      '$process_person_profile',
      'platform',
      'rule',
    ]);
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });
});
