import { isRunSegment, type Zone } from '@run-coach/training-engine';
import type { TimerSegment } from './machine';

// Bahasa bunyi timer (09-VOICE bagian 5). Murni: menentukan bunyi apa dan kapan; pemutarnya di cues.ts.

export type Earcon =
  'tick' | 'go' | 'rest' | 'halfway' | 'warning' | 'switch' | 'segment' | 'finish' | 'pause' | 'resume';

const ZONE_RANK: Record<Zone, number> = { recovery: 0, easy: 1, long: 1, tempo: 2, interval: 3 };

/** Intensitas relatif: istirahat/jalan 0, lari menurut zona, gerakan/drill = kerja. */
function rank(seg: TimerSegment): number {
  if (seg.kind === 'rest') return 0;
  if (seg.kind === 'exercise' || seg.kind === 'drill') return 2;
  if (isRunSegment(seg)) return seg.walk ? 0 : ZONE_RANK[seg.zone];
  return 1;
}

/** Bunyi saat masuk segmen `next` dari `prev` (null = awal sesi). Nada naik = kerja, turun = istirahat. */
export function boundaryEarcon(prev: TimerSegment | null, next: TimerSegment | null): Earcon {
  if (!next) return 'finish';
  if (next.kind === 'rest' && next.prep) return prev ? 'rest' : 'segment';
  if (!prev) return 'go';
  if (next.kind === 'rest') return 'rest';
  if (next.kind === 'exercise') return 'go';
  if (next.kind === 'drill') return prev.kind === 'drill' ? 'segment' : 'go';
  const a = rank(prev);
  const b = rank(next);
  return b > a ? 'go' : b < a ? 'rest' : 'segment';
}

export type Moment = { atS: number; earcon: Earcon };

/**
 * Momen di dalam satu segmen berwaktu (detik sejak segmen mulai):
 * 3-2-1 di akhir, peringatan (10 detik / 1 menit lagi), setengah jalan atau ganti sisi.
 * Dua momen tidak pernah jatuh di detik yang sama atau berdampingan.
 */
export function segmentMoments(seg: TimerSegment): Moment[] {
  const T = seg.timedS;
  if (T == null || T < 4) return [];
  const out: Moment[] = [];
  if (T >= 5) for (const r of [3, 2, 1]) out.push({ atS: T - r, earcon: 'tick' });
  const run = isRunSegment(seg);
  const warnAt = run ? (T >= 180 ? T - 60 : T >= 30 ? T - 10 : null) : T >= 30 ? T - 10 : null;
  if (warnAt != null) out.push({ atS: warnAt, earcon: 'warning' });
  const half = Math.round(T / 2);
  const perSide = seg.kind === 'exercise' && seg.per_side;
  const wantsHalf = perSide ? T >= 10 : run ? T >= 360 : seg.kind === 'rest' ? T >= 60 : T >= 20;
  if (wantsHalf && out.every((m) => Math.abs(m.atS - half) > 1)) {
    out.push({ atS: half, earcon: perSide ? 'switch' : 'halfway' });
  }
  return out.sort((a, b) => a.atS - b.atS);
}

/** Momen yang terlewati antara detik `fromS` (eksklusif) dan `toS` (inklusif). Hanya yang terakhir dipakai jika lompat jauh. */
export function momentsBetween(seg: TimerSegment, fromS: number, toS: number): Earcon | null {
  if (toS <= fromS || toS - fromS > 2) return null; // lompatan besar (app dari latar belakang) = basi
  const hit = segmentMoments(seg).filter((m) => m.atS > fromS && m.atS <= toS);
  return hit.length ? hit[hit.length - 1]!.earcon : null;
}
