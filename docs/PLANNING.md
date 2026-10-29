# Run Coach: Product & Technical Planning

Status: Draft v0.1 (2026-10-26)
Owner: Bhakti Utama

## Ringkasan

- Aplikasi latihan lari harian untuk target 5K, 10K, Half Marathon (HM) dan Full Marathon (FM), satu codebase untuk Web, iOS dan Android (Expo / React Native + Supabase).
- Inti produk hanya 3 hal: **"Latihan hari ini" + Timer interval + Grafik progres**. Semua fitur lain menunggu validasi.
- Strategi bisnis: gratis penuh di MVP untuk mengumpulkan pengguna dan data perilaku, lalu freemium (langganan Premium) setelah retensi terbukti.

---

## 1. Problem & Target User

### 1.1 Problem (hipotesis, divalidasi lewat survey di `docs/SURVEY.md`)

| # | Problem | Bukti saat ini |
|---|---------|----------------|
| P1 | Pelari pemula/menengah tidak tahu harus lari apa hari ini (jarak, pace, jenis latihan) | Hipotesis, belum ada data |
| P2 | Program latihan gratis (PDF, YouTube) tidak menyesuaikan dengan kondisi dan jadwal pribadi | Hipotesis, belum ada data |
| P3 | Aplikasi yang ada terasa terlalu kompleks atau mahal untuk pelari rekreasional | Hipotesis, belum ada data |
| P4 | Pengguna sulit melihat apakah mereka benar-benar membaik | Hipotesis, belum ada data |

### 1.2 Persona awal

| Persona | Profil | Target | Kebutuhan utama |
|---------|--------|--------|-----------------|
| Pemula "Couch to 5K" | Belum rutin lari, 0-10 km/minggu | Finish 5K tanpa berhenti | Program sangat sederhana, run-walk interval, motivasi |
| Rekreasional | Rutin 2-3x/minggu, 10-25 km/minggu | Sub-60 10K, finish HM pertama | Struktur latihan, pace yang jelas, progres terlihat |
| Ambisius | 25-60 km/minggu, sudah pernah race | PB HM/FM | Zona pace/HR, periodisasi, sinkron Strava/Apple Watch |

Fokus MVP: **Pemula dan Rekreasional** (asumsi: segmen terbesar dan paling kurang terlayani; divalidasi oleh survey).

### 1.3 Kompetitor (untuk dipetakan saat discovery)

| Aplikasi | Catatan untuk dicek |
|----------|---------------------|
| Strava | Tracking + sosial; fitur plan ada di tier berbayar |
| Runna | Plan terstruktur berbayar (diakuisisi Strava, 2025) |
| Nike Run Club | Gratis, guided runs, plan generik |
| Garmin Coach | Gratis, butuh device Garmin |
| Adidas Running, Coros, Polar | Plan berbasis device/ekosistem |

Harga dan fitur detail kompetitor **belum diverifikasi** di dokumen ini; lakukan di fase Discovery.

### 1.4 Diferensiasi yang diuji

1. Paling sederhana: 1 layar "Hari ini", 1 tombol Mulai.
2. Plan adaptif ringan: menyesuaikan dari feedback 1 tap (RPE) dan latihan yang terlewat.
3. Konteks lokal: Bahasa Indonesia, jadwal lari pagi, cuaca panas/lembab, kalender race lokal (fase lanjut).
4. Device-agnostic: bisa dipakai tanpa jam (timer + input manual), lebih kaya kalau tersambung Strava/Apple Watch.

---

## 2. Scope MVP

### 2.1 In scope

| Fitur | Deskripsi | Prioritas |
|-------|-----------|-----------|
| Onboarding singkat | Maks 6 pertanyaan (lihat 3.2) | Must |
| Plan generator | 5K, 10K, HM, FM; berdasarkan target tanggal, hari tersedia, level | Must |
| Layar "Hari ini" | Latihan hari ini + tombol Mulai | Must |
| Workout timer | Interval/segmen dengan countdown besar, warna zona, suara + getar | Must |
| Log manual + RPE | Jarak, durasi, rasa berat (1-10) dalam 1 layar | Must |
| Grafik progres | Volume mingguan, tren pace, kepatuhan plan | Must |
| Akun & sync | Login email/Google/Apple, data tersimpan cloud | Must |
| Penyesuaian plan dasar | Aturan sederhana dari RPE dan latihan terlewat | Should |
| Notifikasi pengingat | Pengingat jam latihan | Should |
| ABC drill sebagai pemanasan | Segmen drill sebelum Tempo/Interval, teks + animasi sederhana (lihat 4.7) | Should |

