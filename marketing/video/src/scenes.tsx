import React from 'react';
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import {
  BEAT,
  C,
  CueRings,
  FONT_D,
  FONT_U,
  Headline,
  LaneDashes,
  LogoMark,
  Phone,
  PhotoStadium,
  StrideWipe,
  Word,
  Wordmark,
  pop,
  useStep,
} from './kit';

const useLayout = () => {
  const { width, height } = useVideoConfig();
  const v = height > width;
  return { width, height, v, u: width / 100 };
};

/** Tata letak umum: judul + HP (+ foto opsional). Landscape: judul kiri, HP kanan. Portrait: judul atas, HP bawah. */
const Feature: React.FC<{
  lines: Word[][];
  sub: string;
  screen: string | string[];
  every?: number;
  dark?: boolean;
  photo?: string;
  photoSide?: 'left' | 'right';
  extra?: React.ReactNode;
}> = ({ lines, sub, screen, every, dark, photo, extra }) => {
  const { width, height, v, u } = useLayout();
  const phoneW = v ? width * 0.62 : height * 0.43;
  const phoneLeft = v ? (width - phoneW) / 2 : width * 0.64 - phoneW / 2;
  const phoneTop = v ? height * 0.36 : height * 0.13;
  const ring = dark ? C.primary : C.sand;
  // Landscape: foto di belakang HP, di tepi kanan; orangnya ditaruh di tengah bagian yang tidak tertutup HP.
  const lw = height * 0.5;
  const lh = height * 0.68;
  const ll = width * 0.74;
  const visL = Math.max(ll, phoneLeft + phoneW);
  const visR = Math.min(ll + lw, width);
  // Portrait: foto kecil di depan HP (kanan bawah) supaya tetap terlihat utuh.
  const vw = width * 0.4;
  const vh = vw * 1.28;
  return (
    <AbsoluteFill style={{ background: dark ? C.dark : C.bg, overflow: 'hidden' }}>
      <LaneDashes opacity={dark ? 0.22 : 0.14} />
      {photo && !v && (
        <PhotoStadium
          name={photo}
          w={lw}
          h={lh}
          enterAt={4}
          from="right"
          ring={ring}
          target={[(visL + visR) / 2 - ll, lh / 2]}
          style={{ left: ll, top: height * 0.22 }}
        />
      )}
      <div style={{ position: 'absolute', left: phoneLeft, top: phoneTop }}>
        <Phone src={screen} width={phoneW} every={every} dark={dark} enterAt={2} tilt={v ? 0 : -3} />
      </div>
      {photo && v && (
        <PhotoStadium
          name={photo}
          w={vw}
          h={vh}
          enterAt={8}
          from="right"
          ring={ring}
          style={{ left: width * 0.56, top: height * 0.66 }}
        />
      )}
      {extra}
      <Headline
        lines={lines}
        dark={dark}
        size={v ? u * 10.5 : u * 5.6}
        sub={sub}
        subSize={v ? u * 4.4 : u * 1.9}
        startAt={3}
        style={
          v
            ? { position: 'absolute', left: u * 8, right: u * 8, top: height * 0.08 }
            : { position: 'absolute', left: u * 6, width: u * 44, top: height * 0.3 }
        }
      />
      <StrideWipe />
    </AbsoluteFill>
  );
};

