// Legenda kode huruf-angka yang muncul di laporan validasi: artinya dan dokumen asalnya.

export type LegendRow = { code: string; meaning: string; source: string };

export const PLAN_DOC = 'Plan Validity Testing Engine Run Coach (Claude Docs)';

export const LEGEND: LegendRow[] = [
  {
    code: 'E-01 sampai E-26',
    meaning:
      'Aturan engine: cara app menyusun dan menyesuaikan plan. Contoh: E-06 = batas jarak satu sesi, E-10 = sesi berat, E-11 = taper.',
    source:
      'docs/specs/02-TRD.md bagian 4.2 dan 4.3; bukti tiap aturan di docs/specs/07-ENGINE-EVIDENCE.md bagian 2; versi untuk pelatih di docs/engine-review.html',
  },
  {
    code: 'E-06a, E-11b, ...',
    meaning:
      'Sub-pemeriksaan validator untuk satu aturan. Huruf kecil di belakang = pemeriksaan ke berapa untuk aturan itu (daftar lengkap di laporan Lapisan 2).',
    source: `${PLAN_DOC}, bagian Lapisan 2; validation/lib/oracle.ts`,
  },
  {
    code: 'E-O1 sampai E-O5',
    meaning:
      'Keputusan terbuka engine (pertanyaan yang belum final, misal E-O4 = koefisien VDOT belum dicek ke buku Daniels).',
    source: 'docs/specs/07-ENGINE-EVIDENCE.md bagian 4; docs/engine-review.html bagian "Keputusan terbuka"',
  },
  {
    code: 'R1 sampai R24',
    meaning:
      'Referensi penelitian yang menjadi dasar aturan (misal R7 = kohort 5.205 pelari, R13 = meta-analisis taper).',
    source:
      'docs/specs/07-ENGINE-EVIDENCE.md bagian 5; docs/engine-review.html bagian "Daftar pustaka"; packages/training-engine/src/evidence/references.ts',
  },
  {
    code: 'Bukti A, B, C, D',
    meaning:
      'Tingkat bukti aturan. A = meta-analisis/review sistematis, B = RCT atau kohort besar, C = studi terbatas/konsensus, D = praktik pelatih tanpa studi langsung.',
    source: 'docs/specs/07-ENGINE-EVIDENCE.md bagian 1; docs/engine-review.html',
  },
  {
    code: 'D6',
    meaning: 'Keputusan produk: aturan engine wajib direview pelatih bersertifikat sebelum beta publik.',
    source: 'docs/specs/01-PRD.md tabel keputusan (baris D6)',
  },
  {
    code: 'F-01, F-11, F-21, ...',
    meaning: 'Nomor fitur produk (misal F-11 = adaptasi mingguan, F-21 = strength + core).',
    source: 'docs/specs/01-PRD.md',
  },
  {
    code: 'Layar 1.8, 2.2, 2.5, 3.2',
    meaning:
      'Nomor layar app: 1.8 Preview plan ("Kenapa plan ini?"), 2.2 Detail latihan ("Kenapa latihan ini?"), 2.5 Ringkasan minggu (usulan adaptasi), 3.2 Pindah latihan.',
    source: 'docs/specs/03-APP-FLOW.md; gambar di docs/wireframes/png/',
  },
  {
    code: 'TRD 4.2, 07 3.5, ...',
    meaning: 'Nomor bagian dokumen spec. TRD = 02-TRD.md, 07 = 07-ENGINE-EVIDENCE.md, PRD = 01-PRD.md.',
    source: 'docs/specs/',
  },
  {
    code: 'L1.1 sampai L1.6',
    meaning:
      'Uji Lapisan 1: saran di app sama dengan keluaran engine (plan, teks saran, angka di layar, adaptasi, pindah latihan, tanpa perubahan diam-diam).',
    source: `${PLAN_DOC}, bagian Lapisan 1`,
  },
  {
    code: 'L3.1 sampai L3.6',
    meaning:
      'Uji Lapisan 3: aturan sesuai referensi (paritas dokumen-kode, klaim teks, tingkat bukti, benchmark VDOT, benchmark Riegel, review pelatih).',
    source: `${PLAN_DOC}, bagian Lapisan 3`,
  },
  {
    code: 'H1 sampai H4',
    meaning:
      'Temuan prioritas tinggi yang sudah diketahui sebelum run ini (taper, sesi berat sesudah long run, sesi kualitas taper, teks E-03).',
    source: `${PLAN_DOC}, bagian Temuan yang sudah diketahui`,
  },
  {
    code: 'N1 sampai N3',
    meaning: 'Temuan minor yang sudah diketahui (angka E-07, easy run < 2 km, engine-review usang).',
    source: `${PLAN_DOC}, bagian Temuan yang sudah diketahui`,
  },
  {
    code: 'M1 sampai M5',
    meaning:
      'Temuan coaching yang diputuskan pelatih, bukan test otomatis (long run, dosis interval, easy run pendek, easy run minggu race, minggu 8).',
    source: `Analisis seed minggu 4; ${PLAN_DOC}, pertanyaan pelatih di Lapisan 3`,
  },
  {
    code: 'P1 sampai P10',
    meaning: 'Persona golden: 10 profil pengguna contoh yang dipakai di Lapisan 1 dan review pelatih.',
    source: `${PLAN_DOC}, bagian Matriks skenario; validation/lib/scenarios.ts`,
  },
  {
    code: 'S-0001, S-0002, ...',
    meaning: 'Nomor skenario matriks Lapisan 2, dibuat otomatis dan selalu sama tiap run (seed tetap).',
    source: 'validation/lib/scenarios.ts; daftar lengkap di file JSON hasil run',
  },
  {
    code: 'AD-01, RR-01, PD-01',
    meaning: 'Skenario adaptasi (AD), Return to run setelah jeda (RR), dan pindah latihan (PD).',
    source: `validation/lapisan2.val.ts; ${PLAN_DOC}, tabel Skenario adaptasi`,
  },
  {
    code: 'RAT-a sampai RAT-f',
    meaning:
      'Pemeriksaan angka di teks rationale ("Kenapa plan/latihan ini?") dibandingkan angka plan sebenarnya.',
    source: 'docs/specs/07-ENGINE-EVIDENCE.md bagian 3',
  },
  {
    code: 'WAJ-a sampai WAJ-e',
    meaning:
      'Pemeriksaan batas wajar: easy run minimal 2 km, tanggal di dalam plan, tidak ada 2 lari di tanggal sama, setiap latihan punya rationale, template terisi.',
    source: 'docs/specs/07-ENGINE-EVIDENCE.md bagian 3.5 dan 7',
  },
  {
    code: 'Kritis / Mayor / Minor',
    meaning:
      'Tingkat keparahan pelanggaran. Kritis = keamanan atau janji ke pengguna; Mayor = tidak sesuai spec; Minor = kualitas atau konsistensi.',
    source: `${PLAN_DOC}, bagian Lapisan 2`,
  },
  {
    code: 'VDOT, RPE, HM, FM',
    meaning:
      'VDOT = skor kebugaran Daniels dari waktu race; RPE = rasa berat latihan 1-10; HM = half marathon 21,1 km; FM = full marathon 42,2 km.',
    source: 'docs/engine-review.html bagian "Daftar istilah"',
  },
  {
    code: 'Pace E, M, T, I, R',
    meaning: 'Zona pace Daniels: Easy, Marathon, Threshold (tempo), Interval, Repetition (strides).',
    source: "docs/specs/02-TRD.md bagian 4.1; R3 (Daniels' Running Formula)",
  },
];
