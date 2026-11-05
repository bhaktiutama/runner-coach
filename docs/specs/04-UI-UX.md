# 04. UI/UX Design Brief

Status: Draft v0.6 (2026-11-03) | Tata letak: [`docs/wireframes/`](../wireframes/README.md) | Tampilan: [`docs/design-system/`](../design-system/README.md)

## Ringkasan

- **Tata letak** mengikuti wireframe per nomor layar; wireframe v0.3 sudah memakai Lintas, jadi warnanya juga bisa dijadikan acuan. Nilai pasti tetap dari `docs/design-system/tokens.json`.
- Ciri khas: intensitas = skala panas, bentuk lintasan (stadium/oval), label bib, latar kertas hangat + tombol oranye bertulisan gelap.
- Mobile-first (390 x 844). Semua pasangan warna teks lolos WCAG, dicek otomatis.

## 1. Prinsip

1. Satu keputusan per layar; satu tombol primary (oranye) di bawah.
2. Angka besar, teks sedikit. Timer terbaca dari jarak lengan.
3. Warna = makna (zona, status), selalu disertai label teks.
4. Feedback 1 tap (RPE).
5. Sapaan "kamu", kalimat pendek. Semua teks dari katalog `id.ts`, bukan ditulis langsung di komponen (TRD 8).

## 2. Token

- Sumber tunggal: `docs/design-system/tokens.json` (format W3C Design Tokens). Di M1 file ini diubah otomatis jadi `packages/ui/tokens.ts`.
- **Tidak boleh ada hex atau ukuran lepas di komponen.** Butuh nilai baru = tambah token dulu.
- Perubahan warna wajib lolos `python3 docs/design-system/check_contrast.py` (saat ini 39/39 pasangan lolos).

Ringkasan isi (nilai lengkap di `tokens.json`):

| Grup | Isi |
|------|-----|
| Warna dasar | bg abu-abu hangat #F5F4F2, surface putih, text charcoal #242C32, primary oranye #F26B38 (teks di atasnya charcoal), accent peach #E9B79D, success hijau #467861 |
| Status plan | On track #70D6B3, Perhatian #F2C66D, Tertinggal #FF806E, Recovery #A6B8FF; masing-masing punya varian `-ink` untuk teks. Teks dan ikon **di atas** isian status (InfoBox, pesan 3.2, kotak adaptasi 2.5, kotak kembali 4.3, StatusChip) selalu `on-status` #242C32 di kedua tema; permukaan `surface` di dalamnya kembali ke `text`. Kode: `TextColorContext` di `packages/ui` (v0.9) |
| Zona (skala panas) | recovery lavender, easy peach, long #D9946F, tempo oranye, interval #B4361A, strength charcoal |
| Fase | base peach, build peach tua, peak oranye, taper lavender |
| RPE | 1-3 easy, 4-6 long, 7-8 tempo, 9-10 interval |
| Timer (gelap) | bg #161B1F, teks krem, interval memakai #E0522E |
| Mode gelap (F-24) | Ikut tema perangkat. Semantik sama, nilai dari `color.dark` + palet: bg #161B1F, surface #242C32, teks krem, `-ink` dicerahkan (primary #F58A5F, status = warna dasarnya), strength #3A444C, bayangan hitam. Isian zona/fase/RPE tidak berubah. Acuan `docs/wireframes/png/dark/`. Kode: `color` dan `themed()` di `packages/ui/src/theme.ts`; jangan simpan warna di konstanta modul |
| Tipe | Bricolage Grotesque (judul, angka, `tnum`), Plus Jakarta Sans (UI) |
| Bentuk | Radius kartu 24, stadium untuk tombol/chip, bib 6; bayangan keras 2 px (kartu). Tombol kaca (v0.9, meniru referensi liquid glass): isi rata tanpa gradasi dan tanpa bayangan keluar. Utama: tepi atas/kiri sedikit gelap (`scrim` 10-15%), tepi bawah/kanan sedikit terang (putih 20-40%), lembut 1-1,5 px. Sekunder: latar `surface-sunken` (gelap: `surface`), tepi putih/krem paling terang di bawah/kanan, garis luar 0,5 px. Ditekan: semua efek tepi hilang, tombol datar sejajar layar, tidak bergeser |
| Ukuran | Tombol primary 60, sekunder 48, input 52, area sentuh min 44 |
| Gerak | 120 / 200 / 320 ms (cincin, garis tren, angka naik 1000 ms); easing `stride` hanya untuk progres; detail di bagian 11 |

