import { describe, expect, it } from 'vitest';
import { buildEvent, envelopeUrl, parseStack, scrub } from '../../src/lib/crash';

// TRD 6 aturan 5: laporan error tanpa data pribadi.
const meta = { release: 'runco@0.9.0', platform: 'ios', environment: 'production' };

describe('laporan error anonim', () => {
  it('DSN menjadi URL envelope; DSN kosong atau rusak tidak mengirim apa pun', () => {
    expect(envelopeUrl('https://abc123@o1.ingest.sentry.io/456')).toBe(
      'https://o1.ingest.sentry.io/api/456/envelope/?sentry_key=abc123&sentry_version=7',
    );
    expect(envelopeUrl(undefined)).toBeNull();
    expect(envelopeUrl('not a dsn')).toBeNull();
  });

  it('pesan disaring: email, id, URL dan semua angka hilang', () => {
    const s = scrub(
      'Pace 5:30 for runner@example.com plan 3f2b1c4d-1111-2222-3333-444455556666 at https://x.y/z?q=1 RPE 8',
    );
    expect(s).not.toMatch(/\d/);
    expect(s).not.toContain('runner@example.com');
    expect(s).not.toContain('3f2b1c4d');
    expect(s).not.toContain('https://');
  });

  it('stack hanya menyimpan nama file, bukan path perangkat', () => {
    const frames = parseStack(
      [
        'Error: boom',
        '    at doThing (file:///var/mobile/Containers/Data/Application/ABC/main.jsbundle:12:34)',
        'render@/Users/someone/app/index.bundle?platform=ios:5:6',
      ].join('\n'),
    );
    expect(frames.map((f) => f.filename)).toEqual(['index.bundle', 'main.jsbundle']);
    expect(JSON.stringify(frames)).not.toMatch(/Users|mobile|Containers/);
  });

  it('event tidak memuat user, breadcrumb, request atau konteks perangkat', () => {
    const err = new Error('Plan for runner@example.com has 42 km');
    const ev = buildEvent(err, 'boundary', meta) as Record<string, unknown>;
    for (const k of ['user', 'breadcrumbs', 'request', 'contexts', 'extra', 'server_name'])
      expect(ev).not.toHaveProperty(k);
    const json = JSON.stringify(ev.exception);
    expect(json).not.toContain('runner@example.com');
    expect(json).not.toContain('42');
    expect(ev.release).toBe('runco@0.9.0');
  });
});
