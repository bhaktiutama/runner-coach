# 07. Dasar Ilmiah Training Engine + Reasoning Plan

Status: Draft v0.1 (2026-10-29) | Dipakai oleh: TRD 4, PRD F-03/F-04/F-08/F-11, Schema 2 (`rationale`)

## Ringkasan

- Setiap keputusan engine punya **ID aturan** (`E-xx`), **tingkat bukti** (A-D) dan **referensi**. Engine wajib mengeluarkan daftar `rationale` untuk setiap plan, latihan dan usulan adaptasi, sehingga pengguna bisa melihat "kenapa" di layar 1.8, 2.2, 2.5 dan 3.2.
- Hasil validasi 19 aturan lama + 3 aturan baru (E-06, E-21, E-22): 4 Didukung, 8 Sebagian, 2 Diubah, 8 Heuristik (tanpa bukti langsung). Tidak ditemukan bukti bahwa aturan yang ada membahayakan.
- 3 perubahan aturan dari bukti: **aturan baru E-06** (satu sesi lari maks 110% lari terjauh 30 hari, Frandsen dkk. 2025), **taper diberi besaran** (volume turun 40-60%, intensitas tetap; Bosquet dkk. 2007), dan **aturan 10% tidak boleh diklaim mencegah cedera** (Buist dkk. 2008).

Cara verifikasi: setiap referensi dicek ke abstrak di PubMed, penerbit atau indeks perpustakaan pada 2026-10-29. Full text belum dibaca; angka di dokumen ini hanya yang tertulis di abstrak. Review pelatih bersertifikat (D6) tetap wajib dan memakai dokumen ini sebagai checklist.

## 1. Tingkat bukti

| Tingkat | Arti | Label di app |
|---------|------|--------------|
| A | Meta-analisis atau review sistematis dari uji terkontrol | "Bukti kuat" |
| B | Satu RCT atau kohort prospektif besar (n > 500) | "Bukti sedang" |
| C | Studi kecil, studi mekanistik, model empiris, atau konsensus ahli | "Bukti terbatas" |
| D | Praktik umum pelatih, tidak ditemukan studi langsung | "Praktik pelatih" |

Aturan tingkat D tetap boleh dipakai jika konservatif (lebih aman, bukan lebih agresif) dan sudah direview pelatih. App tidak boleh menampilkan aturan tingkat C/D seolah-olah terbukti.

## 2. Registri aturan

Kolom "Putusan": **Didukung** = bukti sejalan dengan aturan; **Sebagian** = arah benar, angka pastinya tidak diuji atau bukti dari populasi lain; **Heuristik** = tidak ada bukti langsung; **Diubah** = aturan direvisi karena bukti.

### 2.1 Estimasi fitness dan zona

| ID | Aturan (TRD) | Tingkat | Temuan kunci | Putusan |
|----|--------------|---------|--------------|---------|
| E-01 | Prediksi waktu Riegel `T2 = T1 x (D2/D1)^1.06`, tampil rentang (4.1) | C | Rumus dari kurva rekor dunia [R1]. Pada 2.303 pelari rekreasional, Riegel terkalibrasi baik sampai HM, tetapi untuk maraton terlalu cepat: median selisih 10:09 menit, 25% pelari meleset > 20 menit, persentil ke-90 +2:53 menit (validasi n = 156) [R2] | Sebagian. Rentang per 4.1 (keputusan E-O1) |
| E-02 | Zona pace kerangka Daniels / VDOT (4.1) | C | VDOT = model empiris dari performa race (Daniels dan Gilbert 1979, disempurnakan di edisi buku) [R3]. Standar praktik, bukan hasil RCT | Didukung sebagai kerangka. Koefisien rumus wajib dicek ke buku edisi 4 (E-O4) |
| E-20 | Waktu race / time trial baru: hitung ulang zona dan prediksi (4.3) | C | VDOT diturunkan dari performa terbaru [R3]; performa lebih baru lebih mewakili kondisi sekarang | Didukung |

### 2.2 Struktur plan