## 3. Komponen inti (`packages/ui`)

Anatomi, varian dan state lengkap: `docs/design-system/README.md` bagian 4.

| Komponen | Layar |
|----------|-------|
| OnboardingHeader (progress 6 lajur) | 1.2-1.7 |
| AuthButtons (Apple, Google, Email) + PrivacyNote | 1.1, 1.8, 1.9, 4.5 |
| ChoiceCard | 1.2 |
| Stepper | 1.5 |
| DayPicker | 1.6, 3.2 |
| InfoBox | 1.3, 1.6, 1.7 |
| BibTag + WorkoutCard | 2.1, 2.2, 3.1 |
| SegmentBar | 2.2 |
| TimerDisplay + TrackRing | 2.3 |
| DrillStep (nama gerakan, set, cue, tombol Lanjut) | 2.3b |
| RpePicker, TagChips | 2.4, 2.6, 4.3 |
| SettingsRow, Switch, DangerButton | 4.1, 4.5, 4.6 |
| LaneWeek | 2.1, 3.1 |
| StatusChip | 2.1, 2.5, 3.1 |
| PhaseBar | 1.8, 3.1 |
| BarChart, LineTrend, TrackRing | 1.8, 3.3 |
| PrimaryButton, SecondaryButton, SegmentedControl, TabBar | Semua |
| Icon (`name`, `size`, `color`) dari `assets/icons/icons.json` | Semua |
| Logo (mark / horizontal) | 1.1, web |

## 4. Aset

Semua di `docs/design-system/assets/` (detail: README di folder itu). Di M1 disalin ke app.

