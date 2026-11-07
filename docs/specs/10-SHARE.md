# 10. Bagikan momen ke media sosial (plan fase 2)

Status: Draft v0.1 (2026-11-07), **plan, belum diimplementasi** kecuali gerbang Premium | Fitur: F-29 | Layar: 2.7 (baru), 2.4, 2.5, 3.3, 3.4, 1.8 | Gerbang: `08-MONETIZATION.md` bagian 2 dan 7

## Ringkasan

- **Hanya 6 momen yang bisa dibagikan**: plan dimulai, long run rekor, pencapaian (F-28), minggu tuntas beruntun 4/8/12, minggu race, plan tuntas. Lari easy, istirahat, sesi strength biasa dan semua data kesehatan tidak pernah jadi kartu.
- **Kartu dibuat di HP** (PNG 1080 x 1920, rasio 9:16 untuk Instagram Story dan WhatsApp Status), lalu dikirim lewat lembar bagikan sistem. Tidak ada upload ke server kita, tidak ada library baru di v1 (react-native-svg + expo-sharing sudah terpasang).
- **Bagikan = Premium** (keputusan pemilik 2026-11-07). Gerbang sudah ada di kode (`canShare`); pengguna whitelist mendapat akses tanpa bayar.

## 1. Prinsip

| Prinsip | Aturan |
|---|---|
| Selektif | Hanya momen di bagian 2. Ajakan otomatis (nudge) maksimal 1 per momen dan 1 per minggu; tombol manual hanya muncul di momen yang memenuhi syarat |
| Pengguna yang memilih | Tidak ada posting otomatis. Selalu ada pratinjau 2.7 sebelum lembar bagikan dibuka |
| Privasi dulu | Kartu dirender di HP dari data lokal. Tidak ada gambar/teks yang dikirim ke server kita, analitik atau Sentry. Tidak ada RPE, tag (panas, kurang tidur, nyeri), catatan, alasan jeda, detak jantung, jawaban screening |
| Nama opsional | `display_name` tidak tampil kecuali pengguna menyalakan "Tampilkan nama" di 2.7 (bawaan mati, tidak disimpan) |
| Satu sumber teks | Semua teks kartu lewat katalog `i18n/id.ts` + `i18n/en.ts`, angka lewat `format.ts` |

## 2. Momen yang bisa dibagikan

Semua dihitung dari data yang sudah ada di SQLite (tanpa tabel baru). Status "sudah diajak" disimpan sebagai daftar ID momen di `app_meta` (usulan migrasi, lihat bagian 6).

| ID | Momen | Syarat (dari data lokal) | Isi kartu | Dari layar | Kenapa layak dibagikan |
|---|---|---|---|---|---|
| S1 | Plan dimulai | Plan baru dibuat (1.8) | Target (mis. "Menuju 10K"), jumlah minggu, tanggal race bila ada, jumlah hari/minggu | 1.8 setelah masuk, 2.1 hari pertama | Komitmen publik; momen paling "plan" |
| S2 | Long run rekor | Aktivitas tipe `long` selesai dan jaraknya terjauh di plan ini (`planRecords().longest`) | Jarak, durasi, pace rata-rata (bisa disembunyikan), minggu ke-n | 2.4 sesudah Simpan, 3.4 | Jarak terjauh = pencapaian yang mudah dipahami orang lain |
| S3 | Pencapaian | Badge F-28 baru didapat: `first_5k`, `streak_4`, `plan_done` (`achievements()`) | Ikon badge + judul badge + tanggal | 2.4 sesudah Simpan, 3.3 kartu Pencapaian | Sudah dirancang sebagai badge |
| S4 | Minggu tuntas beruntun | `weekStreak().current` mencapai 4, 8 atau 12 | Jumlah minggu beruntun + lajur 6 minggu terakhir | 2.5 ringkasan minggu | Konsistensi, bukan kecepatan; ramah pemula |
| S5 | Minggu race | Hitung mundur race <= 7 hari (`countdownTo`) | Nama race (bila diisi), jarak, hari tersisa, total km plan sejauh ini | 2.1 kartu hitung mundur | Momen sosial (dukungan teman) |
| S6 | Plan tuntas / race selesai | Plan berakhir dan >= 80% lari selesai (sama dengan `plan_done`) | Total km, jumlah latihan selesai, jumlah minggu, waktu race bila dicatat | 2.4 latihan terakhir, 3.3 | Penutup cerita plan |

