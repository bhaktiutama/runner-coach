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
  Backdrop,
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

type Box = { left: number; top: number; w: number; h: number };
type Spec = {
  photo?: Box & {
    fade: 'down' | 'up' | 'left' | 'right' | 'radial';
    dim?: number;
    target?: [number, number];
    opacity?: number;
  };
  phone: { left: number; top: number; w: number; tilt?: number };
  head: React.CSSProperties;
  size?: number;
};

/** Adegan fitur: foto latar memudar (opsional) di belakang, HP di depan, judul. Tata letak per adegan lewat `spec`. */
const Feature: React.FC<{
  lines: Word[][];
  sub: string;
  screen: string | string[];
  every?: number;
  dark?: boolean;
  photo?: string;
  spec: (l: { width: number; height: number; v: boolean; u: number }) => Spec;
  extra?: (s: Spec) => React.ReactNode;
}> = ({ lines, sub, screen, every, dark, photo, spec, extra }) => {
  const L = useLayout();
  const { v, u } = L;
  const s = spec(L);
  return (
    <AbsoluteFill style={{ background: dark ? C.dark : C.bg, overflow: 'hidden' }}>
      {photo && s.photo && <Backdrop name={photo} {...s.photo} />}
      <LaneDashes opacity={dark ? 0.18 : 0.12} />
      {extra?.(s)}
      <div style={{ position: 'absolute', left: s.phone.left, top: s.phone.top }}>
        <Phone
          src={screen}
          width={s.phone.w}
          every={every}
          dark={dark}
          enterAt={2}
          tilt={s.phone.tilt ?? 0}
        />
      </div>
      <Headline
        lines={lines}
        dark={dark}
        size={s.size ?? (v ? u * 10.5 : u * 5.6)}
        sub={sub}
        subSize={v ? u * 4.4 : u * 1.9}
        startAt={3}
        style={{ position: 'absolute', ...s.head }}
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

// Lebar HP: portrait 62% lebar layar, landscape 43% tinggi layar.
const pw = (l: { width: number; height: number; v: boolean }) => (l.v ? l.width * 0.62 : l.height * 0.43);

/** A. Foto di atas memudar ke bawah, judul di bagian yang memudar, HP di bawah. Landscape: foto kanan memudar ke kiri. */
export const TodayScene = () => (
  <Feature
    lines={[
      ['Know', 'exactly'],
      ['what', 'to', { k: 'run' }, { k: 'today' }],
    ]}
    sub="Your plan, one screen, one tap to start."
    screen="today"
    photo="track-side"
    spec={(l) =>
      l.v
        ? {
            photo: {
              left: 0,
              top: 0,
              w: l.width,
              h: l.height * 0.46,
              fade: 'down',
              target: [l.width * 0.62, l.height * 0.2],
            },
            head: { left: l.u * 8, right: l.u * 8, top: l.height * 0.27 },
            phone: { left: (l.width - pw(l)) / 2, top: l.height * 0.56, w: pw(l) },
          }
        : {
            photo: {
              left: l.width * 0.42,
              top: 0,
              w: l.width * 0.58,
              h: l.height,
              fade: 'left',
              target: [l.width * 0.42, l.height * 0.5],
            },
            head: { left: l.u * 6, width: l.u * 36, top: l.height * 0.3 },
            phone: { left: l.width * 0.6 - pw(l) / 2, top: l.height * 0.13, w: pw(l), tilt: -3 },
          }
    }
  />
);

/** B. HP di kiri, foto tinggi di kanan memudar ke kiri. Landscape: foto melebar di bawah memudar ke atas, judul kanan atas. */
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
    spec={(l) =>
      l.v
        ? {
            photo: {
              left: l.width * 0.3,
              top: l.height * 0.26,
              w: l.width * 0.7,
              h: l.height * 0.74,
              fade: 'left',
              target: [l.width * 0.52, l.height * 0.3],
            },
            head: { left: l.u * 8, right: l.u * 8, top: l.height * 0.07 },
            phone: { left: l.width * 0.06, top: l.height * 0.4, w: l.width * 0.56, tilt: -4 },
          }
        : {
            photo: {
              left: 0,
              top: l.height * 0.35,
              w: l.width,
              h: l.height * 0.65,
              fade: 'up',
              target: [l.width * 0.78, l.height * 0.4],
            },
            head: { left: l.width * 0.42, width: l.u * 50, top: l.height * 0.12 },
            phone: { left: l.width * 0.08, top: l.height * 0.1, w: pw(l), tilt: -4 },
          }
    }
  />
);

/** C. Gelap tanpa foto: HP di tengah, cincin bunyi penanda. */
export const TimerScene: React.FC = () => (
  <Feature
    dark
    lines={[['Every', 'interval,'], [{ k: 'coached' }]]}
    sub="Target pace, sound cues and haptics."
    screen={Array.from({ length: 12 }, (_, i) => `timer-${String(i).padStart(2, '0')}`)}
    every={BEAT}
    spec={(l) =>
      l.v
        ? {
            head: { left: l.u * 8, right: l.u * 8, top: l.height * 0.08 },
            phone: { left: (l.width - pw(l)) / 2, top: l.height * 0.36, w: pw(l) },
          }
        : {
            head: { left: l.u * 6, width: l.u * 40, top: l.height * 0.3 },
            phone: { left: l.width * 0.64 - pw(l) / 2, top: l.height * 0.13, w: pw(l) },
          }
    }
    extra={(s) => (
      <CueRings x={s.phone.left + s.phone.w / 2} y={s.phone.top + s.phone.w * 0.62} r={s.phone.w * 0.46} />
    )}
  />
);

/** D. Foto penuh di belakang, digelapkan dan memudar ke atas; judul di area gelap. Landscape: foto kanan memudar ke kiri. */
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
    spec={(l) =>
      l.v
        ? {
            photo: {
              left: 0,
              top: l.height * 0.22,
              w: l.width,
              h: l.height * 0.78,
              fade: 'up',
              dim: 0.2,
              target: [l.width * 0.8, l.height * 0.38],
            },
            head: { left: l.u * 8, right: l.u * 8, top: l.height * 0.08 },
            phone: { left: l.width * 0.06, top: l.height * 0.4, w: pw(l) * 0.9, tilt: -3 },
          }
        : {
            photo: {
              left: l.width * 0.35,
              top: 0,
              w: l.width * 0.65,
              h: l.height,
              fade: 'left',
              dim: 0.2,
              target: [l.width * 0.16, l.height * 0.5],
            },
            head: { left: l.u * 6, width: l.u * 40, top: l.height * 0.3 },
            phone: { left: l.width * 0.82 - pw(l) / 2, top: l.height * 0.13, w: pw(l), tilt: 3 },
          }
    }
  />
);

