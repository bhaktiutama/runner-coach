# 02. Store listing (English, en-US)

Status: Draft v0.1 (2026-11-05) | Strategy and hypotheses: `01-ASO-STRATEGY.md` | Character counts verified with a script on 2026-11-05 (bagian 8)

Copy di bawah siap ditempel ke App Store Connect dan Google Play Console. Teks di dalam blok kode = teks final; catatan di luar blok dalam bahasa Indonesia.

## 1. App Store (iOS)

| Field | Limit | Copy | Chars |
|---|---|---|---|
| Name | 30 | `Run Coach: Running Plan` | 23 |
| Subtitle | 30 | `5K to Marathon Training Coach` | 29 |
| Primary category | | Health & Fitness | |
| Secondary category | | Sports | |

Alternatif nama jika "Run Coach" tidak tersedia (D5): `Run Coach: 5K to Marathon` (25).

**Keywords** (100 byte, koma tanpa spasi, tidak mengulang kata di Name/Subtitle karena Apple sudah mengindeksnya):

```
beginner,half,10k,interval,timer,pace,race,jogging,strength,workout,schedule,runner,tempo,fitness
```

**Promotional text** (170, tidak diindeks, bisa diganti kapan saja tanpa review):

```
Your full plan is free, from day one to race day. A guided timer, strength built for runners, and training data that never leaves your phone.
```

**Description** (4000). Tiga baris pertama tampil sebelum "more", jadi berisi janji utama:

```
Know exactly what to run today. Run Coach builds a training plan around your race date, your schedule and your current fitness, then coaches you through every session.

Your full running plan is free. Not a trial week. The whole plan, to the finish line.

BUILT AROUND YOU
- Pick your goal: 5K, 10K, half marathon, marathon, or just getting fit
- Tell us your race date, the days you can train and how much you run now
- Get a plan that builds through Base, Build, Peak and Taper phases, with pace zones matched to your fitness

ONE SCREEN, ONE TAP
- Today shows the one workout that matters, with a clear Start button
- Easy runs, long runs, tempo, intervals, strides and run-walk, explained in plain words
- A race countdown and your next long run, always one swipe away

A TIMER THAT COACHES
- Every interval counted down, with your target pace on screen
- Distinct sound cues and haptics for work, recovery, halfway and the final 3-2-1
- Running drills before quality sessions, with technique cues for each move

EVERY WORKOUT EXPLAINS ITSELF
- "Why this plan?" and "Why this workout?" show the reasoning behind each session
- Each training rule shows its level of evidence and its source
- A built-in guide explains pace, zones, RPE, taper and more

ADAPTS WHEN LIFE HAPPENS
- Rate how each run felt in one tap
- Your weekly summary suggests changes, with the reason, and you decide
- Move a workout to another day, swap it for an easy run, or pause the plan for illness, injury or travel, then return safely

STRENGTH BUILT FOR RUNNERS
- Optional bodyweight leg and core sessions, scheduled around your hard days
- A guided timer for every set, rest and side switch
- Sessions get harder as you get stronger, and easier when they feel too heavy

SEE YOURSELF IMPROVE
- Weekly volume, easy pace trend and plan consistency
- A race time prediction range based on your training
- Every run in one history, including runs you log by hand

PRIVATE BY DESIGN
- Your plan, workouts, effort ratings and health answers are stored only on your phone
- Your account is used only to sign in
- Back up to a file, restore on a new phone, or delete everything at any time

Also: English and Bahasa Indonesia, dark mode, and training reminders on your running days.

Run Coach is not a medical device. Check with a doctor before starting a new training program.
```

**What's New** (versi 1.0):

```
Welcome to Run Coach. Build your plan, press Start, and run. Tell us what you think from Profile, we read every message.
```

Catatan: kalimat "we read every message" hanya dipakai jika ada kanal feedback di Profil saat rilis; jika belum, hapus kalimat kedua.

## 2. Google Play

| Field | Limit | Copy | Chars |
|---|---|---|---|
| App name | 30 | `Run Coach: 5K to Marathon Plan` | 30 |
| Category | | Health & Fitness | |
| Tags | | Running, Workout tracker, Fitness coaching (pilih yang tersedia di Play Console) | |

**Short description** (80, diindeks search):

```
Free running plans for 5K to marathon, with a guided timer and strength sessions
```

Varian B untuk uji H1:

