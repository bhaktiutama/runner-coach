import { isRunSegment, paceZones, tempoRun, type Step } from '@run-coach/training-engine';
import { describe, expect, it } from 'vitest';
import { migrate } from '../src/db/migrate';
import { migrations } from '../src/db/migrations';
import { boundaryEarcon, momentsBetween, segmentMoments } from '../src/timer/earcons';
import {
  buildSegments,
  extend,
  initialState,
  next,
  position,
  PREP_S,
  setAuto,
  start,
  sync,
  upcomingBoundaries,
} from '../src/timer/machine';
import { createNodeDb } from './node-db';

const T0 = 1_700_000_000_000;
const s = (sec: number) => T0 + sec * 1000;

// Squat 2 x 10 (istirahat 60), plank 2 x 30 dtk, side plank 1 x 20 dtk per sisi.
const strength: Step[] = [
  { kind: 'exercise', exercise_id: 'squat', sets: 2, reps: 10, rest_s: 60 },
  { kind: 'exercise', exercise_id: 'plank', sets: 2, duration_s: 30, rest_s: 45 },
  { kind: 'exercise', exercise_id: 'side_plank', sets: 1, duration_s: 20, per_side: true, rest_s: 0 },
];

describe('mode otomatis (09-VOICE bagian 6)', () => {
  it('manual: set repetisi tanpa countdown; otomatis: estimasi 3 dtk per repetisi', () => {
    expect(buildSegments(strength)[1]!.timedS).toBeNull();
    const auto = buildSegments(strength, { auto: true });
    expect(auto[1]).toMatchObject({ kind: 'exercise', timedS: 30, autoTimed: true });
    // Dosis waktu dari plan tidak berubah dan tidak ditandai otomatis.
    const plank = auto.find((x) => x.kind === 'exercise' && x.exercise_id === 'plank')!;
    expect(plank.timedS).toBe(30);
    expect(plank.autoTimed).toBeUndefined();
  });

  it('otomatis: drill jarak memakai 60 dtk per set', () => {
    const steps = tempoRun(14 * 60, paceZones(40), true);
    const drills = buildSegments(steps, { auto: true }).filter((x) => x.kind === 'drill');
    expect(drills.length).toBeGreaterThan(0);
    expect(drills.every((x) => x.timedS === 60 && x.autoTimed)).toBe(true);
  });

  it('sesi strength otomatis berjalan sampai selesai tanpa tombol', () => {
    const segs = buildSegments(strength, { auto: true });
    const total = segs.reduce((a, x) => a + (x.timedS ?? 0), 0);
    // 5 (siap-siap) + 30 + 60 + 30 + 60 (istirahat sesudah gerakan) + 30 + 45 + 30 + 45 + 40
    expect(total).toBe(375);
    const st = sync(start(initialState('w', true), T0), segs, s(total + 1));
    expect(st.status).toBe('finished');
  });

  it('ganti mode di tengah set: hitungan set sekarang dimulai ulang, tidak lompat', () => {
    const manual = buildSegments(strength);
    const auto = buildSegments(strength, { auto: true });
    let st = start(initialState('w', false), T0);
    st = sync(st, manual, s(100)); // siap-siap selesai, masih di set 1 squat (manual)
    expect(st.index).toBe(1);
    st = setAuto(st, s(100), true, true);
    expect(st.auto).toBe(true);
    expect(position(st, auto, s(110)).remainingS).toBe(20);
    expect(sync(st, auto, s(131)).index).toBe(2);
    // Kembali manual di istirahat (segmen tidak berubah) = hitungan tidak diulang.
    st = sync(st, auto, s(140));
    const before = st.segStartActiveMs;
    st = setAuto(st, s(140), false, false);
    expect(st.segStartActiveMs).toBe(before);
    expect(next(st, manual, s(141)).index).toBe(3);
  });
});

