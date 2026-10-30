# Status Development

Diperbarui otomatis oleh agent setiap langkah selesai. Branch kerja: `claude/relaxed-galileo-lknyhx`, di-merge langsung ke `development`.

Terakhir diperbarui: 2026-10-29 (setelah penyamaan UI ke wireframe)

## Ringkasan

Posisi sekarang: M0-M6 selesai dan diuji di web (unit 2.358, E2E 10, privasi 15). Yang tersisa butuh kamu: uji di HP (B3), login Google/Apple (B2), kode email (B5), deploy `delete-account` (B6), kunci analitik/Sentry (B7), dan M7 rilis beta.


| Milestone | Status | Catatan |
|---|---|---|
| M0 Spike | Selesai (perlu device) | `docs/specs/spikes.md`: SQLite web OK, grafik pakai react-native-svg. Timer background + backup OS perlu HP |
| M1 Fondasi | Selesai (sebagian menunggu B2/B5) | Login Apple/Google/Email ada di kode; Google/Apple butuh B2, kode email butuh B5. Belum dicek di HP |
| M2 Engine | Selesai | 2.294 test (5 target x 4 profil x 3-6 hari x mode ringan), coverage baris 99,6%. Keputusan angka: 07 bagian 7 |
| M3 Onboarding, Hari ini, Plan | Selesai (web) | 1.1-1.9, 2.1, 2.2, 3.1, 3.2 sesuai wireframe (dicek screenshot). E2E: onboarding -> Hari ini, reload, pindah hari; 0 request ke luar localhost. Pulihkan dari file (1.9) menunggu M6 |
| M4 Timer | Selesai (perlu device) | 2.3 + 2.3b, state machine dari timestamp (8 test), suara + getar, notifikasi lokal terjadwal per segmen, izin saat Mulai pertama, lanjut setelah app ditutup. Uji layar terkunci iOS/Android = B3 |
| M5 Feedback, Progres | Selesai (web) | 2.4, 2.6, 3.3, 3.4. E2E 2.1 -> 2.3 -> 2.4 -> 3.3 -> 3.4 lulus. Split per km dan detak jantung hanya tampil jika ada data (fase 2), tidak dikarang |
| M6 Privasi, Akun | Selesai (web), menunggu B6/B7 | 4.1, 4.3, 4.5, 4.6, 2.5, pengingat lokal, kartu pengingat backup, event anonim. Edge Function `delete-account` siap tapi belum ter-deploy (B6). Sentry/PostHog aktif setelah kunci ada (B7) |
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
| 2026-10-29 | M1 | Monorepo pnpm, Expo SDK 58 + Router, 4 tab, tokens.ts dari tokens.json, format.ts id-ID, migrasi SQLite v1-v4, klien Supabase (Auth saja), ESLint larangan teks literal JSX, CI GitHub Actions | lint OK, typecheck OK, unit 11/11, E2E smoke 1/1, privacy (schema public kosong) 1/1 |
| 2026-10-29 | M3 | Onboarding 1.1-1.7 (draft lokal bisa dilanjutkan), 1.8 preview + Kenapa plan ini, 1.9 masuk, 2.1 Hari ini, 2.2 detail + ganti jadi easy, 3.1 kalender, 3.2 pindah/gabung/lewati. Fix engine: race Senin/Selasa | unit 2.323/2.323, E2E 4/4, lint + typecheck OK |
| 2026-10-29 | M4 | Timer 2.3/2.3b: hitung mundur, jeda/lanjut, lewati, kunci layar, drill per set, cue suara+getar, notifikasi terjadwal, keep-awake/Wake Lock, lanjut setelah app ditutup. Bug ditemukan E2E: hitung mundur tertahan (diperbaiki) | timer 8/8 |
| 2026-10-29 | M5 | 2.4 Selesai+RPE+tag, 2.6 log manual (dicocokkan ke latihan hari itu), 3.3 Progres (volume, tren pace easy, kepatuhan, prediksi), 3.4 detail. Tanggal lokal per zona waktu profil | unit 2.340/2.340, E2E 6/6 |
| 2026-10-29 | M6 | Backup ke file + pulihkan (validasi, versi lebih baru ditolak, rollback), hapus data di HP, keluar, hapus akun (Edge Function + handler), jeda/lanjut + Return to run, adaptasi 2.5 (E-13/17/18/19), atur ulang hari, pengingat 7 hari, event anonim dengan daftar properti | unit 2.358, privacy 15/15, E2E 10/10 |
| 2026-10-29 | UI | Semua 26 layar disamakan ke wireframe PNG (1.x, 2.x, 3.x, 4.x): ukuran font dari token, input waktu satu kotak, chip/pil, jarak antarblok, tinggi baris, sakelar 52x32, ikon tombol 20. Dicek berdampingan lewat `e2e/compare.spec.ts` + `scripts/compare-wireframes.py` | unit 2.361, E2E 15/15 + compare 3/3, lint + typecheck OK |
| 2026-10-30 | M1 | Fix login Google di web: "Terjadi kesalahan" karena database lokal (OPFS) dipegang halaman lain. Login web sekarang lewat popup + `auth-callback.html` statis, DB dilepas saat `pagehide`, buka ulang dicoba sampai 6 detik, pesan khusus jika app terbuka di tab lain | unit 2.361, E2E 10/10, uji popup + callback di Chromium |


