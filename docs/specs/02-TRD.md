# 02. Technical Requirements Document (TRD)

Status: Draft v0.3 (2026-10-29) | Detail latar belakang: `docs/PLANNING.md` bagian 4, 5, 6

## Ringkasan

- Satu codebase **Expo (React Native) + TypeScript** untuk Web, iOS, Android.
- **Privasi dulu: semua data pribadi hanya disimpan di perangkat pengguna.** Supabase (cloud) hanya dipakai untuk login/sesi. Tidak ada tabel data pengguna di server.
- Logika plan ada di paket TypeScript murni `packages/training-engine` dan berjalan di perangkat. App berfungsi penuh tanpa internet, kecuali login dan hapus akun.

## 1. Stack (dikunci)

Agent tidak boleh mengganti atau menambah library di luar tabel ini tanpa update spec.

| Layer | Pilihan |
|-------|---------|
| App | Expo + Expo Router + TypeScript (strict) |
| Query data lokal + panggilan Edge Function | TanStack Query |
| State lokal UI | Zustand |
| Database lokal (satu-satunya tempat data pribadi) | expo-sqlite (web: penyimpanan browser via dukungan web expo-sqlite; cek di spike M0) |
| Penyimpanan rahasia | expo-secure-store (sesi login, token Strava di fase 2) |
| Validasi data | zod (tipe `steps`, input form, respons Edge Function) |
| Grafik | Berbasis react-native-svg (kandidat: Victory Native; final setelah spike M0) |
| Backend | Supabase **cloud**: Auth + Edge Functions (Deno). Tanpa tabel data pengguna |
| Notifikasi | Expo Notifications |
| Analitik | PostHog (lewat HTTP capture API, tanpa SDK; aktif hanya jika `EXPO_PUBLIC_POSTHOG_KEY` diisi; daftar properti di `apps/app/src/lib/analytics.ts`) |
| Error monitoring | Sentry (SDK dipasang saat DSN tersedia; `sendDefaultPii: false`) |
| Monorepo | pnpm workspaces |
| Test | Vitest (engine, logika), React Native Testing Library (komponen), Playwright (web E2E) |
| CI/CD | GitHub Actions + EAS Build/Submit |
| Fase 2 | Strava API, HealthKit, Health Connect |
| Fase 3 | RevenueCat (IAP), Stripe (web) |

Versi: pakai versi stabil terbaru saat setup, lalu kunci di `package.json` dan lockfile.

## 2. Arsitektur

```
Perangkat pengguna (semua data pribadi)          Supabase cloud (tanpa data pribadi)
apps/app (Expo)                                  Auth: akun + sesi login
  UI -> hook di src/data/                        functions/
     -> SQLite lokal (plan, latihan, RPE, ...)     delete-account
     -> training-engine (plan, adaptasi)           strava-token (fase 2, tanpa simpan)
     -> secure-store (sesi, token)
     -> file backup (export / import)
packages/
  training-engine  (TS murni, tanpa dependency React/Supabase)
  ui               (komponen + design token)
```

Aturan:

1. `training-engine` tidak boleh import React, Expo, atau Supabase.
2. Komponen UI tidak memanggil Supabase langsung; lewat hook di `apps/app/src/data/`.
3. Semua satuan disimpan dalam **meter** dan **detik**. Konversi km/mi dan pace hanya di layer UI.
4. **Tidak ada data pribadi yang dikirim ke server kita.** Data pribadi = semua isi SQLite lokal: profil, target, plan, aktivitas, RPE, catatan, jawaban kesehatan, jeda/cedera. Yang boleh ke Supabase hanya data Auth (bagian 3.2).
5. Fitur baru yang butuh data pribadi di server wajib lewat perubahan spec + persetujuan eksplisit pengguna (opt-in), tidak boleh diam-diam.

## 3. Data lokal & privasi

### 3.1 Penyimpanan

