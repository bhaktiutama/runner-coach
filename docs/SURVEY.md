# Survey Discovery: Kebiasaan Latihan Lari

Tujuan: memvalidasi problem P1-P4 dan menjawab keputusan terbuka D1-D4 di `docs/PLANNING.md`.

- Target responden: minimal 100 (pelari aktif dan yang ingin mulai lari).
- Kanal: komunitas lari (Instagram, Strava club, run club lokal, grup WhatsApp/Telegram), peserta race lokal.
- Durasi isi: target <= 5 menit (maks ~20 pertanyaan).
- Alat: Google Form atau Typeform. Ekspor ke CSV untuk analisis.

---

## A. Profil

1. Usia: <18 / 18-24 / 25-34 / 35-44 / 45-54 / 55+
2. Kota domisili: (isian)
3. Sudah berapa lama rutin lari? Belum mulai / <6 bulan / 6-12 bulan / 1-3 tahun / >3 tahun
4. Rata-rata lari per minggu saat ini: 0 / 1x / 2x / 3x / 4x / 5x+
5. Rata-rata jarak per minggu: 0 / <10 km / 10-20 km / 20-40 km / 40-60 km / >60 km
6. Jarak race terjauh yang pernah diselesaikan: Belum pernah / 5K / 10K / HM / FM / Ultra

## B. Target & Masalah

7. Target lari 6-12 bulan ke depan (boleh lebih dari satu): Finish 5K / Finish 10K / Finish HM / Finish FM / Personal best / Turun berat badan / Kesehatan umum / Lainnya
8. Apa kesulitan terbesar saat latihan? (pilih maks 3)
   - Tidak tahu harus latihan apa setiap hari
   - Program yang ada tidak cocok dengan jadwal saya
   - Sulit konsisten / kurang motivasi
   - Tidak tahu pace yang tepat
   - Sering cedera / lelah berlebihan
   - Tidak terlihat ada kemajuan
   - Aplikasi yang ada terlalu rumit
   - Pelatih pribadi terlalu mahal
   - Lainnya
9. Bagaimana Anda menentukan latihan saat ini? Tidak ada rencana / Plan dari internet (PDF, YouTube) / Aplikasi / Pelatih / Run club / Lainnya
10. Seberapa setuju: "Saya tahu persis apa yang harus saya lakukan di setiap sesi lari." (skala 1-5)

## C. Device & Aplikasi

11. HP utama: iPhone / Android
12. Jam/perangkat saat lari: Tidak pakai / Apple Watch / Garmin / Coros / Huawei / Xiaomi/Amazfit / Samsung / Polar / Suunto / Lainnya
13. Aplikasi yang dipakai untuk lari (boleh lebih dari satu): Strava / Nike Run Club / Garmin Connect / Runna / Adidas Running / Coros / Apple Fitness / Tidak ada / Lainnya
14. Apakah Anda pernah membayar aplikasi olahraga/lari? Ya, masih / Ya, sudah berhenti / Tidak pernah
15. Jika berhenti/tidak pernah membayar, kenapa? (isian singkat)

## D. Preferensi Fitur

16. Urutkan 5 fitur paling penting (1 = paling penting):
    - Plan latihan yang menyesuaikan kondisi saya
    - Timer interval dengan suara saat berlari
    - Grafik progres yang jelas
    - Sinkron otomatis dengan Strava/jam
    - Prediksi waktu race
    - Komunitas/teman latihan
    - Latihan kekuatan & stretching
    - Pengingat latihan
17. Lebih suka panduan intensitas berdasarkan: Pace (menit/km) / Detak jantung / Rasa (mudah-sedang-berat) / Tidak tahu

## E. Kesediaan Membayar (Van Westendorp)

Konteks untuk responden: "Bayangkan aplikasi yang memberi plan latihan personal harian yang menyesuaikan kondisi Anda, dengan timer dan grafik progres."

18. Pada harga per bulan berapa aplikasi ini **terlalu murah** sehingga Anda meragukan kualitasnya? (Rp)
19. Pada harga per bulan berapa aplikasi ini **murah / harga yang bagus**? (Rp)
20. Pada harga per bulan berapa aplikasi ini **mulai mahal**, tapi masih Anda pertimbangkan? (Rp)
21. Pada harga per bulan berapa aplikasi ini **terlalu mahal** sehingga Anda tidak akan membeli? (Rp)

## F. Penutup

22. Bersedia diwawancara 30 menit? (Ya + email/WA / Tidak)
23. Mau ikut beta tester gratis? (Ya + email / Tidak)

---

## Rencana Analisis

| Pertanyaan bisnis | Pertanyaan survey | Output |
|-------------------|-------------------|--------|
| Persona mana yang terbesar? (D1) | 3, 4, 5, 6 | Distribusi responden per persona |
| Problem mana yang paling nyata? (P1-P4) | 8, 9, 10 | Ranking masalah per persona |
| Perlu GPS sendiri? (D2) | 12, 13 | % responden tanpa jam dan tanpa app tracking |
| Pace atau HR default? (D3) | 12, 17 | % pemilik smartwatch, preferensi |
| Prioritas fitur | 16 | Skor rata-rata ranking per persona |
| Rentang harga | 18-21 | Kurva Van Westendorp: titik harga optimal dan rentang harga yang dapat diterima |
| Prioritas platform (iOS vs Android) | 11 | Split platform untuk prioritas QA dan rilis |

Catatan: sampel dari komunitas lari cenderung bias ke pelari yang sudah aktif. Catat kanal asal tiap responden dan laporkan hasil per kanal.
