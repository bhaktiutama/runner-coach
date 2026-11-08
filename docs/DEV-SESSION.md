# Panduan sesi development (Claude Code cloud)

Ringkasan semua alat, perintah dan kebiasaan kerja yang dipakai di sesi-sesi sebelumnya, supaya sesi baru langsung jalan. Baca bersama `CLAUDE.md` dan `docs/STATUS.md`.

## 1. Setup environment

| Bagian | Isi |
|---|---|
| Setup script environment | `bash /home/user/runner-coach/scripts/setup-session.sh` (atau tempel isinya). Aman diulang, tanpa secret |
| Node | 22 (sudah ada di image) |
| pnpm | 10.28.0 (`packageManager` di `package.json`), `node-linker=hoisted` |
| Python | 3 + Pillow (untuk `scripts/compare-wireframes.py`) |
| Chromium | Sudah terpasang di `/opt/pw-browsers/chromium`. Jangan `playwright install`; set `PW_CHROMIUM_PATH=/opt/pw-browsers/chromium` |
| EAS CLI | `eas` global atau `npx eas-cli` (v27) |

### Environment variables (diisi pemilik di pengaturan environment, bukan di repo/chat)

| Variabel | Untuk |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Login (Supabase Auth) di app/web build |
| `EXPO_TOKEN` | EAS: deploy web, `eas update`, build |
| `SUPABASE_ACCESS_TOKEN` | Supabase MCP (`.mcp.json`): Auth, Edge Function, log. Jangan buat tabel data pengguna |
| `GH_TOKEN` / akses GitHub | Push ke `runner-coach` |

Network: perlu `*.supabase.co`, `api.supabase.com`, `expo.dev`/`*.expo.dev`/`*.expo.app`, `registry.npmjs.org`, `fonts.googleapis.com`.

## 2. Perintah harian

| Tujuan | Perintah |
|---|---|
| Install | `pnpm install --frozen-lockfile` |
| Cek cepat (wajib sebelum commit) | `pnpm lint && pnpm typecheck && pnpm test` |
| Test engine saja | `pnpm vitest run packages/training-engine` |
| Coverage engine | `pnpm test:coverage` |
| Test privasi (schema public kosong, tanpa data pribadi keluar) | `pnpm test:privacy` |
| Generate token desain (setelah ubah `docs/design-system/tokens.json`) | `pnpm tokens` |
| Cek kontras warna | `python3 docs/design-system/check_contrast.py` |
| Build web untuk E2E | `cd apps/app && rm -rf dist && EXPO_PUBLIC_E2E=1 npx expo export --platform web --output-dir dist` |
| E2E (Playwright, server dari `scripts/serve-web.mjs`) | `PW_CHROMIUM_PATH=/opt/pw-browsers/chromium pnpm test:e2e` |
| Screenshot vs wireframe | `SHOTS_DIR=<folder> PW_CHROMIUM_PATH=... pnpm test:e2e e2e/compare.spec.ts` lalu `python3 scripts/compare-wireframes.py <folder>` (hasil `cmp-*.jpg`: kiri wireframe PNG, kanan app) |
| Validasi engine (manual, bukan CI): Lapisan 2, Lapisan 3, paket review pelatih | `pnpm validate:engine`; hasil HTML di `docs/validation/engine-<versi>/` (detail `validation/README.md`) |
| Validasi app = engine (manual, bukan CI): Lapisan 1 | Ekspor web dengan `EXPO_PUBLIC_E2E=1`, lalu `PW_CHROMIUM_PATH=/opt/pw-browsers/chromium pnpm validate:app` |

Catatan E2E: 6 test "skipped" itu normal (spec screenshot butuh `SHOTS_DIR`; satu test bergantung hari ini bukan hari istirahat). `EXPO_PUBLIC_E2E=1` memunculkan "Lewati login (mode uji)".

## 3. Deploy (tanpa build ulang native)

| Tujuan | Perintah |
|---|---|
| Web preview, link tetap | `cd apps/app && rm -rf dist && npx expo export --platform web --output-dir dist && npx eas-cli deploy --alias preview --non-interactive` -> https://run-coach--preview.expo.app |
| Update HP (Expo Go / APK preview) | `cd apps/app && npx eas-cli update --branch preview --environment preview --message "<pesan>" --non-interactive` |
| Edge Function (Supabase) | `npx supabase@latest functions deploy <nama> --no-verify-jwt --project-ref <ref>` (butuh `SUPABASE_ACCESS_TOKEN` yang valid). Fungsi: `delete-account`, `entitlement` |
| Whitelist Premium | `npx supabase@latest secrets set PREMIUM_WHITELIST="<uuid>,<uuid>" --project-ref <ref>` atau Dashboard > Edge Functions > Secrets (08-MONETIZATION 7.3) |
| Link Expo Go (selalu terbaru) | `exp://u.expo.dev/9855e7c4-9e3c-49d8-b871-d04ded670b08?channel-name=preview` |

