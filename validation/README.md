# Validasi engine (Plan Validity Testing)

Suite untuk membuktikan bahwa saran latihan Run Coach bisa dipertanggungjawabkan. Mengikuti dokumen
_Plan Validity Testing Engine Run Coach_ (Claude Docs). **Tidak masuk CI** dan tidak ikut `pnpm test`
atau `pnpm test:e2e`. Jalankan manual kapan saja dibutuhkan, misalnya sebelum review pelatih (D6),
sebelum beta, atau setelah engine berubah.

## Cara menjalankan

Dari akar repo:

```bash
pnpm validate:engine
```

Lapisan 2 (engine sesuai aturan), Lapisan 3 (aturan sesuai referensi) dan paket review pelatih. Sekitar 1 menit.

```bash
EXPO_PUBLIC_E2E=1 pnpm --filter ./apps/app export:web
```

```bash
PW_CHROMIUM_PATH=/opt/pw-browsers/chromium pnpm validate:app
```

Lapisan 1 (app sama dengan engine) lewat Playwright pada build web berflag E2E. Sekitar 3 menit.
Jangan deploy build berflag E2E ke preview; ekspor ulang tanpa flag dulu.

## Hasil

Laporan HTML ditulis ke `docs/validation/engine-<versi>/` (satu folder per versi engine, run berikutnya menimpa):

| File | Isi |
|---|---|
| `index.html` | Ringkasan semua lapisan dan kriteria lulus |
| `lapisan-1.html` | L1.1-L1.6: plan, teks saran, angka di layar, adaptasi, pindah latihan, reload/bahasa |
| `lapisan-2.html` | Validator per aturan di ~1.650 plan, regresi H1-H4, penolakan input, adaptasi, Return to run, pindah latihan |
| `lapisan-3.html` | L3.1 paritas dokumen-kode, L3.2 klaim teks, L3.3 tingkat bukti, L3.4-L3.5 benchmark |
| `review-pelatih.html` | L3.6: 10 plan persona per minggu + pertanyaan M1-M5 untuk pelatih |
| `data/*.json` | Data mentah: skenario, input, setiap pelanggaran |

Setiap halaman punya bagian "Legenda kode" (arti kode E-xx, R-xx, H1, P1, L1.1 dan seterusnya, serta dokumen asalnya).

## Struktur

| File | Peran |
|---|---|
| `lib/calc.ts`, `lib/daniels.ts` | Hitungan ulang dari spec (tanggal, jarak lari, Daniels, Riegel), tanpa kode generator |
| `lib/oracle.ts` | Validator Lapisan 2: daftar pemeriksaan (`CHECKS`) dan `validatePlan()` |
| `lib/scenarios.ts` | Persona P1-P10 dan matriks skenario deterministik (pairwise + kombinasi penuh) |
| `lib/textmatch.ts` | Pencocok teks rationale di layar dengan template katalog |
| `lib/html.ts`, `lib/legend.ts`, `lib/output.ts` | Pembuat laporan HTML, legenda kode, lokasi paket bukti |
| `lapisan2.val.ts`, `lapisan3.val.ts`, `review-pelatih.val.ts` | Runner Vitest (`vitest.config.mts`) |
| `app/lapisan1.spec.ts` | Runner Playwright (`app/playwright.config.ts`) |

Validator sengaja ditulis terpisah dari generator: memakai tanggal kalender dan bunyi spec, bukan fungsi
internal engine. Saat menambah aturan di TRD, tambahkan pemeriksaannya di `CHECKS` dan, bila perlu,
persona atau dimensi matriks baru. Pemeriksaan yang lebih ketat dari bunyi TRD diberi `proposed: true`.
Semua data uji sintetis; tidak ada data pengguna.
