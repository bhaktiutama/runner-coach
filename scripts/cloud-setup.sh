#!/usr/bin/env bash
# Setup script untuk environment cloud Claude Code (Settings environment -> Setup script).
# Jalan sekali saat container baru dibuat, sebelum session mulai. Tidak bisa membaca
# variabel/secret environment; EXPO_TOKEN dll. diisi di bagian Environment variables.
set -euo pipefail

# 1. Node 22 + pnpm (versi dari package.json "packageManager")
corepack enable
corepack prepare pnpm@10.28.0 --activate

# 2. Dependensi monorepo (Expo SDK 58, Vitest, Playwright, dll.)
cd "${CLAUDE_PROJECT_DIR:-/home/user/runner-coach}"
pnpm install --frozen-lockfile

# 3. EAS CLI global (eas update / eas deploy / eas build); tanpa ini dipakai lewat npx eas-cli
npm install -g eas-cli@latest

# 4. Python untuk design system + wireframe (check_contrast.py, phase2.py, overview PNG)
pip install --quiet pillow

# 5. Font wireframe (render.js butuh font terpasang di sistem); diambil dari paket npm app
mkdir -p ~/.fonts
find -L node_modules/@expo-google-fonts/bricolage-grotesque node_modules/@expo-google-fonts/plus-jakarta-sans \
  -name '*.ttf' -exec cp -n {} ~/.fonts/ \;
fc-cache -f >/dev/null 2>&1 || true

# Chromium + Playwright sudah terpasang di image (/opt/pw-browsers/chromium).
# JANGAN jalankan `playwright install`. Pakai PW_CHROMIUM_PATH=/opt/pw-browsers/chromium.
