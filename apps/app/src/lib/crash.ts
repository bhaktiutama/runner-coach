// Laporan error anonim ke Sentry (TRD 6 aturan 5), lewat endpoint envelope HTTP, tanpa SDK native:
// tidak ada library baru dan tetap bisa dikirim lewat update OTA. Opt-in: memakai sakelar yang sama
// dengan analitik (1.8, 4.5). Yang dikirim hanya jenis error, pesan yang disaring, nama file + baris,
// versi app dan platform. Tidak ada user, breadcrumb, request, nama perangkat atau data latihan.

export type CrashContext = 'global' | 'promise' | 'boundary';

type Frame = { function?: string; filename?: string; lineno?: number; colno?: number; in_app: boolean };

const MAX_PER_SESSION = 10;
const MAX_MESSAGE = 240;

let enabled = false;
let sent = 0;
const seen = new Set<string>();

export function setCrashReportingEnabled(on: boolean) {
  enabled = on;
}

/** `https://<key>@<host>/<project>` -> URL envelope. null = DSN kosong atau tidak valid. */
export function envelopeUrl(dsn: string | undefined): string | null {
  if (!dsn) return null;
  const m = dsn.match(/^(https?):\/\/([^@/]+)@([^/]+)\/(\d+)$/);
  if (!m) return null;
  const [, scheme, key, host, project] = m;
  return `${scheme}://${host}/api/${project}/envelope/?sentry_key=${key}&sentry_version=7`;
}

/** Buang yang bisa memuat data pribadi: email, id, URL, dan setiap angka (jarak, pace, RPE, tanggal). */
export function scrub(text: string): string {
  return text
    .replace(/[^\s@]+@[^\s@]+\.[^\s@]+/g, '[email]')
    .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, '[id]')
    .replace(/\bhttps?:\/\/\S+/g, '[url]')
    .replace(/\d+/g, '#')
    .slice(0, MAX_MESSAGE);
}

/** Baris stack (V8, Hermes, JSC) -> frame dengan nama file saja, tanpa path perangkat. */
export function parseStack(stack: string | undefined): Frame[] {
  if (!stack) return [];
  const frames: Frame[] = [];
  for (const line of stack.split('\n').slice(0, 40)) {
    const m =
      line.match(/^\s*at (?:(.+?) \()?(.+?):(\d+):(\d+)\)?$/) ??
      line.match(/^\s*(?:(.*?)@)?(.+?):(\d+):(\d+)$/);
    if (!m) continue;
    const file = m[2]!.split('?')[0]!.split('/').pop() || 'unknown';
    frames.push({
      function: m[1] ? m[1].replace(/\s+/g, ' ').slice(0, 80) : undefined,
      filename: file,
      lineno: Number(m[3]),
      colno: Number(m[4]),
      in_app: !/node_modules|native code/.test(m[2]!),
    });
  }
  // Sentry membaca frame dari yang terlama ke yang terbaru.
  return frames.reverse();
}

const hex = (n: number) =>
  Array.from({ length: n }, () => Math.floor(Math.random() * 16).toString(16)).join('');

export type CrashMeta = { release: string; platform: string; environment: string };

/** Event Sentry tanpa PII. Murni, supaya isi yang dikirim bisa diuji. */
export function buildEvent(error: unknown, context: CrashContext, meta: CrashMeta) {
  const e =
    error instanceof Error ? error : new Error(typeof error === 'string' ? error : 'non_error_thrown');
  return {
    event_id: hex(32),
    timestamp: Date.now() / 1000,
    platform: 'javascript',
    level: 'error',
    release: meta.release,
    environment: meta.environment,
    tags: { platform: meta.platform, context },
    exception: {
      values: [
        {
          type: scrub(e.name || 'Error'),
          value: scrub(e.message || ''),
          stacktrace: { frames: parseStack(e.stack) },
        },
      ],
    },
  };
}

const DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;

export function reportError(error: unknown, context: CrashContext, meta: CrashMeta): void {
  const url = envelopeUrl(DSN);
  if (!enabled || !url || process.env.EXPO_PUBLIC_E2E === '1' || sent >= MAX_PER_SESSION) return;
  const event = buildEvent(error, context, meta);
  const v = event.exception.values[0]!;
  const top = v.stacktrace.frames[v.stacktrace.frames.length - 1];
  const key = `${v.type}:${v.value}:${top?.filename}:${top?.lineno}`;
  if (seen.has(key)) return;
  seen.add(key);
  sent++;
  const body = [
    JSON.stringify({ event_id: event.event_id, sent_at: new Date().toISOString() }),
    JSON.stringify({ type: 'event' }),
    JSON.stringify(event),
  ].join('\n');
  void fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-sentry-envelope' },
    body,
  }).catch(() => undefined);
}

type GlobalHandler = (error: unknown, isFatal?: boolean) => void;
type ErrorUtilsLike = { getGlobalHandler(): GlobalHandler; setGlobalHandler(h: GlobalHandler): void };

/** Pasang penangkap error global sekali: ErrorUtils di native, `error`/`unhandledrejection` di web. */
export function installCrashHandlers(meta: CrashMeta): void {
  const g = globalThis as unknown as {
    ErrorUtils?: ErrorUtilsLike;
    addEventListener?: (t: string, f: (e: unknown) => void) => void;
    __runcoCrash?: boolean;
  };
  if (g.__runcoCrash) return;
  g.__runcoCrash = true;
  if (g.ErrorUtils) {
    const prev = g.ErrorUtils.getGlobalHandler();
    g.ErrorUtils.setGlobalHandler((error, isFatal) => {
      reportError(error, 'global', meta);
      prev(error, isFatal);
    });
  }
  if (process.env.EXPO_OS === 'web' && g.addEventListener) {
    g.addEventListener('error', (e) => reportError((e as { error?: unknown }).error, 'global', meta));
    g.addEventListener('unhandledrejection', (e) =>
      reportError((e as { reason?: unknown }).reason, 'promise', meta),
    );
  }
}