### 2.2 Out of scope MVP (backlog)

- GPS tracking sendiri (pakai Strava/Apple Watch/Health Connect sebagai sumber data; mengurangi kompleksitas background location dan battery).
- Aplikasi watchOS / Wear OS native.
- Fitur sosial, leaderboard, club.
- AI chat coach.
- Plan strength kaki, core dan mobility penuh (fase 2-3, lihat 4.7). MVP hanya memuat ABC drill sebagai pemanasan.

Alasan: setiap item di atas menambah kompleksitas teknis atau review store yang besar, sementara nilai inti (tahu harus lari apa + melihat progres) bisa diuji tanpa itu.

---

## 3. UX / UI

### 3.1 Prinsip

1. **Satu keputusan per layar.** Pengguna tidak perlu berpikir.
2. **Angka besar, teks sedikit.** Timer dan pace terbaca dari jarak lengan saat berlari.
3. **Warna = zona intensitas.** Konsisten di timer, kalender dan grafik.
4. **Feedback 1 tap.** RPE dengan emoji/slider, bukan form panjang.
5. **Bisa dipakai satu tangan, layar terkunci.** Audio cue untuk setiap pergantian segmen.

### 3.2 Onboarding (maks 6 layar)

1. Target: 5K / 10K / HM / FM
2. Tanggal race (atau "tidak ada, ingin lebih baik saja")
3. Kemampuan saat ini: waktu 5K/10K terakhir, atau "tidak tahu" (pilih level)
4. Rata-rata lari per minggu saat ini (km atau kali)
5. Hari yang tersedia (pilih hari, dan hari long run); opsional: mau latihan kekuatan + alat yang dimiliki (fase 2)
6. Screening kesehatan singkat (pertanyaan gaya PAR-Q) + disclaimer

Hasil: preview plan (grafik volume per minggu) + tombol "Mulai Plan".

### 3.3 Navigasi: 4 tab

| Tab | Isi |
|-----|-----|
| Hari ini | Kartu latihan hari ini, tombol Mulai, ringkasan minggu ini |
| Plan | Kalender minggu, bisa geser latihan ke hari lain |
| Progres | 3 grafik inti + rekor pribadi |
| Profil | Target, integrasi (Strava/Health), langganan, pengaturan |

### 3.4 Wireframe kasar

```
+-----------------------------+    +-----------------------------+
| Senin, 27 Okt    Minggu 3/12|    |  INTERVAL 3 / 6             |
|                             |    |                             |
|  [ TEMPO RUN ]              |    |          03:42              |
|  6 km  |  ~38 menit         |    |   (angka sangat besar)      |
|  Pemanasan 1 km easy        |    |                             |
|  4 km @ 5:45-5:55 /km       |    |  Target 5:10 /km            |
|  Pendinginan 1 km easy      |    |  [=====>        ] zona merah|
|                             |    |                             |
|      ( MULAI LATIHAN )      |    |  Berikutnya: Jog 2:00       |
|                             |    |                             |
| Minggu ini: 12/28 km  [##-] |    |  [ Jeda ]      [ Lewati ]   |
+-----------------------------+    +-----------------------------+
 Hari ini | Plan | Progres | Profil
```

```
+-----------------------------+    +-----------------------------+
| Selesai! Bagaimana rasanya? |    | Progres                     |
|                             |    | Volume mingguan (km)        |
| 1  2  3  4  5  6  7  8  9 10|    |  |  _  _  #  _  #  #        |
|  mudah      sedang     berat|    |  | ## ## ## ## ## ##        |
|                             |    | Tren pace easy run (/km)    |
| Jarak  [ 6.1 ] km           |    |  \__ ___                    |
| Durasi [ 38:20 ]            |    |        \___                 |
|                             |    | Kepatuhan plan: 85% (o)     |
|        ( SIMPAN )           |    |                             |
+-----------------------------+    +-----------------------------+
```

### 3.5 Visual

- Palet zona (konsisten di seluruh app): Easy = hijau/biru, Tempo/Threshold = kuning/oranye, Interval = merah, Recovery = abu-abu.
- Mode gelap sebagai default timer (hemat baterai di layar OLED, kontras tinggi di luar ruangan).
- Animasi minimal: progress ring saat timer berjalan, konfeti kecil saat menyelesaikan minggu.

