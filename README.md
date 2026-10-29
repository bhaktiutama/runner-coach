# Run Coach

Aplikasi latihan lari harian untuk target 5K, 10K, Half Marathon dan Full Marathon. Web, iOS dan Android dari satu codebase.

Status: MVP M0-M6 sudah dibangun dan diuji di web; uji di HP dan rilis beta (M7) belum. Progres: [docs/STATUS.md](docs/STATUS.md).

## Menjalankan

```bash
pnpm install
pnpm dev        # Expo (web: tekan w; HP: Expo Go)
pnpm test       # unit test
```

Struktur: `apps/app` (Expo Router), `packages/training-engine` (logika plan, TS murni), `packages/ui` (design system Lintas), `supabase/functions` (Edge Function delete-account).

## Dokumen

| Dokumen | Isi |
|---------|-----|
| [docs/PLANNING.md](docs/PLANNING.md) | Problem, persona, scope MVP, UX, training engine (termasuk strength & drill), sumber data, arsitektur, roadmap, monetisasi, metrik, risiko |
| [docs/SURVEY.md](docs/SURVEY.md) | Kuesioner discovery + rencana analisis |
| [docs/specs/](docs/specs/README.md) | **Acuan build** (6 dokumen spec-driven): PRD, TRD, App Flow, UI/UX, Backend Schema, Implementation Plan |
| [docs/wireframes/](docs/wireframes/README.md) | Wireframe 21 layar (PNG + sumber), acuan tata letak |
| [docs/design-system/](docs/design-system/README.md) | Design system "Lintas": tokens.json, aturan, komponen, cek kontras |
| [docs/ANIMATION_PIPELINE.md](docs/ANIMATION_PIPELINE.md) | Rencana animasi gerakan (MediaPipe + Rive) |
| [docs/prototypes/exercise-animations.html](docs/prototypes/exercise-animations.html) | Prototipe animasi drill, strength dan core |
