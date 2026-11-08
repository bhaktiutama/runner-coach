# Status Development

Diperbarui otomatis oleh agent setiap langkah selesai. Branch kerja: `claude/relaxed-galileo-lknyhx`, di-merge langsung ke `development`.

Terakhir diperbarui: 2026-11-07 (paywall aktif + whitelist Premium, bagikan ke media sosial gratis). Branch fase 2: `claude/festive-hopper-ml7tp7` (dari `development`)

## Ringkasan

Posisi sekarang: M0-M6 selesai; fase 2 (P2-0 s.d. P2-6) selesai dan diuji di web: strength + core dengan animasi placeholder, bahasa English, konsep paywall + gerbang nonaktif (unit 3.718, E2E 15 lulus + 6 dilewati, privasi 16). Integrasi Strava/Health (P2-7) ditunda. Yang tersisa butuh kamu: uji di HP (B3), login Google/Apple (B2), kode email (B5), kunci analitik/Sentry (B7), review pelatih/fisioterapis untuk aturan + gerakan strength (B9), terjemahan EN dibaca penutur asli (B8), dan M7 rilis beta.


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
| P2 Strength (F-21) | Selesai (web, perlu device) | Engine E-23..E-26, migrasi v6, 2.1 kartu kedua, 2.2s, 2.3s mode gerakan, 2.4 rasa beban, sakelar 4.1. Animasi = placeholder kosong (D8). Cue saat layar terkunci perlu dicek di HP |
| P2 Bahasa English (F-22) | Selesai (web) | Katalog app/engine/Panduan EN, layar 4.8, format `Intl` per locale. Perlu dibaca penutur asli (B8) |
| P2 Gerbang Premium (F-23) | Aktif di kode, fungsi belum ter-deploy | Sejak 2026-11-07 paywall aktif bawaan (strength minggu 3+ dan bagikan); whitelist user id lewat Edge Function `entitlement` + secret `PREMIUM_WHITELIST` (08 bagian 7). Deploy + isi secret = B12. RevenueCat = Fase 3 |
| P2 Bagikan ke media sosial (F-29) | Selesai (web, perlu device) | Gratis. Kartu PNG 9:16 untuk latihan selesai (3.4), ringkasan minggu (2.5), plan (3.1), pencapaian (3.3); layar 2.7. Native (`toDataURL` + expo-sharing) belum diuji di HP |
| P2 Integrasi Strava/Health | Ditunda | Butuh kredensial Strava + HP fisik (HealthKit/Health Connect) |

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
| 2026-10-30 | M6 | F-20 Panduan & istilah (layar 4.7, spec PRD/APP-FLOW/UI-UX diperbarui): cara kerja plan, istilah (volume, volume puncak, pace, zona, RPE, fase, taper, cutback), jenis lari termasuk recovery dan progression, istilah penelitian, 20 aturan engine dalam bahasa awam + tingkat bukti + sumber. Tombol (i) di 1.8, 2.1, 2.2, 2.4, 2.6, 3.1, 3.3; baris di Profil | unit 2.364, E2E 11/11 |
| 2026-10-30 | M2 | Engine v0.2: long run HM 35% / FM 45% volume + batas 2,5 / 3 jam (E-08), recovery run (E-21), progression run (E-22, tipe baru + migrasi DB v5 yang menjaga relasi aktivitas). Bug lama diperbaiki: volume pemula macet ~10 km/minggu (pembulatan), turun di awal Build (hari easy terhapus), cutback/taper terlalu dalam. Spec TRD 4.2, 07, Schema, halaman review diperbarui | unit 2.847, E2E 11/11 |
| 2026-11-06 | Fase 2 | Ikon spot F-27: set 27 ikon (garis 1.75), wireframe penempatan, `SpotIcon` + `spot-icons.json` dari generator, token `size.spot-*`, migrasi v9 `profile.spot_icons`, sakelar Profil, penempatan di 8 layar tanpa mengubah struktur (margin negatif di baris bertinggi tetap) | unit 3765 lulus, E2E 33 lulus (+1 spot-icons) |
| 2026-11-06 | Fase 2 | Semua ikon spot dipakai: bunyi (izin notifikasi 2.3), cedera (4.3), kartu Pencapaian 3.3 (F-28: 5K pertama, 4 minggu beruntun, plan tuntas; dihitung, tanpa tabel). Set gaya Apple dicoba lalu dibatalkan pemilik | unit 3768 lulus, E2E 33 lulus |
| 2026-11-07 | Fase 2 | Ikon spot v2: 28 ikon baru dipasang (jenis latihan sendiri, target, fase, tag, alasan jeda, Profil, judul layar sekunder, backup, drill), token `spot-xs`, slot `leading` di Chip/ChoiceCard/ScreenTitle/SettingsRow/PhaseLegend. Review visual 390 terang + 320 gelap, ikon nyala/mati: perbaikan jarak kartu Bugar, label 2 baris di chip alasan 320 px, perataan Backup 4.5, ikon baris cedera | unit 3769 lulus, E2E 31 lulus (2 test animasi dilewati otomatis karena hari ini hari istirahat) |
| 2026-11-07 | Fase 2 | Review pemilik: tinggi ikon = tinggi teks. Judul layar mengukur tinggi judul (1/2 baris); kartu geser 2.1 judul 2 baris (label + kalimat fase/saran, kartu +18 px); kartu istirahat ikon + jarak teks; navigasi minggu 3.1 ikon kiri + 2 baris rata kiri (`formatDayRange`, < 360 px tanpa nama fase); baris hari 3.1 strength sebaris judul (2 baris); 1.6 pengingat 2 baris; 1.8 legenda kisi 2 kolom + jumlah minggu | unit 3770 lulus, E2E 31 lulus |
| 2026-11-07 | Fase 2 | Plan 3.1: bar fase 15 pil + legenda diganti satu bar gradasi + penanda minggu ini (opsi A pemilik); strength di hari yang sama jadi baris kedua dalam kartu hari yang sama | unit 3770 lulus, E2E 31 lulus |