| Aturan | Nilai |
|--------|-------|
| Tempat data pribadi | Hanya SQLite di perangkat. Skema: `05-BACKEND-SCHEMA.md` bagian 2 |
| Sinkron ke server | **Tidak ada.** Tidak ada antrian sinkron, tidak ada tabel server |
| ID baris | UUID dibuat di perangkat |
| Hapus | Hapus langsung (hard delete); tidak perlu soft delete karena tidak ada sinkron |
| Migrasi skema lokal | Script migrasi berurutan di app, versi di `PRAGMA user_version`. Wajib diuji naik dari versi sebelumnya tanpa kehilangan data |
| Enkripsi | Mengandalkan enkripsi bawaan OS (iOS Data Protection, enkripsi berbasis file Android). Database terenkripsi tambahan (SQLCipher) tidak di MVP |
| Web | Data di penyimpanan browser. Minta `navigator.storage.persist()`. Tampilkan peringatan: menghapus data browser = data hilang, sarankan backup |

### 3.2 Yang ada di Supabase

| Data | Alasan |
|------|--------|
| `auth.users`: id, email (Email/Apple/Google), provider, waktu dibuat/login terakhir | Dibutuhkan untuk login. Dikelola Supabase Auth |
| Sesi (access + refresh token) | Disimpan di perangkat lewat `expo-secure-store` (web: penyimpanan browser) |

Tidak ada: nama tampilan, target, plan, aktivitas, RPE, data kesehatan, lokasi. Nama dari provider login tidak disalin ke tabel apa pun.

### 3.3 Pindah HP dan backup (F-13, F-18)

Karena tidak ada sinkron, data hanya berpindah lewat file milik pengguna:

| Cara | Detail |
|------|--------|
| Backup ke file | Export semua tabel lokal ke 1 file JSON (`run-coach-backup-YYYY-MM-DD.json`) berisi `schema_version`. Dibagikan lewat share sheet (simpan ke Files/Drive/email milik pengguna) |
| Pulihkan dari file | Import file backup: validasi zod + `schema_version`, tampilkan ringkasan (target, jumlah aktivitas), konfirmasi, lalu ganti data lokal |
| Backup OS | iOS: data app ikut backup iCloud/komputer bila diaktifkan pengguna. Android: Auto Backup. Perilaku pasti dicek di spike M0 dan tidak dijanjikan di UI |
| Pengingat backup | Di Profil: "Backup terakhir: X hari lalu". Setelah 30 hari tanpa backup, tampilkan pengingat 1x (bisa dimatikan) |

### 3.4 Login dan perangkat

| Kasus | Perilaku |
|-------|----------|
| Sebelum login | Onboarding dan plan dibuat lokal; login diminta di 1.8 |
| Login di perangkat yang sudah punya data | Data tetap; ditandai milik `auth.uid()` ini (kolom `owner_id` di `app_meta`) |
| Login di perangkat baru (data kosong) | Tawarkan "Pulihkan dari file backup" atau "Buat plan baru" |
| Login akun lain di perangkat yang sudah ada data milik akun lain | Wajib pilih: backup dulu lalu hapus data lokal, atau batal |
| Logout | Data lokal tetap (ini data perangkat). Ada opsi "Keluar dan hapus data di HP ini" |
| Sesi kedaluwarsa / offline | App tetap jalan penuh; login ulang hanya diminta untuk aksi akun |

## 4. Training engine

### 4.1 Rumus

| Kebutuhan | Metode |
|-----------|--------|
| Prediksi waktu antar jarak (E-01) | Riegel: `T2 = T1 x (D2 / D1)^1.06`, tampilkan sebagai rentang: 5K-HM `T x 0,97` s.d. `T x 1,03`; FM `T` s.d. `T + 20 mnt` (paling mungkin `T + 10 mnt`). Dasar: 07 E-O1 |
| Zona pace (E-02) | Kerangka Jack Daniels (Easy, Marathon, Threshold, Interval, Repetition), implementasi dari Daniels' Running Formula edisi 4 + unit test |

### 4.2 Aturan wajib (diuji otomatis)

Tingkat bukti, referensi dan putusan tiap aturan: `07-ENGINE-EVIDENCE.md` (kolom ID). Aturan tingkat D adalah heuristik coaching; semua wajib direview pelatih (D6).

