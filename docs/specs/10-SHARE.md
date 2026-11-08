# 10. Bagikan ke media sosial (F-29)

Status: v0.2 (2026-11-07), **diimplementasi (web diuji; native perlu HP)** | Fitur: F-29 | Layar: 2.7 (baru), 3.4, 2.5, 3.3, 3.1 | Kode: `apps/app/src/lib/shareCard.ts`, `lib/shareImage.ts`, `components/ShareCardView.tsx`, `app/share.tsx`

## Ringkasan

- **Gratis untuk semua** (keputusan pemilik 2026-11-07, menggantikan v0.1 "Premium"). Tidak lewat gerbang Premium.
- **Yang bisa dibagikan:** setiap latihan yang sudah selesai (3.4), ringkasan minggu (2.5), plan (3.1), pencapaian yang sudah didapat (3.3). Kartu latihan diberi sorotan otomatis untuk momen penting ("5K pertama!", "Lari terjauh di plan ini").
- **Kartu PNG 1080 x 1920 (9:16) dibuat di HP** lalu dikirim lewat lembar bagikan sistem (pilih Instagram Story atau WhatsApp Status). Tidak ada upload ke server, tidak ada library baru (react-native-svg + expo-sharing sudah terpasang).

## 1. Prinsip

| Prinsip | Aturan |
|---|---|
| Pengguna yang memilih | Tidak ada posting atau ajakan otomatis. Selalu lewat pratinjau 2.7 |
| Privasi dulu | Kartu dirender di HP dari data lokal. Builder kartu tidak menerima RPE, tag (panas, kurang tidur, pegal, nyeri), catatan, rasa beban, detak jantung, alasan jeda atau jawaban screening, jadi data itu tidak mungkin masuk gambar (diuji) |
| Nama opsional | `display_name` hanya tampil jika "Tampilkan nama" di 2.7 dinyalakan (bawaan mati, tidak disimpan) |
| Pace opsional | Kartu lari: "Tampilkan pace" (bawaan nyala, tidak disimpan) |
| Satu sumber teks | Semua teks kartu dari katalog `share.*` di `i18n/id.ts` + `en.ts`; angka lewat `format.ts`; bahasa ikut `profile.locale` |

## 2. Jenis kartu

| Jenis (`kind`) | Dari layar | Isi kartu | Sorotan |
|---|---|---|---|
| `activity` | 3.4 Detail aktivitas, ikon bagikan di atas (semua aktivitas: timer, manual, lari tambahan, strength/core) | Kicker "LATIHAN SELESAI", nama tipe, angka besar (lari: jarak; strength/core: menit; tanpa jarak: durasi), Durasi, Pace (opsional), Tanggal; konteks "Minggu n dari N · Menuju 10K"; ikon spot tipe | "5K pertama!" = aktivitas lari pertama >= 5 km. "Lari terjauh di plan ini" = jarak terjauh sejak plan mulai, minimal 3 lari di plan, yang pertama mencapai jarak itu |
| `week` | 2.5 Ringkasan minggu, tombol "Bagikan kartu ringkasan" (wireframe WeekDone) | Kicker "MINGGU n" / "MINGGU n TUNTAS", "x dari y latihan selesai" / "Semua latihan tuntas", jarak minggu, 7 bulatan hari (selesai, terlewat, akan datang, tanpa lari), Latihan, Waktu, Fase | Aksen hijau (sukses) bila semua tuntas |
| `plan` | 3.1 Plan, ikon bagikan di judul | Kicker "PLAN LATIHANKU", "Menuju 10K", nama + tanggal race, hari ke race (atau jumlah minggu), bar fase dengan minggu ini ditandai, Minggu, Hari/minggu, Volume puncak | - |
| `achievement` | 3.3 kartu Pencapaian, ketuk badge yang sudah didapat | Kicker "PENCAPAIAN BARU", ikon badge besar, nama badge (F-28), keterangan | - |

Tidak pernah ada di kartu: RPE, tag, catatan, rasa beban, detak jantung, adaptasi 2.5 (alasan engine), alasan jeda, lokasi.

## 3. Kartu

| Aspek | Aturan |
|---|---|
| Ukuran | PNG 1080 x 1920 px. Zona aman: 240 px atas dan 340 px bawah tanpa teks penting (UI Story/Status) |
| Warna | Dari token tema aktif (terang/gelap ikut perangkat, F-24); aksen = warna zona tipe latihan, sukses atau primer. Tanpa warna baru |
| Font | Bricolage Grotesque (judul, angka) + Plus Jakarta Sans, sama dengan app. Web: font disematkan sebagai data URL agar ikut saat dirender ke canvas |
| Tata letak | Kartu `surface` rx 56 di atas latar `bg` dengan 2 lingkaran aksen; pil kicker; isi tengah dipusatkan vertikal; statistik maks 3 kolom (ukuran angka menyesuaikan lebar); baris bawah konteks + logo "Run Coach" |
| Teks panjang | Judul maks 2 baris, keterangan maks 3 baris, dipotong di batas kata dengan elipsis |

