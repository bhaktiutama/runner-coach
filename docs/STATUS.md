# Status Development

Diperbarui otomatis oleh agent setiap langkah selesai. Branch kerja: `claude/relaxed-galileo-lknyhx`, di-merge langsung ke `development`.

Terakhir diperbarui: 2026-10-29

## Ringkasan

| Milestone | Status | Catatan |
|---|---|---|
| M0 Spike | Belum mulai | Bagian device (timer background, backup OS) butuh HP fisik |
| M1 Fondasi | Belum mulai | |
| M2 Engine | Belum mulai | |
| M3 Onboarding, Hari ini, Plan | Belum mulai | |
| M4 Timer | Belum mulai | Uji layar terkunci butuh HP fisik |
| M5 Feedback, Progres | Belum mulai | |
| M6 Privasi, Akun | Belum mulai | |
| M7 Rilis beta | Di luar jangkauan agent | Butuh akun Apple/Google + keputusan pemilik |

Legenda: Belum mulai / Berjalan / Selesai / Selesai (perlu device) / Terblokir

## Loop kerja

1. Baca `F-xx`, flow + nomor layar, tabel Schema.
2. Tulis test dari kriteria diterima.
3. Implementasi sampai `pnpm lint && pnpm typecheck && pnpm test` lulus.
4. Cek kriteria "Verifikasi" milestone (06-IMPLEMENTATION-PLAN). Yang tidak bisa dicek di container ditandai "perlu device".
5. Commit, merge ke `development`, push, update file ini.

## Log langkah

| Tanggal | Milestone | Langkah | Hasil test |
|---|---|---|---|

## Blocker dan butuh dari pemilik

| # | Item | Untuk | Status |
|---|---|---|---|
| B1 | `EXPO_TOKEN` di environment session (expo.dev > Account settings > Access tokens), lalu mulai session baru | EAS Update (buka di Expo Go), EAS Build APK, EAS Hosting web | Menunggu |
| B2 | Provider Apple dan Google di Supabase Auth | Login Apple/Google (F-01). Email sudah bisa | Menunggu |
| B3 | Uji di HP fisik: cue timer saat layar terkunci, lanjut posisi setelah app ditutup | Verifikasi M0, M4 | Menunggu build |
| B4 | Review aturan engine oleh pelatih (D6) | Sebelum beta publik | Menunggu |

## Cara test

Akan diisi setelah M1 (perintah `pnpm dev`, link Expo, dsb).