| ID | Aturan (TRD) | Tingkat | Temuan kunci | Putusan |
|----|--------------|---------|--------------|---------|
| E-03 | Durasi plan 5K 8 / 10K 10 / HM 12 / FM 16-18 / Bugar 8 minggu (4.2) | D | Tidak ditemukan studi yang membandingkan durasi plan untuk pelari rekreasional | Heuristik |
| E-04 | Fase Base -> Build -> Peak -> Taper (4.2) | C | Konsensus ECSS/ACSM: latihan butuh overload, tetapi overload berlebih tanpa pemulihan cukup harus dihindari [R4]. Urutan fase spesifik tidak diuji | Sebagian |
| E-05 | Kenaikan volume mingguan maks 10%, dibanding minggu non-cutback terakhir (4.2) | B | RCT 13 minggu (aturan 10%) vs 8 minggu pada pelari pemula: cedera 20,8% vs 20,3%, tidak beda [R5]. Kohort 874 pemula: kenaikan > 30% dalam 2 minggu, HR 1,59 (95% CI 0,96-2,66; p = 0,07) untuk cedera terkait jarak [R6]. Kohort 5.205 pelari: perubahan minggu ke minggu hampir tidak berhubungan dengan cedera [R7] | Sebagian. Dipertahankan sebagai batas konservatif; **teks app tidak boleh mengklaim 10% mencegah cedera** |
| E-06 | **Baru.** Jarak satu sesi maks 110% dari lari terjauh 30 hari terakhir | B | Kohort 5.205 pelari, 588.071 sesi: risiko cedera overuse naik bila satu sesi > 10% di atas lari terjauh 30 hari terakhir (naik 64% untuk +10-30%, 52% untuk +30-100%, 128% untuk > +100%) [R7]. Observasional; jendela 30 hari dipilih peneliti, hasil serupa untuk 14 hari | Diubah (aturan ditambah). Nilai awal = `goals.longest_run_m` (layar 1.5, "lari terjauh 4 minggu") |
| E-07 | Cutback week tiap minggu ke-3/4, volume turun 20-30% (4.2) | D | Tidak ditemukan review sistematis tentang frekuensi atau besaran cutback pada pelari. Prinsip keseimbangan beban-pemulihan dari [R4] | Heuristik |
| E-08 | Long run maks porsi volume mingguan (5K/10K 30%, HM 35%, FM 45%) dan maks durasi (2 / 2,5 / 3 jam) (4.2) | D | Tidak ditemukan studi langsung. Kerangka beban-kapasitas: cedera terjadi bila beban per sesi melebihi kapasitas jaringan [R8]; E-06 adalah versi berbukti dari batas per sesi. v0.2 (2026-10-30): porsi HM/FM dinaikkan karena dengan 30% long run FM puncak hanya ~18 km pada volume 60 km; batas durasi mencegah sesi sangat panjang untuk pelari lambat | Heuristik. Berlaku bersama E-06; yang lebih ketat menang |
| E-09 | ~80% waktu lari di intensitas easy (4.2) | A | Meta-analisis 17 studi (n = 437): polarized lebih baik untuk VO2peak (SMD 0,24; 95% CI 0,01-0,48), tetapi **tidak beda** untuk time trial (SMD -0,01; 95% CI -0,28-0,25); keunggulan terutama pada atlet terlatih tinggi [R9]. RCT 30 pelari rekreasional 10 minggu: 10K membaik 5,0% (77% easy) vs 3,6% (46% easy), beda tidak signifikan [R10] | Sebagian. Porsi easy besar didukung sebagai praktik aman; keunggulan atas distribusi lain untuk pelari rekreasional belum terbukti |
| E-10 | Sesi berat maks 2/minggu, pemula 0-1, tidak di 2 hari berurutan (4.2) | C | Pemulihan saraf otonom setelah sesi di atas ambang ventilasi 1 lebih lama dari sesi easy; pada atlet kurang terlatih >= 90 menit vs ~30 menit pada atlet terlatih tinggi (n = 17) [R11]. Pelari pemula: 17,8 cedera per 1.000 jam vs 7,7 pada rekreasional [R12] | Sebagian. Arah (jeda antar sesi berat, pemula lebih konservatif) didukung; angka 2 dan 0-1 heuristik |
| E-11 | Taper 5K/10K 1 mgg, HM 1-2, FM 2-3 (4.2) | A | Meta-analisis 27 studi: taper 2 minggu, volume turun 41-60% secara eksponensial, intensitas dan frekuensi dipertahankan memberi efek terbesar [R13] | Diubah. Durasi tetap; **ditambah: volume turun 40-60% dari minggu puncak, intensitas dan frekuensi sesi dipertahankan** |
| E-14 | Run-walk untuk pemula (kriteria: keputusan E-O2) | B | RCT 42 pelari maraton: run-walk vs lari terus, waktu finish tidak beda (4:14 vs 4:08, p = 0,377), nyeri otot dan kelelahan lebih rendah (p = 0,006) [R14]. Pelari pemula punya risiko cedera per jam lebih tinggi [R12]. Bukti dari maraton, bukan pemula 5K | Sebagian. Kriteria masuk dan keluar run-walk tingkat D |
| E-15 | ABC drill 8-12 mnt setelah pemanasan easy, sebelum sesi kualitas (4.2, F-17) | C | Pemanasan memperbaiki performa pada 79% kriteria yang diukur (32 studi) [R15]; bukti pencegahan cedera belum cukup, tetapi condong ke manfaat [R16]. Tidak ditemukan studi khusus ABC drill | Sebagian (pemanasan didukung; drill spesifik heuristik) |

