# 08. Monetisasi (konsep paywall)

Status: Draft v0.1 (2026-10-30) | Fitur: F-23 | Layar: 4.4, 4.1, 2.1, 2.2s | Latar belakang: `docs/PLANNING.md` bagian 8

## Ringkasan

- **Model: hybrid "lari gratis, strength berbayar".** Plan lari lengkap gratis selamanya; strength + core gratis di 2 minggu pertama plan, sesudahnya Premium. Trial store 14 hari.
- **Harga usulan (placeholder): US$5,99 / bulan atau US$39,99 / tahun** (setara US$3,33 / bulan, hemat 44%). Harga final mengikuti tier store per negara dan hasil survey Van Westendorp.
- **Fase 2: gerbang ada di kode tetapi MATI** (`EXPO_PUBLIC_PAYWALL` tidak diisi = semua terbuka). Pembelian (RevenueCat) dipasang di Fase 3 setelah akun App Store / Google Play ada.

## 1. Pilihan model yang dipertimbangkan

| Model | Kelebihan | Kekurangan | Putusan |
|---|---|---|---|
| A. 1 profil latihan gratis, profil ke-2 dst. bayar | Mudah dipahami | App hanya mendukung 1 target aktif (index unik `goals_one_active`, Schema 2); multi-target harus dibangun dulu. Pelari umumnya menyiapkan 1 race dalam satu waktu, jadi yang butuh profil kedua sedikit (inferensi, belum ada data) | Tidak dipakai sebagai pemicu utama; "siapkan target berikutnya" jadi bonus Premium |
| B. Gratis 3 bulan pertama, lalu bayar semua | Pengguna sempat merasakan nilai | Plan 5K (8 mgg) / 10K (10 mgg) selesai sebelum ditagih. Bertentangan dengan PLANNING 8.1 "core tetap gratis selamanya". Tanpa server data, trial tidak bisa dijaga selain lewat trial store | Diganti trial store 14 hari |
| C. Plan lari gratis, strength berbayar | Sejalan dengan PLANNING 8.2. Batas jelas. Lari tetap jadi pendorong akuisisi | Fase 2 awalnya merencanakan strength dasar gratis untuk uji minat (D7); dikunci penuh = minat tidak terukur | **Dipakai, dengan 2 minggu strength gratis** supaya minat (D7) tetap terukur |

## 2. Pembagian fitur

| Fitur | Gratis | Premium |
|---|---|---|
| Plan lari 5K/10K/HM/FM/Bugar, adaptasi mingguan (F-03, F-11) | Ya | Ya |
| Timer, suara + getar, log manual, RPE (F-05, F-06, F-15) | Ya | Ya |
| Progres 8 minggu, backup/pulihkan (F-07, F-13, F-18) | Ya | Ya (riwayat penuh, Fase 3) |
| Panduan & istilah (F-20), bahasa (F-22) | Ya | Ya |
| Strength + core bodyweight (F-21) | Minggu 1-2 plan (`FREE_STRENGTH_WEEKS = 2`) | Seluruh plan + progresi gerakan (E-25) |
| Siapkan target berikutnya sebelum plan selesai | Tidak | Ya (Fase 3, butuh perubahan Schema) |
| Mobility, strength dengan beban, animasi gerakan | Tidak | Ya (Fase 3, D8) |

Aturan kunci (`apps/app/src/lib/entitlement.ts`, `isLocked`): terkunci hanya jika paywall aktif **dan** bukan Premium **dan** tipe `strength`/`core` **dan** `week_index > 2`. Lari tidak pernah terkunci. Sesi terkunci tetap terlihat di 2.1 dan 2.2s dengan tombol "Buka dengan Premium" ke 4.4.

## 3. Harga

| | Bulanan | Tahunan | Setara / bulan |
|---|---|---|---|
| Runna (US, sumber pihak ketiga Okt 2026) | US$19,99 | US$119,99 | US$9,99 |
| Strava (US, sumber pihak ketiga 2025-2026) | US$11,99 | US$79,99 | US$6,67 |
| **Run Coach (usulan)** | **US$5,99** | **US$39,99** | **US$3,33** |

- Alasan: di rentang US$5-10 yang diminta pemilik produk, sekitar 3x lebih murah dari Runna untuk segmen rekreasional (PRD P3 "terlalu mahal"). Ini inferensi, bukan hasil data.
- Indonesia: harga regional lewat tier store. Ilustrasi Rp 49.000 / bulan, Rp 299.000 / tahun hanya placeholder.
- Komisi store: program usaha kecil Apple / Google umumnya 15% (perlu dicek ulang sebelum Fase 3); bersih kira-kira US$5,09 dari US$5,99.
- Early adopter (PLANNING 8.1): beta tester mendapat harga tahunan diskon atau lifetime; mekanisme (kode promo store) diputuskan di Fase 3.
- Angka di kode: `apps/app/src/lib/pricing.ts` (ditandai PLACEHOLDER). Di app, harga final diambil dari store, bukan dari konstanta ini.

Sumber pembanding: the5krunner.com "Is Runna Free?" (14 Okt 2026), recurdash.com (Runna, Strava), Tom's Guide (bundel Strava + Runna), runnerspicks.com dan BikeRadar (kenaikan harga Strava). Belum diverifikasi langsung di App Store / strava.com.

## 4. Privasi

| Aturan | Detail |
|---|---|
| Tidak ada tabel langganan di server kita | Status entitlement dari RevenueCat per akun (`auth.uid()` atau ID anonim RevenueCat), Schema 5 |
| Data yang dikirim ke RevenueCat / store | Hanya ID akun + transaksi store. Tidak ada plan, latihan, RPE, kesehatan, nama |
| Offline | Status Premium terakhir di-cache di perangkat; jika tidak bisa dicek, app tidak mengunci sesi yang sudah terbuka |
| Analitik | Event `paywall_viewed` (properti `platform` saja). `subscription_started` ditambahkan saat pembelian aktif (Fase 3) |

## 5. Implementasi bertahap

| Tahap | Isi | Status |
|---|---|---|
| Fase 2 | `useEntitlement()` + `isLocked()` + flag `EXPO_PUBLIC_PAYWALL` (mati), layar 4.4 tanpa pembelian (tombol nonaktif + "Pembelian belum tersedia"), baris Premium di 4.1 hanya jika flag nyala, event `paywall_viewed` | Selesai (2026-10-30) |
| Fase 3 | RevenueCat (IAP iOS/Android, Stripe untuk web dicek), trial 14 hari, restore purchase, `subscription_started`, uji A/B bulanan vs tahunan lewat feature flag PostHog | Belum, butuh akun App Store / Play + keputusan pemilik |

## 6. Keputusan terbuka

| ID | Pertanyaan | Default |
|---|---|---|
| M1 | Lama strength gratis: 2 minggu pertama atau 1 sesi/minggu selamanya | 2 minggu pertama |
| M2 | Harga final per negara | Tunggu survey Van Westendorp + tier store |
| M3 | Trial 7 atau 14 hari | 14 hari |
| M4 | Sinkron Strava/Health gratis atau Premium (D4 PLANNING) | Gratis (driver akuisisi) |
