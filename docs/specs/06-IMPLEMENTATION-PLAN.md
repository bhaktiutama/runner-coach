# 06. Implementation Plan

Status: Draft v0.2 (2026-10-28) | Durasi mengikuti estimasi kasar PLANNING bagian 7 (1-2 developer)

## Ringkasan

- MVP dibangun dalam **8 milestone (M0-M7), sekitar 8 minggu**. Satu milestone = satu atau beberapa branch kecil dari `development`.
- Urutan: fondasi -> engine (paling banyak test) -> onboarding & plan -> timer -> feedback & progres -> sinkron -> rilis beta.
- Setiap milestone selesai hanya jika semua cek di kolom "Verifikasi" lulus dan layarnya sesuai wireframe.

## 1. Loop kerja per fitur (untuk AI agent)

1. Baca spec: baris `F-xx` di PRD, flow + nomor layar di App Flow, tabel di Schema, token di UI/UX.
2. Buat branch `feat/<milestone>-<nama-singkat>` dari `development` (contoh `feat/m4-timer`).
3. Tulis test dulu dari kriteria diterima.
4. Implementasi sampai test lulus. Bandingkan tampilan dengan layar wireframe bernomor sama.
5. Jalankan `pnpm lint && pnpm typecheck && pnpm test`.
6. Cek manual di web + 1 device (iOS atau Android).
7. Jika perilaku berubah dari spec: update spec di PR yang sama.
8. Buka PR kecil (idealnya < 400 baris berubah) ke `development`, tunggu CI hijau.

## 2. Milestone MVP

| # | Minggu | Branch | Lingkup (layar) | Test | Verifikasi (Definition of Done) |
|---|--------|--------|-----------------|------|--------------------------------|
| M0 | Sebelum mulai (2-3 hari) | `spike/*` | Spike: timer background iOS + Android, grafik di web + mobile | Tidak wajib | Catatan hasil spike di `docs/specs/spikes.md`; library grafik dipilih |
| M1 | 1 | `feat/m1-foundation` | Monorepo pnpm, Expo + 4 tab kosong, Supabase lokal, migration `profiles`, login Apple/Google/Email, token UI/UX, font, ikon app + splash + komponen Icon dari `docs/design-system/assets/`, CI | Test RLS `profiles`, smoke test app | CI hijau; login berhasil di web + 1 device |
| M2 | 2-3 | `feat/m2-engine` | `training-engine`: zona pace, Riegel (rentang), workout library, generator 5 target termasuk Bugar, fase, mode ringan, Return to run, daftar ABC drill statis + penempatan segmen drill (F-17), tipe + validator `steps` | Unit test semua aturan TRD 4.2 untuk setiap kombinasi target x level x hari tersedia (3-6) | Coverage engine >= 90%; tidak ada import React/Supabase |
| M3 | 3-4 | `feat/m3-onboarding`, `feat/m3-today`, `feat/m3-plan` | Migration goals, plans, planned_workouts. 1.1-1.8 (simpan lokal, login di akhir), 2.1, 2.2, 3.1, 3.2 | Test komponen tiap langkah onboarding; test pindah/gabung latihan; test RLS | Pengguna baru sampai 2.1 tanpa login di tengah; data lokal ter-upload setelah login di 1.8 |
| M4 | 5 | `feat/m4-timer` | 2.3, state machine 3.2, audio + getar, notifikasi terjadwal, segmen drill dengan tombol Lanjut per set | Unit test state machine; test posisi dari timestamp | Uji device nyata: cue muncul saat layar terkunci (iOS + Android); app ditutup lalu dibuka melanjutkan posisi benar |
| M5 | 6 | `feat/m5-feedback`, `feat/m5-progress` | Migration activities, workout_feedback, fitness_snapshots. 2.4, log manual, 3.3, 3.4 | Test pencocokan aktivitas; test volume, pace, kepatuhan, prediksi | Alur 2.1 -> 2.3 -> 2.4 -> 3.3 end-to-end (Playwright di web) |
| M6 | 7 | `feat/m6-sync`, `feat/m6-account` | Sinkron offline (TRD 3), 4.1, 4.3, hapus akun, export, pengingat, migration `plan_adjustments` + 2.5 (Should), event analitik, Sentry | Test last-write-wins; test `delete-account`; test aturan adaptasi | Mode pesawat: latihan + log tersimpan, tersinkron saat online. Semua event PLANNING 9 terkirim ke PostHog |
| M7 | 8 | `release/beta` | TestFlight + Play internal testing + deploy web, perbaikan bug, privacy policy, formulir data safety | Regression E2E | Beta terpasang di 3 platform; tidak ada crash prioritas tinggi terbuka di Sentry |

Prasyarat di luar kode (paralel M1-M6): review aturan plan termasuk O2 dan O3 oleh pelatih bersertifikat (D6), dan wireframe untuk layar O1 dan O4, sebelum M7.

## 3. Setelah MVP (ringkas)

| Fase | Durasi estimasi | Milestone utama |
|------|-----------------|-----------------|
| 2. Integrasi & adaptif | 4-6 minggu | Layar 4.2; Strava, HealthKit, Health Connect; `plan-adjust`; panduan detak jantung di 2.2; strength + core bodyweight, tabel `exercises` |
| 3. Monetisasi | 3-4 minggu | Layar 4.4, `subscriptions`, RevenueCat + Stripe, paywall via feature flag, strength lanjutan + mobility |
| 4. Growth | Berkelanjutan | Kartu share (2.5), race lokal, export workout ke jam |

Setiap fase lanjut dipecah jadi milestone dengan format tabel yang sama sebelum dikerjakan.

## 4. Perintah standar

| Perintah | Fungsi |
|----------|--------|
| `pnpm dev` | Jalankan app (Expo) |
| `pnpm lint` | ESLint + Prettier check |
| `pnpm typecheck` | `tsc --noEmit` semua paket |
| `pnpm test` | Vitest + test komponen |
| `pnpm test:e2e` | Playwright (web) |
| `supabase db reset` | Terapkan ulang semua migration + seed lokal |
| `supabase test db` | Test RLS (pgTAP) |

Perintah ini dibuat di M1; sebelum itu belum ada.
