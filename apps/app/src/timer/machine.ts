import { DRILL_SET_S, flattenSteps, type FlatSegment, type Step } from '@run-coach/training-engine';

// State machine timer (App Flow 3.2). Murni (tanpa React/Expo) supaya bisa diuji.
// Posisi selalu dihitung dari timestamp absolut, jadi tetap benar setelah app ditutup sistem (TRD 5).

export type TimerSegment = FlatSegment & {
  /** Nomor grup tampilan (1-based): step tingkat atas, drill berurutan = 1 grup. */
  group: number;
  /** Detik untuk countdown; null = manual (drill berbasis jarak/repetisi, tekan Lanjut). */
  timedS: number | null;
};

export type SegmentResult = { index: number; activeS: number; skipped: boolean };

export type TimerStatus = 'idle' | 'running' | 'paused' | 'finished';

export type TimerState = {
  workoutId: string;
  status: TimerStatus;
  /** Epoch ms saat Mulai (setelah hitung mundur). */
  startedAt: number | null;
  /** Epoch ms saat jeda dimulai; null jika tidak dijeda. */
  pausedAt: number | null;
  /** Total ms dijeda. */
  pausedMs: number;
  index: number;
  /** Waktu aktif (ms sejak startedAt dikurangi jeda) saat segmen sekarang mulai. */
  segStartActiveMs: number;
  results: SegmentResult[];
  finishedAt: number | null;
  muted: boolean;
};

export function buildSegments(steps: Step[]): TimerSegment[] {
  const out: TimerSegment[] = [];
  let group = 0;
  let prevDrill = false;
  for (const top of steps) {
    const isDrill = top.kind === 'drill';
    if (!(isDrill && prevDrill)) group++;
    prevDrill = isDrill;
    for (const seg of flattenSteps([top])) {
      const timedS = seg.kind === 'drill' ? (seg.duration_s ?? null) : seg.duration_s;
      out.push({ ...seg, group, timedS });
    }
  }
  return out;
}

export function initialState(workoutId: string): TimerState {
  return {
    workoutId,
    status: 'idle',
    startedAt: null,
    pausedAt: null,
    pausedMs: 0,
    index: 0,
    segStartActiveMs: 0,
    results: [],
    finishedAt: null,
    muted: false,
  };
}

export function activeMs(s: TimerState, now: number): number {
  if (s.startedAt == null) return 0;
  const end = s.finishedAt ?? s.pausedAt ?? now;
  return Math.max(0, end - s.startedAt - s.pausedMs);
}

/** Majukan segmen berwaktu yang sudah habis (dipanggil tiap tick dan saat app dibuka lagi). */
export function sync(s: TimerState, segs: TimerSegment[], now: number): TimerState {
  if (s.status !== 'running') return s;
  let st = s;
  const act = activeMs(s, now);
  while (st.status === 'running') {
    const seg = segs[st.index];
    if (!seg) return finish(st, now);
    if (seg.timedS == null) return st;
    const endAt = st.segStartActiveMs + seg.timedS * 1000;
    if (act < endAt) return st;
    st = {
      ...st,
      results: [...st.results, { index: st.index, activeS: seg.timedS, skipped: false }],
      index: st.index + 1,
      segStartActiveMs: endAt,
    };
    if (st.index >= segs.length) return finish(st, st.startedAt! + st.pausedMs + endAt);
  }
  return st;
}

function finish(s: TimerState, at: number): TimerState {
  return { ...s, status: 'finished', finishedAt: at, pausedAt: null };
}

export function start(s: TimerState, now: number): TimerState {
  if (s.status !== 'idle') return s;
  return { ...s, status: 'running', startedAt: now, segStartActiveMs: 0 };
}

export function pause(s: TimerState, now: number): TimerState {
  if (s.status !== 'running') return s;
  return { ...s, status: 'paused', pausedAt: now };
}

export function resume(s: TimerState, now: number): TimerState {
  if (s.status !== 'paused' || s.pausedAt == null) return s;
  return { ...s, status: 'running', pausedMs: s.pausedMs + (now - s.pausedAt), pausedAt: null };
}

/** "Lanjut" (drill set selesai) atau lewati segmen sekarang. */
export function next(s: TimerState, segs: TimerSegment[], now: number, skipped = false): TimerState {
  const cur = sync(s, segs, now);
  if (cur.status !== 'running' && cur.status !== 'paused') return cur;
  const act = activeMs(cur, now);
  const st: TimerState = {
    ...cur,
    results: [
      ...cur.results,
      { index: cur.index, activeS: Math.round((act - cur.segStartActiveMs) / 1000), skipped },
    ],
    index: cur.index + 1,
    segStartActiveMs: act,
  };
  return st.index >= segs.length ? finish(st, now) : st;
}