/** E. Terbalik: HP di atas, judul di bawah; foto memudar dari pojok kanan. Landscape: HP kiri, judul kanan, foto pojok kanan bawah. */
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
    spec={(l) =>
      l.v
        ? {
            photo: {
              left: l.width * 0.35,
              top: 0,
              w: l.width * 0.65,
              h: l.height * 0.62,
              fade: 'radial',
              target: [l.width * 0.38, l.height * 0.3],
            },
            head: { left: l.u * 8, right: l.u * 8, top: l.height * 0.72 },
            phone: { left: l.width * 0.07, top: l.height * 0.06, w: l.width * 0.5, tilt: -3 },
          }
        : {
            photo: {
              left: l.width * 0.6,
              top: l.height * 0.3,
              w: l.width * 0.4,
              h: l.height * 0.7,
              fade: 'radial',
              target: [l.width * 0.22, l.height * 0.38],
            },
            head: { left: l.width * 0.42, width: l.u * 44, top: l.height * 0.14 },
            phone: { left: l.width * 0.1, top: l.height * 0.08, w: pw(l), tilt: -3 },
          }
    }
  />
);

/** F. Gelap, foto lebar di atas memudar ke gelap, judul putih menimpa bagian bawah foto; HP kanan bawah. */
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
    spec={(l) =>
      l.v
        ? {
            photo: {
              left: 0,
              top: 0,
              w: l.width,
              h: l.height * 0.5,
              fade: 'down',
              dim: 0.25,
              target: [l.width * 0.55, l.height * 0.2],
            },
            head: { left: l.u * 8, right: l.u * 8, top: l.height * 0.33 },
            phone: { left: l.width * 0.38, top: l.height * 0.56, w: l.width * 0.56, tilt: 4 },
          }
        : {
            photo: {
              left: 0,
              top: 0,
              w: l.width * 0.55,
              h: l.height,
              fade: 'right',
              dim: 0.35,
              target: [l.width * 0.25, l.height * 0.45],
            },
            head: { left: l.u * 6, width: l.u * 40, top: l.height * 0.55 },
            phone: { left: l.width * 0.7 - pw(l) / 2, top: l.height * 0.13, w: pw(l), tilt: 4 },
          }
    }
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