### 2.3 Keamanan

| ID | Aturan (TRD) | Tingkat | Temuan kunci | Putusan |
|----|--------------|---------|--------------|---------|
| E-12 | Screening "Ya" -> mode ringan, tanpa sesi berat + saran ke dokter (4.2, O3) | C | PAR-Q+ dan ePARmed-X+ (konsensus panel) [R17]. ACSM 2015: skrining didasarkan pada tingkat aktivitas sekarang, tanda/gejala atau penyakit kardiovaskular/metabolik/ginjal, dan **intensitas yang diinginkan** [R18] | Didukung (konsensus). Intensitas rendah + rujukan dokter sejalan dengan model ACSM |
| E-13 | Setelah jeda plan atau tidak lari >= 10 hari: 1 minggu Return to run (4.2, 4.3) | C | Detraining jangka pendek (< 4 minggu): VO2max dan volume darah turun cepat pada atlet terlatih, lebih ringan pada yang baru berlatih [R19]. Ambang 10 hari dan lama 1 minggu heuristik. E-06 otomatis menurunkan batas sesi karena lari terjauh 30 hari ikut turun | Sebagian |

### 2.4 Adaptasi (TRD 4.3)

| ID | Aturan | Tingkat | Temuan kunci | Putusan |
|----|--------|---------|--------------|---------|
| E-16 | RPE 1-10 per sesi sebagai input adaptasi | B | Session-RPE valid dibanding standar detak jantung [R20]; review 2017 mencatat 36 studi validitas dan reliabilitas metode ini [R21] | Didukung (sebagai alat ukur) |
| E-17 | RPE >= 8 pada easy run 2x berturut-turut -> volume minggu depan -10%, 1 sesi berat diganti easy | D | Ketidakseimbangan beban-pemulihan bisa menyebabkan non-functional overreaching [R4]. Ambang 8 dan "2x" tidak diuji | Heuristik (arah konservatif) |
| E-18 | RPE <= 4 pada sesi kualitas 3x berturut-turut -> pace sesi kualitas naik 1 tingkat | D | Tidak ditemukan studi. Lebih kuat jika dikonfirmasi time trial (E-20) | Heuristik. Usulan teks 2.5 menawarkan time trial sebagai alternatif |
| E-19 | 1 latihan terlewat: lanjut; >= 2 terlewat seminggu: ulangi minggu | D | Tidak ditemukan studi | Heuristik |
| E-21 | Recovery run maks 30 mnt sehari setelah long run / sesi berat (rekreasional, >= 5 hari) | D | Tidak ditemukan studi khusus recovery run. Prinsip keseimbangan beban-pemulihan [R4] | Heuristik |
| E-22 | Progression run (easy + 10 mnt pace maraton) di fase Build, selang seminggu | D | Tidak ditemukan studi | Heuristik |

