#!/usr/bin/env bash
# Setup environment cloud untuk sesi Claude Code (Run Coach). Aman dijalankan berulang.
# Dipakai sebagai "Setup script" environment, atau manual: bash scripts/setup-session.sh
# Tidak butuh secret; token (EXPO_TOKEN, SUPABASE_ACCESS_TOKEN, EXPO_PUBLIC_SUPABASE_*) diisi
# di Environment variables, bukan di sini. Detail: docs/DEV-SESSION.md
set -euo pipefail

REPO="${REPO_DIR:-/home/user/runner-coach}"

# 1. pnpm sesuai packageManager (10.28.0) via corepack; fallback npm global.
corepack enable >/dev/null 2>&1 && corepack prepare pnpm@10.28.0 --activate >/dev/null 2>&1 \
  || npm install -g pnpm@10.28.0

# 2. EAS CLI global (deploy web, eas update). Fallback: npx eas-cli.
command -v eas >/dev/null 2>&1 || npm install -g eas-cli >/dev/null 2>&1 || true

# 3. Pillow untuk scripts/compare-wireframes.py (biasanya sudah ada).
python3 -c "import PIL" 2>/dev/null || python3 -m pip install --quiet pillow || true

# 4. Chromium untuk Playwright sudah ada di /opt/pw-browsers; JANGAN "playwright install".
grep -q PW_CHROMIUM_PATH ~/.bashrc 2>/dev/null \
  || echo 'export PW_CHROMIUM_PATH=/opt/pw-browsers/chromium' >> ~/.bashrc

# 5. Dependensi monorepo (jika repo sudah di-clone saat script jalan).
if [ -f "$REPO/pnpm-lock.yaml" ]; then
  cd "$REPO"
  pnpm install --frozen-lockfile
fi

echo "setup-session: selesai"