| ID | Aturan | Nilai default |
|----|--------|---------------|
| E-03 | Durasi plan | 5K: 8 mgg, 10K: 10 mgg, HM: 12 mgg, FM: 16-18 mgg, Bugar: blok 8 mgg berulang (O2) |
| E-04 | Fase | Base -> Build -> Peak -> Taper (Bugar: tanpa Taper) |
| E-05 | Kenaikan volume mingguan | Maks 10% dari minggu non-cutback terakhir (batas konservatif; tidak diklaim mencegah cedera) |
| E-14 | Run-walk | Level `beginner` + lari terjauh 4 minggu < 3 km. Blok lari naik tiap minggu; jadi lari kontinu setelah blok lari 20 mnt (07 E-O2) |
| E-06 | Jarak satu sesi | Maks 110% dari lari terjauh 30 hari terakhir (awal: `goals.longest_run_m`) |
| E-07 | Cutback week | Tiap minggu ke-3 atau ke-4, volume turun 20-30% |
| E-08 | Long run | Maks 30% volume mingguan, di hari long run pilihan pengguna. Berlaku bersama E-06; yang lebih ketat menang |
| E-09 | Intensitas | ~80% easy |
| E-10 | Sesi berat | Maks 2 per minggu, pemula 0-1, tidak boleh di 2 hari berurutan |
| E-11 | Taper | 5K/10K: 1 mgg, HM: 1-2 mgg, FM: 2-3 mgg. Volume turun 40-60% dari minggu puncak; intensitas dan jumlah sesi kualitas dipertahankan |
| E-12 | Screening "Ya" (O3) | Mode ringan: tanpa sesi berat sampai diubah pengguna |
| E-13 | Setelah jeda plan | 1 minggu Return to run: volume rendah, tanpa sesi berat |
| E-15 | ABC drill (F-17) | Segmen drill 8-12 mnt ditempel setelah pemanasan easy, sebelum bagian kerja Tempo/Interval. Daftar gerakan MVP = data statis di `training-engine` (tanpa tabel DB) |

### 4.3 Adaptasi (F-11, layar 2.5)

Dihitung engine di akhir minggu, ditampilkan sebagai **usulan**; plan baru berubah setelah pengguna menekan "Oke, terapkan".

| ID | Kondisi | Usulan |
|----|---------|--------|
| E-17 | RPE >= 8 pada easy run 2x berturut-turut | Volume minggu depan turun ~10%, 1 sesi berat diganti easy |
| E-18 | RPE <= 4 pada sesi kualitas 3x berturut-turut | Target pace sesi kualitas naik 1 tingkat, atau tawarkan time trial (E-20) |
| E-19 | 1 latihan terlewat | Tidak diganti; lanjut plan |
| E-19 | >= 2 latihan terlewat dalam seminggu | Ulangi minggu tersebut (volume tidak dinaikkan) |
| E-13 | Tidak lari >= 10 hari | Tawarkan 1 minggu Return to run |
| E-20 | Waktu race / time trial baru | Hitung ulang zona pace dan prediksi |

Sumber: PLANNING 4.5; bukti per aturan di `07-ENGINE-EVIDENCE.md` 2.4. `plan_adjustments.rule` berisi ID di kolom pertama.

### 4.4 Reasoning (rationale)

Setiap keputusan engine (plan, latihan, usulan adaptasi) mengembalikan daftar `rationale` `{rule, values}` yang merujuk ID aturan di atas. Teks, tingkat bukti dan referensi diambil dari registri statis di `training-engine` (tanpa tabel DB) dan ditampilkan di 1.8, 2.2, 2.5, 3.2. Format, template teks dan test wajib: `07-ENGINE-EVIDENCE.md` bagian 3. Aturan baru tanpa entri registri = test gagal.

## 5. Batasan platform

| Batasan | Solusi |
|---------|--------|
| iOS membatasi eksekusi di background | Timer pakai timestamp absolut + notifikasi lokal terjadwal per pergantian segmen |
| Web: timer hanya andal saat tab aktif | Wake Lock API jika tersedia + peringatan ke pengguna |
| HealthKit butuh kode native | Expo dev build (bukan Expo Go); tidak tersedia di web |
| Strava API | Kapasitas atlet awal terbatas, rate limit, larangan pakai data untuk training AI/ML. Verifikasi ulang syarat terbaru sebelum fase 2. Karena tanpa server data: token disimpan di perangkat, aktivitas diambil perangkat saat app dibuka (tanpa webhook) |
| Data hanya di perangkat | HP hilang/rusak tanpa backup = data hilang. Mitigasi: backup ke file + pengingat (3.3). Dijelaskan jujur di 1.8 dan 4.5 |