| 2026-11-07 | Fase 2 | Paywall aktif bawaan + whitelist Premium: Edge Function `entitlement` (JWT -> cocokkan user id dengan secret `PREMIUM_WHITELIST`, tanpa tabel), `useEntitlement` (cache per akun di penyimpanan sesi, cek ulang 1 jam), `canShare`, 4.4 "Premium aktif", 4.1 "Aktif (akses penguji)". Plan bagikan `10-SHARE.md` (F-29). Spec 01/02/03/04/05/06/08 diperbarui | unit + edge lulus, E2E phase2 7 lulus (+1 test kunci minggu 3) |
| 2026-11-07 | Fase 2 | Bagikan (F-29), gratis untuk semua: builder kartu SVG murni (`shareCard.ts`: latihan, minggu, plan, pencapaian; sorotan 5K pertama / lari terjauh; tanpa RPE/tag/catatan/HR), PNG 1080 x 1920 (web: canvas + font tersemat, Web Share API / unduh; native: `toDataURL` + expo-sharing), layar 2.7, titik masuk 3.4, 2.5, 3.1, 3.3, event `share_completed`. Gerbang `canShare` dihapus. Review visual kartu terang + gelap | unit 3803 lulus, E2E share 3 lulus |
| 2026-10-30 | P2 | Fase 2. Engine: step `exercise`, 15 gerakan bodyweight (`animation: null`), `planStrength` (E-23..E-26), `easierStrength`; lari tidak berubah saat strength nyala (diuji semua kombinasi). App: migrasi v6, onboarding "Mau latihan kekuatan?", kartu strength 2.1, 2.2s, timer 2.3s (repetisi = Selesai set, plank + istirahat = hitung mundur), 2.4 "Bebannya terasa" (terlalu berat -> sesi berikutnya turun level), sakelar 4.1, log manual/kepatuhan/adaptasi tidak mencampur strength dengan lari. English: `en.ts`, `help.en.ts`, engine `en.ts`, 4.8, `LocaleGate`. Premium: `entitlement.ts`, 4.4, `paywall_viewed`. Bug lama diperbaiki di `SettingsRow`: baris tanpa aksi menonaktifkan sakelar di dalamnya di web (ditemukan E2E pada sakelar strength; pola yang sama dipakai sakelar 4.5). Spec PRD/TRD/Flow/UI/Schema/07 + `08-MONETIZATION.md`, wireframe 16 PNG (ID+EN) | unit 3.718, E2E 15/15 (+6 dilewati), privasi 16, coverage engine 99,5% baris |
| 2026-11-03 | UI | Imagery draft (UI/UX 12): library 10 gambar, token `on-image`/`scrim`/`hero`/`card-image`, `ImageHero` + `ImageHeader`, gambar di 1.1, 1.9, 2.1 (per jenis latihan + istirahat), 2.4, 2.5, 2.6, 3.3 kosong, 4.4. Mode gelap: teks di kotak status selalu `on-status` (`TextColorContext`), tabel 2.5. 3.1: tanda selesai (centang warna zona). Wireframe: varian `IMG-*`/`ST-3-1b` dari sumber asli (`imagery.py`), terang + gelap, diterapkan ke canvas Claude Design. Preview web + EAS Update `preview` + build APK. iOS belum bisa dibuild (kredensial Apple) | lint + typecheck OK, unit 3.731, validate:engine 3/3, E2E 23 (6 skipped) |
| 2026-11-04 | UI/M1 | Profil: nilai baris pengaturan turun ke bawah label di layar sempit; Ganti target jadi dialog. Login: status sesi langsung terbarui (onAuthStateChange), Keluar -> 1.9 dan tab butuh sesi, 1.8 tidak minta login lagi bila sudah masuk | lint + typecheck OK, unit 3.731, E2E 25 (6 skipped). Alur login asli belum diuji otomatis (mode uji melewati login) |
| 2026-11-04 | UI | 1.1 jadi carousel 3 halaman penuh (riset, privasi, teman Strava), geser manual, teks santai ID + EN, ikut tema; tombol utama bertebal (`primary-edge`, turun saat ditekan); `ImageHero` dapat fokus horizontal. Wireframe + canvas Claude Design v39 | lint + typecheck OK, unit 3.731, E2E 26 (6 skipped) |

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


