import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  use: {
    baseURL: 'http://localhost:8081',
    viewport: { width: 390, height: 844 },
    locale: 'id-ID',
    // Di container cloud memakai Chromium bawaan; di CI memakai hasil `playwright install`.
    launchOptions: process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {},
  },
  webServer: {
    command: 'node scripts/serve-web.mjs apps/app/dist',
    url: 'http://localhost:8081',
    reuseExistingServer: true,
  },
});
