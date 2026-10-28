# 02. Technical Requirements Document (TRD)

Status: Draft v0.2 (2026-10-28) | Detail latar belakang: `docs/PLANNING.md` bagian 4, 5, 6

## Ringkasan

- Satu codebase **Expo (React Native) + TypeScript** untuk Web, iOS, Android. Backend **Supabase**.
- Logika plan ada di paket TypeScript murni `packages/training-engine`, dipakai offline di app dan di server.
- Offline-first: timer dan log tetap jalan tanpa internet, sinkron saat online.

## 1. Stack (dikunci)

Agent tidak boleh mengganti atau menambah library di luar tabel ini tanpa update spec.

| Layer | Pilihan |
|-------|---------|
| App | Expo + Expo Router + TypeScript (strict) |
| State server / cache | TanStack Query |
| State lokal UI | Zustand |
| Database lokal | expo-sqlite |
| Validasi data | zod (tipe `steps`, input form, respons Edge Function) |
| Grafik | Berbasis react-native-svg (kandidat: Victory Native; final setelah spike M0) |
| Backend | Supabase: Postgres, Auth, Edge Functions (Deno) |
| Notifikasi | Expo Notifications |
| Analitik | PostHog |
| Error monitoring | Sentry |
| Monorepo | pnpm workspaces |
| Test | Vitest (engine, logika), React Native Testing Library (komponen), Playwright (web E2E) |
| CI/CD | GitHub Actions + EAS Build/Submit |
| Fase 2 | Strava API, HealthKit, Health Connect |
| Fase 3 | RevenueCat (IAP), Stripe (web) |

Versi: pakai versi stabil terbaru saat setup, lalu kunci di `package.json` dan lockfile.

## 2. Arsitektur

```
apps/app (Expo)                     supabase/
  UI -> TanStack Query                migrations/   skema + RLS
     -> SQLite lokal  <--sync-->      functions/    Edge Functions
     -> training-engine (offline)
packages/
  training-engine  (TS murni, tanpa dependency React/Supabase)
  ui               (komponen + design token)
```

Aturan:

1. `training-engine` tidak boleh import React, Expo, atau Supabase.
2. Komponen UI tidak memanggil Supabase langsung; lewat hook di `apps/app/src/data/`.
3. Semua satuan disimpan dalam **meter** dan **detik**. Konversi km/mi dan pace hanya di layer UI.

## 3. Sinkron offline

| Aturan | Nilai |
|--------|-------|
| ID baris | UUID dibuat di client |
| Konflik | Last-write-wins berdasarkan `updated_at` |
| Hapus | Soft delete (`deleted_at`) agar ikut tersinkron |
| Antrian | Perubahan lokal diantrikan, dikirim saat online, retry dengan backoff |
| Sebelum login | Onboarding dan plan dibuat lokal tanpa `user_id` (login baru diminta di layar 1.8). Setelah login, semua baris lokal diberi `user_id` lalu disinkron. Login ke akun yang sudah punya plan: tanya pakai plan lama atau plan baru |

## 4. Training engine

### 4.1 Rumus

| Kebutuhan | Metode |
|-----------|--------|
| Prediksi waktu antar jarak | Riegel: `T2 = T1 x (D2 / D1)^1.06`, tampilkan sebagai rentang |
| Zona pace | Kerangka Jack Daniels (Easy, Marathon, Threshold, Interval, Repetition), implementasi dari referensi asli + unit test |

### 4.2 Aturan wajib (diuji otomatis)

Angka adalah heuristik umum coaching (PLANNING 4.3), bukan hasil riset; wajib direview pelatih (D6).

| Aturan | Nilai default |
|--------|---------------|
| Durasi plan | 5K: 8 mgg, 10K: 10 mgg, HM: 12 mgg, FM: 16-18 mgg, Bugar: blok 8 mgg berulang (O2) |
| Fase | Base -> Build -> Peak -> Taper (Bugar: tanpa Taper) |
| Kenaikan volume mingguan | Maks 10% |
| Cutback week | Tiap minggu ke-3 atau ke-4, volume turun 20-30% |
| Long run | Maks 30% volume mingguan, di hari long run pilihan pengguna |
| Intensitas | ~80% easy |
| Sesi berat | Maks 2 per minggu, pemula 0-1, tidak boleh di 2 hari berurutan |
| Taper | 5K/10K: 1 mgg, HM: 1-2 mgg, FM: 2-3 mgg |
| Screening "Ya" (O3) | Mode ringan: tanpa sesi berat sampai diubah pengguna |
| Setelah jeda plan | 1 minggu Return to run: volume rendah, tanpa sesi berat |

### 4.3 Adaptasi (F-11, layar 2.5)

Dihitung engine di akhir minggu, ditampilkan sebagai **usulan**; plan baru berubah setelah pengguna menekan "Oke, terapkan".

| Kondisi | Usulan |
|---------|--------|
| RPE >= 8 pada easy run 2x berturut-turut | Volume minggu depan turun ~10%, 1 sesi berat diganti easy |
| RPE <= 4 pada sesi kualitas 3x berturut-turut | Target pace sesi kualitas naik 1 tingkat |
| 1 latihan terlewat | Tidak diganti; lanjut plan |
| >= 2 latihan terlewat dalam seminggu | Ulangi minggu tersebut (volume tidak dinaikkan) |
| Tidak lari >= 10 hari | Tawarkan 1 minggu Return to run |
| Waktu race / time trial baru | Hitung ulang zona pace dan prediksi |

Sumber: PLANNING 4.5.

## 5. Batasan platform

| Batasan | Solusi |
|---------|--------|
| iOS membatasi eksekusi di background | Timer pakai timestamp absolut + notifikasi lokal terjadwal per pergantian segmen |
| Web: timer hanya andal saat tab aktif | Wake Lock API jika tersedia + peringatan ke pengguna |
| HealthKit butuh kode native | Expo dev build (bukan Expo Go); tidak tersedia di web |
| Strava API | Kapasitas atlet awal terbatas, rate limit, larangan pakai data untuk training AI/ML. Verifikasi ulang syarat terbaru sebelum fase 2 |

## 6. Keamanan & privasi

1. RLS aktif di **semua** tabel (detail di `05-BACKEND-SCHEMA.md`).
2. Service role key hanya di Edge Function, tidak pernah di app.
3. Token pihak ketiga (Strava) dienkripsi di server, tidak bisa dibaca client.
4. Izin data kesehatan diminta seminimal mungkin dan hanya saat fitur dipakai.
5. Data kesehatan tidak dipakai untuk iklan dan tidak dijual.
6. Wajib: hapus akun (F-10), export data (F-13). Pemetaan ke UU PDP (UU No. 27/2022) dicek sebelum rilis publik.
7. Secrets di GitHub Actions / EAS secrets, tidak di repo.

## 7. Target non-fungsional (usulan, belum diukur)

| Area | Target |
|------|--------|
| Cue timer | Telat maks 1 detik dari jadwal saat app aktif |
| Offline | Onboarding selesai = plan tersimpan lokal; timer + log bisa tanpa internet |
| Aksesibilitas | Kontras teks min 4.5:1, area sentuh min 44 x 44 (sesuai wireframe) |
| Biaya infra beta | Tier gratis Supabase / PostHog / Sentry |