### 2.5 Sengaja tidak dipakai

| Metode | Alasan |
|--------|--------|
| Acute:Chronic Workload Ratio (ACWR) | Kritik metodologis: hubungan kausal belum diuji, masalah data rasio [R22]. Pada 5.205 pelari, ACWR tidak berhubungan dengan cedera [R7] |
| Strength training di MVP | Di luar scope MVP (PRD 5). Dicatat untuk fase 2: latihan kekuatan menurunkan cedera olahraga (RR 0,315; 95% CI 0,207-0,480; 25 RCT) [R23] dan memperbaiki running economy pelari terlatih (SMD -1,42) [R24] |

## 3. Reasoning yang dilihat pengguna

### 3.1 Output engine

Setiap fungsi engine yang membuat keputusan mengembalikan `rationale` di samping hasilnya.

```ts
type RuleId = `E-${string}`;            // dari registri bagian 2
type Rationale = {
  rule: RuleId;
  values: Record<string, number | string>; // angka yang dipakai, satuan m / s
};
```

| Level | Disimpan di | Minimal berisi |
|-------|-------------|----------------|
| Plan | `plans.params.rationale` | E-01 atau E-02 (sumber zona), E-03, E-04, E-05, E-06, E-09, E-11 (jika ada taper), E-12 (jika mode ringan) |
| Latihan | `planned_workouts.rationale` | Alasan tipe latihan + fase; E-06/E-08 untuk long run; E-10 untuk sesi berat; E-15 jika ada drill; E-13 jika minggu return |
| Adaptasi | `plan_adjustments.rule` + `changes` | ID aturan E-16 s.d. E-20 yang terpicu + nilai pemicunya |

Contoh latihan long run:

```json
[
  { "rule": "E-06", "values": { "distance_m": 13000, "longest_30d_m": 12000, "cap_m": 13200 } },
  { "rule": "E-08", "values": { "distance_m": 13000, "week_volume_m": 45000, "share_pct": 29 } }
]
```

Teks tidak disimpan di database. Registri statis di `packages/training-engine/src/evidence/` (seperti daftar ABC drill, tanpa tabel DB) berisi per aturan: `id`, `grade`, `refs[]`, dan kunci template teks; teksnya di katalog `packages/training-engine/src/i18n/id.ts` (TRD 8). UI mengisi template dengan `values` dan memformat satuan di layer UI (TRD 2 aturan 3).

### 3.2 Template teks (sapaan "kamu")

| ID | Template |
|----|----------|
| E-01 | "Perkiraan waktumu {range}, paling mungkin {likely}, dihitung dari waktu {baseline} kamu dengan rumus Riegel. Untuk maraton rumus ini rata-rata 10 menit terlalu cepat pada pelari rekreasional, jadi batas cepatnya adalah skenario terbaik." |
| E-14 | "Larimu diselingi jalan: {run_min} menit lari, {walk_min} menit jalan. Cara ini mengurangi pegal dan lelah tanpa memperlambat progres; blok lari bertambah tiap minggu sampai kamu lari 20 menit tanpa berhenti." |
| E-05 | "Volume minggu ini {week_km} km, naik {pct}% dari minggu lalu. Kami menaikkan bertahap (maks 10%) sebagai batas aman; penelitian belum membuktikan angka 10% itu sendiri mencegah cedera." |
| E-06 | "Long run {distance_km} km, maks 10% di atas lari terjauhmu 30 hari terakhir ({longest_km} km). Studi pada 5.205 pelari menemukan risiko cedera naik saat satu lari melewati batas ini." |
| E-09 | "Sekitar {easy_pct}% waktu larimu minggu ini di pace easy. Porsi easy yang besar membangun daya tahan dengan beban pemulihan rendah." |
| E-10 | "Sesi berat diberi jarak minimal 1 hari supaya tubuhmu pulih; pemulihan setelah sesi berat lebih lama dibanding lari easy." |
| E-11 | "Minggu taper: volume turun {pct}% tetapi intensitas tetap. Meta-analisis menemukan pola ini paling membantu performa saat race." |
| E-12 | "Karena ada jawaban 'Ya' di pertanyaan kesehatan, plan dibuat tanpa sesi berat. Konsultasikan dulu ke dokter; kamu bisa mengubah ini di Profil." |
| E-13 | "Minggu kembali berlari: volume rendah dan tanpa sesi berat, karena kebugaran turun cukup cepat setelah {days} hari tidak berlari." |
| E-17 | "RPE easy run-mu {rpe1} dan {rpe2} (target easy: 3-5). Minggu depan volume turun 10% dan 1 sesi berat jadi easy supaya kamu pulih." |