## 6. Keamanan & privasi

1. **Data pribadi hanya di perangkat** (bagian 2 aturan 4 dan bagian 3). Server tidak punya tabel data pengguna.
2. Jika kelak ada tabel di schema `public` (mis. data referensi gerakan), RLS wajib aktif dan tabel itu tidak boleh berisi data pribadi.
3. Service role key hanya di Edge Function (disediakan otomatis oleh Supabase), tidak pernah di app atau repo.
4. Token Strava (fase 2) disimpan di `expo-secure-store` perangkat. Edge Function `strava-token` hanya menukar/memperbarui token memakai client secret dan **tidak menyimpan apa pun**.
5. Analitik (PostHog) dan error (Sentry) tanpa data pribadi: tanpa email/nama, tanpa nilai kesehatan (RPE, tag, alasan jeda, jawaban screening), IP tidak disimpan, Sentry `sendDefaultPii: false`. Event hanya nama + properti teknis (mis. `target_type`, `platform`). Ada sakelar "Kirim data pemakaian anonim" di 4.5 (default aktif, perlu dicek ulang terhadap UU PDP sebelum rilis).
6. Izin data kesehatan (HealthKit, Health Connect) diminta seminimal mungkin dan hanya saat fitur dipakai; datanya tetap di perangkat.
7. Data tidak dipakai untuk iklan dan tidak dijual.
8. Wajib: hapus akun (F-10) menghapus akun Auth di server **dan** semua data lokal; backup/export (F-13). Pemetaan ke UU PDP (UU No. 27/2022) dicek sebelum rilis publik.
9. Secrets: `.env` lokal (di-gitignore), environment secrets session cloud, GitHub Actions / EAS secrets. Tidak pernah di repo atau chat.

### 6.1 Konfigurasi Supabase cloud

| Variabel | Isi | Di mana |
|----------|-----|---------|
| `EXPO_PUBLIC_SUPABASE_URL` | URL project (`https://<ref>.supabase.co`) | `.env`, EAS, environment session |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Anon / publishable key (aman di app karena tidak ada tabel yang bisa dibaca) | `.env`, EAS, environment session |
| `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF` | Untuk `supabase functions deploy` dari CI/session | GitHub Actions, environment session |

Service role key **tidak** perlu diberikan ke repo, CI, atau session; Edge Function sudah mendapatkannya dari Supabase. Session cloud perlu izin jaringan ke `*.supabase.co` dan `api.supabase.com`.

## 7. Target non-fungsional (usulan, belum diukur)

| Area | Target |
|------|--------|
| Cue timer | Telat maks 1 detik dari jadwal saat app aktif |
| Offline | Semua fitur jalan tanpa internet kecuali login dan hapus akun |
| Privasi | 0 baris data pribadi di server; dicek dengan test: tidak ada tabel di schema `public` kecuali yang disetujui di spec |
| Aksesibilitas | Kontras teks min 4.5:1, area sentuh min 44 x 44 (sesuai wireframe) |
| Biaya infra beta | Tier gratis Supabase / PostHog / Sentry |
| Backup | Export dan import 1 tahun data selesai < 5 detik di HP kelas menengah (usulan, diukur di M6) |

## 8. Bahasa dan format

MVP hanya bahasa Indonesia, tetapi kode disiapkan untuk multibahasa (pasar global, D9) supaya menambah bahasa tidak perlu membongkar komponen.

