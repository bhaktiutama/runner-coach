import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { border, color, radius, themed } from '@run-coach/ui';
import { StyleSheet, View } from 'react-native';
import Svg, { parse } from 'react-native-svg';
import { CARD_H, CARD_W } from '@/lib/shareCard';

export type ShareCardHandle = {
  /** Native: PNG base64 ukuran penuh 1080 x 1920. */
  toPngBase64: () => Promise<string>;
};

/**
 * Pratinjau kartu bagikan 2.7 (F-29): SVG kartu yang sama dengan yang diekspor, diskalakan ke lebar
 * `width`. Ref ke elemen Svg dipakai untuk `toDataURL` di native.
 */
export const ShareCardView = forwardRef<ShareCardHandle, { xml: string; width: number; label: string }>(
  function ShareCardView({ xml, width, label }, ref) {
    const svgRef = useRef<Svg>(null);
    const ast = useMemo(() => parse(xml), [xml]);
    useImperativeHandle(ref, () => ({
      toPngBase64: () =>
        new Promise<string>((ok, fail) => {
          const svg = svgRef.current;
          if (!svg) return fail(new Error('no_svg'));
          svg.toDataURL((b64) => ok(b64), { width: CARD_W, height: CARD_H });
        }),
    }));
    const height = (width * CARD_H) / CARD_W;
    return (
      <View
        style={[styles.frame, { width, height }]}
        accessible
        accessibilityRole="image"
        accessibilityLabel={label}
        testID="share-preview"
      >
        <Svg ref={svgRef} width={width} height={height} viewBox={`0 0 ${CARD_W} ${CARD_H}`}>
          {ast?.children}
        </Svg>
      </View>
    );
  },
);

// Bingkai: latar kartu sama dengan latar layar, jadi pratinjau diberi sudut + garis agar terbaca sebagai gambar.
const styles = themed(() =>
  StyleSheet.create({
    frame: {
      borderRadius: radius.lg,
      overflow: 'hidden',
      backgroundColor: color.bg,
      borderWidth: border.hairline,
      borderColor: color.lineStrong,
    },
  }),
);
