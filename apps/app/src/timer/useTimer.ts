import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { getDb } from '@/db/client';
import * as repo from '@/data/repo';
import type { Workout } from '@/data/rows';
import { t } from '@/i18n/t';
import { cancelTimerCues, scheduleTimerCues } from '@/lib/notifications';
import { track } from '@/lib/analytics';
import { cueText } from './labels';
import * as M from './machine';
import { playCue, prepareCues, releaseCues } from './cues';

/** State timer + efek samping (suara, getar, notifikasi terjadwal, simpan ke SQLite). */
export function useTimer(workout: Workout | null | undefined) {
  const segs = useMemo(() => (workout ? M.buildSegments(workout.steps) : []), [workout]);
  const [state, setState] = useState<M.TimerState | null>(null);
  const [now, setNow] = useState(Date.now());
  const [restored, setRestored] = useState<M.TimerState | null>(null);
  const lastIndex = useRef<number>(-1);
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
      else setState(M.initialState(workout.id));
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

  const reschedule = useCallback(
    async (s: M.TimerState) => {
      if (s.status !== 'running' || s.muted) return cancelTimerCues();
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
    },
    [segs],
  );

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

  // Cue saat segmen berganti (app aktif) + simpan saat auto-maju.
  useEffect(() => {
    if (!synced || !state) return;
    if (synced.index !== state.index || synced.status !== state.status) {
      setState(synced);
      void persist(synced);
    }
    if (lastIndex.current !== -1 && synced.index !== lastIndex.current && !synced.muted) {
      playCue(synced.status === 'finished' ? 'finish' : 'segment');
    }
    lastIndex.current = synced.index;
  }, [synced, state, persist]);

  useEffect(() => {
    if (synced?.status === 'finished') void cancelTimerCues();
  }, [synced?.status]);

  return {
    segs,
    state: synced,
    restored,
    now,
    position: synced ? M.position(synced, segs, now) : null,
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
    pause: () => apply((s, n) => M.pause(s, n)),
    resume: () => apply((s, n) => M.resume(s, n)),
    next: () => apply((s, n) => M.next(s, segs, n)),
    skip: () => apply((s, n) => M.next(s, segs, n, true)),
    skipGroup: () => apply((s, n) => M.skipGroup(s, segs, n)),
    end: () => apply((s, n) => M.end(s, segs, n)),
    toggleMute: () => apply((s) => ({ ...s, muted: !s.muted })),
  };
}