| Aturan | Nilai |
|--------|-------|
| Bahasa MVP | Indonesia saja (`id`), sapaan "kamu". Tidak ada pemilih bahasa di UI |
| Katalog teks | Semua teks yang tampil ke pengguna (UI, pesan error, notifikasi, cue timer, template rationale 07 bagian 3.2, nama + cue gerakan drill) diambil dari katalog: `apps/app/src/i18n/id.ts` dan `packages/training-engine/src/i18n/id.ts`. Kunci stabil (mis. `today.start`), nilainya teks. Tidak ada teks UI tertulis langsung di komponen |
| Placeholder | `{nama}` di dalam teks katalog. Angka diformat dulu (baris Format) sebelum dimasukkan |
| Format | Satu modul `format.ts` di `packages/ui`: angka dan tanggal lewat `Intl.NumberFormat` / `Intl.DateTimeFormat` dengan locale dari `profile.locale` (MVP selalu `id-ID`). Pace dan durasi (`6:45 /km`, `38:45`) diformat manual. Tampilan: 04-UI-UX bagian 6 |
| Engine | `training-engine` mengembalikan kode + nilai (enum tipe latihan, rationale `{rule, values}`), bukan teks jadi. Teks dibentuk di UI dari katalog |
| Data tersimpan | Database menyimpan kode, bukan teks (mis. `type = 'tempo'`, bukan "Tempo"). File backup ikut aturan ini |
| Library | Tanpa library i18n di MVP (1 bahasa cukup dengan katalog TypeScript). Library dipilih saat D9 diputuskan, lewat perubahan stack bagian 1 |
| Test | CI memeriksa: tidak ada teks literal di JSX `apps/app/src` dan `packages/ui` (kecuali angka/simbol); setiap kunci yang dipakai ada di `id.ts`; snapshot format `5,2 km`, `6:45 /km`, `Selasa, 27 Okt`, `2j 21m` |

Saat multibahasa (D9): tambah katalog per bahasa (mis. `en.ts`), pemilih bahasa di 4.1 + bahasa awal dari perangkat, `profile.locale` diisi, satuan awal mengikuti negara (mi untuk US/UK), notifikasi dan cue ikut bahasa, dan konten yang khas Indonesia ditinjau ulang (zona waktu default, konteks panas, race lokal, kebijakan privasi per negara).

## 9. Notifikasi

Semua notifikasi **lokal**: dijadwalkan di perangkat lewat Expo Notifications. Tidak ada push dari server dan tidak ada token push yang dikirim ke server (sesuai TRD 2 aturan 4).

| Jenis | Kapan | Contoh isi | Aturan |
|-------|-------|------------|--------|
| Pengingat latihan (F-12) | Jam `profile.reminder_time` di hari yang punya latihan `scheduled` | "Hari ini: Tempo 42 menit. Siap lari?" | Tidak dikirim di hari istirahat, saat plan `paused`, atau jika latihan hari itu sudah `completed`. Dijadwalkan untuk 7 hari ke depan dan dijadwalkan ulang saat app dibuka, plan berubah (pindah, gabung, adaptasi, jeda, lanjut) atau jam diubah |
| Cue timer (F-05) | Tiap pergantian segmen saat timer `running` | "Segmen 3 dari 4: Tempo 14 menit, 6:45 /km" | Dibatalkan saat `paused` / `finished` (App Flow 3.2) |

Tidak ada di MVP: notifikasi pemasaran, streak, ringkasan minggu, usulan adaptasi. Pengingat backup tetap kartu di dalam app (TRD 3.3), bukan notifikasi.

Aturan:

1. **Isi tanpa data kesehatan.** Boleh: tipe latihan, durasi, jarak, pace target. Dilarang: RPE, tag catatan, alasan jeda/cedera, jawaban screening. Notifikasi bisa terbaca di layar kunci.
2. **Izin diminta saat dibutuhkan**, dengan 1 kalimat penjelasan sebelum dialog sistem: di 1.6 saat pengguna memilih jam pengingat, dan saat Mulai timer pertama kali jika belum diizinkan. Tidak diminta saat app pertama dibuka.
3. **Izin ditolak:** app tetap berjalan. 4.1 menampilkan "Pengingat mati: izin notifikasi ditolak" + tombol "Buka pengaturan". Timer tetap memakai suara + getar selama app aktif.
4. **Web:** pengingat tidak didukung di MVP; pilihan jam di 1.6 dan 4.1 nonaktif dengan keterangan. Cue timer hanya saat tab aktif (bagian 5).
5. Teks dari katalog (bagian 8); jam mengikuti `profile.timezone`.
6. Test: pengingat hanya di hari latihan, tidak saat `paused`, dijadwalkan ulang setelah pindah latihan; isi notifikasi tidak memuat field pribadi di aturan 1.