`eas deploy --prod` (produksi) dijalankan pemilik sendiri. EAS project: `@bhaktiutama/run-coach`.

### 3b. Uji di HP orang lain (penguji)

| Platform | Cara | Syarat |
|---|---|---|
| Semua | Web preview https://run-coach--preview.expo.app (data tersimpan di browser penguji) | Browser modern |
| Android | Kirim link halaman build APK preview (`eas build -p android --profile preview`, halaman build di expo.dev punya tombol Install/QR). Penguji mengizinkan "install dari sumber tidak dikenal". Perubahan JS berikutnya lewat `eas update --branch preview` (masuk saat app dibuka ulang, runtime sama) | Tidak perlu daftar perangkat |
| iOS (cepat, terbatas) | Expo Go dari App Store, buka `exp://u.expo.dev/9855e7c4-9e3c-49d8-b871-d04ded670b08?channel-name=preview` (QR) | Expo Go harus mendukung SDK app; fitur native (Apple Sign In, notifikasi) bisa berbeda dari build asli |
| iOS (build asli, ad hoc) | Pemilik menjalankan secara interaktif di komputer sendiri: `npx eas-cli device:create` (link registrasi UDID untuk penguji), lalu `npx eas-cli build -p ios --profile preview` (login Apple). Penguji install dari link build | Apple Developer Program berbayar; maks 100 iPhone per tahun; perangkat baru = build ulang |
| iOS (TestFlight) | `npx eas-cli build -p ios --profile production` lalu `npx eas-cli submit -p ios`; undang penguji di App Store Connect > TestFlight | Apple Developer Program; penguji eksternal (link publik, maks 10.000) perlu Beta App Review |

Build iOS tidak bisa dari sesi cloud selama akun EAS belum punya kredensial Apple (`eas build -p ios --non-interactive` gagal "couldn't find any credentials suitable for internal distribution"). Sekali kredensial dibuat secara interaktif, build berikutnya bisa non-interaktif.

## 4. Alur git

- Branch kerja dari `development` (mis. `feat/<milestone>-<nama>`). Pemilik mengizinkan merge langsung ke `development` tanpa PR: `git checkout development && git pull --ff-only origin development && git merge --no-edit <branch> && git push origin development`.
- Selalu `git pull` dari `development` dulu di awal sesi; sesi lain juga merge ke sana.
- Perubahan perilaku = update spec di commit yang sama (`docs/specs/`), lalu catat di `docs/STATUS.md` (tabel Log langkah).

## 5. Struktur dan kebiasaan kode

| Hal | Lokasi / aturan |
|---|---|
| Engine plan (TS murni) | `packages/training-engine` (generator, aturan E-xx di `evidence/registry.ts`, teks di `i18n/id.ts`). Aturan baru = entri registri + template + test |
| Komponen UI + token | `packages/ui` (`tokens.ts` dihasilkan dari `docs/design-system/tokens.json`; tanpa hex/ukuran lepas) |
| App Expo Router | `apps/app/src/app`; teks UI lewat `apps/app/src/i18n/id.ts`, panduan F-20 di `i18n/help.ts`; angka lewat `format.ts` |
| Database lokal | `apps/app/src/db/migrations.ts` (jangan ubah migrasi lama; tambah versi). Ubah CHECK = bangun ulang tabel dengan `foreignKeysOff: true` |
| Wireframe acuan | `docs/wireframes/png/` (PNG yang dibandingkan pemilik), sumber `docs/wireframes/source/*.dc.html` |
| Review pelatih | `docs/engine-review.html` (artifact https://claude.ai/artifact/6iBvn1TgSFEEX3BtqHwF6V); perbarui saat aturan engine berubah |
| Skill repo | `.claude/skills/supabase*` |

## 6. Hal yang pernah bikin macet

| Gejala | Penyebab / solusi |
|---|---|
| Playwright tidak menemukan browser | Pakai `PW_CHROMIUM_PATH=/opt/pw-browsers/chromium` |
| Web "Terjadi kesalahan" setelah login | Database OPFS dipegang tab/halaman lain; sudah ditangani (popup login + `auth-callback.html`) |
| Login Expo Go kembali ke web | Tambah `exp://**` di Supabase Redirect URLs |
| Expo Go menampilkan versi lama | Buka lewat link channel di atas, bukan "Recently opened" |
| Prettier gagal di CI | Jalankan `pnpm format` atau `pnpm exec prettier --write <path>` sebelum commit |
| Perubahan Supabase dashboard (redirect URL, template email) ditolak untuk agent | Minta pemilik mengubah di dashboard |
| `SUPABASE_ACCESS_TOKEN` ditolak (401, 2026-11-07): MCP Supabase gagal tersambung, Edge Function tidak bisa di-deploy dari sesi | Pemilik membuat token baru (supabase.com > Account > Access Tokens) dan mengganti variabel environment, atau deploy sendiri |