Template aturan lain mengikuti pola yang sama dan ditulis di registri saat M2. Setiap template wajib menyebut angka yang dipakai (dari `values`), bukan kalimat umum.

### 3.3 Tampilan (tanpa layar baru)

| Layar | Isi |
|-------|-----|
| 1.8 Preview | Kartu lipat "Kenapa plan ini?" di bawah pace: 4 rationale level plan teratas + "Lihat semua" (wireframe 1.8) |
| 2.2 Detail latihan | "Kenapa latihan ini?" (sudah ada di F-04) diisi rationale latihan |
| 2.5 Ringkasan minggu | Alasan usulan adaptasi dari rationale adaptasi |
| 3.2 Pindah latihan | Pesan cek aturan memakai template E-06, E-08, E-10 |

Setiap item: teks template + label tingkat bukti (bagian 1) + "Lihat sumber" (daftar referensi singkat penulis, tahun, jurnal, tautan DOI/PubMed). Tautan dibuka di browser luar; app tidak mengirim data apa pun ke tautan itu.

### 3.4 Privasi

`rationale` berisi data pribadi (volume, RPE, waktu race), jadi hanya di SQLite lokal dan ikut file backup (TRD 3). Tidak boleh masuk event analitik atau Sentry. Event boleh memuat ID aturan saja (mis. `adjustment_proposed` dengan `rule: "E-17"`) tanpa `values`.

### 3.5 Test wajib (M2)

1. Setiap aturan di TRD 4.2 dan 4.3 punya entri registri dengan `grade` dan `refs` (boleh kosong hanya untuk tingkat D).
2. Setiap plan hasil generator punya rationale level plan sesuai tabel 3.1; setiap `planned_workout` selain `rest` punya >= 1 rationale.
3. Setiap placeholder di template terisi oleh `values` untuk semua kombinasi target x level x hari tersedia (3-6).
4. E-01: rentang FM = `[Riegel, Riegel + 20 mnt]`; 5K-HM = Riegel +-3%. E-14: run-walk hanya untuk `beginner` dengan lari terjauh < 3 km dan berhenti setelah blok lari 20 menit.
5. E-06: tidak ada sesi di plan yang melebihi 110% lari terjauh 30 hari (dihitung dari plan itu sendiri + `longest_run_m`).
6. E-11: volume minggu taper terakhir 40-60% di bawah minggu puncak; jumlah sesi kualitas per minggu tidak berkurang (kecuali mode ringan).

## 4. Keputusan

Diputuskan 2026-10-29 oleh pemilik produk: E-O1 dan E-O2 memakai usulan di bawah (disusun dari bukti yang ada), tetap direview pelatih (D6).

