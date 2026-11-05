# 01. Strategi toko (ASO) dan hipotesis

Status: Draft v0.1 (2026-11-05) | Copy listing: `02-LISTING-EN.md` | Terkait: `docs/specs/01-PRD.md` (P1-P4, D5), `docs/specs/08-MONETIZATION.md`, `docs/PLANNING.md` 1.3

## Ringkasan

- **Posisi yang diusulkan: "rencana lari lengkap yang gratis, menjelaskan alasannya, dan datanya tetap di HP".** Tiga hal ini bisa dibuktikan dari app hari ini dan berlawanan dengan arah pasar 2026 (Runna memindahkan plan pemula ke berbayar, gratis hanya minggu 1).
- **Tuas konversi terbesar ada di 3 screenshot pertama dan baris pertama deskripsi**, bukan di deskripsi panjang. Screenshot pertama = layar Hari ini (2.1), bukan logo atau onboarding.
- **Semua angka di bawah adalah hipotesis.** Target angka ditetapkan dari baseline 4 minggu pertama setelah rilis, lalu diuji lewat Product Page Optimization (App Store) dan Store Listing Experiments (Google Play).

## 1. Temuan riset

| # | Temuan | Sumber | Keyakinan |
|---|---|---|---|
| R1 | Runna: sejak 5 Jun 2026 plan pemula (New to Running, Return to Running, Path to parkrun) berbayar; tanpa langganan hanya minggu 1 tiap plan. Harga US$19.99 / bulan, US$119.99 / tahun | the5krunner.com, 14 Okt 2026 | Sedang (pihak ketiga, belum dicek di store) |
| R2 | Strava menaikkan harga 2023 (US$7.99 ke US$11.99 / bulan) dan meminta maaf setelah protes | Triathlete, road.cc, Cyclingnews | Tinggi untuk fakta, rendah untuk sentimen 2026 |
| R3 | Judul listing Runna menonjolkan "Running Plans & Coach" dan jarak race (5K, 10K, half, marathon); screenshot memakai alur onboarding + paywall trial | appgoblin.info, screensdesign.com | Sedang |
| R4 | 3 screenshot pertama tampil tanpa scroll (juga di hasil search App Store); urutan dan caption adalah variabel uji paling berpengaruh | appfollow.io, appscreenshotstudio.com, appalize.com | Rendah-sedang (blog vendor ASO, saling mengutip) |
| R5 | Screenshot dengan caption mengungguli tanpa caption sekitar 25-30% (analisis 500+ uji SplitMetrics, dikutip pihak ketiga) | trysonar.app, appfollow.io | Rendah (kutipan tangan kedua) |
| R6 | Rata-rata konversi halaman produk US 2025: 8.56% App Store, 16.15% Google Play (data AppTweak, dikutip) | trysonar.app | Rendah-sedang |
| R7 | Health & Fitness: median trial ke berbayar 39.9%; app yang memberi nilai sebelum paywall konversi 1.5-2x dibanding hard paywall; trial <= 4 hari lebih rendah | RevenueCat State of Subscription Apps 2025 (dikutip pihak ketiga) | Sedang; cek laporan asli sebelum dipakai di 08 |
| R8 | Rating < 4.0 menurunkan konversi tajam; >= 4.5 dianggap kompetitif. iOS membatasi prompt rating 3x / pengguna / 365 hari | appalize.com, appopportunity.com, dokumentasi SKStoreReviewController (dikutip) | Sedang untuk batas Apple, rendah untuk persentase |
| R9 | Batas karakter: App Store judul 30, subtitle 30, keywords 100 (byte), promotional text 170 (tidak diindeks, bisa diganti tanpa review), deskripsi 4000. Google Play judul 30, short description 80, deskripsi 4000 | support.google.com (Play), blog ASO (Apple) | Tinggi untuk Play, sedang untuk Apple (cek di App Store Connect) |
| R10 | Ukuran aset: iPhone 6.9" 1320 x 2868 px (wajib, diskalakan ke iPhone lain); iPad 13" 2064 x 2752 px jika iPad didukung; Play feature graphic 1024 x 500 px (JPEG / PNG 24-bit tanpa alpha), screenshot ponsel min. 2, disarankan 1080 x 1920 px | adalo.com, applaunchflow.com | Sedang; cek spesifikasi resmi sebelum ekspor |

