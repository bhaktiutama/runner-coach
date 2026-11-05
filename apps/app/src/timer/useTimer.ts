import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { getDb } from '@/db/client';
import * as repo from '@/data/repo';
import type { Workout } from '@/data/rows';
import { t } from '@/i18n/t';
import { cancelTimerCues, clearTimerStatus, scheduleTimerCues, showTimerStatus } from '@/lib/notifications';
import { formatTimeOfDay } from '@run-coach/ui/format';
import { track } from '@/lib/analytics';
import { cueText } from './labels';
import * as M from './machine';
import { playEarcon, prepareCues, releaseCues } from './cues';
import { boundaryEarcon, momentsBetween } from './earcons';

/** State timer + efek samping (suara, getar, notifikasi terjadwal, simpan ke SQLite). */
export function useTimer(workout: Workout | null | undefined, autoDefault = true) {
  const [state, setState] = useState<M.TimerState | null>(null);
  const auto = state?.auto ?? autoDefault;
  const segs = useMemo(() => (workout ? M.buildSegments(workout.steps, { auto }) : []), [workout, auto]);
  const segsRef = useRef(segs);
  segsRef.current = segs;
  const autoRef = useRef(autoDefault);
  autoRef.current = autoDefault;
  const [now, setNow] = useState(Date.now());
  const [restored, setRestored] = useState<M.TimerState | null>(null);
  /** Posisi terakhir yang sudah diberi bunyi: indeks, detik dalam segmen, status. */
  const heard = useRef<{ index: number; sec: number; status: M.TimerStatus } | null>(null);
  const qc = useQueryClient();

  // Muat state tersimpan (app ditutup saat timer jalan -> tawarkan lanjut / akhiri).
  useEffect(() => {
    if (!workout) return;
    let alive = true;
    void (async () => {
      const json = await repo.getActiveTimer(await getDb());
      const saved = json ? (JSON.parse(json) as M.TimerState) : null;
      if (!alive) return;
      if (saved && saved.workoutId === workout.id && saved.status !== 'idle') setRestored(saved);
      else setState(M.initialState(workout.id, autoRef.current));
    })();
    void prepareCues();
    return () => {
      alive = false;
      releaseCues();
    };
  }, [workout]);

  const persist = useCallback(
    async (s: M.TimerState | null) => {
      await repo.setActiveTimer(await getDb(), s ? JSON.stringify(s) : null);
      void qc.invalidateQueries({ queryKey: ['meta'] });
    },
    [qc],
  );

  const reschedule = useCallback(async (s: M.TimerState) => {
    if (s.status !== 'running' || s.muted) return cancelTimerCues();
    const segs = segsRef.current;
    const b = M.upcomingBoundaries(s, segs, Date.now());
    await scheduleTimerCues(
      b.map((x) => {
        const seg = segs[x.nextIndex];
        const groups = segs[segs.length - 1]?.group ?? 0;
        return seg
          ? { at: x.at, title: t('timer.notifTitle', { n: seg.group, total: groups }), body: cueText(seg) }
          : { at: x.at, title: t('timer.notifDoneTitle'), body: t('timer.notifDoneBody') };
      }),
    );
  }, []);

  const apply = useCallback(
    (fn: (s: M.TimerState, n: number) => M.TimerState) => {
      setState((prev) => {
        if (!prev) return prev;
        const n = Date.now();
        const next = fn(prev, n);
        void persist(next);
        void reschedule(next);
        return next;
      });
    },
    [persist, reschedule],
  );

  // Tick 4x/detik; sinkron saat app kembali aktif.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    const sub = AppState.addEventListener('change', (st) => st === 'active' && setNow(Date.now()));
    return () => {
      clearInterval(id);
      sub.remove();
    };
  }, []);

  const synced = state ? M.sync(state, segs, now) : null;

  const pos = synced ? M.position(synced, segs, now) : null;

  // Bunyi penanda (app aktif): pergantian segmen, 3-2-1, peringatan, setengah jalan / ganti sisi.
  // Simpan saat auto-maju.
  useEffect(() => {
    if (!synced || !state || !pos) return;
    if (synced.index !== state.index || synced.status !== state.status) {
      setState(synced);
      void persist(synced);
    }
    const prev = heard.current;
    const cur = { index: synced.index, sec: pos.elapsedInSegS, status: synced.status };
    heard.current = cur;
    if (synced.status === 'idle' || !prev) return;
    if (synced.status === 'finished') {
      if (prev.status !== 'finished') playEarcon('finish', synced.muted);
      return;
    }
    if (prev.status === 'idle' || cur.index !== prev.index) {
      const seg = segs[cur.index] ?? null;
      playEarcon(
        boundaryEarcon(prev.status === 'idle' ? null : (segs[cur.index - 1] ?? null), seg),
        synced.muted,
      );
      return;
    }
    if (synced.status !== 'running' || !pos.segment) return;
    const e = momentsBetween(pos.segment, prev.sec, cur.sec);
    if (e) playEarcon(e, synced.muted);
  }, [synced, state, pos, segs, persist]);

  useEffect(() => {
    if (synced?.status === 'finished') void cancelTimerCues();
  }, [synced?.status]);

  // U5: status di layar kunci, diperbarui saat segmen/status/perpanjangan berubah (bukan tiap detik:
  // isinya jam selesai, jadi tetap benar tanpa diperbarui).
  const statusKey = synced ? `${synced.status}:${synced.index}:${synced.extendS ?? 0}:${synced.auto}` : '';
  useEffect(() => {
    if (!synced || !pos) return;
    if (synced.status !== 'running' && synced.status !== 'paused') return void clearTimerStatus();
    const seg = pos.segment;
    if (!seg) return;
    const title = t('timer.statusTitle', { name: cueText(seg) });
    const body =
      synced.status === 'paused'
        ? t('timer.statusPaused')
        : pos.remainingS != null
          ? t('timer.statusUntil', { time: formatTimeOfDay(Date.now() + pos.remainingS * 1000) })
          : t('timer.statusManual');
    void showTimerStatus(title, body, t('timer.statusChannel'));
  }, [statusKey]);
  useEffect(() => () => void clearTimerStatus(), []);

  return {
    segs,
    state: synced,
    restored,
    now,
    position: pos,
    auto,
    resumeRestored: () => {
      if (!restored) return;
      setState(restored);
      setRestored(null);
      void reschedule(restored);
    },
    endRestored: () => {
      if (!restored) return;
      const ended = M.end(restored, segs, Date.now());
      setState(ended);
      setRestored(null);
      void persist(ended);
    },
    start: () => {
      track('workout_started', { workout_type: workout?.type ?? 'unknown' });
      apply((s, n) => M.start(s, n));
    },
    pause: () => {
      if (state?.status === 'running') playEarcon('pause', state.muted);
      apply((s, n) => M.pause(s, n));
    },
    resume: () => {
      if (state?.status === 'paused') playEarcon('resume', state.muted);
      apply((s, n) => M.resume(s, n));
    },
    /** Ganti mode otomatis/manual (juga di tengah sesi). */
    setAuto: (on: boolean) => {
      if (!workout) return;
      const other = M.buildSegments(workout.steps, { auto: on });
      const old = segs;
      segsRef.current = other;
      apply((s, n) => {
        const cur = M.sync(s, old, n);
        return M.setAuto(cur, n, on, old[cur.index]?.timedS !== other[cur.index]?.timedS);
      });
    },
    next: () => apply((s, n) => M.next(s, segs, n)),
    skip: () => apply((s, n) => M.next(s, segs, n, true)),
    skipGroup: () => apply((s, n) => M.skipGroup(s, segs, n)),
    /** "+15 dtk" di istirahat (U1). */
    extend: () => apply((s, n) => M.extend(s, segs, n)),
    end: () => apply((s, n) => M.end(s, segs, n)),
    toggleMute: () => apply((s) => ({ ...s, muted: !s.muted })),
  };
}