```
Know what to run today. A full 5K to marathon plan, free, with a coaching timer
```

**Full description**: pakai teks Description App Store di atas. Play mengindeks deskripsi panjang, jadi kata kunci utama (running plan, 5K, 10K, half marathon, marathon, interval timer, beginner) sudah muncul secara alami; jangan tambahkan daftar kata kunci.

## 3. Screenshots (urutan, layar dan caption)

Semua dari wireframe / build yang sudah ada; nomor layar mengacu `docs/wireframes/png/`. Tidak perlu capture baru di dokumen ini.

| # | Layar sumber | Headline (baris 1) | Subline (baris 2) | Kenapa di posisi ini |
|---|---|---|---|---|
| 1 | 2.1 Hari ini (`2-1-hari-ini.png`, kartu interval dari `imagery/2-1i-hari-ini-interval.png`) | Know exactly what to **run today** | Your plan, one screen, one tap to start | Menjawab P1 langsung; tampil di hasil search (H2) |
| 2 | 1.8 Preview plan (`1-8-preview-plan.png`) | A real plan, built around **race day** | 5K, 10K, half or full marathon, on your days | Bukti personalisasi; tampil di hasil search |
| 3 | 2.3 Timer (`2-3-timer.png`) | Every interval, **coached** | Target pace, sound cues and haptics | Fitur yang dipakai tiap hari; tampil di hasil search |
| 4 | 2.2 Detail latihan, bagian "Kenapa latihan ini?" (`2-2-detail-latihan.png`) | Every workout **explains itself** | The reason and the evidence, in plain words | Pembeda dari plan generik (H4) |
| 5 | 2.5 Ringkasan minggu (`imagery/2-5-ringkasan-minggu.png`) | Adapts when **life happens** | Missed a run or felt heavy? Your plan adjusts | Mengatasi P2 |
| 6 | 2.3s Timer gerakan (`2-3s-timer-gerakan-en.png`) | Strength built for **runners** | Bodyweight legs and core, timed for you | Fitur fase 2, nilai tambah Premium |
| 7 | 3.3 Progres (`3-3-progres.png`) | See yourself getting **faster** | Pace trend, consistency, race prediction | Mengatasi P4 |
| 8 | 4.5 Data & privasi (`4-5-data-privasi.png`) | Your data stays **on your phone** | No cloud profile. Your backup, your file | Pembeda privasi (H3) |

Opsional (App Store mengizinkan sampai 10): 9 = mode gelap layar 2.3 (`dark/2-3-timer.png`) dengan headline `Made for early mornings` / `Dark mode follows your phone`; 10 = 3.1 Kalender (`3-1-kalender-plan.png`) `Your whole season, phase by phase` / `Base, Build, Peak, Taper`.

Semua screenshot harus memakai **build EN**. Layar yang wireframe EN-nya belum ada (2.1, 1.8, 2.3, 2.2, 2.5, 3.3, 4.5) diambil dari app dengan bahasa English di 4.8, bukan dari PNG berbahasa Indonesia.

## 4. Arah visual screenshot

Tujuannya terlihat seperti pemain lama: satu sistem, rapi, sedikit kata, layar app sebagai bintang.

| Elemen | Spesifikasi | Token / aset |
|---|---|---|
| Latar | Frame 1-7: `bg` terang (stone). Frame 8 (privasi) dan 9 (gelap): `bg` gelap untuk memberi jeda ritme | `color.bg`, tema gelap di `tokens.json` |
| Motif penghubung | Satu garis lintasan oranye melengkung yang menyambung dari frame ke frame (terlihat sebagai panorama saat digeser) | `color.primary`, bentuk oval TrackRing |
| Headline | Bricolage Grotesque 800, 2 baris maks, satu kata kunci berwarna oranye (ditebalkan di tabel di atas) | `font.family.display` |
| Subline | Plus Jakarta Sans, warna teks kedua | `font.family.ui`, `color.text-muted` |
| Perangkat | Layar app di dalam bingkai iPhone tipis (tanpa bingkai juga boleh, asal konsisten); posisi sama di semua frame; sedikit miring hanya di frame 1 | |
| Angka di layar | Data contoh realistis (mis. tempo 6 x 800 m, pace 5:20 /km), font display + `tnum` | TRD 8 |
| Yang dihindari | Lebih dari 2 baris teks, harga, badge "#1", emoji, foto stok, nama kompetitor | Bagian 3 di `01-ASO-STRATEGY.md` |