Yang **tidak** ditemukan: data konversi khusus app lari, studi independen tentang efek pesan privasi pada install. H3 di bawah karena itu berkeyakinan rendah.

## 2. Hipotesis

Format: jika kita melakukan X, maka metrik Y naik, karena Z. Uji satu variabel per eksperimen.

| ID | Hipotesis | Dasar | Cara uji | Metrik |
|---|---|---|---|---|
| H1 | Menyatakan **"full plan, free"** (bukan hanya minggu 1) di promotional text, baris pertama deskripsi dan short description Play menaikkan konversi halaman produk | R1, PRD P3 "terlalu mahal" | Play Store Listing Experiment: short description A (fitur) vs B (gratis penuh) | Konversi halaman ke install |
| H2 | Screenshot pertama = **layar Hari ini** dengan caption hasil ("Know exactly what to run today") mengungguli screenshot plan atau onboarding | R4, PRD P1 (masalah no. 1) | PPO: urutan 1 = 2.1 vs 1.8 | Konversi halaman (impression ke install) |
| H3 | Pesan **"your training data stays on your phone"** di screenshot 8 dan deskripsi menaikkan konversi pada segmen yang sadar privasi, tanpa menurunkan konversi total | PRD bagian 3; belum ada data pasar | PPO: set dengan vs tanpa frame privasi di posisi 4 | Konversi; review yang menyebut privasi |
| H4 | Frame **"Every workout explains itself"** (rationale + tingkat bukti) membedakan dari plan generik dan menaikkan retensi W1 karena ekspektasi sesuai | F-03, F-04, 07 bagian 3 | Bandingkan retensi W1 kohort sebelum/sesudah set screenshot baru | Retensi W1, aktivasi |
| H5 | Kata kunci **jarak + level** ("beginner 5k", "half marathon training") lebih mudah diranking daripada "running app" yang dikuasai pemain besar | R3, logika persaingan kata kunci (inferensi) | Pantau ranking per kata kunci di App Store Connect / Play Console 4 minggu | Impression dari search |
| H6 | Meminta rating **setelah momen sukses** (minggu tuntas di 2.5, bukan setelah latihan pertama) menghasilkan rata-rata >= 4.5 | R8 | Butuh perubahan spec + library (lihat bagian 4) | Rata-rata rating, jumlah rating |
| H7 | Kata "Coach" di judul + subtitle dengan rentang jarak ("5K to Marathon") lebih jelas daripada nama saja | R3 | PPO tidak bisa menguji judul; uji di Play (judul bisa diuji di Store Listing Experiments) | Konversi |

## 3. Prinsip copy (berlaku untuk semua bahasa)

| Aturan | Alasan |
|---|---|
| Setiap klaim harus benar di build yang dirilis (lihat daftar cek di `02-LISTING-EN.md` bagian 7) | Review Apple 2.3 (metadata akurat); kepercayaan |
| Tidak ada nama kompetitor di judul, subtitle, keyword, screenshot | Aturan App Store dan Google Play soal metadata |
| Tidak ada "free", "best", "#1", emoji di judul Play; tidak ada ajakan "download now" di ikon dan feature graphic | Kebijakan metadata Google Play |
| Tidak ada angka sosial palsu ("1M runners", "4.9 stars") sebelum datanya ada | Akurasi; Review Apple |
| Tidak mengklaim GPS, Strava, Apple Health, jam tangan sampai fitur itu ada (F-xx fase 2 belum rilis) | PRD bagian 5 |
| Caption screenshot = manfaat, maksimal 2 baris, kata kerja di depan, satu kata kunci oranye | R5; gaya pemain besar |
| Gaya bahasa: kalimat pendek, "you", tanpa jargon kecuali istilah lari umum (pace, tempo, intervals) | Persona Pemula + Rekreasional |

## 4. Penerapan di app (usulan, butuh persetujuan spec)

