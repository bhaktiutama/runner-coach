#!/bin/bash
# SessionStart (cloud): pastikan pnpm + node_modules siap. Idempoten; install dilewati
# kalau lockfile/manifest tidak berubah. Tool sistem (eas-cli, Pillow) ada di scripts/setup-session.sh.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-.}"

# pnpm sesuai packageManager (10.28.0); murah, jalankan setiap sesi.
{ corepack enable && corepack prepare pnpm@10.28.0 --activate; } >/dev/null 2>&1 \
  || npm install -g pnpm@10.28.0 >/dev/null 2>&1

hashes=node_modules/.session-start.sha256
if ! sha256sum --check --status "$hashes" 2>/dev/null; then
  rm -f "$hashes"
  pnpm install --frozen-lockfile
  sha256sum .claude/hooks/session-start.sh package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc \
    apps/*/package.json packages/*/package.json 2>/dev/null > "$hashes" || rm -f "$hashes"
fi

# Dibutuhkan E2E (jangan "playwright install").
if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
  echo 'export PW_CHROMIUM_PATH=/opt/pw-browsers/chromium' >> "$CLAUDE_ENV_FILE"
fi
