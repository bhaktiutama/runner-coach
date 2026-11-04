#!/usr/bin/env python3
"""Memotong lembar keyframe 3x3 atau 4x4 (PNG/WebP transparan) menjadi 9 atau 16 frame seragam untuk ExerciseAnimation.

Langkah: deteksi garis pemisah, potong tiap sel, bersihkan noise alpha, ambil komponen terbesar (figur),
luruskan titik tumpu kaki (tengah sepatu + dasar sepatu) ke satu posisi, lalu simpan di kanvas yang sama
(gabungan semua pose + margin) supaya animasi tidak bergoyang.

Pemakaian: python3 -I scripts/slice-keyframes.py <lembar.webp> <folder-keluaran> <nama> [--size TINGGI_PX]
Hasil: <folder-keluaran>/<nama>-1.webp ... <nama>-9.webp (3x3) atau ... <nama>-16.webp (4x4)
Butuh: Pillow, numpy. Dokumentasi: apps/app/assets/exercises/README.md
"""
import sys
from collections import deque

import numpy as np
from PIL import Image, ImageFilter

PAD = 10  # margin (px) di sekeliling gabungan pose
SHOE_FRAC = 0.06  # bagian bawah figur yang dianggap sepatu
ALPHA_FLOOR = 24  # alpha di bawah ini dianggap noise


def groups(idx):
    out, start, prev = [], idx[0], idx[0]
    for x in idx[1:]:
        if x != prev + 1:
            out.append((start, prev))
            start = x
        prev = x
    out.append((start, prev))
    return out


def cells(alpha):
    """Rentang sel (x, y) di antara garis pemisah putih (alpha tinggi sepanjang sel)."""
    h, w = alpha.shape

    def spans(line, n):
        idx = [i for i in range(n) if line[i] > 0.9]
        gs = groups(idx) if idx else []
        # batas luar (garis tepi) tidak dihitung sebagai pemisah dalam
        inner = [g for g in gs if g[0] > 5 and g[1] < n - 5]
        edges = [0] + [v for g in inner for v in (g[0], g[1] + 1)] + [n]
        return [(edges[i], edges[i + 1]) for i in range(0, len(edges), 2)]

    xs = spans((alpha > 150).mean(0), w)
    ys = spans((alpha > 150).mean(1), h)
    return xs, ys


def largest_component(mask):
    h, w = mask.shape
    seen = np.zeros_like(mask, bool)
    best, best_n = None, 0
    for sy in range(h):
        for sx in range(w):
            if mask[sy, sx] and not seen[sy, sx]:
                q = deque([(sy, sx)])
                seen[sy, sx] = True
                pts = []
                while q:
                    y, x = q.popleft()
                    pts.append((y, x))
                    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                        ny, nx = y + dy, x + dx
                        if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not seen[ny, nx]:
                            seen[ny, nx] = True
                            q.append((ny, nx))
                if len(pts) > best_n:
                    best, best_n = pts, len(pts)
    out = np.zeros_like(mask, bool)
    for y, x in best:
        out[y, x] = True
    return out


def main():
    if len(sys.argv) < 4:
        sys.exit(__doc__)
    src, outdir, name = sys.argv[1:4]
    target_h = int(sys.argv[sys.argv.index("--size") + 1]) if "--size" in sys.argv else 420
    sheet = Image.open(src).convert("RGBA")
    arr = np.asarray(sheet)
    xs, ys = cells(arr[..., 3].astype(int))
    n = len(xs)
    if n != len(ys) or n not in (3, 4):
        sys.exit(f"Garis pemisah tidak terdeteksi: {len(xs)} kolom x {len(ys)} baris (butuh 3x3 atau 4x4)")

    frames = []  # (RGBA array, anchor_x, bottom_y)
    for r in range(n):
        for c in range(n):
            x0, x1 = xs[c][0] + 4, xs[c][1] - 4
            y0, y1 = ys[r][0] + 4, ys[r][1] - 4
            cell = arr[y0:y1, x0:x1].copy()
            alpha = cell[..., 3].astype(int)
            fig = largest_component(alpha > 100)
            keep = Image.fromarray((fig * 255).astype("uint8")).filter(ImageFilter.MaxFilter(7))
            keep = np.asarray(keep) > 0
            a = np.where(keep & (alpha >= ALPHA_FLOOR), alpha, 0).astype("uint8")
            cell[..., 3] = a
            cell[a == 0, :3] = 0
            ys_, xs_ = np.where(fig)
            top, bot = ys_.min(), ys_.max()
            shoe = fig[bot - int((bot - top) * SHOE_FRAC) : bot + 1]
            sx = np.where(shoe.any(0))[0]
            frames.append((cell, (sx.min() + sx.max()) / 2, bot))

    # kanvas gabungan, titik tumpu (tengah sepatu, dasar sepatu) di posisi yang sama
    left = max(ax for _, ax, _ in frames)
    right = max(c.shape[1] - ax for c, ax, _ in frames)
    up = max(b for _, _, b in frames)
    down = max(c.shape[0] - b for c, _, b in frames)
    W, H = int(left + right), int(up + down)
    boxes = []
    for cell, ax, bot in frames:
        canvas = np.zeros((H, W, 4), "uint8")
        ox, oy = int(round(left - ax)), int(round(up - bot))
        canvas[oy : oy + cell.shape[0], ox : ox + cell.shape[1]] = cell
        boxes.append(canvas)
    # pangkas ke gabungan figur + margin
    union = np.zeros((H, W), bool)
    for b in boxes:
        union |= b[..., 3] > 0
    yy, xx = np.where(union)
    t, bm = max(yy.min() - PAD, 0), min(yy.max() + PAD + 1, H)
    lf, rg = max(xx.min() - PAD, 0), min(xx.max() + PAD + 1, W)
    scale = target_h / (bm - t)
    size = (round((rg - lf) * scale), target_h)
    for i, b in enumerate(boxes, 1):
        img = Image.fromarray(b[t:bm, lf:rg]).resize(size, Image.LANCZOS)
        img.save(f"{outdir}/{name}-{i}.webp", quality=92, alpha_quality=100, method=6)
    print(f"{name}: {n * n} frame, {size[0]}x{size[1]} px, titik tumpu di x={int(left)}")


main()