## Catatan tampilan di HP

Laporan pemilik 2026-10-30: di iPhone 13 (Expo Go) font di dalam pil terlihat lebih besar dari web, dan di layar pertama ada teks yang tertutup tombol. Simulasi web iPhone 15 sudah OK.

| Gejala | Kemungkinan penyebab | Jenis | Arah perbaikan |
|---|---|---|---|
| Ukuran layar | iPhone 13 = 390 x 844 pt, iPhone 15 = 393 x 852 pt. Hampir sama, jadi ukuran layar bukan penyebab utama | - | - |
| Font (terutama di pil) lebih besar | Native mengikuti setelan iOS "Ukuran Teks" (Dynamic Type); belum ada batas `maxFontSizeMultiplier` di komponen `Text`. Web tidak terpengaruh setelan ini | Perlu dibuat responsif | Batasi skala di pil/chip/tombol (mis. 1,2x), biarkan teks isi tetap ikut setelan aksesibilitas; pil memakai `minHeight` + padding, bukan tinggi tetap |
| Teks tertutup tombol (layar pertama) | Footer tombol menempel di bawah dan memakai inset safe area iPhone (34 pt home indicator) yang tidak ada di web, ditambah font yang membesar; konten di atasnya tidak bergeser | Perlu dibuat responsif | Konten di atas footer harus bisa di-scroll dan memberi ruang setinggi footer; cek di layar pendek (iPhone SE 375 x 667) |
| Tinggi baris/huruf sedikit beda | Mesin teks iOS dan browser menghitung line-height dan metrik font berbeda; `letterSpacing` em dikonversi ke px | Wajar, kecil | Terima selisih 1-2 px |
| Tampilan versi lama | Expo Go membuka update tertentu dari "Recently opened" | Bukan bug tampilan | Buka lewat link channel `preview` |

Diperbaiki 2026-10-30: `Text` membatasi pembesaran 1,2x untuk teks di pil/chip/tombol/angka besar dan 1,5x untuk teks isi; input 1,2x; layar 1.1 bisa di-scroll dan tangga zona dipadatkan di layar < 760 pt (dicek iPhone SE 375 x 667 di web). Masih perlu dicek di HP dengan Ukuran Teks terbesar.

## Blocker dan butuh dari pemilik

| # | Item | Untuk | Status |
|---|---|---|---|
| B1 | `EXPO_TOKEN` | EAS | Selesai: project `@bhaktiutama/run-coach`, web preview di EAS Hosting, EAS Update channel `preview`, build APK preview |
| B2 | Google aktif. Apple belum (butuh akun Apple Developer). Redirect URL app belum diizinkan (agent ditolak): Supabase > Authentication > URL Configuration > Redirect URLs, tambahkan `runcoach://**`, `https://run-coach--*.expo.app/**`, `http://localhost:8081/**` sudah ditambahkan pemilik. Untuk uji di Expo Go tambahkan juga `exp://**` | Login Google/Apple (F-01) | Sebagian |
| B3 | Uji di HP fisik: cue timer saat layar terkunci, lanjut posisi setelah app ditutup | Verifikasi M0, M4 | Menunggu build |
| B4 | Review aturan engine oleh pelatih (D6) | Sebelum beta publik | Menunggu |
| B6 | Deploy Edge Function `delete-account` | Hapus akun (F-10) | Selesai: ter-deploy, dicek tanpa JWT = 401, OPTIONS = 204 |
| B7 | Kunci PostHog (`EXPO_PUBLIC_POSTHOG_KEY`) dan DSN Sentry (`EXPO_PUBLIC_SENTRY_DSN`) di environment/EAS | Analitik anonim + error monitoring (TRD 6) | Menunggu (app jalan normal tanpa ini) |
| B5 | Template email Supabase Auth belum memuat kode masuk. Di dashboard Supabase > Authentication > Email Templates, tambahkan `{{ .Token }}` ke template "Magic Link" dan "Confirm signup" (agent ditolak saat mencoba mengubahnya lewat API). Catatan: OTP 8 digit; SMTP bawaan dibatasi 2 email/jam, perlu SMTP sendiri sebelum beta | Login email (F-01) di HP | Menunggu |

## Cara test

| Cara | Link |
|---|---|
| Web (preview) | https://run-coach--preview.expo.app (alias tetap, selalu versi terbaru) |
| APK Android (preview) | expo.dev > project run-coach > Builds (profil `preview`), unduh dan pasang di HP |
| Update tanpa build ulang | `eas update --branch preview` (APK preview mengambil update saat dibuka) |


Di komputer sendiri (butuh Node 22 + pnpm):

```bash
pnpm install
pnpm dev          # Expo: tekan w untuk web, atau scan QR dengan Expo Go
pnpm test         # unit test
pnpm test:e2e     # E2E web (setelah: EXPO_PUBLIC_E2E=1 pnpm --filter app export:web)
```

Isi `.env` di root `apps/app` dari `.env.example` (URL + anon key Supabase). `EXPO_PUBLIC_E2E=1` memunculkan tombol "Lewati login (mode uji)", hanya untuk uji.