Tidak bisa dibagikan: lari easy/recovery/strides biasa, hari istirahat, sesi strength/core tunggal, adaptasi 2.5 (alasan engine), plan dijeda, aktivitas dengan tag `pain`.

## 3. Kartu

| Aspek | Aturan |
|---|---|
| Ukuran | PNG 1080 x 1920 px (9:16). Zona aman: 250 px atas dan 340 px bawah tanpa teks penting (tempat UI Story/Status) |
| Template | 1 tata letak per momen, varian terang dan gelap dari `tokens.json` (tanpa hex lepas). Gambar latar opsional dari library imagery (UI/UX 12) bila lisensi B10 beres |
| Angka | Font display + `tnum`, satuan selalu tertulis (km/mi, mnt, /km) |
| Merek | Logo + "Run Coach" kecil di bawah zona aman bawah. Tanpa link pelacakan |
| Bahasa | Mengikuti `profile.locale` |
| Kontras | Kombinasi warna baru wajib lolos `python3 docs/design-system/check_contrast.py` |

## 4. Kanal dan teknik

| Platform | Cara kirim v1 | Catatan |
|---|---|---|
| iOS / Android | Kartu digambar dengan `react-native-svg`, diekspor `Svg.toDataURL()` -> file PNG sementara (`expo-file-system`) -> `expo-sharing` (lembar bagikan sistem). Pengguna memilih Instagram (Story) atau WhatsApp (Status) | Tanpa library baru. File sementara dihapus setelah lembar bagikan ditutup |
| Web | SVG yang sama diserialisasi -> `canvas` -> Blob PNG -> `navigator.share({ files })` bila didukung, jika tidak: unduh PNG | Font harus disematkan (base64 `@font-face`) di SVG agar ikut ter-render di canvas |
| Langsung ke Instagram Story | Ditunda (v2) | Butuh Facebook App ID + modul native (pasteboard iOS, intent `com.instagram.share.ADD_TO_STORY` Android). Perlu persetujuan spec + build native |
| Langsung ke WhatsApp Status | Tidak direncanakan | Belum diketahui ada API publik untuk Status; lewat lembar bagikan saja. Perlu dicek di HP fisik |

Perilaku lembar bagikan per app (opsi "Story" di Instagram, "Status saya" di WhatsApp) belum diverifikasi di perangkat; masuk checklist uji HP (B3).

Alternatif bila `toDataURL` tidak andal di salah satu platform: `react-native-view-shot` (library baru, perlu persetujuan spec dulu).

## 5. Alur (usulan FL-15)

1. Momen terpenuhi (bagian 2) -> di layar asal muncul kartu ajakan kecil "Bagikan momen ini" (sekali per momen) atau tombol bagikan di badge/aktivitas yang memenuhi syarat.
2. Tap -> **gerbang Premium** (`canShare`): bukan Premium dan paywall aktif -> 4.4. Premium atau whitelist -> 2.7.
3. 2.7 Pratinjau: kartu, sakelar "Tampilkan pace" (S2) dan "Tampilkan nama" (bawaan mati), tombol "Bagikan" dan "Simpan gambar".
4. "Bagikan" -> lembar bagikan sistem. Batal = kembali ke 2.7, tidak ada yang tersimpan.
5. Tutup ajakan = momen ditandai sudah diajak; tetap bisa dibagikan manual dari 3.3 / 3.4.

## 6. Data, privasi, analitik