## Berikutnya (untuk sesi baru)

Branch baru dari `development`, format `feat/<milestone>-<nama>` (CLAUDE.md). Urutan yang disarankan:

| # | Pekerjaan | Branch usulan | Butuh dari pemilik |
|---|---|---|---|
| 1 | Uji login end-to-end di HP (Google web popup, Expo Go, APK) dan perbaiki yang gagal | `feat/m1-auth-device` | `exp://**` di Redirect URLs Supabase (B2), template email `{{ .Token }}` (B5) |
| 2 | Uji device M0/M4 (B3): cue timer saat layar terkunci, lanjut posisi setelah app ditutup, notifikasi; tampilan dengan Ukuran Teks terbesar dan iPhone SE | `feat/m4-device-fixes` | Uji di HP fisik |
| 3 | Mode uji di channel terpisah (`test`) dengan "Lewati login" + reset data, agar Expo Go bisa dipakai uji dari nol | `feat/m7-test-channel` | - |
| 4 | M7 persiapan rilis: halaman kebijakan privasi (model "data di HP"), isian App Privacy / Data safety, profil EAS production, Sentry + PostHog aktif | `release/beta` | Kunci PostHog/Sentry (B7), akun Apple Developer + Google Play, keputusan rilis |
| 5 | Review aturan engine oleh pelatih (B4/D6) dengan `07-ENGINE-EVIDENCE.md` sebagai checklist | - | Pelatih bersertifikat |
| 6 | ~~Fase 2: strength + core, English, konsep paywall~~ Selesai 2026-10-30 (lihat log) | `claude/festive-hopper-ml7tp7` | Review B8, B9 |
| 7 | Animasi gerakan strength (D8): semua 15 gerakan berupa frame ilustrasi 4x4 (model pria) yang diputar bolak-balik di kotak persegi (2026-11-04). Sisa: versi wanita + pilihan model di app (perlu spec), konfirmasi lisensi gambar AI, review teknik oleh pelatih | `feat/p2-squat-frames` | Review di preview web |
| 8 | Integrasi Strava, HealthKit, Health Connect + layar 4.2 + panduan HR di 2.2 | `feat/p2-integrations` | Client ID/secret Strava, HP fisik, dev build |
| 8b | Bagikan (F-29): uji di HP (SH-5): lembar bagikan ke Instagram Story + WhatsApp Status, iOS + Android; wireframe 2.7 bila perlu | - | HP fisik, review preview web |
| 9 | Fase 3: pembelian Premium lewat RevenueCat, trial, restore, `subscription_started` | `feat/p3-premium` | Akun App Store / Play, keputusan harga (08 bagian 6) |
| 10 | Desain suara + timer (`docs/specs/09-VOICE.md` v0.3). **Selesai 2026-11-05:** bunyi penanda baru (nada sintesis) di timer, angka waktu di setiap set, mode otomatis (bawaan, sakelar 4.1, pil di timer), UI 2.3s baru (bar sesi, kartu Berikutnya, layar pendek), migrasi v7; U1 +15 dtk, U2 tahan layar, U4 Siap-siap, gradasi cincin/bar; U3 jarak jauh (expo-sensors), U5 status layar kunci (notifikasi, tanpa Live Activity iOS), U6 per gerakan; review 3.4/2.5/2.1/3.3 (2026-11-05). Berikutnya: uji di HP fisik (bunyi saat layar terkunci, bunyi di atas musik), keputusan K1 sampai K5, Live Activity iOS (native, butuh perintah build), lalu mode Suara (TTS) | `claude/zen-ptolemy-4m4k9v` | Review di preview web, HP fisik |
| 11 | Ikon spot (F-27, UI/UX 14). **Selesai 2026-11-06:** 27 ikon berwarna (`assets/spot-icons/`), komponen `SpotIcon`, dipasang di 2.1, 2.3, 2.3s, 2.4, 2.5, 3.1, 3.3, 3.4, 4.3, 4.5; sakelar "Ikon ilustrasi" di 4.1 (migrasi v9); kartu Pencapaian 3.3 (F-28, 3 badge dari data yang ada). v2 2026-11-07: 55 ikon, 53 terpakai (HR + integrasi menunggu fase 2). Berikutnya: review di preview web, cek di HP fisik | `claude/zen-ptolemy-4m4k9v` | Review di preview web |
| 12 | Listing toko (ASO): strategi + hipotesis H1 sampai H7 dan copy EN + rencana 8 screenshot selesai sebagai draft (2026-11-05, `docs/store/`). Berikutnya: cek nama D5, kebijakan privasi, gambar resolusi tinggi berlisensi, buat screenshot dari build EN, usulan prompt rating (A1) ke spec, listing ID | `claude/quirky-meitner-8okbat` | Review copy, keputusan D5 |