Ukuran ekspor: iPhone 6.9" 1320 x 2868 px (wajib). iPad 13" 2064 x 2752 px hanya jika iPad didukung saat rilis. Google Play: 1080 x 1920 px (minimal 2, disarankan 8 yang sama dengan iOS).

## 5. Aset lain

| Aset | Spesifikasi | Isi yang diusulkan |
|---|---|---|
| Ikon app | iOS 1024 x 1024 px, Play 512 x 512 px PNG 32-bit | Sudah ada: `docs/design-system/assets/app-icon/` |
| Play feature graphic | 1024 x 500 px, JPEG atau PNG 24-bit tanpa alpha | Ilustrasi `road-sunrise-f` di kanan, logo horizontal + `Your running coach, 5K to marathon` di kiri, latar `bg`. Butuh versi gambar resolusi tinggi (aset saat ini lebar 866 px) dan lisensi jelas |
| App preview video (opsional, iOS 15-30 dtk) | 1320 x 2868 px atau sesuai spesifikasi resmi | Urutan: pilih target (1.2), preview plan (1.8), Hari ini (2.1), tap Mulai, timer berganti segmen dengan bunyi (2.3), ringkasan minggu (2.5). Tanpa narasi, caption sama gaya dengan screenshot |
| Play promo video (opsional) | URL YouTube | Video yang sama |

## 6. Info listing lain

| Field | Isi | Status |
|---|---|---|
| Support URL | Halaman bantuan / kontak | Belum ada |
| Privacy Policy URL | Kebijakan privasi model "data di HP" | Belum ada (STATUS M7 no. 4) |
| Marketing URL (opsional) | Landing page | Belum ada |
| Age rating | 4+ (iOS) / Everyone (Play); jawab kuesioner jujur, screening kesehatan 1.7 tidak mengubah rating | Isi saat submit |
| App Privacy / Data safety | Harus sesuai TRD 6: email akun untuk login (linked to you), data pemakaian anonim + diagnostik (not linked). Data latihan dan kesehatan tidak dikumpulkan karena tidak keluar dari perangkat | Isi saat submit; jangan klaim "Data Not Collected" karena email login dikumpulkan |
| Harga di listing | Tidak disebut di screenshot. Daftar in-app purchase tampil otomatis dari store saat Premium aktif (Fase 3) | |

## 7. Daftar cek klaim sebelum publish

Setiap klaim di copy harus benar di build yang dirilis. Hapus atau ubah kalimat jika belum.

| Klaim di copy | Fitur | Status 2026-11-05 |
|---|---|---|
| Full plan free | 08 bagian 2 (lari tidak pernah terkunci) | Benar |
| Sound cues and haptics, termasuk saat layar terkunci | F-05 | Copy sengaja **tidak** menulis "screen locked" sampai uji HP fisik (STATUS no. 10) lolos |
| Running drills with technique cues | F-17 | Benar |
| Evidence level and source per rule | F-03, 07 bagian 3 | Benar |
| Weekly summary suggests changes | F-11 | Benar |
| Pause for illness, injury, travel, return safely | F-09 | Benar |
| Strength sessions adapt (easier when too heavy) | F-21, E-25 | Benar. Jika paywall aktif, strength setelah minggu 2 = Premium; tambahkan "Strength sessions after week 2 require Premium" di deskripsi saat Fase 3 |
| Race time prediction range | F-07 | Benar |
| Stored only on your phone, backup to file | PRD 3, F-13, F-18 | Benar |
| English and Bahasa Indonesia, dark mode, reminders | F-22, F-24, F-12 | Benar di iOS/Android (reminder tidak di web) |
| Tidak disebut: GPS, Strava, Apple Health, Health Connect, jam tangan | PRD 5 | Belum ada; tambahkan ke copy saat fase 2 integrasi rilis |

## 8. Jumlah karakter (dicek dengan skrip)

| Field | Chars | Limit |
|---|---|---|
| iOS Name | 23 | 30 |
| iOS Subtitle | 29 | 30 |
| iOS Keywords | 97 (byte) | 100 |
| iOS Promotional text | 141 | 170 |
| iOS / Play Description | 2351 | 4000 |
| Play App name | 30 | 30 |
| Play Short description A | 80 | 80 |
| Play Short description B | 79 | 80 |
| Play feature graphic line | 34 | - |
