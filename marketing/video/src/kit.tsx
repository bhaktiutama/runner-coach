import React, { useEffect, useState } from 'react';
import {
  AbsoluteFill,
  Easing,
  Img,
  continueRender,
  delayRender,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

// Warna dari docs/design-system/tokens.json (palet Lintas).
export const C = {
  bg: '#F5F4F2',
  surface: '#FFFFFF',
  text: '#242C32',
  muted: '#5E6670',
  primary: '#F26B38',
  dark: '#1B2126',
  darkMuted: '#B9C0C6',
  mint: '#70D6B3',
  sand: '#F2C66D',
  lavender: '#A6B8FF',
  coral: '#FF806E',
};
export const FONT_D = 'RcDisplay';
export const FONT_U = 'RcUi';

/** Ritme pelari: 180 langkah / menit = 3 langkah / detik = 1 beat tiap 10 frame (30 fps). */
export const BEAT = 10;

export const Fonts: React.FC = () => {
  const [h] = useState(() => delayRender('fonts'));
  useEffect(() => {
    const faces = [
      new FontFace(FONT_D, `url(${staticFile('fonts/BricolageGrotesque_800ExtraBold.ttf')})`),
      new FontFace(FONT_U, `url(${staticFile('fonts/PlusJakartaSans_600SemiBold.ttf')})`, { weight: '600' }),
      new FontFace(FONT_U, `url(${staticFile('fonts/PlusJakartaSans_800ExtraBold.ttf')})`, { weight: '800' }),
    ];
    Promise.all(faces.map((f) => f.load())).then((fs) => {
      fs.forEach((f) => document.fonts.add(f));
      continueRender(h);
    });
  }, [h]);
  return null;
};

/** 0..1 di awal tiap beat, meluruh cepat: dipakai untuk "pantulan langkah". */
export const useStep = (offset = 0) => {
  const f = useCurrentFrame() + offset;
  const p = ((f % BEAT) + BEAT) % BEAT;
  return Math.exp(-p / 2.2);
};

export const pop = (frame: number, fps: number, at: number, damping = 11) =>
  spring({ frame: frame - at, fps, config: { damping, stiffness: 180, mass: 0.6 } });

/** Garis putus-putus lajur lintasan yang bergerak ke kiri, seperti pemandangan saat berlari. */
export const LaneDashes: React.FC<{ color?: string; opacity?: number; rows?: number }> = ({
  color = C.primary,
  opacity = 0.18,
  rows = 5,
}) => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const unit = width / 9;
  return (
    <AbsoluteFill style={{ opacity }}>
      {Array.from({ length: rows }).map((_, r) => {
        const y = (height / (rows + 1)) * (r + 1);
        const speed = 14 + r * 5;
        const shift = (f * speed) % (unit * 2);
        return Array.from({ length: 12 }).map((__, i) => (
          <div
            key={`${r}-${i}`}
            style={{
              position: 'absolute',
              top: y,
              left: i * unit * 2 - shift - unit,
              width: unit,
              height: width * 0.008,
              borderRadius: 99,
              background: color,
            }}
          />
        ));
      })}
    </AbsoluteFill>
  );
};

/** HP dengan layar app. `src` boleh array: berganti tiap `every` frame (rekaman frame demi frame). */
export const Phone: React.FC<{
  src: string | string[];
  width: number;
  every?: number;
  dark?: boolean;
  enterAt?: number;
  tilt?: number;
  style?: React.CSSProperties;
}> = ({ src, width, every = BEAT, dark, enterAt = 0, tilt = 0, style }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const list = Array.isArray(src) ? src : [src];
  const idx = Math.min(list.length - 1, Math.max(0, Math.floor((f - enterAt) / every)));
  const inP = pop(f, fps, enterAt, 13);
  const step = useStep();
  const y = interpolate(inP, [0, 1], [width * 1.4, 0]) - step * width * 0.018;
  const pad = width * 0.024;
  return (
    <div
      style={{
        width,
        padding: pad,
        borderRadius: width * 0.135,
        background: dark ? '#3A444C' : C.text,
        boxShadow: `0 ${width * 0.06}px ${width * 0.14}px rgba(20,26,30,${0.22 + step * 0.06})`,
        transform: `translateY(${y}px) rotate(${tilt * inP}deg)`,
        ...style,
      }}
    >
      <Img
        src={staticFile(`screens/${list[idx]}.png`)}
        style={{ display: 'block', width: '100%', borderRadius: width * 0.112 }}
      />
    </div>
  );
};

