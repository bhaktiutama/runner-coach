import { defineConfig } from '@playwright/test';
import { resolve } from 'node:path';

// Lapisan 1 (app = engine). Dijalankan manual: `pnpm validate:app`, tidak termasuk `pnpm test:e2e` / CI.
// Butuh ekspor web dengan EXPO_PUBLIC_E2E=1 di apps/app/dist.
const root = resolve(__dirname, '../..');

export default defineConfig({
  testDir: '.',
  testMatch: /.*\.spec\.ts/,
  timeout: 240_000,
  workers: 1,
  fullyParallel: false,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:8081',
    viewport: { width: 390, height: 844 },
    locale: 'id-ID',
    timezoneId: 'Asia/Jakarta',
    acceptDownloads: true,
    launchOptions: process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {},
  },
  webServer: {
    command: 'node scripts/serve-web.mjs apps/app/dist',
    cwd: root,
    url: 'http://localhost:8081',
    reuseExistingServer: true,
  },
});
