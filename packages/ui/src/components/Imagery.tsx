import { useId, useState, type ReactNode } from 'react';
import {
  Image,
  StyleSheet,
  View,
  type ImageSourcePropType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { color, radius, size, space, themed } from '../theme';

/** Opasitas scrim atas (status bar + tombol kembali di atas gambar). */
const SCRIM_TOP_OPACITY = 0.6;
/** Bagian bawah hero mulai memudar ke `bg` dari titik ini (fraksi tinggi). */
const FADE_START = 0.45;

type Stops = { offset: number; color: string; opacity: number }[];

/** Gradien vertikal penuh area induknya (react-native-svg, tanpa library tambahan). */
function Gradient({ stops }: { stops: Stops }) {
  const id = `g${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <Svg
      style={StyleSheet.absoluteFill}
      width="100%"
      height="100%"
      viewBox="0 0 1 1"
      preserveAspectRatio="none"
    >
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          {stops.map((s) => (
            <Stop key={s.offset} offset={s.offset} stopColor={s.color} stopOpacity={s.opacity} />
          ))}
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="1" height="1" fill={`url(#${id})`} />
    </Svg>
  );
}

/**
 * Gambar hero di atas layar (UI/UX 12): selebar layar, scrim gelap di atas untuk status bar dan
 * tombol, lalu memudar ke `bg` sehingga ikut tema terang/gelap. Dekoratif (disembunyikan dari
 * pembaca layar). Diletakkan absolut di belakang isi; isi memberi jarak sendiri (lihat `Screen`).
 */
export function ImageHero({
  source,
  tall = false,
  height,
  fade = [FADE_START, 1],
  focus,
}: {
  source: ImageSourcePropType;
  tall?: boolean;
  /** Tinggi khusus (mis. layar penuh carousel 1.1); default `size.hero` / `size.hero-tall`. */
  height?: number;
  /** Awal dan akhir pudar ke `bg` (fraksi tinggi). */
  fade?: [number, number];
  /**
   * Titik fokus horizontal (0 kiri, 1 kanan) + rasio lebar/tinggi berkas. Tanpa ini gambar dipotong di
   * tengah; dengan ini subjek (pelari) tetap terlihat di layar sempit.
   */
  focus?: { x: number; aspect: number };
}) {
  const [boxW, setBoxW] = useState(0);
  const h = height ?? (tall ? size.heroTall : size.hero);
  let imgStyle: object = styles.fill;
  if (focus && boxW > 0) {
    const w = Math.max(boxW, h * focus.aspect);
    const left = Math.min(0, Math.max(boxW - w, boxW / 2 - w * focus.x));
    imgStyle = { position: 'absolute', top: 0, left, width: w, height: h };
  }
  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.hero, { height: h }]}
      onLayout={focus ? (e) => setBoxW(e.nativeEvent.layout.width) : undefined}
      testID="image-hero"
    >
      <Image source={source} style={imgStyle} resizeMode="cover" />
      <View style={styles.scrimTop}>
        <Gradient
          stops={[
            { offset: 0, color: color.scrim, opacity: SCRIM_TOP_OPACITY },
            { offset: 1, color: color.scrim, opacity: 0 },
          ]}
        />
      </View>
      <Gradient
        stops={[
          { offset: fade[0], color: color.bg, opacity: 0 },
          { offset: fade[1], color: color.bg, opacity: 1 },
        ]}
      />
    </View>
  );
}

/**
 * Header bergambar di dalam `Card` (2.1, 3.3): menempel ke tepi atas kartu (menembus padding 20),
 * anak (bib, chip) di atas gambar dengan latar sendiri.
 */
export function ImageHeader({
  source,
  children,
  style,
}: {
  source: ImageSourcePropType;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.header, style]} testID="image-header">
      <Image
        source={source}
        style={styles.fill}
        resizeMode="cover"
        accessibilityElementsHidden
        importantForAccessibility="no"
      />
      {children ? <View style={styles.headerRow}>{children}</View> : null}
    </View>
  );
}

const styles = themed(() =>
  StyleSheet.create({
    hero: { position: 'absolute', top: 0, left: 0, right: 0, overflow: 'hidden' },
    // Ukuran eksplisit: di web, Image tanpa width/height memakai ukuran asli berkas.
    fill: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
    scrimTop: { position: 'absolute', top: 0, left: 0, right: 0, height: space[10] * 3 },
    header: {
      height: size.cardImage,
      marginTop: -space[5],
      marginHorizontal: -space[5],
      borderTopLeftRadius: radius.lg,
      borderTopRightRadius: radius.lg,
      overflow: 'hidden',
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      padding: space[4],
    },
  }),
);