/** Ukuran asli dan titik fokus (posisi orang, 0..1) tiap foto hero, agar orangnya selalu terlihat. */
export const PHOTOS: Record<string, { w: number; h: number; fx: number; fy: number }> = {
  'road-sunrise-f': { w: 866, h: 887, fx: 0.76, fy: 0.55 },
  'road-sunrise-m': { w: 867, h: 887, fx: 0.85, fy: 0.6 },
  'riverside-city-f': { w: 866, h: 887, fx: 0.7, fy: 0.6 },
  'riverside-city-m': { w: 864, h: 887, fx: 0.73, fy: 0.55 },
  'track-back': { w: 527, h: 506, fx: 0.53, fy: 0.5 },
  'track-side': { w: 508, h: 506, fx: 0.45, fy: 0.5 },
  'track-overhead': { w: 504, h: 507, fx: 0.52, fy: 0.55 },
  'shoe-sole': { w: 502, h: 507, fx: 0.45, fy: 0.55 },
  'promo-privacy': { w: 659, h: 731, fx: 0.6, fy: 0.45 },
  'promo-companion': { w: 658, h: 731, fx: 0.45, fy: 0.5 },
  'promo-science': { w: 657, h: 731, fx: 0.25, fy: 0.5 },
};

/**
 * Foto hero dalam bentuk lintasan (stadion) dengan efek Ken Burns.
 * Titik fokus foto (orangnya) ditaruh di `target` (koordinat lokal kotak, bawaan = tengah),
 * misalnya tengah bagian yang tidak tertutup HP.
 */
export const PhotoStadium: React.FC<{
  name: string;
  w: number;
  h: number;
  enterAt?: number;
  from?: 'left' | 'right' | 'bottom';
  style?: React.CSSProperties;
  ring?: string;
  target?: [number, number];
}> = ({ name, w, h, enterAt = 0, from = 'right', style, ring = C.primary, target }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(f, fps, enterAt, 14);
  const dx = from === 'left' ? -w * 1.3 : from === 'right' ? w * 1.3 : 0;
  const dy = from === 'bottom' ? h * 1.3 : 0;
  const zoom = interpolate(f - enterAt, [0, 150], [1.08, 1.2], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  });
  const meta = PHOTOS[name] ?? { w: 1, h: 1, fx: 0.5, fy: 0.5 };
  const s = Math.max(w / meta.w, h / meta.h) * zoom;
  const rw = meta.w * s;
  const rh = meta.h * s;
  const [tx, ty] = target ?? [w / 2, h / 2];
  const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
  const left = clamp(tx - meta.fx * rw, w - rw, 0);
  const top = clamp(ty - meta.fy * rh, h - rh, 0);
  return (
    <div
      style={{
        position: 'absolute',
        width: w,
        height: h,
        borderRadius: Math.min(w, h) / 2,
        overflow: 'hidden',
        boxShadow: `0 0 0 ${Math.min(w, h) * 0.035}px ${ring}`,
        transform: `translate(${(1 - p) * dx}px, ${(1 - p) * dy}px)`,
        ...style,
      }}
    >
      <Img
        src={staticFile(`photos/${name}.webp`)}
        style={{ position: 'absolute', left, top, width: rw, height: rh, maxWidth: 'none' }}
      />
    </div>
  );
};

export type Word = string | { k: string };