| ID | Pertanyaan | Keputusan | Dasar | Tingkat |
|----|-----------|-----------|-------|---------|
| E-O1 | Rentang prediksi waktu race | **5K-HM:** `[T x 0,97, T x 1,03]`, `T` = Riegel 1,06. **FM:** `[T, T + 20 menit]`, titik "paling mungkin" `T + 10 menit`. Jika waktu acuan 5K atau 10K (bukan HM) untuk target FM: label "perkiraan kasar" + saran time trial 10K/HM di minggu Build (E-20) | FM: median selisih Riegel 10:09 menit terlalu cepat, 75% pelari meleset <= 20 menit [R2]. R2 memakai race non-maraton terjauh pelari (umumnya HM) sebagai acuan, jadi acuan 5K/10K kemungkinan lebih meleset (inferensi, tidak diukur). Lebar +-3% untuk 5K-HM tidak berasal dari studi | FM: B. 5K-HM: D |
| E-O2 | Kapan pemula memakai run-walk | **Masuk:** level `beginner` (tanpa waktu acuan) **dan** lari terjauh 4 minggu < 3 km, apa pun targetnya. **Progresi:** porsi lari per blok naik tiap minggu, total waktu sesi tetap (aturan E-05 berlaku pada menit lari). **Keluar:** saat blok lari mencapai 20 menit tanpa jalan, latihan easy berikutnya jadi lari kontinu | 3 km ~ 20-25 menit pada pace pemula; ambang "lari 20-30 menit tanpa berhenti" adalah syarat 10K di PLANNING 4.3. Manfaat run-walk: [R14] | D |
| E-O3 | Wireframe 1.8 belum punya "Kenapa plan ini?" | Selesai: wireframe 1.8 diperbarui (kartu lipat, 4 alasan + label bukti + "Lihat sumber", "Lihat semua") | | |
| E-O4 | Koefisien rumus VDOT yang beredar berasal dari sumber sekunder | Terbuka. Implementasi dari Daniels' Running Formula edisi 4 [R3] + unit test terhadap tabel di buku | | |
| E-O5 | E-06 bisa membuat long run naik lambat pada volume rendah | Ikuti E-06; jika durasi plan tidak cukup mencapai long run minimum target, tawarkan target lebih pendek (FL-1 layar 1.3/1.5) | | |

## 5. Referensi

Semua dicek 2026-10-29 dari abstrak atau metadata. "PMID" = PubMed ID.