| Aset | Pakai |
|------|-------|
| Logo mark + wordmark "run coach" | 1.1, header web |
| `icon.png`, `adaptive-icon.png` (+ monochrome), `splash-icon.png`, `favicon.png` | `app.json`: icon, adaptiveIcon (latar #F26B38), splash (latar #F5F4F2), web.favicon |
| 40 ikon garis 24 px | Komponen Icon; tab bar: today, plan, progress, profile |
| Karakter animasi gerakan | Belum ada (D8). MVP pakai teks + SVG prototipe |

## 5. Layout & breakpoint

| Lebar | Layout |
|-------|--------|
| < 600 | HP: sesuai wireframe, tab bar bawah, padding 20 |
| 600-1023 | Tablet: tab bar bawah, konten maks 560 di tengah |
| >= 1024 | Web desktop: navigasi samping kiri, konten maks 640 di tengah |

## 6. Format angka

- Semua angka dan tanggal lewat modul `format.ts` dengan locale `id-ID` (TRD 8); jangan format manual di komponen.
- Pace `6:45 /km`, jarak `5,2 km` (koma desimal), durasi `38:45`, total `2j 21m`.
- Tanggal `Selasa, 27 Okt`; rentang prediksi `1:05 - 1:08`.
- Placeholder yang belum ada datanya ditulis `[NAMA]`, `[HARGA]`, tidak diisi angka karangan.

## 7. Ditunda

- Animasi karakter Rive untuk gerakan (D8). MVP drill memakai teks + animasi SVG sederhana dari prototipe jika siap.
- Kartu share. (Konfeti sudah masuk bagian 11.)

## 8b. Baris pengaturan di layar sempit (v0.9, 2026-11-04)

`SettingsRow`: label dan nilai dalam satu baris yang boleh membungkus. Jika keduanya tidak muat (iPhone SE / 13 mini, Ukuran Teks besar), nilai turun ke baris kedua di bawah label, rata kiri, sama seperti teks kedua baris Strength + core. Label tidak pernah dipotong menjadi 2 kolom sempit.

## 8a. Status hari di kalender 3.1 (v0.9, 2026-11-03)

| Status latihan | Tampilan baris |
|---|---|
| scheduled | Normal |
| completed | Lingkaran 24 px warna zona latihan berisi centang (`on-<zona>`), label aksesibilitas "Selesai"; sama dengan lajur selesai di 2.1 (`LaneWeek`) |
| missed / skipped | Nama latihan dicoret |
| Hari ini | Garis luar 2 px + tag HARI INI (bisa bersamaan dengan centang) |

## 8. Kesetiaan ke wireframe (v0.5, 2026-10-29)

- Ukuran pasti layar diambil dari sumber HTML wireframe (`docs/wireframes/source/*.dc.html`), bukan dari PNG. Skala tipe wireframe sudah masuk `tokens.json` (subtitle 15, label 13/700, control 14/600, control-sm 13, row 15/700, title 28/800, title-lg 32, stat 22/800, dst.).
- Garis kontrol memakai garis dalam (`ring()` di `packages/ui/src/theme.ts`, setara `inset box-shadow` wireframe), supaya isi tidak bergeser saat terpilih.
- Kontainer layar: padding atas min 56, samping 20, jarak antarblok 20 (24 untuk 1.2 dan 1.5), footer 12/20/32.
- Cek visual: `SHOTS_DIR=<folder> pnpm test:e2e e2e/compare.spec.ts` lalu `python3 scripts/compare-wireframes.py <folder>` (kiri wireframe, kanan app, @2x).
- Perbedaan yang disengaja: tautan "Isi otomatis dari Strava / Apple Health" (1.4) disembunyikan sampai fase 2 (PRD 5); lari terjauh punya pilihan "< 3 km" agar kriteria run-walk E-14 bisa terpenuhi.

## 9. Panduan dan hint (F-20, v0.6)

Belum ada wireframe; layar 4.7 memakai komponen yang sudah ada agar konsisten dengan 4.1 dan 4.5.

| Elemen | Aturan |
|---|---|
| Layar 4.7 | Header kembali + judul "Panduan & istilah" (pola 4.3). Grup berjudul `section-caps` (CARA KERJA PLAN, JENIS LARI, ISTILAH PENELITIAN, DASAR ILMIAH PLAN) berisi kartu lipat: judul `row`, isi `body-sm`. Topik dari hint terbuka otomatis dan digulir ke atas |
| Kartu aturan | Isi bahasa awam + pil tingkat bukti (sama dengan "Kenapa plan ini?") + "Lihat sumber" (tautan PubMed/DOI, dibuka di browser luar) |
| Hint (i) | Ikon `info` 18 px warna `text-muted` di samping label, area sentuh min 44 px, label aksesibilitas "Apa itu {istilah}?". Membuka 4.7 di topiknya. Tidak memakai popover agar sama di iOS, Android, web |
| Teks | Sapaan "kamu", tanpa singkatan tanpa penjelasan; angka contoh konkret (mis. "20 km -> paling banyak 22 km") |


## 10. Fase 2: strength, bahasa, Premium (v0.7, 2026-10-30)

Wireframe: `docs/wireframes/png/` layar 2.1s, 2.2s, 2.3s, 2.4s, 4.1, 4.4, 4.8, masing-masing versi ID dan EN (`-en`).

| Elemen | Aturan |
|---|---|
| Warna strength | `zone.strength` charcoal (DS3) + `on-strength`. Bib "STRENGTH"/"CORE", garis kiri kartu 8 px, penanda lajur "S" bulat charcoal di 2.1, `LaneMark` charcoal di 3.1 |
| Kartu strength 2.1 | Di bawah kartu lari (atau kartu Istirahat). Lebih ringkas: bib + jumlah gerakan, menit besar, 1 kalimat, "Mulai strength", "Lihat detail". Terkunci: tombol "Buka dengan Premium" |
| Tempat animasi | `ExerciseAnimation`: kotak `surface-sunken` (gelap: `dark.surface-sunken`) dengan garis putus-putus 2.5 px `line-strong`, ikon `strength` + "Animasi gerakan menyusul". Tinggi 120 (timer) / 88 (daftar 2.2s). Gerakan yang punya frame (semua 15): tanpa kotak dan tanpa warna latar sendiri (frame transparan langsung di atas warna layar, terang maupun gelap), area persegi lebar penuh maksimal 240, di tengah. Frame diputar bolak-balik (awal -> puncak -> awal; 100 ms per frame, awal ditahan 300 ms, puncak ditahan 0,4 sampai 2 dtk sesuai gerakan), label aksesibilitas "Animasi gerakan {nama}", reduce motion diam di frame puncak. Layar tidak berubah (D8) |
| 2.2s | Kartu per gerakan: tempat animasi, "n. Nama" + dosis (`3 x 8x / sisi`, `2 x 30 dtk`), cue `body-sm`, istirahat `caption`. Tanpa grafik intensitas dan tanpa pilihan panduan intensitas |
| 2.3s | Gelap seperti 2.3b. Bar atas: Akhiri, pil Otomatis/Manual, bisu (tanpa "Segmen x dari y"). Bar sesi (lajur per gerakan). Set: animasi, bib "Gerakan n/N", nama `drill-name`, "Set x dari y · dosis" `set`, lajur set, angka `numberXl` (hitung mundur saat berwaktu/otomatis, hitung naik saat manual) + bar progres set `primary`, cue, petunjuk mode. Istirahat: cincin `zone.recovery` + angka `timer` + kartu "Berikutnya" (animasi kecil, nama, set, dosis). Layar < 700 px: animasi di samping nama, angka istirahat `numberXl`. Footer: tombol utama (Selesai set / Lewati istirahat) + Jeda dan Lewati gerakan sebagai teks. Detail `09-VOICE.md` bagian 13 |
| 2.4 untuk strength | Tanpa kolom jarak dan pace. SegmentedControl "Bebannya terasa" (Terlalu berat / Pas / Terlalu ringan) di atas RPE |
| 4.8 Bahasa | Pola 4.3: tombol kembali, judul, subjudul, 3 `ChoiceCard` lebar dengan centang. Nama bahasa ditulis dalam bahasanya sendiri |
| 4.4 Premium | Kicker `status-caps` oranye, judul, kartu Gratis (centang hijau) dan kartu Premium (garis kiri oranye, ikon `premium`), 2 kartu harga (Tahunan terpilih default), catatan privasi `InfoBox info`, tombol "Coba gratis 14 hari" (fase 2 nonaktif) |
| Teks EN | Panjang teks EN rata-rata lebih pendek dari ID; tidak ada ukuran tetap baru. Pil/chip tetap `minHeight` + padding |

## 11. Gerak (v0.8, 2026-10-31)

Prototipe untuk melihat wujudnya: `docs/prototypes/motion-prototype.html`. Semua gerak memakai token `motion` (`fast` 120, `base` 200, `slow` 320 ms; easing `standard` dan `stride`), tanpa library baru (API `Animated` bawaan React Native + `react-native-svg`). Kode: `packages/ui/src/motion.tsx`.

| # | Gerak | Di mana | Aturan | Komponen |
|---|---|---|---|---|
| G1 | Busur TrackRing tumbuh ke nilai baru | Kepatuhan (3.3), minggu tuntas (2.5), timer (2.3) | Kepatuhan dan 2.5: `ring` 1000 ms + easing `stride` (sedikit memantul; busur dibatasi 0..100%), mulai dari 0 setelah jeda 200 ms setiap layar/tab terlihat. Timer 2.3: bergerak linear 1 detik per tick agar halus; pindah segmen (progres turun) langsung reset tanpa memutar balik. Posisi timer tetap dihitung dari timestamp | `TrackRing` (`motion`, `animateIn`) |
| G2 | Konfeti kecil, 16 potongan, warna palet | 2.5 hanya jika semua latihan minggu itu tuntas | Sekali putar saat layar tampil, `slow` 320 ms, memudar di akhir. Tata letak deterministik (tanpa acak) | `Confetti`, `confettiPieces` |
| G3 | (dibatalkan) Animasi centang "Selesai" di kartu latihan | | Kartu Selesai kembali statis seperti semula (keputusan pemilik produk 2026-11-01) | |
| G4 | Tombol ditekan | Semua tombol utama | Sudah ada: turun 2 px dan bayangan hilang (README design system, PrimaryButton). Tidak ditambah skala | `PrimaryButton` |
| G5 | Bunyi penanda + getar: pergantian segmen (naik = kerja, turun = istirahat), 3-2-1, peringatan, setengah jalan, ganti sisi, jeda/lanjut, selesai | Timer 2.3, 2.3b, 2.3s | `09-VOICE.md` bagian 5; bunyi dari `scripts/make-earcons.py`. Bisu = getar saja. Getar tidak ada di web | `playEarcon`, `earcons.ts` |
| G6 | Bib segmen dan kartu pace/rasa memudar masuk saat segmen berganti | Timer 2.3 | `base` + `standard`. Angka hitung mundur tidak dianimasikan (tidak berkedip tiap detik) | `FadeIn` |
| G7 | Batang volume tumbuh dari dasar bergantian (jeda 70 ms, `slow` + `stride`), angkanya naik dari 0; garis tren tergambar kiri ke kanan (`ring`, setelah jeda 320 ms) | Progres 3.3 (juga dipakai grafik 1.8 jika `animate`) | Diputar setiap tab Progres terlihat. Angka naik tanpa melewati nilai akhir (easing `standard`) | `BarChart` dan `LineTrend` (`animate`) |
| G8 | Tujuh lajur "Minggu ini" muncul membesar + fade in bergantian (jeda 80 ms, `base` + `stride`); angka km minggu ini naik dari 0 (`ring`) | Hari ini 2.1 | **Sekali per sesi app** (saat Today pertama terlihat), bukan setiap membuka tab | `LaneWeek` (`animate`), `useAnimatedNumber` |
| G9 | Tombol RPE terpilih membesar 0.9 ke 1.12 lalu 1 | 2.4, 2.6 | `base` + `fast`, `stride`. Tidak ada saat pilihan awal | `RpePicker` |
| G10 | Knob sakelar bergeser halus, bukan loncat | Semua `Switch` (mis. 4.1, 4.5) | `base` + `standard` | `Switch` |
| G11 | Angka hitung mundur 3-2-1 mengecil dari 1.5x sambil fade in; bunyi tick + getar ringan per angka | Timer 2.3 | `slow` + `standard`. Getar hanya di iOS/Android (`countdownTick`) | `ZoomIn`, `cues.ts` |

Aturan umum:
- **Kurangi gerakan**: semua G1, G2, G6 sampai G11 berhenti (nilai langsung ke akhir; konfeti tidak dirender). Dibaca dari setelan OS (web: `prefers-reduced-motion`) lewat `useReducedMotion`.
- Animasi tidak boleh menahan input dan tidak boleh mengubah posisi timer (posisi tetap dihitung dari timestamp, TRD 5).
- Durasi dan easing hanya dari token; tidak ada angka milidetik di komponen layar.
- Efek visual tren (kaca, kabut, aurora, grain, border bercahaya, clay) **belum** dipakai di app dan belum ada keputusan. Butuh `expo-blur` / `expo-glass-effect` untuk efek kaca (di luar TRD 1) dan cek kontras `check_contrast.py`. Eksplorasi hanya ada di prototipe.

### Dialog konfirmasi (v0.8)

Aksi yang merusak atau mengubah status (Keluar, Hapus data di HP, Pulihkan dari file, Ganti target di 4.1) memakai `ConfirmDialog` (`packages/ui`): dialog di tengah layar di atas semua isi, latar `overlay` yang bisa diketuk untuk batal, judul berupa pertanyaan, 1 kalimat penjelas, tombol konfirmasi (merah untuk aksi merusak), tombol Batal. Tidak boleh dirender di dalam isi yang bisa tergulir (pengguna tidak melihatnya). Satu dialog = satu keputusan: Keluar tidak menawarkan hapus data (menu Hapus data di HP sudah ada).

## 12. Gambar (imagery, v0.9, 2026-11-03)

Status: **draft**. Gambar dari `docs/design-system/assets/imagery/` (salinan app: `apps/app/assets/imagery/`, peta `apps/app/src/lib/imagery.ts`). Lisensi sumber belum diverifikasi: wajib jelas sebelum rilis toko. Gambar statis di dalam app, tidak diunduh, tidak berisi data pengguna.

| Komponen (`packages/ui`) | Isi | Dipakai |
|---|---|---|
| `ImageHero` | Gambar selebar layar di atas, tinggi `size.hero` 300 (1.1: `size.hero-tall` 480), scrim `color.scrim` 60% di 120 px teratas, memudar ke `bg` mulai 45% tinggi (ikut tema). Dekoratif, disembunyikan dari pembaca layar. `Screen` prop `hero` menggeser isi ke bawah gambar; `keepFirst` = tombol kembali/tutup tetap di atas gambar. Status bar terang | 1.1, 1.9, 2.4, 2.5, 2.6, 4.4 |
| `ImageHeader` | Header gambar `size.card-image` 150 di tepi atas `Card` (menembus padding 20); bib dan pil jarak (latar `surface`) di atasnya | 2.1 kartu latihan dan kartu istirahat, 3.3 kosong (tanpa bleed, radius `md`) |

Teks langsung di atas gambar memakai `color.on-image` (#FFF9F2, kedua tema) dan hanya di area scrim (logo 1.1, judul kecil 2.6).

| Layar / keadaan | Gambar |
|---|---|
| 1.1 Selamat datang (menggantikan tangga zona) | road-sunrise-m |
| 1.9 Masuk | riverside-city-f |
| 2.1 easy, recovery, run-walk | riverside-city-f / -m (bergantian per tanggal) |
| 2.1 tempo, progression | track-back |
| 2.1 interval | track-side |
| 2.1 strides | track-overhead |
| 2.1 long | road-sunrise-f / -m (bergantian per tanggal) |
| 2.1 istirahat (`RestCard`, garis kiri recovery dihapus) | track-aerial |
| 2.1 strength / core | Tanpa gambar (belum ada) |
| 2.4 Selesai | shoe-sole |
| 2.5 Ringkasan minggu | track-overhead |
| 2.6 Catat lari manual | pov-feet |
| 3.3 Belum ada aktivitas (kartu volume) | track-aerial |
| 4.4 Premium | riverside-city-m |

Wireframe: `docs/wireframes/png/imagery/` (+ `dark/`), canvas baris "5. Eksplorasi imagery".

## 13. Selamat datang 1.1: carousel (v0.9, 2026-11-04)

Menggantikan hero tunggal 1.1 (bagian 12). Hanya tampil saat belum ada plan (pertama kali / setelah hapus data).

| Bagian | Isi |
|---|---|
| Halaman | 3 halaman penuh, geser horizontal manual (tidak berganti otomatis), titik halaman bisa diketuk (tombol, label "Halaman n dari 3"), penanda `n/3` di kanan atas |
| Gambar | `promo-science`, `promo-privacy`, `promo-companion` (658 x 732, draft, lisensi B10) selebar layar, fokus horizontal per gambar agar pelari tidak terpotong, memudar ke `bg` antara 36% dan 66% tinggi (ikut tema terang/gelap) |
| Tetap di setiap halaman | Logo `on-image` di atas, lalu di bawah: titik halaman, "Buat plan saya", "Sudah punya akun? Masuk", catatan "Data latihanmu tersimpan di HP ini" |
| Teks (`welcome.s1..s3`, ID + EN) | 1 Ada dasarnya / Backed by science: "Latihan pintar, bukan asal capek." 2 Privasi / Private by default: "Data larimu, ya punyamu." 3 Teman Strava / Strava's sidekick: "Strava tetap jalan, kami yang atur menunya." Bahasa santai untuk pelari muda; tanpa klaim mencegah cedera dan tanpa janji sinkron Strava (fase 2) |
