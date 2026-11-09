import React from 'react';
import { AbsoluteFill, Audio, Composition, Series, interpolate, staticFile } from 'remotion';
import { Fonts } from './kit';
import {
  EndScene,
  LogoScene,
  PlanScene,
  PrivacyScene,
  ProgressScene,
  ReadySetRun,
  StrengthScene,
  TimerScene,
  TodayScene,
} from './scenes';

// Semua durasi kelipatan 10 frame (1 beat = 1 langkah pada 180 langkah/menit).
type Part = [React.FC, number];

const V1: Part[] = [
  [ReadySetRun, 60],
  [() => <LogoScene tagline="Your running coach" />, 60],
  [TodayScene, 120],
  [PlanScene, 140],
  [TimerScene, 130],
  [StrengthScene, 110],
  [ProgressScene, 110],
  [PrivacyScene, 80],
  [EndScene, 90],
];

const V2: Part[] = [
  [ReadySetRun, 60],
  [TimerScene, 80],
  [TodayScene, 90],
  [PlanScene, 90],
  [ProgressScene, 70],
  [() => <EndScene cta="Get RunCo free" />, 60],
];

const total = (p: Part[]) => p.reduce((s, [, d]) => s + d, 0);

// Dua musik (Suno v6 wild lewat EvoLink, instrumental, denyut sekitar 180 BPM), detail di README:
// - orbit: sinematik minimalis; klimaks 26,5-28 dtk; V2 mulai 14,8 dtk; fade akhir 0,8 dtk (track masih keras di akhir).
// - stride: pop drum and bass + jersey club; berhenti bersih 29,5 dtk; V2 mulai 14,5 dtk; fade akhir 0,27 dtk.
const FPS = 30;
const TRACKS = {
  orbit: { file: 'music/orbit.mp3', v2From: 14.8, fadeOut: 24 },
  stride: { file: 'music/stride.mp3', v2From: 14.5, fadeOut: 8 },
} as const;
type Track = keyof typeof TRACKS;

const Cut: React.FC<{ parts: Part[]; track: Track; musicFrom?: number }> = ({
  parts,
  track,
  musicFrom = 0,
}) => {
  const dur = total(parts);
  const m = TRACKS[track];
  return (
    <AbsoluteFill>
      <Fonts />
      <Audio
        src={staticFile(m.file)}
        trimBefore={Math.round(musicFrom * FPS)}
        volume={(f) =>
          interpolate(f, [0, 3, dur - m.fadeOut, dur], [0, 1, 1, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })
        }
      />
      <Series>
        {parts.map(([C, d], i) => (
          <Series.Sequence key={i} durationInFrames={d}>
            <C />
          </Series.Sequence>
        ))}
      </Series>
    </AbsoluteFill>
  );
};

/** Id komposisi: V1-Promo, V1-Portrait, V2-Social (musik Orbit) dan versi `-Stride`. */
export const Root: React.FC = () => (
  <>
    {(Object.keys(TRACKS) as Track[]).map((track) => {
      const sfx = track === 'orbit' ? '' : '-Stride';
      return (
        <React.Fragment key={track}>
          <Composition
            id={`V1-Promo${sfx}`}
            component={() => <Cut parts={V1} track={track} />}
            durationInFrames={total(V1)}
            fps={FPS}
            width={1920}
            height={1080}
          />
          <Composition
            id={`V1-Portrait${sfx}`}
            component={() => <Cut parts={V1} track={track} />}
            durationInFrames={total(V1)}
            fps={FPS}
            width={1080}
            height={1920}
          />
          <Composition
            id={`V2-Social${sfx}`}
            component={() => <Cut parts={V2} track={track} musicFrom={TRACKS[track].v2From} />}
            durationInFrames={total(V2)}
            fps={FPS}
            width={1080}
            height={1920}
          />
        </React.Fragment>
      );
    })}
  </>
);