Hal berikut **tidak** dikerjakan di dokumen ini karena menambah library/perilaku di luar spec (aturan CLAUDE.md). Diusulkan untuk M7 atau sesudahnya.

| # | Usulan | Dampak ke spec | Prioritas |
|---|---|---|---|
| A1 | Prompt rating native setelah minggu tuntas pertama (2.5, "Oke, terapkan" atau tutup), maks 1x per versi; tidak setelah latihan dengan RPE >= 8 | PRD fitur baru, library `expo-store-review`, event analitik `rating_prompt_shown` (tanpa data pribadi) | Tinggi (H6) |
| A2 | Halaman kebijakan privasi publik + isian App Privacy / Data safety yang konsisten dengan klaim "data stays on your phone" | Sudah di STATUS M7 no. 4 | Wajib sebelum listing |
| A3 | Cek nama "Run Coach" (D5): ketersediaan di kedua store dan merek dagang. Nama generik sulit dilindungi dan mungkin sudah dipakai | PRD D5 | Wajib sebelum listing |
| A4 | Gambar resolusi tinggi + lisensi jelas untuk feature graphic dan latar screenshot (imagery saat ini maks 887 px, lisensi belum diverifikasi) | `docs/design-system/assets/imagery/README.md` | Wajib sebelum listing |
| A5 | Listing Bahasa Indonesia (`id`) setelah EN, memakai istilah dari katalog `i18n/id.ts` | Dokumen `03-LISTING-ID.md` | Sedang |
| A6 | Kartu ringkasan yang bisa dibagikan (2.5, Fase 4) sebagai akuisisi organik | Sudah di PRD bagian 5 | Rendah sekarang |

## 5. Pengukuran

| Metrik | Sumber | Kapan |
|---|---|---|
| Konversi halaman produk (impression atau page view ke install) | App Store Connect Analytics, Play Console | Mingguan sejak rilis |
| Impression dari search per kata kunci | App Store Connect, Play Console | Mingguan |
| Aktivasi, retensi W1/W4 | Event analitik anonim (PRD 6) | Mingguan |
| Rating rata-rata dan jumlah | Kedua store | Mingguan |

Uji pertama yang disarankan (setelah >= 2 minggu baseline): H2 (urutan screenshot) di App Store, H1 (short description) di Play.

## Sumber

- the5krunner.com, "Is Runna Free?", 14 Okt 2026: https://the5krunner.com/2026/10/14/is-runna-free/
- Triathlete, Strava price hike: https://www.triathlete.com/culture/news/strava-apologizes-after-price-hike-backlash-we-just-moved-too-fast/
- Cyclingnews, Strava price rise: https://www.cyclingnews.com/news/the-strava-price-rise-controversy-what-happened-and-how-much-will-it-be-now
- AppGoblin, Runna keywords: https://appgoblin.info/apps/1594204443/keywords
- AppFollow, ASO screenshots 2026: https://appfollow.io/blog/aso-screenshots-best-practices
- App Screenshot Studio, first three screenshots: https://appscreenshotstudio.com/blog/first-three-app-store-screenshots-2026-conversion-playbook
- Appalize, A/B testing: https://www.appalize.com/blog/creative-optimization/app-store-ab-testing-how-to-run-experiments-that-convert
- Sonar, conversion benchmarks: https://trysonar.app/blog/app-store-conversion-rate.md
- RevenueCat, State of Subscription Apps 2025: https://revenuecat.com/state-of-subscription-apps-2025
- Adapty, Health & Fitness benchmarks: https://adapty.io/blog/health-fitness-app-subscription-benchmarks/
- Appalize, ratings impact: https://www.appalize.com/blog/app-marketing/app-store-ratings-impact-on-downloads-data-driven-analysis
- Google Play Console Help, store listing: https://support.google.com/googleplay/android-developer/answer/1078870
- AppDrift, character limits: https://appdrift.co/blog/app-store-character-limits-complete-reference
- Adalo, screenshot sizes: https://studio.adalo.com/blog/app-store-screenshot-sizes-2026 dan https://studio.adalo.com/blog/google-play-screenshot-sizes
