import { defineConfig } from '@playwright/test';

// Smoke test of the static landing page (docs/store/06-LANDING-V2-PROMPT.md). Run: pnpm test:landing
export default defineConfig({
  testDir: '.',
  testMatch: 'smoke.spec.ts',
  timeout: 60_000,
  use: {
    baseURL: 'http://localhost:8091',
    launchOptions: {
      ...(process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {}),
      args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
    },
  },
  webServer: {
    command: 'node ../../scripts/serve-web.mjs .',
    url: 'http://localhost:8091',
    env: { PORT: '8091' },
    reuseExistingServer: true,
  },
});