## 4. Kanal dan teknik

| Platform | Cara kirim | Status |
|---|---|---|
| Web | SVG kartu -> canvas -> PNG. "Bagikan" = Web Share API dengan file bila didukung (browser HP), jika tidak diunduh. "Unduh gambar" selalu ada. PNG disiapkan saat 2.7 dibuka supaya share dipanggil langsung dari ketukan | Diuji E2E (unduh, ukuran PNG, 0 request ke luar) |
| iOS / Android | Pratinjau `react-native-svg` -> `Svg.toDataURL` 1080 x 1920 -> file sementara (`expo-file-system`, cache) -> `expo-sharing` | Ditulis, **belum diuji di HP** (B3) |
| Langsung ke Instagram Story | Ditunda | Butuh Facebook App ID + modul native; perlu persetujuan spec + perintah build |
| Langsung ke WhatsApp Status | Tidak direncanakan | Lewat lembar bagikan saja |

Perilaku lembar bagikan per app (opsi "Story" di Instagram, "Status saya" di WhatsApp) belum diverifikasi di perangkat. Alternatif bila `toDataURL` tidak andal di native: `react-native-view-shot` (library baru, perlu persetujuan spec).

## 5. Alur (FL-15)

1. Pengguna menekan ikon/tombol bagikan di 3.4, 2.5, 3.1 atau badge yang sudah didapat di 3.3.
2. 2.7: pratinjau kartu, sakelar "Tampilkan pace" (kartu lari) dan "Tampilkan nama" (jika nama diisi), "Bagikan", "Unduh gambar" (web), catatan privasi.
3. "Bagikan" -> lembar bagikan sistem. Batal = tetap di 2.7, tidak ada yang tersimpan. Berhasil / diunduh -> event `share_completed`.
4. Kembali -> layar asal.

## 6. Data, privasi, analitik

| Item | Aturan |
|---|---|
| Tabel / migrasi | Tidak ada |
| Server | Tidak ada. Gambar tidak pernah di-upload. Font dibaca dari aset app sendiri (origin yang sama) |
| Analitik | `share_completed` dengan `moment` (`activity`, `week`, `plan`, `achievement`) + `platform`. Tanpa jarak, pace, nama, target |
| File sementara (native) | `run-coach-<jenis>-<tanggal>.png` di cache app, ditimpa saat berbagi berikutnya |

## 7. Milestone

| # | Lingkup | Status |
|---|---|---|
| SH-1 | Gerbang Premium untuk bagikan | Dibatalkan 2026-11-07: bagikan gratis |
| SH-2 | Builder kartu murni + sorotan (`shareCard.ts`) | Selesai: unit `share-card.test.ts` |
| SH-3 | Render PNG web (canvas + font tersemat) dan native (`toDataURL`) | Web selesai (E2E); native perlu HP |
| SH-4 | Layar 2.7 + titik masuk 3.4, 2.5, 3.1, 3.3 | Selesai: E2E `share.spec.ts` |
| SH-5 | Uji HP: lembar bagikan ke Instagram Story + WhatsApp Status, iOS + Android | Belum (B3) |
| SH-6 | Langsung ke Instagram Story | Ditunda |
| SH-7 | Ajakan otomatis setelah momen penting (2.4 sesudah Simpan) | Belum direncanakan; butuh migrasi `app_meta.share_prompted` |

Wireframe 2.7 belum ada; tata letak direview lewat screenshot preview web (terang + gelap) sebagai gantinya.

## 8. Kriteria diterima

1. Setiap aktivitas di 3.4, ringkasan minggu 2.5, plan 3.1 dan badge yang sudah didapat di 3.3 bisa dibagikan; badge yang belum didapat tidak.
2. Teks kartu tidak pernah memuat RPE, tag, catatan, detak jantung, alasan jeda; nama hanya jika sakelar dinyalakan.
3. Tidak ada request ke luar origin app saat kartu dibuat dan dibagikan.
4. Tidak butuh Premium, login whitelist atau koneksi.
5. PNG 1080 x 1920, bahasa sesuai `profile.locale`, angka dengan satuan.

## 9. Keputusan terbuka

| ID | Pertanyaan | Default |
|---|---|---|
| SH-A | Bagikan Premium atau gratis | **Diputuskan 2026-11-07: gratis untuk semua** |
| SH-B | Pace di kartu lari tampil bawaan | Tampil, bisa dimatikan di 2.7 |
| SH-C | Gambar latar imagery di kartu | Tanpa gambar sampai lisensi B10 jelas |
| SH-D | Langsung ke Instagram Story | Ditunda sampai ada Facebook App ID + perintah build native |
| SH-E | Ajakan otomatis setelah momen penting (SH-7) | Tidak dulu; tombol manual saja |
