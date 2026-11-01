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

/** Cara progres bergerak: `stride` (memantul, nilai bertambah), `linear` (timer), `none` (langsung). */
export type RingMotion = 'stride' | 'linear' | 'none';

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
export function useAnimatedNumber(target: number, mode: RingMotion, from?: number): number {
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
      duration: mode === 'linear' ? TICK_MS : duration.ring,
      // Mulai dari 0 (layar baru tampil): jeda sebentar supaya awal gerak terlihat setelah transisi layar.
      delay: from !== undefined ? duration.base : 0,
      easing: mode === 'linear' ? Easing.linear : easing.stride,
      useNativeDriver: false,
    });
    a.start();
    return () => a.stop();
  }, [target, mode, reduced, value]);
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