---

## 4. Training Engine (logika plan)

Engine ditulis sebagai paket TypeScript murni (`packages/training-engine`) agar bisa dipakai di app (offline) dan server, serta mudah diuji unit.

### 4.1 Input

| Input | Sumber |
|-------|--------|
| Target jarak + tanggal race | Onboarding |
| Fitness saat ini | Waktu race terakhir, atau estimasi dari level, atau data Strava/Health |
| Volume mingguan saat ini | Onboarding atau rata-rata 4 minggu terakhir dari data tersinkron |
| Hari tersedia per minggu | Onboarding (3-6 hari) |
| Feedback latihan | RPE, selesai/terlewat, (opsional) HR |

### 4.2 Estimasi fitness & zona pace

- Prediksi waktu antar jarak dengan rumus Riegel: `T2 = T1 x (D2 / D1)^1.06` (Riegel, 1977/1981). Akurasi menurun untuk ekstrapolasi jauh (mis. 5K ke FM); tampilkan sebagai rentang, bukan angka tunggal.
- Zona pace mengikuti kerangka Jack Daniels (Easy, Marathon, Threshold, Interval, Repetition) yang diturunkan dari performa race. Tabel/rumus VDOT perlu diimplementasikan dari referensi aslinya ("Daniels' Running Formula") dan divalidasi dengan unit test.
- Jika ada data HR (Apple Watch / Strava): zona HR opsional; zona pace tetap default karena lebih mudah dipahami pemula tanpa jam.

### 4.3 Struktur plan (default, bisa di-tune setelah data terkumpul)

| Target | Durasi plan default | Syarat minimum disarankan sebelum mulai |
|--------|---------------------|-----------------------------------------|
| 5K | 8 minggu | Bisa jalan cepat 30 menit |
| 10K | 10 minggu | Bisa lari 20-30 menit tanpa berhenti |
| HM | 12 minggu | Rutin lari, long run nyaman ~8-10 km |
| FM | 16-18 minggu | Rutin lari, long run nyaman ~14-16 km |

Durasi dan syarat di atas adalah angka umum dari praktik coaching, bukan hasil riset di dokumen ini; dipakai sebagai default awal. Jika pengguna di bawah syarat, app menyarankan target lebih pendek atau plan "base building" terlebih dulu.

Fase periodisasi: **Base -> Build -> Peak -> Taper**.

Aturan default (heuristik umum, dapat dikonfigurasi):

| Aturan | Nilai default | Catatan |
|--------|---------------|---------|
| Distribusi intensitas | ~80% easy / ~20% sedang-berat | Mengacu konsep polarized/80-20 (Seiler) |
| Kenaikan volume mingguan | Maks ~10% | Heuristik umum; bukti ilmiahnya terbatas |
| Cutback week | Setiap minggu ke-3 atau ke-4, volume turun ~20-30% | Pemulihan |
| Long run | Maks ~30% volume mingguan (FM bisa lebih) | Mengurangi risiko cedera |
| Taper | 5K/10K: 1 minggu, HM: 1-2 minggu, FM: 2-3 minggu | Volume turun, intensitas dipertahankan |
| Sesi berat per minggu | Maks 2 (pemula: 0-1) | |

### 4.4 Jenis latihan (workout library)

| Tipe | Contoh | Warna |
|------|--------|-------|
| Easy | 30-60 menit pace easy | Hijau |
| Run-walk | 1 menit lari / 2 menit jalan x 8 | Hijau |
| Long run | 60-150 menit easy | Biru |
| Tempo/Threshold | 20 menit @ threshold | Oranye |
| Interval | 6 x 800 m @ interval, jog 2 menit | Merah |
| Strides | 6 x 20 detik cepat setelah easy run | Kuning |
| Recovery / Rest | Jalan, istirahat | Abu-abu |
| Drill | ABC drill 8-12 mnt sebelum sesi kualitas | Biru (segmen pemanasan) |
| Strength / Core / Mobility | Lihat 4.7 | Ungu |

Setiap workout disimpan sebagai daftar **step** (warmup, work, recovery, cooldown, repeat; untuk strength: exercise dengan sets/reps atau durasi) sehingga timer, kalender dan export (fase lanjut, mis. ke jam) memakai struktur yang sama.

### 4.5 Adaptasi (versi sederhana, rule-based)