/** 0-2 dtk: "Ready. Set. Run!" bergantian tiap 2 beat dengan foto hero. */
export const ReadySetRun: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { width, height, v, u } = useLayout();
  const items = [
    { w: 'Ready.', bg: C.sand, photo: 'road-sunrise-f' },
    { w: 'Set.', bg: C.mint, photo: 'track-back' },
    { w: 'Run!', bg: C.primary, photo: 'riverside-city-m' },
  ];
  const i = Math.min(2, Math.floor(f / (BEAT * 2)));
  const it = items[i];
  const local = f - i * BEAT * 2;
  const p = pop(local, fps, 0, 8);
  const step = useStep();
  const ph = v ? height * 0.42 : height * 0.78;
  const pw = v ? width * 0.84 : ph * 0.82;
  return (
    <AbsoluteFill style={{ background: it.bg, overflow: 'hidden' }}>
      <LaneDashes color={C.text} opacity={0.1} />
      <PhotoStadium
        key={i}
        name={it.photo}
        w={pw}
        h={ph}
        enterAt={0}
        from={i % 2 ? 'left' : 'right'}
        ring={C.text}
        style={
          v ? { left: (width - pw) / 2, top: height * 0.4 } : { left: width * 0.56, top: (height - ph) / 2 }
        }
      />
      <div
        style={{
          position: 'absolute',
          left: v ? u * 8 : u * 7,
          top: v ? height * 0.14 : height * 0.32,
          fontFamily: FONT_D,
          fontSize: v ? u * 26 : u * 13,
          lineHeight: 1,
          letterSpacing: -u * 0.5,
          color: C.text,
          transform: `scale(${0.6 + 0.4 * p + step * 0.03}) rotate(${(1 - p) * -6}deg)`,
          transformOrigin: 'left bottom',
        }}
      >
        {it.w}
      </div>
    </AbsoluteFill>
  );
};

/** Logo di latar oranye. */
export const LogoScene: React.FC<{ tagline?: string }> = ({ tagline }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { v, u } = useLayout();
  const s = v ? u * 30 : u * 13;
  const tp = pop(f, fps, 26, 14);
  return (
    <AbsoluteFill style={{ background: C.primary, justifyContent: 'center', alignItems: 'center' }}>
      <LaneDashes color={C.text} opacity={0.12} />
      <div style={{ display: 'flex', alignItems: 'center', gap: s * 0.12 }}>
        <LogoMark size={s} at={2} track={C.text} dot={C.bg} />
        <Wordmark size={s * 0.62} at={14} color={C.text} />
      </div>
      {tagline && (
        <div
          style={{
            marginTop: s * 0.1,
            fontFamily: FONT_U,
            fontWeight: 800,
            fontSize: v ? u * 5 : u * 2.3,
            color: C.text,
            opacity: tp,
            transform: `translateY(${(1 - tp) * 20}px)`,
          }}
        >
          {tagline}
        </div>
      )}
      <StrideWipe color={C.text} />
    </AbsoluteFill>
  );
};

export const TodayScene = () => (
  <Feature
    lines={[
      ['Know', 'exactly'],
      ['what', 'to', { k: 'run' }, { k: 'today' }],
    ]}
    sub="Your plan, one screen, one tap to start."
    screen="today"
    photo="track-side"
  />
);

export const PlanScene = () => (
  <Feature
    lines={[
      ['A', 'real', 'plan,'],
      ['built', 'around', { k: 'race' }, { k: 'day' }],
    ]}
    sub="5K, 10K, half or full marathon, on your days."
    screen={['onb-welcome', 'onb-goal', 'onb-race', 'preview']}
    every={BEAT * 3}
    photo="road-sunrise-m"
    photoSide="right"
  />
);

export const TimerScene: React.FC = () => {
  const { width, height, v } = useLayout();
  const phoneW = v ? width * 0.62 : height * 0.43;
  const cx = v ? width / 2 : width * 0.64;
  const cy = v ? height * 0.36 + phoneW * 0.62 : height * 0.13 + phoneW * 0.62;
  return (
    <Feature
      dark
      lines={[['Every', 'interval,'], [{ k: 'coached' }]]}
      sub="Target pace, sound cues and haptics."
      screen={Array.from({ length: 12 }, (_, i) => `timer-${String(i).padStart(2, '0')}`)}
      every={BEAT}
      extra={<CueRings x={cx} y={cy} r={phoneW * 0.46} />}
    />
  );
};

