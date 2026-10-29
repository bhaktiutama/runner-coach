# Catatan Spike M0

Status: 2026-10-29. Dikerjakan dari container cloud (tanpa HP fisik). Bagian yang butuh device ditandai **perlu device**.

| # | Spike | Hasil | Keputusan |
|---|-------|-------|-----------|
| S1 | expo-sqlite di web | Jalan di Chromium (Playwright) dengan header `Cross-Origin-Embedder-Policy: credentialless` + `Cross-Origin-Opener-Policy: same-origin` (metro dev server, `scripts/serve-web.mjs`, plugin `expo-router` untuk EAS Hosting). Data bertahan setelah reload: dicek E2E `e2e/onboarding.spec.ts` | Web memakai expo-sqlite (OPFS lewat worker). App memanggil `navigator.storage.persist()` saat DB dibuka dan menampilkan peringatan web (TRD 3.1) |
| S2 | Library grafik | Victory Native versi terbaru bergantung pada Skia (library tambahan di luar TRD 1). Grafik MVP sederhana (bar volume, garis tren, TrackRing) | **Komponen sendiri di atas `react-native-svg`** (sudah di stack). Tidak menambah library |
| S3 | Timer background iOS + Android | Belum diuji di device. Desain mengikuti TRD 5: posisi dihitung dari timestamp absolut, cue lewat notifikasi lokal terjadwal per pergantian segmen | **Perlu device**: uji cue saat layar terkunci dan lanjut posisi setelah app ditutup |
| S4 | Backup OS untuk file SQLite | Belum diuji | **Perlu device**. UI tidak menjanjikan backup OS (TRD 3.3) |
