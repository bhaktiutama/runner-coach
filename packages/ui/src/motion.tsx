import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, View } from 'react-native';
import { confettiPieces } from './confetti-layout';
import { border, color, motion, space } from './theme';

/** Durasi (ms) dan easing dari token `motion` (docs/design-system/tokens.json). */
export const duration = motion.duration;
export const easing = {
  standard: Easing.bezier(...motion.easing.standard),
  /** Sedikit memantul. Hanya untuk progres yang bertambah (design system aturan 5). */
  stride: Easing.bezier(...motion.easing.stride),
};

/** Interval pembaruan timer (1 detik): cincin timer bergerak linear selama selang ini agar tidak patah-patah. */
const TICK_MS = 1000;

/** Skala awal elemen yang muncul (lajur minggu, angka hitung mundur memakai kebalikannya). */
const SCALE_FROM = 0.4;
const ZOOM_FROM = 1.5;
/** Jeda antar elemen pada animasi berurutan (stagger). */
export const STAGGER_BAR = 70;
export const STAGGER_LANE = 80;

/** Cara angka bergerak: `stride` (memantul), `linear` (timer), `count` (naik tanpa melewati target), `none` (langsung). */
export type RingMotion = 'stride' | 'linear' | 'count' | 'none';

/** Setelan "kurangi gerakan" milik OS (web: prefers-reduced-motion). Semua animasi wajib berhenti jika true. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    let alive = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((v) => alive && setReduced(v));
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => {
      alive = false;
      sub.remove();
    };
  }, []);
  return reduced;
}

/**
 * Menganimasikan angka menuju `target`. `stride`: easing stride, `base`. `linear`: 1 detik tanpa
 * easing (timer). Langsung ke nilai jika `none` atau reduce-motion aktif. Dipakai TrackRing.
 */
export function useAnimatedNumber(
  target: number,
  mode: RingMotion,
  opts: { from?: number; delay?: number; durationMs?: number } = {},
): number {
  const { from, delay = 0, durationMs } = opts;
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(from ?? target);
  const value = useRef(new Animated.Value(from ?? target)).current;
  const last = useRef(from ?? target);
  useEffect(() => {
    const id = value.addListener(({ value: v }) => {
      last.current = v;
      setShown(v);
    });
    return () => value.removeListener(id);
  }, [value]);
  useEffect(() => {
    // Timer: pindah segmen mereset progres ke awal; jangan "memutar balik" selama 1 detik.
    if (mode === 'none' || reduced || (mode === 'linear' && target < last.current)) {
      value.stopAnimation();
      value.setValue(target);
      setShown(target);
      return;
    }
    const a = Animated.timing(value, {
      toValue: target,
      duration: durationMs ?? (mode === 'linear' ? TICK_MS : duration.ring),
      delay,
      easing: mode === 'linear' ? Easing.linear : mode === 'count' ? easing.standard : easing.stride,
      useNativeDriver: false,
    });
    a.start();
    return () => a.stop();
  }, [target, mode, reduced, value, delay, durationMs]);
  return shown;
}

/** Memudar masuk setiap kali `k` berubah (pergantian segmen timer). Render pertama langsung tampil. */
export function FadeIn({ k, children }: { k: string | number; children: ReactNode }) {
  const reduced = useReducedMotion();
  const v = useRef(new Animated.Value(1)).current;
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (reduced) return;
    v.setValue(0);
    const a = Animated.timing(v, {
      toValue: 1,
      duration: duration.base,
      easing: easing.standard,
      useNativeDriver: true,
    });
    a.start();
    return () => a.stop();
  }, [k, reduced, v]);
  return <Animated.View style={{ opacity: v }}>{children}</Animated.View>;
}

/**
 * Konfeti kecil sekali putar (durasi `slow`, hanya untuk perayaan minggu tuntas). Isi penuh induknya
 * (taruh di dalam View yang `position: relative`). Tidak dirender jika reduce-motion aktif.
 */
export function Confetti({ count = 16 }: { count?: number }) {
  const reduced = useReducedMotion();
  const pieces = useMemo(() => confettiPieces(count), [count]);
  // Dibaca saat render (bukan konstanta modul), sesuai aturan tema di theme.ts.
  const palette = [
    color.palette.orange,
    color.palette.lavender,
    color.palette.mint,
    color.palette.sand,
    color.palette.coral,
    color.palette.peach,
  ];
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduced) return;
    v.setValue(0);
    const a = Animated.timing(v, {
      toValue: 1,
      duration: duration.slow,
      easing: easing.standard,
      useNativeDriver: true,
    });
    a.start();
    return () => a.stop();
  }, [reduced, v]);
  if (reduced) return null;
  const opacity = v.interpolate({ inputRange: [0, 0.6, 1], outputRange: [1, 1, 0] });
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} testID="confetti">
      {pieces.map((p, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: space[2],
            height: space[3],
            borderRadius: border.selected,
            backgroundColor: palette[p.colorIndex],
            opacity,
            transform: [
              { translateX: v.interpolate({ inputRange: [0, 1], outputRange: [0, p.dx * space[1]] }) },
              { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, p.dy * space[1]] }) },
              { rotate: v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${p.rotate}deg`] }) },
            ],
          }}
        />
      ))}
    </View>
  );
}

/**
 * Nilai 0 ke 1 sekali saat komponen dipasang (stagger lewat `delay`). Langsung 1 jika `enabled` false
 * atau reduce-motion aktif.
 */
export function useEntrance({
  delay = 0,
  durationMs = duration.base,
  ease = easing.stride,
  enabled = true,
}: {
  delay?: number;
  durationMs?: number;
  ease?: (t: number) => number;
  enabled?: boolean;
} = {}): Animated.Value {
  const reduced = useReducedMotion();
  const skip = !enabled || reduced;
  const v = useRef(new Animated.Value(enabled ? 0 : 1)).current;
  useEffect(() => {
    if (skip) {
      v.setValue(1);
      return;
    }
    v.setValue(0);
    const a = Animated.timing(v, {
      toValue: 1,
      duration: durationMs,
      delay,
      easing: ease,
      useNativeDriver: true,
    });
    a.start();
    return () => a.stop();
  }, [skip, delay, durationMs, ease, v]);
  return v;
}

/** Muncul membesar + fade in, berurutan per `index` (lajur "Minggu ini"). */
export function ScaleIn({
  index = 0,
  enabled = true,
  children,
}: {
  index?: number;
  enabled?: boolean;
  children: ReactNode;
}) {
  const v = useEntrance({ delay: index * STAGGER_LANE, enabled });
  return (
    <Animated.View
      style={{
        opacity: v,
        transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [SCALE_FROM, 1] }) }],
      }}
    >
      {children}
    </Animated.View>
  );
}

/** Muncul mengecil dari besar + fade in saat dipasang; ganti `key` untuk memutar ulang (hitung mundur 3-2-1). */
export function ZoomIn({ children }: { children: ReactNode }) {
  const v = useEntrance({ durationMs: duration.slow, ease: easing.standard });
  return (
    <Animated.View
      style={{
        opacity: v,
        transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [ZOOM_FROM, 1] }) }],
      }}
    >
      {children}
    </Animated.View>
  );
}