describe('U4 siap-siap dan U1 +15 dtk (09-VOICE bagian 13)', () => {
  it('siap-siap hanya sebelum gerakan yang tidak didahului istirahat', () => {
    const steps: Step[] = [
      { kind: 'exercise', exercise_id: 'squat', sets: 2, reps: 10, rest_s: 0 },
      { kind: 'exercise', exercise_id: 'plank', sets: 1, duration_s: 30, rest_s: 0 },
      { kind: 'exercise', exercise_id: 'glute_bridge', sets: 1, reps: 10, rest_s: 30 },
    ];
    const kinds = buildSegments(steps).map((x) => (x.kind === 'rest' ? (x.prep ? 'prep' : 'rest') : x.kind));
    // Awal sesi, lalu tiap gerakan baru tanpa istirahat; antar set gerakan yang sama tidak.
    expect(kinds).toEqual(['prep', 'exercise', 'exercise', 'prep', 'exercise', 'prep', 'exercise']);
    const segs = buildSegments(strength);
    expect(segs.filter((x) => x.kind === 'rest' && x.prep)).toHaveLength(1);
    expect(segs[0]).toMatchObject({ timedS: PREP_S, group: 1 });
  });

  it('+15 dtk menambah sisa istirahat, juga jadwal notifikasi; segmen berikut kembali normal', () => {
    const segs = buildSegments(strength, { auto: true });
    let st = sync(start(initialState('w', true), T0), segs, s(36)); // 5 + 30 -> istirahat 60
    expect(segs[st.index]!.kind).toBe('rest');
    st = extend(st, segs, s(40));
    expect(position(st, segs, s(40)).remainingS).toBe(60 - 5 + 15);
    expect(upcomingBoundaries(st, segs, s(40))[0]!.at).toBe(s(35 + 75));
    st = sync(st, segs, s(35 + 75));
    expect(segs[st.index]!.kind).toBe('exercise');
    expect(st.extendS).toBe(0);
    expect(position(st, segs, s(111)).remainingS).toBe(29);
  });

  it('+15 dtk tidak berlaku di set manual', () => {
    const segs = buildSegments(strength);
    const st = sync(start(initialState('w'), T0), segs, s(10));
    expect(extend(st, segs, s(10)).extendS ?? 0).toBe(0);
  });
});

describe('bahasa bunyi (09-VOICE bagian 5)', () => {
  const segs = buildSegments(strength, { auto: true });
  const [prep, squat1, rest1] = [segs[0]!, segs[1]!, segs[2]!];
  const sidePlank = segs[segs.length - 1]!;

  it('nada naik saat kerja mulai, turun saat istirahat, selesai di akhir', () => {
    expect(boundaryEarcon(null, squat1)).toBe('go');
    expect(boundaryEarcon(null, prep)).toBe('segment');
    expect(boundaryEarcon(prep, squat1)).toBe('go');
    expect(boundaryEarcon(squat1, rest1)).toBe('rest');
    expect(boundaryEarcon(rest1, segs[3]!)).toBe('go');
    // 3-2-1 juga di siap-siap 5 dtk.
    expect(segmentMoments(prep).map((m) => m.earcon)).toEqual(['tick', 'tick', 'tick']);
    expect(boundaryEarcon(sidePlank, null)).toBe('finish');
  });

  it('lari: naik intensitas = go, turun = rest, sama = segment', () => {
    const run = buildSegments(tempoRun(14 * 60, paceZones(40), false));
    const easy = run.find((x) => isRunSegment(x) && x.zone === 'easy')!;
    const tempo = run.find((x) => isRunSegment(x) && x.zone === 'tempo')!;
    expect(boundaryEarcon(easy, tempo)).toBe('go');
    expect(boundaryEarcon(tempo, easy)).toBe('rest');
    expect(boundaryEarcon(easy, easy)).toBe('segment');
  });

  it('istirahat 60 dtk: setengah jalan, 10 detik, 3-2-1', () => {
    expect(segmentMoments(rest1)).toEqual([
      { atS: 30, earcon: 'halfway' },
      { atS: 50, earcon: 'warning' },
      { atS: 57, earcon: 'tick' },
      { atS: 58, earcon: 'tick' },
      { atS: 59, earcon: 'tick' },
    ]);
  });

  it('per sisi: "ganti sisi" di tengah set, bukan setengah jalan', () => {
    const m = segmentMoments(sidePlank);
    expect(m.find((x) => x.earcon === 'switch')?.atS).toBe(20);
    expect(m.some((x) => x.earcon === 'halfway')).toBe(false);
  });

  it('tidak ada dua momen di detik yang sama atau berdampingan', () => {
    for (const seg of segs) {
      const at = segmentMoments(seg)
        .filter((m) => m.earcon !== 'tick')
        .map((m) => m.atS);
      const ticks = segmentMoments(seg)
        .filter((m) => m.earcon === 'tick')
        .map((m) => m.atS);
      for (const a of at) expect(ticks.every((t) => Math.abs(t - a) > 1)).toBe(true);
    }
  });

  it('lompatan waktu besar (app dari latar belakang) tidak membunyikan momen basi', () => {
    expect(momentsBetween(rest1, 29, 30)).toBe('halfway');
    expect(momentsBetween(rest1, 10, 58)).toBeNull();
  });
});

describe('migrasi v7', () => {
  it('profil mendapat timer_auto = 1', async () => {
    const db = createNodeDb();
    for (const m of migrations.filter((x) => x.version <= 6)) {
      db.raw.exec(m.sql);
      db.raw.exec(`PRAGMA user_version = ${m.version}`);
    }
    await migrate(db);
    const p = await db.getFirstAsync<{ timer_auto: number }>('SELECT timer_auto FROM profile');
    expect(p?.timer_auto).toBe(1);
  });
});