| ID | Referensi | Pengenal |
|----|-----------|----------|
| R1 | Riegel PS. Athletic records and human endurance. American Scientist 1981;69(3):285-290 | JSTOR 27850427 |
| R2 | Vickers AJ, Vertosick EA. An empirical study of race times in recreational endurance runners. BMC Sports Sci Med Rehabil 2016;8. Full text (Tabel 4) dibaca untuk E-O1 | PMC5000509 |
| R3 | Daniels J. Daniels' Running Formula, edisi 4. Human Kinetics (c) 2022. Asal VDOT: Daniels J, Gilbert J. Oxygen Power, 1979 | ISBN 9781718203662 |
| R4 | Meeusen R, dkk. Prevention, diagnosis and treatment of the overtraining syndrome: joint consensus statement ECSS/ACSM. Med Sci Sports Exerc 2013;45(1):186-205; juga Eur J Sport Sci 2013;13(1):1-24 | doi:10.1080/17461391.2012.730061 |
| R5 | Buist I, dkk. No effect of a graded training program on the number of running-related injuries in novice runners: a randomized controlled trial. Am J Sports Med 2008;36(1):33-39 | Protokol: GRONORUN, BMC Musculoskelet Disord 2007 |
| R6 | Nielsen RO, dkk. Excessive progression in weekly running distance and risk of running-related injuries. J Orthop Sports Phys Ther 2014 | Abstrak di repositori Aalborg University |
| R7 | Frandsen JSB, Hulme A, Parner ET, Nielsen RO, dkk. How much running is too much? Identifying high-risk running sessions in a 5200-person cohort study. Br J Sports Med 2025;59:1203-1210 | PMC12421110 |
| R8 | Bertelsen ML, dkk. A framework for the etiology of running-related injuries. Scand J Med Sci Sports 2017;27(11):1170-1180 | doi:10.1111/sms.12883, PMID 28329441 |
| R9 | Silva Oliveira P, Boppre G, Fonseca H. Comparison of polarized versus other types of endurance training intensity distribution on athletes' endurance performance: systematic review with meta-analysis. Sports Med 2024;54(8):2071-2095 | doi:10.1007/s40279-024-02034-z, PMID 38717713 |
| R10 | Munoz I, dkk. Does polarized training improve performance in recreational runners? Int J Sports Physiol Perform 2014;9(2):265-272 | doi:10.1123/ijspp.2012-0350, PMID 23752040 |
| R11 | Seiler S, Haugen O, Kuffel E. Autonomic recovery after exercise in trained athletes: intensity and duration effects. Med Sci Sports Exerc 2007;39(8):1366-1373 | PMID 17762370 |
| R12 | Videbaek S, dkk. Incidence of running-related injuries per 1000 h of running in different types of runners: systematic review and meta-analysis. Sports Med 2015;45(7):1017-1026 | doi:10.1007/s40279-015-0333-8, PMID 25951917 |
| R13 | Bosquet L, Montpetit J, Arvisais D, Mujika I. Effects of tapering on performance: a meta-analysis. Med Sci Sports Exerc 2007;39(8):1358-1365 | PMID 17762369 |
| R14 | Hottenrott K, dkk. Does a run/walk strategy decrease cardiac stress during a marathon in non-elite runners? J Sci Med Sport 2016;19(1):64-68 | PMID 25467199 |
| R15 | Fradkin AJ, Zazryn TR, Smoliga JM. Effects of warming-up on physical performance: systematic review with meta-analysis. J Strength Cond Res 2010;24(1):140-148 | PMID 19996770 |
| R16 | Fradkin AJ, Gabbe BJ, Cameron PA. Does warming up prevent injury in sport? The evidence from randomised controlled trials. J Sci Med Sport 2006 | PMID 16679062 |
| R17 | Warburton DER, Jamnik VK, Bredin SSD, Gledhill N. PAR-Q+ and ePARmed-X+: summary of consensus panel recommendations. Health Fit J Can 2011;4(2):26-37. Versi resmi terbaru: 2023 | |
| R18 | Riebe D, dkk. Updating ACSM's recommendations for exercise preparticipation health screening. Med Sci Sports Exerc 2015;47(11):2473-2479 | doi:10.1249/MSS.0000000000000664, PMID 26473759 |
| R19 | Mujika I, Padilla S. Detraining: loss of training-induced physiological and performance adaptations. Part I. Sports Med 2000;30(2):79-87 | doi:10.2165/00007256-200030020-00002 |
| R20 | Foster C, dkk. A new approach to monitoring exercise training. J Strength Cond Res 2001;15(1):109-115 | |
| R21 | Haddad M, dkk. Session-RPE method for training load monitoring: validity, ecological usefulness, and influencing factors. Front Neurosci 2017 | doi:10.3389/fnins.2017.00612 |
| R22 | Impellizzeri FM, dkk. Acute:chronic workload ratio: conceptual issues and fundamental pitfalls. Int J Sports Physiol Perform 2020;15:907-913 | |
| R23 | Lauersen JB, Bertelsen DM, Andersen LB. The effectiveness of exercise interventions to prevent sports injuries: systematic review and meta-analysis of RCTs. Br J Sports Med 2014;48:871-877 | |
| R24 | Balsalobre-Fernandez C, Santos-Concejero J, Grivas GV. Effects of strength training on running economy in highly trained runners: systematic review with meta-analysis. J Strength Cond Res 2016;30(8):2361-2368 | PMID 26694507 |

## 6. Batasan

- Hanya abstrak yang dibaca (kecuali R2); angka efek dan populasi bisa punya nuansa di full text. Sebelum beta publik, pelatih/peneliti membaca full text R5, R7, R9, R13 (yang mengubah aturan).
- Sebagian besar bukti dari pelari terlatih atau populasi Eropa/AS. Konteks lokal (panas, lembab; PLANNING 1.4) belum ada buktinya di dokumen ini.
- R7 observasional: menunjukkan hubungan, bukan sebab-akibat.
- Menambah aturan baru ke engine wajib menambah entri registri (bagian 2) di PR yang sama; tanpa entri, test 3.5 gagal.

## 7. Keputusan implementasi M2 (2026-10-29)

Angka di bawah adalah pilihan implementasi (tingkat D, konservatif) untuk hal yang belum diatur TRD 4.2. Semua ikut review pelatih (D6). Kode: `packages/training-engine/src/generator.ts`.

