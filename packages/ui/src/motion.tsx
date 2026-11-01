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

/** Skala awal elemen yang muncul (centang selesai). */
const POP_FROM = 0.4;

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
 * Menganimasikan angka menuju `target` (easing stride, `base`). Kembali ke nilai langsung jika
 * `animate` false atau reduce-motion aktif. Dipakai TrackRing.
 */
export function useAnimatedNumber(target: number, animate: boolean, from?: number): number {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(from ?? target);
  const value = useRef(new Animated.Value(from ?? target)).current;
  useEffect(() => {
    const id = value.addListener(({ value: v }) => setShown(v));
    return () => value.removeListener(id);
  }, [value]);
  useEffect(() => {
    if (!animate || reduced) {
      value.stopAnimation();
      value.setValue(target);
      setShown(target);
      return;
    }
    const a = Animated.timing(value, {
      toValue: target,
      duration: duration.base,
      easing: easing.stride,
      useNativeDriver: false,
    });
    a.start();
    return () => a.stop();
  }, [target, animate, reduced, value]);
  return shown;
}

/** Muncul dengan membesar + fade in saat dipasang (bib selesai + centang). Statis jika reduce-motion. */
export function PopIn({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduced) {
      v.setValue(1);
      return;
    }
    v.setValue(0);
    const a = Animated.timing(v, {
      toValue: 1,
      duration: duration.base,
      easing: easing.stride,
      useNativeDriver: true,
    });
    a.start();
    return () => a.stop();
  }, [reduced, v]);
  return (
    <Animated.View
      style={{
        opacity: v,
        transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [POP_FROM, 1] }) }],
      }}
    >
      {children}
    </Animated.View>
  );
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
