#!/usr/bin/env bash
# Setup script environment cloud Run Coach. Aman dijalankan berulang, tanpa secret.
# Pasang di: menu environment (judul sesi) > Edit > Setup script. Detail: docs/DEV-SESSION.md
# Token (EXPO_TOKEN, SUPABASE_ACCESS_TOKEN, EXPO_PUBLIC_SUPABASE_*) diisi di Environment variables.
set -euo pipefail

# Script setup berjalan satu folder di atas repo; cari repo dengan beberapa cara.
for d in "${REPO_DIR:-}" "${CLAUDE_PROJECT_DIR:-}" "$PWD/runner-coach" "/home/user/runner-coach" "$PWD"; do
  if [ -n "$d" ] && [ -f "$d/pnpm-lock.yaml" ]; then REPO="$d"; break; fi
done
REPO="${REPO:-}"

# 1. pnpm sesuai packageManager (10.28.0) via corepack; fallback npm global.
{ corepack enable && corepack prepare pnpm@10.28.0 --activate; } >/dev/null 2>&1 \
  || npm install -g pnpm@10.28.0 >/dev/null 2>&1

# 2. EAS CLI global (deploy web, eas update). Tidak fatal: npx eas-cli tetap bisa.
command -v eas >/dev/null 2>&1 || npm install -g eas-cli >/dev/null 2>&1 || true

# 3. Pillow untuk scripts/compare-wireframes.py dan docs/wireframes/*.py.
python3 -c "import PIL" 2>/dev/null || python3 -m pip install --quiet pillow >/dev/null 2>&1 || true

# 4. Chromium bawaan image; JANGAN "playwright install".
grep -q PW_CHROMIUM_PATH ~/.bashrc 2>/dev/null \
  || echo 'export PW_CHROMIUM_PATH=/opt/pw-browsers/chromium' >> ~/.bashrc

# 5. Dependensi monorepo + font untuk render wireframe (hanya jika repo sudah ada).
if [ -n "$REPO" ]; then
  cd "$REPO"
  pnpm install --frozen-lockfile
  mkdir -p ~/.fonts
  find -L node_modules/@expo-google-fonts/bricolage-grotesque node_modules/@expo-google-fonts/plus-jakarta-sans \
    -name '*.ttf' -exec cp -n {} ~/.fonts/ \; 2>/dev/null || true
  fc-cache -f >/dev/null 2>&1 || true
else
  echo "setup-session: repo belum ada, lewati pnpm install (jalankan manual nanti)"
fi

echo "setup-session: selesai"
