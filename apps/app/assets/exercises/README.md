# Video animasi gerakan (D8)

Dipakai `ExerciseAnimation` (web) lewat `src/components/exerciseVideos.web.ts`. Satu pasang file per
gerakan: `<exercise_id>.light.mp4` dan `<exercise_id>.dark.mp4`.

| Aturan | Nilai |
|---|---|
| Latar | Warna token `surfaceSunken`: terang `#EAE8E5`, gelap `#1D2328` (`packages/ui/src/tokens.ts`). Ganti kedua video jika token berubah |
| Ukuran | 400x624 (potret), H.264 main, yuv420p, BT.709, 24 fps, tanpa audio, `+faststart` |
| Durasi | Satu repetisi, awal = akhir (loop mulus) |
| Privasi | Hanya video hasil olahan yang masuk repo. Video sumber (latar hijau) tidak di-commit |

## Sumber squat

Dibuat dengan Seedance (prompt: tampak samping, kamera tetap, latar hijau rata), 640x640, 5,04 dtk.
Latar hijau terukur sekitar RGB (0, 185, 61). Subjek berada di x 210-571, y 20-609.
Lisensi dan izin pemakaian belum dikonfirmasi pemilik produk.

## Membuat pasangan terang/gelap

`SRC` = video sumber, `BG` = warna latar token (`0xEAE8E5` atau `0x1D2328`), `OUT` = nama file.

```bash
ffmpeg -i "$SRC" -f lavfi -i "color=c=$BG:s=400x624:r=24,format=rgb24" -filter_complex \
"[0:v]crop=400:624:190:8,format=rgba,chromakey=0x00B93D:0.16:0.08,despill=type=green:mix=0.6:expand=0.2[fg];\
[1:v][fg]overlay=shortest=1:format=gbrp,scale=in_range=full:out_range=tv:out_color_matrix=bt709:flags=accurate_rnd+full_chroma_int,format=yuv420p" \
-an -c:v libx264 -profile:v main -crf 20 -preset slow -movflags +faststart \
-colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv -r 24 "$OUT"
```

Nilai `crop` dan `chromakey` perlu disesuaikan per video. Selisih warna latar video terhadap token
terukur kurang dari 1 dari 255 di browser (Chromium). Periksa tepi rambut dan tangan dari halo hijau.
