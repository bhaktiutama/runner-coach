# Aset Lintas

Logo, ikon app dan set ikon untuk Runner Coach. Semua warna dari `../tokens.json`.

## Isi

| Folder | File | Pakai di |
|---|---|---|
| `logo/` | `logo-mark.svg` (64x64), `-dark`, `-mono` | Header, onboarding 1.1, tempat sempit |
| `logo/` | `logo-horizontal.svg` (+ `-dark`, PNG 1200 px) | Layar sambutan, web, materi promosi |
| `logo/` | `wordmark.svg` | Teks logo tanpa mark |
| `app-icon/` | `icon.png` 1024x1024, RGB tanpa alpha | `expo.icon` (iOS + store) |
| `app-icon/` | `adaptive-icon.png` (foreground transparan, mark di zona aman 66%) | `android.adaptiveIcon.foregroundImage`, `backgroundColor: "#F26B38"` |
| `app-icon/` | `adaptive-monochrome.png` | `android.adaptiveIcon.monochromeImage` (ikon bertema Android 13+) |
| `app-icon/` | `splash-icon.png` (transparan, mark oranye) | `expo-splash-screen`, `backgroundColor: "#FFF9F2"` |
| `app-icon/` | `favicon.png` 48 px, `favicon.svg` | `web.favicon` |
| `icons/` | 40 ikon garis 24 px + `icons.json` | Semua UI; lihat daftar di bawah |
| `_build/` | `build.py`, `icons.py`, `render.js` | Membuat ulang semua file di atas |

## Logo

- **Mark**: lintasan lari (bentuk stadium, sama dengan TrackRing) yang terbuka di kanan atas, titik charcoal = pelari yang sedang keluar dari tikungan. Arti: progres yang terus berjalan.
- **Wordmark**: "runner coach" huruf kecil, Bricolage Grotesque 800, lebar 88, sudah diubah ke path (tidak butuh font terpasang).
- Warna: lintasan `primary` #F26B38, titik `text` #242C32 (versi gelap: titik `bg` #FFF9F2). Di ikon app, lintasan krem di atas oranye.
- Ukuran minimum mark: 20 px. Ruang kosong di sekeliling minimal setinggi titik.
- Jangan: memutar mark, mengganti warna di luar token, memberi efek bayangan/gradien, memisahkan titik dari lintasan.

## Ikon

Aturan sama dengan README design system: grid 24, garis 2 px, ujung dan sambungan bulat, `currentColor`. Ikon isi (play, pause, stop) hanya untuk kontrol timer.

| Grup | Ikon |
|---|---|
| Tab bar | today, plan, progress, profile (bentuk sama dengan wireframe) |
| Navigasi | back, chevron-right, close, plus, minus, more, settings |
| Timer | play, pause, stop, skip, lock, sound-on, sound-off |
| Data lari | timer, distance (oval lintasan), pace, heart, effort (RPE), drill, strength, location |
| Status | check, info, alert, injury, trophy, move |
| Akun & data | sync, link, share, trash, edit, bell, logout, premium |

Di app: `react-native-svg` + `icons.json` (nama ke isi SVG) dibungkus satu komponen `<Icon name size color />`.

## Membuat ulang

```bash
pip install fonttools
# Font: BricolageGrotesque[opsz,wdth,wght].ttf dari github.com/google/fonts (ofl/bricolagegrotesque), lisensi OFL
python3 _build/build.py <path-font.ttf> <folder-svg>
python3 _build/icons.py <folder-svg>/icons
node _build/render.js <folder-svg> <folder-png> app-icon.svg:icon.png:1024 ...
```

## Belum ada (butuh keputusan atau sumber)

| Aset | Status | Catatan |
|---|---|---|
| Karakter animasi latihan | Menunggu | Sumber yang diminta: polyfork.dev/characters. Situs belum bisa diakses dari container (domain belum diizinkan di network policy). Dari deskripsi publik, Polyfork berisi aset **3D low-poly** (GLB / ES module untuk three.js). Ini berbeda dengan `ANIMATION_PIPELINE.md` yang memakai **2D tampak samping + Rive**. Perlu keputusan sebelum dipakai, lihat bagian berikut |
| Lisensi aset Polyfork | Belum dicek | Wajib dibaca sebelum aset masuk repo (komersial? atribusi?) |
| Ilustrasi kosong / error / onboarding | Belum | Bisa dari karakter yang sama supaya konsisten |
| Badge pencapaian (minggu tuntas, rekor) | Belum | Bisa memakai mark + bib |
| Screenshot store, feature graphic | Fase rilis (M7) | Dibuat dari layar final |

### Karakter: 2D (Rive) atau 3D (Polyfork)?

| | 2D + Rive (rencana sekarang) | 3D Polyfork |
|---|---|---|
| Format di app | `.riv`, `rive-react-native` | GLB, butuh `expo-gl` + `@react-three/fiber/native` |
| Gerakan | Dari video pelatih (MediaPipe), sudah ada prototipe | Tergantung animasi yang disediakan; gerakan drill spesifik (A-skip, B-skip) belum tentu ada |
| Ukuran & performa | Ringan | Lebih berat, perlu uji di HP kelas menengah |
| Tampilan | Paling mudah dibaca untuk koreksi postur (tampak samping) | Bisa diputar, lebih "hidup" |

Rekomendasi sementara: tetap 2D untuk instruksi gerakan; Polyfork dipertimbangkan untuk ilustrasi dekoratif (layar sambutan, selesai latihan) setelah lisensi dan isi animasinya dicek.