| Kondisi | Aksi |
|---------|------|
| RPE >= 8 pada easy run 2x berturut-turut | Turunkan volume minggu berikutnya ~10%, ganti 1 sesi berat dengan easy |
| RPE <= 4 pada sesi kualitas 3x berturut-turut | Naikkan target pace sesi kualitas 1 tingkat |
| 1 latihan terlewat | Tidak diganti; lanjut plan |
| >= 2 latihan terlewat dalam seminggu | Ulangi minggu tersebut (volume tidak dinaikkan) |
| Tidak lari >= 10 hari | Tawarkan "return to run" 1 minggu sebelum lanjut |
| Waktu race baru / time trial | Hitung ulang zona pace |

Model adaptif berbasis ML ditunda sampai data cukup, dan **tidak boleh** memakai data dari Strava API untuk training model (lihat 5.2).

### 4.6 Keamanan pengguna

- Disclaimer: bukan nasihat medis.
- Screening kesehatan saat onboarding; jika ada flag (nyeri dada, pusing, kondisi jantung), sarankan konsultasi dokter sebelum mulai.
- Tombol "Saya cedera / sakit" yang menjeda plan.

### 4.7 Strength & Drill (latihan pendukung lari)

Strength dan drill **masuk ke plan yang sama**, bukan modul terpisah: muncul di layar "Hari ini" dan memakai timer yang sama dengan lari (struktur "workout = daftar step").

#### 4.7.1 Jenis sesi

| Sesi | Isi contoh | Durasi | Kapan |
|------|-----------|--------|-------|
| ABC drill | A-skip, B-skip, C-skip (butt kick), high knees, carioca, strides | 8-12 mnt | Ditempel sebagai segmen pemanasan sebelum Tempo/Interval |
| Strength kaki | Squat, lunge, step-up, single-leg deadlift, calf raise, glute bridge | 20-30 mnt | Hari easy run atau hari tanpa lari |
| Core | Plank, side plank, dead bug, bird dog, Copenhagen plank | 10-15 mnt | Digabung dengan strength atau berdiri sendiri |
| Mobility | Hip flexor stretch, hamstring, calf, foam rolling | 8-10 mnt | Setelah lari atau hari istirahat |
| Plyometrik (level lanjut) | Pogo jump, skipping, box jump rendah | 5-10 mnt | Hanya fase Build, bukan untuk pemula |

#### 4.7.2 Integrasi ke periodisasi

| Fase | Strength / minggu | Fokus | Drill |
|------|-------------------|-------|-------|
| Base | 2x | Fondasi, bodyweight, volume sedang | Setiap sebelum sesi kualitas |
| Build | 2x | Beban naik (dumbbell/ransel), plyo ringan untuk level menengah ke atas | Sama |
| Peak | 1x | Pertahankan, volume turun | Sama |
| Taper | 0-1x | Ringan saja, tidak ada latihan baru | Pemanasan race |

#### 4.7.3 Aturan penempatan (default, divalidasi pelatih)

| Aturan | Alasan |
|--------|--------|
| Strength berat di hari yang sama dengan lari kualitas (setelahnya), atau di hari easy | Prinsip "hari berat dibuat berat, hari ringan dibuat ringan" |
| Tidak ada strength kaki berat dalam 48 jam sebelum Long Run atau Interval | Kaki tidak lelah saat sesi kunci |
| Tidak ada strength di minggu race (kecuali mobility) | Taper |
| Pemula: bodyweight saja di 4 minggu pertama | Adaptasi dan keamanan |
| Progresi gerakan (mis. squat -> split squat -> Bulgarian split squat) setiap 2-3 minggu jika RPE sesi <= 6 | Overload bertahap |

Angka frekuensi dan jeda 48 jam di atas adalah heuristik umum coaching, **belum diverifikasi terhadap literatur** di dokumen ini; wajib di-review pelatih/fisioterapis. Secara umum ada studi dan review sistematis bahwa latihan kekuatan membantu running economy pelari jarak jauh; besar efeknya tidak dikutip karena belum dicek ulang.

#### 4.7.4 UX (memakai pola yang sudah ada)

