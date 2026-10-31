import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  retries: process.env.CI ? 1 : 0,
  // Fungsional (alur) dipisah dari cek UI/UX (lintas ukuran layar + tema) dan regresi visual.
  projects: [
    { name: 'functional', testIgnore: /ui-.*\.spec\.ts/ },
    { name: 'ui', testMatch: /ui-.*\.spec\.ts/ },
  ],
  use: {
    baseURL: 'http://localhost:8081',
    viewport: { width: 390, height: 844 },
    locale: 'id-ID',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    // Di container cloud memakai Chromium bawaan; di CI memakai hasil `playwright install`.
    launchOptions: process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {},
  },
  webServer: {
    command: 'node scripts/serve-web.mjs apps/app/dist',
    url: 'http://localhost:8081',
    reuseExistingServer: true,
  },
});
