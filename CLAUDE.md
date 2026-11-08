# Run Coach

App latihan lari harian (5K, 10K, HM, FM, Bugar) untuk Web, iOS dan Android dari satu codebase Expo. Repo: `runner-coach`.

**Privasi dulu: semua data pribadi hanya di SQLite perangkat.** Supabase cloud hanya untuk login/sesi (+ Edge Function `delete-account`). Jangan pernah membuat tabel data pengguna di server atau mengirim data pribadi (plan, latihan, RPE, kesehatan, nama) ke server, analitik atau Sentry. Detail: `docs/specs/02-TRD.md` bagian 3 dan 6.

## Sumber kebenaran

| Butuh | Baca |
|---|---|
| Apa yang dibangun, urutannya | `docs/specs/README.md`, lalu `06-IMPLEMENTATION-PLAN.md` |
| Fitur `F-xx`, scope | `docs/specs/01-PRD.md` |
| Paywall, harga, gerbang Premium, whitelist | `docs/specs/08-MONETIZATION.md` (bagian 7: whitelist user id) |
| Bagikan ke media sosial (F-29) | `docs/specs/10-SHARE.md` |
| Stack, aturan engine, sinkron | `docs/specs/02-TRD.md` |
| Langkah per layar, state machine | `docs/specs/03-APP-FLOW.md` |
| Tata letak layar | `docs/wireframes/png/` (26 layar MVP 1.1 sampai 4.6 + fase 2: 2.1s, 2.2s, 2.3s, 2.4s, 4.1, 4.4, 4.8 versi ID dan EN, memakai Lintas); mode gelap di `docs/wireframes/png/dark/` |
| Warna, tipe, bentuk, komponen | `docs/design-system/tokens.json` + `README.md`; ringkasan di `docs/specs/04-UI-UX.md` |
| Logo, ikon app, ikon UI | `docs/design-system/assets/` |
| Tabel lokal (SQLite), file backup, Auth, Edge Functions | `docs/specs/05-BACKEND-SCHEMA.md` |
| Listing App Store / Google Play, ASO, hipotesis konversi | `docs/store/01-ASO-STRATEGY.md`, `docs/store/02-LISTING-EN.md` |
| Latar belakang, riset | `docs/PLANNING.md` (kalah jika konflik dengan `docs/specs/`) |
| Setup sesi, perintah test/deploy, alur git | `docs/DEV-SESSION.md`, `scripts/setup-session.sh` |

## Aturan

- Fitur baru: baca baris `F-xx`, flow + nomor layar, dan tabel terkait dulu. Test ditulis dari kriteria diterima.
- Jangan menambah library, tabel atau layar di luar spec. Perlu? Usulkan perubahan spec dulu. Perubahan perilaku = update spec di PR yang sama.
- Tidak ada hex atau ukuran lepas di komponen; semua dari token. Perubahan warna harus lolos `python3 docs/design-system/check_contrast.py`.
- Angka (pace, jarak, waktu) memakai font display + `tnum`. Teks UI bahasa Indonesia (sapaan "kamu") dan English, selalu lewat katalog `i18n/id.ts` + `i18n/en.ts` (kunci baru wajib ditambahkan ke keduanya; typecheck gagal jika EN kurang), tidak ditulis langsung di komponen; angka/tanggal lewat `format.ts` (TRD 8).
- Branch `feat/<milestone>-<nama>` dari `development`, PR kecil ke `development`.
- Credential Supabase dibaca dari environment (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`). Jangan menulis credential ke repo.
- Supabase MCP (`.mcp.json`, token dari env `SUPABASE_ACCESS_TOKEN`) dan skill `.claude/skills/supabase*` boleh dipakai untuk Auth, Edge Function, log dan dokumentasi. **Jangan** memakai tool database/migration untuk membuat tabel data pengguna; schema `public` harus tetap kosong (Schema bagian 5). Skill `supabase-postgres-best-practices` hanya relevan jika kelak ada tabel non-pribadi yang disetujui spec.

## Setup sesi (cloud)

Sesi baru memulai dari container kosong; hanya isi repo yang dibawa. Jangan memasang tool secara manual lalu berharap tersimpan.

| Lapisan | Mengurus | Lokasi |
|---|---|---|
| Setup script environment (pengaturan environment, bukan repo) | Tool sistem: pnpm 10.28.0, `eas-cli`, Pillow, `PW_CHROMIUM_PATH` di `~/.bashrc`, font wireframe | `bash /home/user/runner-coach/scripts/setup-session.sh` |
| Hook SessionStart (di repo, hanya cloud) | `pnpm install --frozen-lockfile` bila manifest/lockfile berubah, `PW_CHROMIUM_PATH` ke env sesi | `.claude/hooks/session-start.sh`, `.claude/settings.json` |
| Environment variables (pengaturan environment) | `EXPO_TOKEN`, `SUPABASE_ACCESS_TOKEN`, `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`. Jangan ditulis di repo atau chat | Pengaturan environment |

- Awal sesi: `git pull origin development` dulu (sesi lain juga merge ke sana), lalu baca `docs/STATUS.md` bagian "Berikutnya".
- Jangan `playwright install`; Chromium bawaan ada di `/opt/pw-browsers/chromium`.
- Tool atau library baru yang dibutuhkan lintas sesi: tambahkan ke `scripts/setup-session.sh` (tool sistem) atau `package.json` (dependensi repo, perlu persetujuan spec), bukan hanya dipasang di sesi.
- Perintah harian, deploy, alur git dan daftar masalah yang pernah terjadi: `docs/DEV-SESSION.md`.

## Preview dan deploy (EAS)

- **Default: hanya web.** Jangan menjalankan build iOS/Android (`eas build`, `eas submit`) sampai pemilik produk memberi perintah eksplisit. Review dilakukan di web dulu.
- Cara deploy preview web (dari `apps/app`, akun EAS sudah login lewat `EXPO_TOKEN` di environment session):
  1. `pnpm --filter ./apps/app export:web` (hasil di `apps/app/dist`).
  2. `npx eas-cli@latest deploy --non-interactive` (tanpa `--prod`). Hasilnya URL deployment `https://run-coach--<id>.expo.app`.
  3. Arahkan alias: `npx eas-cli@latest deploy:alias --alias preview --id <id> --non-interactive`. URL tetap untuk review: **https://run-coach--preview.expo.app**. Alias harus selalu di-update setelah deploy baru.
  4. Cek `curl -sS -o /dev/null -w "%{http_code}\n" https://run-coach--preview.expo.app/` dan laporkan URL ke pemilik.
- Jangan memakai `--prod` atau `eas deploy:promote` tanpa perintah pemilik produk.
- Merge ke `development` hanya setelah pemilik produk selesai review di preview web.
- Header COOP/COEP untuk `expo-sqlite` di web diatur di `apps/app/app.json`; periksa jika preview tidak mau memuat database.
- Menjalankan E2E lokal/di container: ekspor web **dengan** `EXPO_PUBLIC_E2E=1` (seperti CI), jalankan dengan `PW_CHROMIUM_PATH=/opt/pw-browsers/chromium pnpm test:e2e`. Tanpa flag itu hampir semua test gagal (timeout 60 detik). Jangan men-deploy build berflag E2E ke preview: ekspor ulang tanpa flag dulu.