| Layar | Perubahan |
|-------|-----------|
| Onboarding | Pertanyaan opsional di layar hari latihan: "Mau latihan kekuatan?" (ya / nanti) dan "Alat yang kamu punya?" (tidak ada / dumbbell / gym) |
| Hari ini | Kartu kedua di bawah lari: "Strength 20 mnt" dengan warna zona baru (ungu) |
| Timer | Mode gerakan: nama gerakan + animasi, hitungan repetisi atau countdown (mis. 40 detik), set 2/3, istirahat otomatis |
| Selesai | RPE yang sama + "terlalu berat / pas / terlalu ringan" per sesi |
| Plan | Ikon kecil "S" di hari yang ada strength; bisa dipindah dengan aturan 4.7.3 |
| Library | Daftar gerakan dengan animasi dan cue teknik (fase lanjut) |

Animasi gerakan: prototipe SVG di `docs/prototypes/exercise-animations.html`; rencana produksi (MediaPipe + Rive) di `docs/ANIMATION_PIPELINE.md`.

#### 4.7.5 Biaya & konten

| Item | Catatan |
|------|---------|
| Animasi/video gerakan | Biaya terbesar. Opsi: SVG berbasis pose (prototipe ada), Rive dengan aset ilustrator, atau video pelatih. Jangan memakai video orang lain tanpa izin |
| Review pelatih/fisioterapis | Wajib untuk library gerakan, dosis dan aturan progresi |
| Pengembangan | Relatif kecil: timer dan struktur step sudah ada |

---

## 5. Sumber Data

Ada dua jenis data: (A) data untuk **merencanakan produk**, (B) data di dalam **aplikasi** untuk personalisasi.

### 5.1 Data untuk perencanaan produk (Discovery)

| Sumber | Data yang dicari | Cara |
|--------|------------------|------|
| Survey online | Profil pelari, masalah, aplikasi yang dipakai, device, kesediaan membayar | Google Form/Typeform, sebar ke komunitas lari (IG, Strava club, run club lokal). Kuesioner di `docs/SURVEY.md` |
| Wawancara | Alasan berhenti latihan, cara memilih program | 8-12 pelari lintas persona, 30 menit |
| Laporan publik | Tren olahraga lari (mis. laporan tahunan Strava "Year in Sport") | Kutip angka hanya dari sumber aslinya |
| Review app kompetitor | Keluhan berulang di App Store / Play Store | Kategorikan keluhan |
| Landing page + waitlist | Minat nyata (konversi pendaftaran) | Uji value proposition sebelum build |

Catatan: data Strava/Apple Watch milik pengguna **tidak** bisa dipakai untuk riset pasar sebelum ada pengguna yang memberi izin; keduanya adalah sumber data fase (B).

### 5.2 Data di dalam aplikasi

| Sumber | Platform | Data | Catatan teknis / kebijakan |
|--------|----------|------|----------------------------|
| Input manual | Semua | Jarak, durasi, RPE | Selalu tersedia, fallback utama |
| Timer internal | Semua | Durasi per segmen | Tanpa GPS di MVP |
| Strava API (OAuth + webhook) | Web, iOS, Android | Aktivitas: jarak, waktu, pace, HR, splits | Aplikasi baru dimulai dengan kapasitas atlet terbatas dan perlu review Strava untuk menambah kapasitas. API Agreement Strava (update Nov 2024) melarang penggunaan data untuk training model AI/ML dan membatasi tampilan data ke pemilik data sendiri. Ada rate limit per 15 menit dan per hari. **Verifikasi ulang syarat terbaru sebelum build.** |
| Apple HealthKit (Apple Watch) | iOS saja | Workout, jarak, HR, VO2max estimasi, rute | Butuh app native (Expo dev build, bukan Expo Go). Tidak bisa diakses dari web. Wajib izin per tipe data + privacy label App Store. |
| Health Connect | Android | Exercise session, jarak, HR | Pengganti Google Fit API (Google Fit sedang dihentikan; cek timeline terbaru). |
| Garmin Connect API | Semua (via server) | Aktivitas, push workout ke jam | Fase lanjut; butuh pendaftaran program developer Garmin |

Prinsip privasi: minta izin seminimal mungkin, jelaskan kegunaannya, data kesehatan tidak dijual atau dipakai iklan, sediakan hapus akun + export data. Perlu dipetakan terhadap UU PDP Indonesia (UU No. 27/2022) dan GDPR jika melayani pengguna EU.

---

## 6. Arsitektur Teknis

> **Diperbarui 2026-10-29:** model data diganti jadi "data pribadi hanya di perangkat" (Supabase hanya untuk login). Bagian 6.3 dan 6.4 di bawah adalah rancangan lama; acuan yang berlaku: `docs/specs/02-TRD.md` dan `docs/specs/05-BACKEND-SCHEMA.md`.