| Topik | Keputusan |
|-------|-----------|
| VDOT tanpa waktu acuan ("Saya tidak tahu") | Pemula VDOT 26 (5K ~35 mnt), rekreasional VDOT 33 (5K ~28 mnt). Prediksi dari VDOT ini selalu diberi label "perkiraan kasar". Diganti saat ada time trial (E-20) |
| Level jika pengguna memberi waktu acuan | Volume < 10 km/minggu = pemula, selain itu rekreasional (PRD 2) |
| Zona (E-02) | %VO2max: easy 59-74%, threshold 86-88%, interval 97,5-100%, repetisi 105-110%; marathon = pace prediksi maraton VDOT +-5 dtk. VDOT 50 menghasilkan T 4:15 /km dan I 3:55 /km (dicek terhadap tabel Daniels yang beredar; E-O4 tetap terbuka) |
| Volume awal | Minggu 1 = max(volume sekarang, lari terjauh, 4 km). Volume puncak target per level/jarak (pemula 5K 20 km ... rekreasional FM 60 km), dicapai hanya lewat E-05 |
| E-05 | Dihitung terhadap volume aktual minggu non-cutback terakhir, dibulatkan ke bawah per 100 m (lihat baris Volume dan pembulatan) |
| E-07 | Cutback tiap minggu ke-4 (bukan di taper), target 80% lalu dibulatkan, dijaga di rentang 20-30% |
| E-06 | Berlaku untuk **jarak lari** sesi (segmen jalan run-walk dan drill tidak dihitung). Lari terjauh awal (`longest_run_m`) dianggap berlaku 30 hari pertama |
| E-08 | Long run = min(porsi volume per jarak, batas durasi, batas E-06), dicek ulang terhadap volume aktual setelah pembulatan |
| E-10 | Base: 0 sesi berat; Build: 1; Peak/Taper: 2 jika rekreasional dan >= 4 hari lari, selain itu 1; cutback maks 1. Sesi berat tidak bersebelahan dengan sesi berat lain maupun long run |
| E-11 | Fraksi volume puncak per minggu taper: 1 mgg [50%], 2 mgg [70%, 50%], 3 mgg [80%, 65%, 50%]. HM taper 2 mgg jika plan >= 12 mgg; FM 3 mgg jika >= 18 mgg |
| Minggu race | Tidak ada latihan pada/sesudah hari race; long run dan sesi berat paling lambat 3 hari sebelum race. Race Senin/Selasa: minggu race tidak dihitung sebagai minggu latihan, taper = minggu sebelumnya |
| Jumlah sesi | Maks hari tersedia, tetapi tidak lebih dari volume/2,5 km (dibulatkan ke terdekat); easy run min 2 km. Hari tersedia = boleh dipakai, bukan wajib |
| E-14 run-walk | Mulai 1 mnt lari / 2 mnt jalan; grid 15 detik; menit lari aktual per sesi naik maks 10%/minggu; sesi easy 30 mnt, long 40 mnt (termasuk 5+5 mnt jalan). Minggu run-walk tanpa cutback (kenaikan sudah kecil); taper memotong ulangan 50% |
| E-15 | 5 gerakan x 2 set x 20 m (A-skip, B-skip, C-skip, high knees, carioca), estimasi 1 mnt per set = 10 mnt |
| E-13 | Minggu Return to run: easy saja, tiap sesi 50% lari terjauh 30 hari (min 2 km), maks 4 sesi; sisa plan digeser per minggu penuh |
| Pindah (3.2) | Sesi berat tidak boleh ke sebelah sesi berat lain; sehari setelah sesi berat/long = "bisa, pelan"; gabung = sesi berat dipertahankan + tambahan easy dibatasi E-06 |
| Volume dan pembulatan (v0.2, 2026-10-30) | Target volume dibulatkan ke bawah per 100 m (sebelumnya per 0,5-1 km, yang bersama pembulatan durasi per menit membuat volume pemula macet di ~10 km/minggu), dikurangi margin 100 m agar E-05 tetap terpenuhi. Jumlah sesi = volume/2,5 km dibulatkan ke terdekat. Volume kecil: long run dikurangi dulu supaya hari easy dapat min 2 km; jika hari easy tetap tidak muat, sisanya ke long run dalam batas E-06/E-08. Jarak easy yang terpotong E-06 dipindah ke pendinginan jogging sesi berat (intensitas tetap). Minggu race tanpa long run: 1 easy run pendek (min 2 km) |
| Pace easy | Durasi dari jarak memakai pace tengah tanpa pembulatan (sama dengan perhitungan jarak) |