## Blocker dan butuh dari pemilik

| # | Item | Untuk | Status |
|---|---|---|---|
| B1 | `EXPO_TOKEN` | EAS | Selesai: project `@bhaktiutama/run-coach`, web preview di EAS Hosting, EAS Update channel `preview`, build APK preview |
| B2 | Google aktif. Apple belum (butuh akun Apple Developer). Redirect URL app belum diizinkan (agent ditolak): Supabase > Authentication > URL Configuration > Redirect URLs, tambahkan `runcoach://**`, `https://run-coach--*.expo.app/**`, `http://localhost:8081/**` sudah ditambahkan pemilik. Untuk uji di Expo Go tambahkan juga `exp://**` | Login Google/Apple (F-01) | Sebagian |
| B3 | Uji di HP fisik: cue timer saat layar terkunci, lanjut posisi setelah app ditutup | Verifikasi M0, M4 | Menunggu build |
| B4 | Review aturan engine oleh pelatih (D6) | Sebelum beta publik | Menunggu |
| B6 | Deploy Edge Function `delete-account` | Hapus akun (F-10) | Selesai: ter-deploy, dicek tanpa JWT = 401, OPTIONS = 204 |
| B7 | Kunci PostHog (`EXPO_PUBLIC_POSTHOG_KEY`) dan DSN Sentry (`EXPO_PUBLIC_SENTRY_DSN`) di environment/EAS | Analitik anonim + error monitoring (TRD 6) | Menunggu (app jalan normal tanpa ini) |
| B8 | Terjemahan English (app, engine, Panduan) dibaca penutur asli | Sebelum rilis EN | Menunggu |
| B9 | Review fisioterapis/pelatih untuk library gerakan strength, dosis, dan aturan E-23..E-26 (PLANNING 4.7.5) | Sebelum beta publik dengan strength | Menunggu |
| B10 | Lisensi/asal 10 gambar imagery (`docs/design-system/assets/imagery/`, kemungkinan hasil AI) dan versi resolusi tinggi untuk hero | Sebelum TestFlight eksternal / rilis toko | Menunggu |
| B11 | Kredensial Apple di EAS (Apple Developer Program, sekali interaktif: `eas build -p ios`) | Build iOS ad hoc / TestFlight (DEV-SESSION 3b) | Menunggu |
| B12 | Deploy Edge Function `entitlement` (`--no-verify-jwt`) + isi secret `PREMIUM_WHITELIST` dengan user id penguji. Token `SUPABASE_ACCESS_TOKEN` di environment sesi ditolak (401), jadi agent tidak bisa deploy. Sampai fungsi ter-deploy, semua akun = bukan Premium (strength minggu 3+ terkunci) | Whitelist Premium (08 bagian 7) | Menunggu |
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
