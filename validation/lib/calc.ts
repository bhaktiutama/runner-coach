// Hitungan dasar validator, ditulis ulang dari spec (TRD 4, 07 bagian 7) tanpa memakai kode
// generator. Sengaja tidak mengimpor `packages/training-engine/src` selain tipe, supaya kesalahan
// di engine tidak ikut terbawa ke pemeriksa.

const DAY_MS = 86_400_000;

export const toMs = (d: string) => Date.parse(`${d}T00:00:00Z`);
export const addDays = (d: string, n: number) => new Date(toMs(d) + n * DAY_MS).toISOString().slice(0, 10);
export const daysBetween = (a: string, b: string) => Math.round((toMs(b) - toMs(a)) / DAY_MS);
/** 0 = Senin ... 6 = Minggu. */
export const weekdayOf = (d: string) => (new Date(toMs(d)).getUTCDay() + 6) % 7;
export const mondayOf = (d: string) => addDays(d, -weekdayOf(d));

export const WEEKDAY_ID = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

export type AnyStep = {
  kind: string;
  duration_s?: number;
  distance_m?: number;
  pace_s_per_km?: { min: number; max: number };
  zone?: string;
  walk?: boolean;
  times?: number;
  steps?: AnyStep[];
  sets?: number;
  exercise_id?: string;
};

export type Seg = {
  kind: string;
  zone: string | null;
  durationS: number;
  distanceM: number;
  walk: boolean;
  pace: { min: number; max: number } | null;
};

const RUN_KINDS = new Set(['warmup', 'work', 'recovery', 'cooldown']);
/** Satu set drill dihitung 60 detik (07 bagian 7, E-15: 5 gerakan x 2 set ~ 10 menit). */
export const DRILL_SET_S = 60;

/** Pecah steps (termasuk repeat) jadi segmen datar. Jarak dari pace tengah bila hanya ada durasi. */
export function segments(steps: AnyStep[]): Seg[] {
  const out: Seg[] = [];
  const push = (s: AnyStep) => {
    if (s.kind === 'repeat') {
      for (let i = 0; i < (s.times ?? 0); i++) for (const x of s.steps ?? []) push(x);
      return;
    }
    if (s.kind === 'drill') {
      out.push({
        kind: 'drill',
        zone: null,
        durationS: (s.sets ?? 0) * DRILL_SET_S,
        distanceM: 0,
        walk: false,
        pace: null,
      });
      return;
    }
    if (!RUN_KINDS.has(s.kind)) {
      out.push({
        kind: s.kind,
        zone: null,
        durationS: s.duration_s ?? 0,
        distanceM: 0,
        walk: false,
        pace: null,
      });
      return;
    }
    const mid = s.pace_s_per_km ? (s.pace_s_per_km.min + s.pace_s_per_km.max) / 2 : null;
    const durationS = s.duration_s ?? (mid ? Math.round(((s.distance_m ?? 0) / 1000) * mid) : 0);
    const distanceM = s.distance_m ?? (mid && s.duration_s ? Math.round((s.duration_s / mid) * 1000) : 0);
    out.push({
      kind: s.kind,
      zone: s.zone ?? null,
      durationS,
      distanceM,
      walk: !!s.walk,
      pace: s.pace_s_per_km ?? null,
    });
  };
  for (const s of steps) push(s);
  return out;
}

/** Jarak lari (tanpa jalan kaki dan drill), meter. Definisi E-06 (07 bagian 7). */
export const runDistance = (steps: AnyStep[]) =>
  segments(steps).reduce((a, s) => (s.zone && !s.walk ? a + s.distanceM : a), 0);

export const totalSeconds = (steps: AnyStep[]) => segments(steps).reduce((a, s) => a + s.durationS, 0);

/** Detik di zona berat (tempo/interval) dan selebihnya (E-09). */
export function intensity(steps: AnyStep[]): { easyS: number; hardS: number } {
  let easyS = 0;
  let hardS = 0;
  for (const s of segments(steps)) {
    if (s.kind !== 'drill' && !s.zone) continue;
    if (s.zone === 'tempo' || s.zone === 'interval') hardS += s.durationS;
    else easyS += s.durationS;
  }
  return { easyS, hardS };
}

export const HARD_TYPES = new Set(['tempo', 'interval']);
export const SUPPORT_TYPES = new Set(['strength', 'core', 'rest']);
export const isRun = (type: string) => !SUPPORT_TYPES.has(type);

export const km = (m: number, digits = 2) => (m / 1000).toFixed(digits).replace('.', ',');
export const pct = (x: number, digits = 1) => `${(x * 100).toFixed(digits).replace('.', ',')}%`;
export const mmss = (s: number) => {
  const r = Math.round(s);
  const h = Math.floor(r / 3600);
  const m = Math.floor((r % 3600) / 60);
  const ss = String(r % 60).padStart(2, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
};