### 6.1 Stack yang direkomendasikan

| Layer | Pilihan | Alasan |
|-------|---------|--------|
| App (Web + iOS + Android) | **Expo (React Native) + Expo Router + TypeScript** | Satu codebase untuk 3 platform; web via react-native-web; akses native (HealthKit, notifikasi, audio) lewat dev build |
| State & data fetching | TanStack Query + Zustand | Sederhana, mendukung cache offline |
| Penyimpanan lokal | SQLite (expo-sqlite) | Timer dan log tetap jalan offline |
| Grafik | Library berbasis react-native-svg (mis. Victory Native) | Jalan di web dan mobile; finalkan setelah spike |
| Backend | **Supabase** (Postgres, Auth, Storage, Edge Functions) | Cepat untuk tim kecil, Row Level Security, SQL standar (mudah migrasi) |
| Integrasi Strava | Supabase Edge Function (OAuth callback + webhook) | Token disimpan terenkripsi di server |
| Pembayaran | RevenueCat (IAP iOS/Android) + Stripe (web) | Langganan lintas platform dengan status entitlement terpusat |
| Notifikasi | Expo Notifications | Pengingat latihan |
| Analitik produk | PostHog | Funnel, retensi, feature flag untuk paywall |
| Error monitoring | Sentry | Crash di 3 platform |
| CI/CD | GitHub Actions + EAS Build/Submit | Build dan rilis store otomatis |

### 6.2 Struktur repo (monorepo)

```
runner-coach/
  apps/
    app/                 # Expo app (iOS, Android, Web)
  packages/
    training-engine/     # Plan generator, zona pace, aturan adaptasi (TS murni + unit test)
    ui/                  # Komponen UI bersama (timer, chart, kartu workout)
  supabase/
    migrations/          # Skema DB
    functions/           # Edge Functions (strava-oauth, strava-webhook, plan-adjust)
  docs/
```

### 6.3 Diagram alur data

```
 [Pengguna] -> [Expo App] --(offline-first, SQLite)--> sync --> [Supabase Postgres]
                   |                                                ^
                   |-- HealthKit / Health Connect (on-device) ------|
                   |
 [Strava] --webhook--> [Edge Function: strava-webhook] -> activities -> match ke planned workout
                                                                   -> training-engine -> update plan
```

### 6.4 Model data inti

| Tabel | Kolom utama |
|-------|-------------|
| profiles | id, nama, tanggal lahir (opsional), jenis kelamin (opsional), unit (km/mi), zona waktu |
| goals | id, user_id, distance (5k/10k/hm/fm), race_date, target_time, status |
| plans | id, goal_id, start_date, end_date, params (jsonb), version |
| planned_workouts | id, plan_id, date, type (run/drill/strength/core/mobility), steps (jsonb), target_distance_m, target_duration_s, status |
| exercises | id, name, category (drill/strength/core/mobility/plyo), level, equipment, target_muscles, cues, animation_ref, progression_next_id |
| activities | id, user_id, source (manual/timer/strava/healthkit/health_connect), external_id, started_at, distance_m, duration_s, avg_hr, splits (jsonb) |
| workout_feedback | id, planned_workout_id, activity_id, rpe (1-10), notes |
| fitness_snapshots | id, user_id, date, vdot_estimate, weekly_volume_m |
| integrations | id, user_id, provider, encrypted tokens, scopes, connected_at |
| subscriptions | id, user_id, provider (revenuecat/stripe), entitlement, expires_at |

Step strength di `planned_workouts.steps`: `{ type: "strength" | "drill" | "mobility", exercise_id, sets, reps | duration_s, rest_s, load: "bodyweight" | "dumbbell_light" | ... }`.

Satuan disimpan dalam meter dan detik; konversi ke km/mi dan pace di UI.

### 6.5 Catatan teknis penting

- **Timer di background**: iOS membatasi eksekusi di background. Untuk MVP, gunakan timestamp absolut (start time + durasi segmen) dan notifikasi lokal terjadwal untuk setiap pergantian segmen, sehingga cue tetap muncul saat layar terkunci. Audio cue saat aplikasi aktif.
- **Web**: semua fitur kecuali HealthKit/Health Connect. Timer di web hanya andal selama tab aktif (gunakan Wake Lock API jika tersedia).
- **Pencocokan aktivitas**: aktivitas dari Strava/Health dicocokkan ke planned workout berdasarkan tanggal + jenis + jarak terdekat; pengguna bisa koreksi manual.

