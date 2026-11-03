# Imagery (draft, eksplorasi)

Status: **draft, belum masuk spec**. Belum dipakai di app. Sebelum dipakai, perlu perubahan spec (`04-UI-UX.md`, `design-system/README.md`) dan verifikasi lisensi.

- Sumber: 3 gambar referensi dari pemilik produk (2026-11-03), gaya ilustrasi digital semi-realis. **Lisensi dan asal gambar belum diverifikasi** (kemungkinan hasil AI generator); jangan rilis sebelum jelas.
- Proses: dipotong per panel (gutter putih dibuang), ukuran asli dipertahankan, disimpan WebP kualitas 82. Total sekitar 500 KB.
- Wireframe pemakaian: varian layar asli `docs/wireframes/source/IMG-*.dc.html` (dibuat `docs/wireframes/imagery.py`), PNG di `docs/wireframes/png/imagery/` (+ `dark/`).

| File | Ukuran (px) | Isi | Usulan pemakaian |
|---|---|---|---|
| `road-sunrise-f.webp` | 866x887 | Pelari perempuan, jalan gunung, matahari terbit | Splash in-app, slide onboarding, kartu long run |
| `road-sunrise-m.webp` | 867x887 | Pelari laki-laki, jalan gunung, matahari terbit | Hero 1.1, kartu long run |
| `riverside-city-f.webp` | 866x887 | Pelari perempuan, tepi sungai, kota | Header 1.9 Masuk, kartu easy |
| `riverside-city-m.webp` | 864x887 | Pelari laki-laki, tepi sungai, kota | Hero 4.4 Premium, kartu easy |
| `track-back.webp` | 527x506 | Pelari dari belakang di lintasan biru | Kartu tempo (2.1), slide onboarding |
| `track-side.webp` | 508x506 | Pelari dari samping, stadion | Kartu interval |
| `track-overhead.webp` | 504x507 | Pelari dari atas, bayangan pohon | Kartu drill, 2.5 Ringkasan minggu |
| `track-aerial.webp` | 508x507 | Lintasan merah dari udara | Empty state, hari istirahat |
| `shoe-sole.webp` | 502x507 | Sol sepatu dari bawah | 2.4 Selesai, pencapaian |
| `pov-feet.webp` | 482x506 | Sudut pandang kaki sendiri | 2.6 Catat lari manual, pemanasan |

## Batasan yang sudah diketahui

- **Resolusi**: panel terbesar 887 px tinggi. Untuk layar penuh HP (3x, sekitar 1170x2532 px) gambar akan buram. Aman untuk area setengah layar atas atau kartu. Splash/hero layar penuh butuh versi resolusi tinggi dari sumber yang sama.
- **Strength**: belum ada gambar; perlu satu gambar baru dengan gaya sama.
- **Teks di atas gambar** wajib memakai lapisan gelap (scrim); kontras belum diuji dengan `check_contrast.py` dan token scrim belum ada.
- **Mode gelap**: gambar sama, scrim memudar ke `bg` gelap; belum digambar.
