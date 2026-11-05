# Frame animasi gerakan (D8)

Dipakai `ExerciseAnimation` lewat `src/components/exerciseFrames.ts`. Satu set per gerakan: 15 sampai 16
file WebP transparan persegi `<exercise_id>-m-1.webp` ... `-16.webp` (`-m` = model pria; `-f` disiapkan
untuk model wanita), diputar bolak-balik (1 -> 16 -> 1) di web dan native.

| Aturan | Nilai |
|---|---|
| Sumber | Lembar ilustrasi 4x4 per gerakan (GPT Image 2.5 lewat EvoLink, 2K, latar transparan). Prompt: `docs/ANIMATION_PROMPTS.md` |
| Format | WebP dengan alpha, 420x420 px, kanvas sama untuk semua frame satu gerakan |
| Urutan | 1 = posisi awal, 16 = puncak gerakan. Gerakan balik tidak digambar |
| Latar di app | Tanpa kotak: frame transparan di atas warna layar (terang dan gelap). Outline gelap ilustrasi menjaga figur tetap terbaca di mode gelap |
| Tempo | `src/components/frameTiming.ts`: 100 ms per frame, awal ditahan 300 ms, puncak per gerakan (`PEAK_HOLD_MS`) |
| Privasi dan lisensi | Gambar statis di dalam app, tanpa data pengguna. Izin pemakaian gambar AI belum dikonfirmasi pemilik |

## Menambah atau mengganti gerakan

1. Generate lembar 4x4 dengan latar transparan (garis pemisah putih tipis boleh ada).
2. Potong dan luruskan titik tumpu:

```bash
python3 -I scripts/slice-keyframes.py lembar.png apps/app/assets/exercises <exercise_id>-m
```

Opsi yang dipakai untuk set sekarang (lembar lain mungkin butuh opsi berbeda):

| Gerakan | Opsi | Alasan |
|---|---|---|
| `bulgarian_split_squat` | `--anchor left` | Bangku di kiri jadi titik tetap |
| `step_up` | `--anchor right --drop 16` | Kotak di kanan; panel 16 digambar lebih kecil oleh generator |
| `single_leg_calf_raise` | `--anchor right` | Panel dinding di kanan |
| `copenhagen_plank` | `--anchor right` | Bangku di kanan |
| `dead_bug`, `bird_dog` | `--drop 16` | Panel 16 bergeser dari urutan |
| lainnya | (bawaan) | Titik tumpu tengah dan dasar sepatu |

Skrip membutuhkan Pillow dan numpy. Ia mendeteksi garis pemisah putih, membersihkan noise alpha dan garis
lantai tipis, mempertahankan figur dan properti besar, meluruskan titik tumpu, lalu menyimpan frame persegi.

3. Tambahkan daftar `require(...)` di `src/components/exerciseFrames.ts` dan lama tahan puncak di
   `PEAK_HOLD_MS` (`src/components/frameTiming.ts`).
4. Periksa frame di atas latar terang: figur dan properti tidak bergeser, tidak ada sisa garis putih.