---

## 7. Roadmap

Estimasi durasi mengasumsikan 1-2 developer full-stack; ini perkiraan kasar, bukan komitmen.

| Fase | Durasi estimasi | Output | Exit criteria |
|------|-----------------|--------|---------------|
| 0. Discovery | 2-3 minggu | Hasil survey, 8-12 wawancara, analisis kompetitor, landing page + waitlist | Problem P1-P4 terkonfirmasi (atau direvisi); persona MVP final |
| 1. MVP (gratis) | 6-8 minggu | Onboarding, plan 5K/10K/HM/FM, Hari ini, timer, log + RPE, 3 grafik, auth, ABC drill sebagai pemanasan. Rilis Web + TestFlight + Play internal testing | 50-100 beta tester aktif |
| 2. Integrasi & adaptif | 4-6 minggu | Strava, Apple Health, Health Connect, aturan adaptasi, notifikasi, strength dasar bodyweight 2x/minggu + core (gratis, uji minat) | Retensi W4 terukur, sinkronisasi stabil |
| 3. Monetisasi | 3-4 minggu | Paywall Premium, RevenueCat + Stripe, trial, strength Premium (progresi beban, plyometrik, animasi lengkap, program pencegahan cedera) | Konversi free-to-paid terukur |
| 4. Growth | Berkelanjutan | Race lokal, challenge, share card ke IG, run club, export workout ke jam, AI coach | Ditentukan dari data |

### 7.1 Breakdown MVP per minggu (indikatif)

| Minggu | Pekerjaan |
|--------|-----------|
| 1 | Setup monorepo, Expo, Supabase, auth, CI, design token (warna zona, tipografi) |
| 2-3 | training-engine: zona pace, generator plan 4 jarak, workout library, unit test |
| 3-4 | Onboarding + preview plan, layar Hari ini, kalender Plan |
| 5 | Workout timer (segmen, audio, getar, layar terkunci) |
| 6 | Log manual + RPE, layar Progres (3 grafik) |
| 7 | Offline sync, notifikasi, polishing, analytics event |
| 8 | Beta: TestFlight, Play internal track, deploy web; perbaikan bug |

---

## 8. Monetisasi

### 8.1 Tahapan

1. **Fase 1-2: 100% gratis.** Tujuan: retensi dan word of mouth. Tidak ada iklan (merusak UX latihan dan kepercayaan soal data kesehatan).
2. **Fase 3: Freemium.** Core tetap gratis selamanya, fitur lanjutan Premium.
3. **Early adopter**: harga khusus/lifetime untuk beta tester sebagai terima kasih dan sumber testimoni.

### 8.2 Pembagian fitur (draft, divalidasi survey)

| Fitur | Free | Premium |
|-------|------|---------|
| Plan 5K & 10K | Ya | Ya |
| Plan HM & FM | Ya (template standar) | Ya + adaptif penuh |
| Workout timer + audio cue | Ya | Ya |
| Log manual + RPE | Ya | Ya |
| Grafik progres dasar (8 minggu terakhir) | Ya | Riwayat penuh |
| Sinkron Strava/Apple Health/Health Connect | Ya (driver akuisisi) | Ya |
| Adaptasi plan otomatis | Dasar | Penuh |
| Prediksi waktu race + zona pace/HR detail | Tidak | Ya |
| Banyak target sekaligus / plan custom | Tidak | Ya |
| ABC drill (pemanasan) | Ya | Ya |
| Strength dasar bodyweight + core | Ya (fase 2) | Ya |
| Strength lanjutan (progresi beban, plyometrik, pencegahan cedera spesifik) + mobility | Tidak | Ya |
| Export workout ke jam (Garmin/Apple Watch) | Tidak | Ya |

### 8.3 Harga

Belum ditentukan. Harga akan diturunkan dari:
- Pertanyaan Van Westendorp di survey (`docs/SURVEY.md`, bagian E).
- Harga kompetitor yang diverifikasi di fase Discovery.
- Uji A/B paywall (bulanan vs tahunan, durasi trial) via feature flag.

Catatan platform: langganan digital di dalam app iOS/Android umumnya wajib memakai in-app purchase (Apple/Google mengambil komisi); pembayaran web via Stripe. Cek aturan terbaru Apple/Google sebelum fase 3.