export const StrengthScene = () => (
  <Feature
    dark
    lines={[
      ['Strength', 'built'],
      ['for', { k: 'runners' }],
    ]}
    sub="Bodyweight legs and core, timed for you."
    screen={Array.from({ length: 10 }, (_, i) => `strength-${String(i).padStart(2, '0')}`)}
    every={BEAT}
    photo="track-overhead"
    photoSide="right"
  />
);

export const ProgressScene = () => (
  <Feature
    lines={[
      ['See', 'yourself'],
      ['getting', { k: 'faster' }],
    ]}
    sub="Pace trend, consistency, race prediction."
    screen={['progress', 'progress', 'progress', 'progress', 'progress', 'week']}
    every={BEAT * 1.2}
    photo="shoe-sole"
    photoSide="right"
  />
);

export const PrivacyScene = () => (
  <Feature
    dark
    lines={[
      ['Your', 'data', 'stays'],
      [{ k: 'on' }, { k: 'your' }, { k: 'phone' }],
    ]}
    sub="No cloud profile. Your backup, your file."
    screen="privacy"
    photo="promo-privacy"
    photoSide="right"
  />
);

/** Penutup: logo, janji utama, ajakan. */
export const EndScene: React.FC<{ cta?: string }> = ({ cta = 'Free on Google Play' }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { width, height, v, u } = useLayout();
  const s = v ? u * 24 : u * 9;
  const p1 = pop(f, fps, 18, 12);
  const p2 = pop(f, fps, 30, 12);
  const step = useStep();
  const ph = v ? height * 0.3 : height * 0.62;
  return (
    <AbsoluteFill style={{ background: C.bg, overflow: 'hidden' }}>
      <LaneDashes opacity={0.14} />
      {['riverside-city-f', 'track-back', 'road-sunrise-m'].map((n, i) => (
        <PhotoStadium
          key={n}
          name={n}
          w={ph * 0.6}
          h={ph}
          enterAt={i * 4}
          from="bottom"
          ring={[C.mint, C.sand, C.lavender][i]}
          style={
            v
              ? { left: width * (0.06 + i * 0.31), top: height * 0.62 + (i === 1 ? -height * 0.03 : 0) }
              : {
                  left: width * (0.57 + i * 0.135),
                  top: height * 0.19 + (i === 1 ? -height * 0.05 : height * 0.04),
                }
          }
        />
      ))}
      <div style={{ position: 'absolute', left: v ? u * 8 : u * 7, top: v ? height * 0.12 : height * 0.26 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: s * 0.1 }}>
          <LogoMark size={s} at={0} />
          <Wordmark size={s * 0.62} at={8} />
        </div>
        <div
          style={{
            marginTop: s * 0.18,
            fontFamily: FONT_D,
            fontSize: v ? u * 9 : u * 4.4,
            lineHeight: 1.05,
            letterSpacing: -u * 0.1,
            color: C.text,
            opacity: p1,
            transform: `translateY(${(1 - p1) * 30}px)`,
            maxWidth: v ? u * 84 : u * 46,
          }}
        >
          Running plans, <span style={{ color: C.primary }}>5K to marathon</span>
        </div>
        <div
          style={{
            display: 'inline-block',
            marginTop: s * 0.22,
            padding: v ? `${u * 3}px ${u * 7}px` : `${u * 1.2}px ${u * 3}px`,
            borderRadius: 999,
            background: C.primary,
            fontFamily: FONT_U,
            fontWeight: 800,
            fontSize: v ? u * 5.2 : u * 2.2,
            color: C.text,
            opacity: p2,
            transform: `scale(${0.8 + 0.2 * p2 + step * 0.03})`,
            transformOrigin: 'left center',
          }}
        >
          {cta}
        </div>
      </div>
      <StrideWipe />
    </AbsoluteFill>
  );
};

/** Bingkai debug: tidak dipakai di render final. */
export const Still: React.FC<{ name: string }> = ({ name }) => (
  <Img src={staticFile(`screens/${name}.png`)} />
);
export { interpolate };
