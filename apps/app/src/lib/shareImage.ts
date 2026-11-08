import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { CARD_FONTS, CARD_H, CARD_W } from './shareCard';

// Ubah kartu bagikan (F-29) jadi PNG dan buka lembar bagikan sistem. Semua di perangkat: tidak ada
// request ke luar (font dibaca dari aset app sendiri). Native: PNG dari `Svg.toDataURL` (ShareCardView).

export type ShareResult = 'shared' | 'downloaded' | 'cancelled' | 'failed';

let fontCssCache: Promise<string> | null = null;

function toBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

/**
 * Web: SVG yang dirender sebagai gambar tidak bisa memakai font halaman, jadi @font-face kartu disalin
 * dari style `expo-generated-fonts` (expo-font) dengan isi font sebagai data URL.
 */
export function webFontCss(): Promise<string> {
  if (fontCssCache) return fontCssCache;
  fontCssCache = (async () => {
    const el = document.getElementById('expo-generated-fonts') as HTMLStyleElement | null;
    const wanted = new Set<string>(Object.values(CARD_FONTS));
    const out: string[] = [];
    const seen = new Set<string>();
    for (const r of Array.from(el?.sheet?.cssRules ?? [])) {
      const css = r.cssText;
      const fam = css.match(/font-family:\s*["']?([^"';]+)["']?/)?.[1]?.trim();
      const url = css.match(/url\(["']?([^"')]+)["']?\)/)?.[1];
      if (!fam || !url || !wanted.has(fam) || seen.has(fam)) continue;
      seen.add(fam);
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        out.push(
          `@font-face{font-family:"${fam}";src:url(data:font/ttf;base64,${toBase64(await res.arrayBuffer())})}`,
        );
      } catch {
        // Font tidak terbaca: kartu memakai font cadangan browser.
      }
    }
    return out.join('');
  })();
  fontCssCache.catch(() => (fontCssCache = null));
  return fontCssCache;
}

/** Web: SVG -> PNG 1080 x 1920 lewat canvas. */
export async function webSvgToPng(svg: string): Promise<Blob> {
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  try {
    const img = new Image();
    img.width = CARD_W;
    img.height = CARD_H;
    await new Promise<void>((ok, fail) => {
      img.onload = () => ok();
      img.onerror = () => fail(new Error('svg_load'));
      img.src = url;
    });
    // Beberapa browser butuh satu frame agar font data URL di dalam SVG siap.
    await new Promise((r) => setTimeout(r, 50));
    const canvas = document.createElement('canvas');
    canvas.width = CARD_W;
    canvas.height = CARD_H;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('no_canvas');
    ctx.drawImage(img, 0, 0, CARD_W, CARD_H);
    return await new Promise<Blob>((ok, fail) =>
      canvas.toBlob((b) => (b ? ok(b) : fail(new Error('png'))), 'image/png'),
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function webDownload(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Web: Web Share API dengan file bila didukung (HP), jika tidak diunduh. */
export async function webSharePng(blob: Blob, name: string): Promise<ShareResult> {
  const file = new globalThis.File([blob], name, { type: 'image/png' });
  const nav = globalThis.navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  if (nav.share && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file] });
      return 'shared';
    } catch (e) {
      return (e as { name?: string })?.name === 'AbortError' ? 'cancelled' : 'failed';
    }
  }
  webDownload(blob, name);
  return 'downloaded';
}

/** Native: PNG base64 -> file sementara -> lembar bagikan (Instagram, WhatsApp, simpan gambar). */
export async function nativeSharePng(base64: string, name: string, title: string): Promise<ShareResult> {
  try {
    const f = new File(Paths.cache, name);
    if (f.exists) f.delete();
    f.create();
    f.write(base64, { encoding: 'base64' });
    if (!(await Sharing.isAvailableAsync())) return 'failed';
    await Sharing.shareAsync(f.uri, { mimeType: 'image/png', dialogTitle: title, UTI: 'public.png' });
    return 'shared';
  } catch {
    return 'failed';
  }
}

export const shareFileName = (kind: string, date: string) => `run-coach-${kind}-${date}.png`;
