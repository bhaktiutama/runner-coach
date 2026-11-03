# Frame animasi gerakan (D8)

Dipakai `ExerciseAnimation` lewat `src/components/exerciseFrames.ts`. Satu set per gerakan: 9 file WebP
transparan `<exercise_id>-1.webp` sampai `-9.webp`, berukuran sama, diputar bertahap (web dan native).

| Aturan | Nilai |
|---|---|
| Sumber | Lembar ilustrasi 3x3 (kamera, ukuran, dan posisi kaki identik di 9 panel). Prompt: `docs/ANIMATION_PROMPTS.md` |
| Format | WebP dengan alpha, 295x420 px (tinggi 420, kanvas sama untuk 9 frame) |
| Urutan | 1 = berdiri, 5 = titik terendah (ditahan), 9 = hampir berdiri agar putaran 9 -> 1 mulus |
| Latar di app | Selalu `surface-sunken` terang (ilustrasi digambar untuk latar terang) |
| Lama tiap frame | `src/components/frameTiming.ts` (satu repetisi sekitar 4,5 dtk) |
| Privasi dan lisensi | Gambar statis di dalam app, tanpa data pengguna. Izin pemakaian gambar AI belum dikonfirmasi pemilik |

## Menambah gerakan

1. Generate lembar 3x3 dengan latar transparan (garis pemisah putih tipis boleh ada).
2. Potong dan luruskan titik tumpu kaki:

```bash
python3 -I scripts/slice-keyframes.py lembar.webp apps/app/assets/exercises <exercise_id>
```

Skrip membutuhkan Pillow dan numpy. Ia mendeteksi garis pemisah, membersihkan noise alpha, mengambil figur
terbesar, menyamakan titik tumpu (tengah dan dasar sepatu), dan menyimpan 9 frame di kanvas yang sama.

3. Tambahkan entri di `src/components/exerciseFrames.ts` dan lama tiap frame di `frameTiming.ts`.
4. Periksa frame di atas latar terang: figur tidak bergeser, kaki di garis yang sama, tidak ada sisa garis putih.
