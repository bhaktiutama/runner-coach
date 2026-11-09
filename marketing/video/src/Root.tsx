import React from 'react';
import { AbsoluteFill, Composition, Series } from 'remotion';
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

const Cut: React.FC<{ parts: Part[] }> = ({ parts }) => (
  <AbsoluteFill>
    <Fonts />
    <Series>
      {parts.map(([C, d], i) => (
        <Series.Sequence key={i} durationInFrames={d}>
          <C />
        </Series.Sequence>
      ))}
    </Series>
  </AbsoluteFill>
);

export const Root: React.FC = () => (
  <>
    <Composition
      id="V1-Promo"
      component={() => <Cut parts={V1} />}
      durationInFrames={total(V1)}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="V1-Portrait"
      component={() => <Cut parts={V1} />}
      durationInFrames={total(V1)}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="V2-Social"
      component={() => <Cut parts={V2} />}
      durationInFrames={total(V2)}
      fps={30}
      width={1080}
      height={1920}
    />
  </>
);