/** Lewati semua set drill di grup ini. */
export function skipGroup(s: TimerState, segs: TimerSegment[], now: number): TimerState {
  let st = sync(s, segs, now);
  const g = segs[st.index]?.group;
  while (st.status !== 'finished' && segs[st.index]?.group === g) st = next(st, segs, now, true);
  return st;
}

/** Akhiri (setelah konfirmasi) -> finished, durasi = waktu aktif sebenarnya. */
export function end(s: TimerState, segs: TimerSegment[], now: number): TimerState {
  const cur = sync(s, segs, now);
  if (cur.status === 'finished' || cur.status === 'idle')
    return cur.status === 'idle' ? finish(cur, now) : cur;
  const at = cur.pausedAt ?? now;
  return { ...cur, status: 'finished', finishedAt: at, pausedAt: null };
}

export type Position = {
  index: number;
  group: number;
  groups: number;
  segment: TimerSegment | null;
  /** Detik tersisa di segmen (null = manual). */
  remainingS: number | null;
  elapsedInSegS: number;
  totalElapsedS: number;
  totalPlannedS: number;
  next: TimerSegment | null;
};

export function plannedS(seg: TimerSegment): number {
  return seg.timedS ?? (seg.kind === 'drill' ? seg.estimate_s : seg.duration_s) ?? DRILL_SET_S;
}

export function position(s: TimerState, segs: TimerSegment[], now: number): Position {
  const st = sync(s, segs, now);
  const act = activeMs(st, now);
  const seg = segs[st.index] ?? null;
  const elapsedInSeg = Math.max(0, (act - st.segStartActiveMs) / 1000);
  return {
    index: st.index,
    group: seg?.group ?? segs[segs.length - 1]?.group ?? 0,
    groups: segs[segs.length - 1]?.group ?? 0,
    segment: seg,
    remainingS: seg?.timedS != null ? Math.max(0, Math.ceil(seg.timedS - elapsedInSeg)) : null,
    elapsedInSegS: Math.floor(elapsedInSeg),
    totalElapsedS: Math.floor(act / 1000),
    totalPlannedS: segs.reduce((a, x) => a + plannedS(x), 0),
    next: segs[st.index + 1] ?? null,
  };
}

/** Jadwal pergantian segmen berwaktu ke depan (epoch ms) untuk notifikasi lokal saat layar terkunci. */
export function upcomingBoundaries(
  s: TimerState,
  segs: TimerSegment[],
  now: number,
): { at: number; nextIndex: number }[] {
  const st = sync(s, segs, now);
  if (st.status !== 'running' || st.startedAt == null) return [];
  const out: { at: number; nextIndex: number }[] = [];
  let t = st.segStartActiveMs;
  for (let i = st.index; i < segs.length; i++) {
    const seg = segs[i]!;
    if (seg.timedS == null) break; // berhenti di drill manual
    t += seg.timedS * 1000;
    out.push({ at: st.startedAt + st.pausedMs + t, nextIndex: i + 1 });
  }
  return out;
}

export type TimerSummary = {
  durationS: number;
  distanceM: number;
  segmentsDone: number;
  segmentsTotal: number;
  results: SegmentResult[];
};

/** Ringkasan untuk 2.4: durasi aktif, estimasi jarak dari segmen yang dijalani, x dari y segmen. */
export function summary(s: TimerState, segs: TimerSegment[], now: number): TimerSummary {
  const st = s.status === 'finished' ? s : end(s, segs, now);
  let dist = 0;
  for (const r of st.results) {
    const seg = segs[r.index];
    if (!seg || seg.kind === 'drill' || seg.walk || r.skipped) continue;
    const full = seg.timedS ?? 0;
    const frac = full > 0 ? Math.min(1, r.activeS / full) : 1;
    dist += (seg.distance_m ?? 0) * frac;
  }
  const cur = segs[st.index];
  if (cur && cur.kind !== 'drill' && !cur.walk && cur.timedS) {
    const partial = Math.max(0, (activeMs(st, now) - st.segStartActiveMs) / 1000);
    dist += (cur.distance_m ?? 0) * Math.min(1, partial / cur.timedS);
  }
  const groups = segs[segs.length - 1]?.group ?? 0;
  const doneIdx = new Set(st.results.filter((r) => !r.skipped).map((r) => r.index));
  let segmentsDone = 0;
  for (let g = 1; g <= groups; g++) {
    const idx = segs.map((x, i) => (x.group === g ? i : -1)).filter((i) => i >= 0);
    if (idx.length && idx.every((i) => doneIdx.has(i))) segmentsDone++;
  }
  return {
    durationS: Math.max(1, Math.round(activeMs(st, now) / 1000)),
    distanceM: Math.round(dist),
    segmentsDone,
    segmentsTotal: groups,
    results: st.results,
  };
}