| Item | Usulan |
|---|---|
| Tabel baru | Tidak ada |
| Migrasi | v10: `app_meta.share_prompted` (json, daftar ID momen yang sudah diajak, mis. `["S1:<plan_id>","S4:8"]`). Tidak ikut file backup |
| Server | Tidak ada. Gambar tidak pernah di-upload |
| Analitik | Event baru `share_completed` dengan properti `moment` (S1..S6) + `platform`. Tanpa jarak, pace, nama, target. Ditambahkan ke `EVENTS` + test privasi saat implementasi |
| Sentry | Error render kartu dikirim tanpa isi kartu |

## 7. Milestone

| # | Lingkup | Test dari kriteria diterima | Verifikasi | Status |
|---|---|---|---|---|
| SH-0 | Spec: PRD F-29, App Flow FL-15 + layar 2.7, UI/UX kartu, Schema v10. Wireframe 2.7 + 6 kartu (ID + EN, terang + gelap) | `check_contrast.py` | Wireframe PNG direview pemilik | Belum |
| SH-1 | Gerbang Premium `canShare` + whitelist (bagian 08-7) | `canShare` flag mati/nyala, premium, whitelist | `pnpm test` | **Selesai 2026-11-07** |
| SH-2 | Deteksi momen (`lib/shareMoments.ts`, fungsi murni) | Tiap S1..S6 terpenuhi / tidak; momen tidak muncul 2x; aktivitas bertag `pain` tidak memicu S2 | `pnpm test` | Belum |
| SH-3 | Render kartu SVG + ekspor PNG (native `toDataURL`, web canvas) | Ukuran 1080 x 1920; tidak ada RPE/tag/catatan/HR di teks kartu (snapshot teks) | Screenshot kartu ID/EN terang/gelap | Belum |
| SH-4 | Layar 2.7 + titik masuk di 1.8, 2.1, 2.4, 2.5, 3.3, 3.4 | E2E: momen S2 -> 2.7 -> unduh PNG (web); bukan Premium -> 4.4 | E2E web | Belum |
| SH-5 | Uji HP: lembar bagikan ke Instagram Story + WhatsApp Status, iOS + Android | - | HP fisik (B3) | Belum |
| SH-6 (v2) | Langsung ke Instagram Story (Facebook App ID, modul native) | - | Build native | Ditunda, perlu perintah build |

## 8. Kriteria diterima (v1)

1. Hanya momen S1..S6 yang memunculkan ajakan atau tombol bagikan; aktivitas lain tidak punya tombol bagikan.
2. Ajakan otomatis tidak muncul 2x untuk momen yang sama dan maksimal 1x per minggu.
3. Teks kartu tidak pernah memuat RPE, tag, catatan, alasan jeda, detak jantung, jawaban screening; nama hanya jika sakelar dinyalakan.
4. Tidak ada request jaringan saat kartu dibuat dan dibagikan (E2E privasi: 0 request ke luar localhost).
5. Paywall aktif + bukan Premium -> 4.4; Premium atau whitelist -> 2.7. Paywall mati -> semua bisa membagikan.
6. Kartu 1080 x 1920 PNG, bahasa sesuai `profile.locale`, angka dengan satuan.

## 9. Keputusan terbuka

| ID | Pertanyaan | Default |
|---|---|---|
| SH-A | Bagikan sepenuhnya Premium, atau 1 momen gratis (mis. S1 plan dimulai) sebagai pemicu akuisisi | Sepenuhnya Premium (permintaan pemilik 2026-11-07). Catatan: kartu yang dibagikan juga iklan gratis untuk app, jadi mengunci semuanya bisa mengurangi pertumbuhan organik (inferensi, belum ada data) |
| SH-B | Pace di kartu S2 tampil bawaan atau disembunyikan | Tampil, bisa dimatikan di 2.7 |
| SH-C | Gambar latar imagery di kartu | Tanpa gambar sampai lisensi B10 jelas |
| SH-D | Langsung ke Instagram Story (v2) | Ditunda sampai ada Facebook App ID + perintah build native |
