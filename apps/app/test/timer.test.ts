import { paceZones, tempoRun, easyRun, runWalk } from '@run-coach/training-engine';
import { describe, expect, it } from 'vitest';
import {
  buildSegments,
  end,
  initialState,
  next,
  pause,
  position,
  resume,
  skipGroup,
  start,
  summary,
  sync,
  upcomingBoundaries,
} from '../src/timer/machine';

const z = paceZones(40);
const T0 = 1_700_000_000_000;
const s = (sec: number) => T0 + sec * 1000;

describe('timer state machine (App Flow 3.2)', () => {
  const steps = tempoRun(14 * 60, z, true); // 10 + drill (10 set manual) + 14 + 10
  const segs = buildSegments(steps);

  it('segmen dan grup: drill 10 set = 1 grup, total 4 grup', () => {
    expect(segs.length).toBe(1 + 10 + 1 + 1);
    expect(segs[segs.length - 1]!.group).toBe(4);
    expect(segs.filter((x) => x.kind === 'drill').every((x) => x.timedS === null)).toBe(true);
  });

  it('idle -> running -> segmen berwaktu maju otomatis, berhenti di drill manual', () => {
    let st = start(initialState('w1'), T0);
    expect(st.status).toBe('running');
    let p = position(st, segs, s(90));
    expect(p.remainingS).toBe(600 - 90);
    expect(p.group).toBe(1);
    st = sync(st, segs, s(700));
    expect(st.index).toBe(1);
    p = position(st, segs, s(800));
    expect(p.segment?.kind).toBe('drill');
    expect(p.remainingS).toBeNull();
    expect(p.group).toBe(2);
  });

  it('jeda menghentikan waktu; lanjutkan meneruskan', () => {
    let st = start(initialState('w1'), T0);
    st = pause(st, s(100));
    expect(position(st, segs, s(500)).remainingS).toBe(500);
    st = resume(st, s(500));
    expect(position(st, segs, s(510)).remainingS).toBe(490);
    expect(st.pausedMs).toBe(400_000);
  });

  it('Lanjut per set drill, lalu lewati grup', () => {
    let st = sync(start(initialState('w1'), T0), segs, s(600));
    st = next(st, segs, s(660));
    expect(st.index).toBe(2);
    expect(position(st, segs, s(661)).segment?.kind).toBe('drill');
    st = skipGroup(st, segs, s(670));
    expect(position(st, segs, s(671)).segment?.zone).toBe('tempo');
  });

  it('app ditutup lalu dibuka: posisi dari timestamp', () => {
    const e = buildSegments(easyRun(5000, z));
    const st = start(initialState('w2'), T0);
    const later = position(st, e, s(e[0]!.timedS! - 30));
    expect(later.remainingS).toBe(30);
    expect(sync(st, e, s(e[0]!.timedS! + 5)).status).toBe('finished');
  });

  it('akhiri di tengah: durasi sebenarnya + segmen tuntas x dari y', () => {
    let st = start(initialState('w1'), T0);
    st = sync(st, segs, s(700));
    st = end(st, segs, s(720));
    const sum = summary(st, segs, s(720));
    expect(st.status).toBe('finished');
    expect(sum.durationS).toBe(720);
    expect(sum.segmentsDone).toBe(1);
    expect(sum.segmentsTotal).toBe(4);
    expect(sum.distanceM).toBeGreaterThan(1000);
  });

  it('notifikasi terjadwal per pergantian segmen, berhenti di drill manual, tidak saat dijeda', () => {
    const st = start(initialState('w1'), T0);
    expect(upcomingBoundaries(st, segs, T0).map((b) => b.at)).toEqual([s(600)]);
    const rw = buildSegments(runWalk(3, 60, 120, z));
    expect(upcomingBoundaries(start(initialState('x'), T0), rw, T0).length).toBe(rw.length);
    expect(upcomingBoundaries(pause(st, s(10)), segs, s(20))).toEqual([]);
  });

  it('jarak run-walk tidak menghitung segmen jalan', () => {
    const rw = buildSegments(runWalk(2, 60, 120, z));
    let st = start(initialState('x'), T0);
    st = sync(st, rw, s(10_000));
    const sum = summary(st, rw, s(10_000));
    const run = rw
      .filter((x) => x.kind === 'work')
      .reduce((a, x) => a + (x.kind !== 'drill' ? (x.distance_m ?? 0) : 0), 0);
    expect(sum.distanceM).toBe(run);
  });
});