### 8.4 Sumber pendapatan lain (eksplorasi, fase 4)

- Kemitraan race organizer (pendaftaran race, plan resmi race).
- Program untuk run club / komunitas (dashboard coach).
- Program korporat (wellness challenge).

---

## 9. Metrik Keberhasilan

| Metrik | Definisi | Kapan diukur |
|--------|----------|--------------|
| Aktivasi | % pengguna yang menyelesaikan onboarding DAN 1 latihan dalam 7 hari | Fase 1+ |
| Retensi W1 / W4 | % pengguna yang mencatat >= 1 latihan di minggu ke-1 / ke-4 | Fase 1+ |
| Kepatuhan plan | Latihan selesai / latihan terjadwal per minggu | Fase 1+ |
| Penyelesaian plan | % plan yang mencapai minggu terakhir | Fase 2+ |
| Rasio sinkron | % pengguna aktif yang menghubungkan Strava/Health | Fase 2+ |
| Konversi | % pengguna aktif yang berlangganan Premium | Fase 3+ |
| Churn bulanan | % pelanggan yang berhenti per bulan | Fase 3+ |

Target angka sengaja **belum** ditetapkan: tentukan dari baseline beta (Fase 1) agar tidak berdasarkan tebakan.

Event analytics minimum: `onboarding_completed`, `plan_created`, `workout_started`, `workout_completed`, `workout_skipped`, `rpe_submitted`, `integration_connected`, `paywall_viewed`, `subscription_started`.

---

## 10. Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
|--------|--------|----------|
| Cedera pengguna karena plan terlalu agresif | Tinggi (reputasi, legal) | Aturan konservatif, screening, disclaimer, tombol cedera, review plan oleh pelatih bersertifikat |
| Perubahan kebijakan Strava API | Tinggi untuk fitur sync | Jangan bergantung pada satu sumber; HealthKit/Health Connect + manual sebagai jalur paralel |
| Timer tidak andal di background (iOS) | Sedang | Notifikasi lokal terjadwal + timestamp absolut; uji di device nyata |
| Retensi rendah setelah minggu 2 | Tinggi | Pengingat, streak ringan, ringkasan mingguan, plan yang realistis |
| Review App Store/Play (data kesehatan) | Sedang | Privacy policy jelas, izin minimal, isi formulir data safety dengan benar |
| Pasar sudah ramai | Sedang | Fokus kesederhanaan + konteks lokal; validasi di Discovery sebelum build penuh |
| Cedera saat strength/plyo (teknik salah) | Sedang | Bodyweight dulu, animasi + cue teknik, plyo hanya level lanjut, review fisioterapis |
| Biaya produksi animasi gerakan | Sedang | Mulai dari SVG berbasis pose; Rive/video hanya untuk gerakan prioritas |
| Biaya infrastruktur | Rendah di awal | Tier gratis Supabase/PostHog/Sentry cukup untuk beta; pantau saat skala |

---

## 11. Keputusan Terbuka

| # | Pertanyaan | Kapan diputuskan |
|---|-----------|------------------|
| D1 | Persona utama: pemula atau rekreasional? | Setelah survey |
| D2 | Perlu GPS tracking sendiri atau cukup integrasi? | Setelah survey (pertanyaan device) |
| D3 | Pace-based vs HR-based sebagai default | Setelah survey (berapa % punya smartwatch) |
| D4 | Apakah sinkron Strava gratis atau Premium | Sebelum fase 3, berdasarkan data akuisisi |
| D5 | Nama dan brand aplikasi | Fase 0 |
| D6 | Kolaborasi pelatih bersertifikat untuk review template plan | Fase 0-1 |
| D7 | Strength jadi pembeda utama atau cukup fitur Premium? | Setelah survey (pertanyaan 17a-17b) + data pemakaian fase 2 |
| D8 | Format animasi gerakan: SVG pose, Rive, atau video | Sebelum fase 2 |

## 12. Langkah Berikutnya (2 minggu pertama)

1. Finalisasi dan sebar survey (`docs/SURVEY.md`), target minimal 100 responden.
2. Jadwalkan 8-12 wawancara dari responden yang bersedia.
3. Buat landing page + waitlist.
4. Spike teknis 2-3 hari: Expo + timer background di iOS dan Android, chart di web + mobile, OAuth Strava.
5. Cari 1 pelatih lari bersertifikat untuk me-review aturan plan di bagian 4.