/** Judul kinetik: tiap kata muncul tepat di beat berikutnya. Kata kunci: penanda oranye (terang) / teks oranye (gelap). */
export const Headline: React.FC<{
  lines: Word[][];
  size: number;
  dark?: boolean;
  startAt?: number;
  sub?: string;
  subSize?: number;
  style?: React.CSSProperties;
}> = ({ lines, size, dark, startAt = 0, sub, subSize, style }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  let n = 0;
  const total = lines.flat().length;
  const subP = pop(f, fps, startAt + total * (BEAT / 2) + BEAT, 16);
  return (
    <div style={{ ...style }}>
      {lines.map((line, li) => (
        <div key={li} style={{ display: 'flex', flexWrap: 'wrap', gap: `0 ${size * 0.24}px` }}>
          {line.map((w, wi) => {
            const at = startAt + n++ * (BEAT / 2);
            const p = pop(f, fps, at, 9);
            const key = typeof w !== 'string';
            const text = key ? w.k : w;
            const bar = interpolate(f - at - 4, [0, 8], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: Easing.out(Easing.cubic),
            });
            return (
              <span
                key={wi}
                style={{
                  position: 'relative',
                  display: 'inline-block',
                  fontFamily: FONT_D,
                  fontSize: size,
                  lineHeight: 1.04,
                  letterSpacing: -size * 0.025,
                  color: key && dark ? C.primary : dark ? C.bg : C.text,
                  opacity: p,
                  transform: `translateY(${(1 - p) * size * 0.5}px) scale(${0.7 + 0.3 * p})`,
                  transformOrigin: 'left bottom',
                }}
              >
                {key && !dark && (
                  <span
                    style={{
                      position: 'absolute',
                      left: -size * 0.06,
                      right: -size * 0.06,
                      bottom: size * 0.1,
                      height: size * 0.34,
                      background: C.primary,
                      transform: `scaleX(${bar})`,
                      transformOrigin: 'left',
                      borderRadius: size * 0.04,
                    }}
                  />
                )}
                <span style={{ position: 'relative' }}>{text}</span>
              </span>
            );
          })}
        </div>
      ))}
      {sub && (
        <div
          style={{
            marginTop: size * 0.32,
            fontFamily: FONT_U,
            fontWeight: 600,
            fontSize: subSize ?? size * 0.36,
            lineHeight: 1.3,
            color: dark ? C.darkMuted : C.muted,
            opacity: subP,
            transform: `translateY(${(1 - subP) * 30}px)`,
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
};

/** Sapuan diagonal oranye di awal adegan (transisi "langkah"). */
export const StrideWipe: React.FC<{ color?: string }> = ({ color = C.primary }) => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const x = interpolate(f, [0, 12], [-1.6, 1.6], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  if (f > 13) return null;
  const d = Math.hypot(width, height);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          left: width / 2 - d / 2 + x * d * 0.6,
          top: height / 2 - d,
          width: d * 0.42,
          height: d * 2,
          background: color,
          transform: 'rotate(18deg)',
        }}
      />
    </AbsoluteFill>
  );
};

/** Gelombang bunyi penanda: cincin melebar tiap 2 beat (visual, video tanpa suara). */
export const CueRings: React.FC<{ x: number; y: number; r: number }> = ({ x, y, r }) => {
  const f = useCurrentFrame();
  return (
    <>
      {[0, 1, 2].map((i) => {
        const t = ((f + i * 7) % (BEAT * 2)) / (BEAT * 2);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x - r * (1 + t),
              top: y - r * (1 + t),
              width: r * 2 * (1 + t),
              height: r * 2 * (1 + t),
              borderRadius: '50%',
              border: `${r * 0.05}px solid ${C.primary}`,
              opacity: (1 - t) * 0.7,
            }}
          />
        );
      })}
    </>
  );
};

/** Logo: oval lintasan tergambar, titik pelari masuk, lalu wordmark. */
export const LogoMark: React.FC<{ size: number; at?: number; dot?: string; track?: string }> = ({
  size,
  at = 0,
  dot = C.text,
  track = C.primary,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const draw = interpolate(f - at, [0, 18], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const d = pop(f, fps, at + 14, 8);
  return (
    <svg width={size} height={size} viewBox="0 0 64 64">
      <path
        d="M38 18H22a14 14 0 0 0 0 28h20a14 14 0 0 0 14-14"
        fill="none"
        stroke={track}
        strokeWidth={7}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={draw}
      />
      <circle cx={49.5} cy={19.5} r={5 * d} fill={dot} />
    </svg>
  );
};

export const Wordmark: React.FC<{ size: number; at?: number; color?: string }> = ({
  size,
  at = 0,
  color = C.text,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ display: 'flex', fontFamily: FONT_D, fontSize: size, letterSpacing: -size * 0.02, color }}>
      {'runco'.split('').map((ch, i) => {
        const p = pop(f, fps, at + i * 2, 9);
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              opacity: p,
              transform: `translateY(${(1 - p) * size * 0.6}px)`,
            }}
          >
            {ch}
          </span>
        );
      })}
    </div>
  );
};
