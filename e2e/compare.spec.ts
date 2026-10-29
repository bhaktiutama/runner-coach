import { test, type Page } from '@playwright/test';

// Screenshot @2x untuk dibandingkan berdampingan dengan docs/wireframes/png (bukan assertion).
// SHOTS_DIR=<folder> pnpm test:e2e e2e/compare.spec.ts lalu python3 scripts/compare-wireframes.py <folder>
const dir = process.env.SHOTS_DIR;
test.skip(!dir, 'SHOTS_DIR tidak diset');
test.use({ deviceScaleFactor: 2, viewport: { width: 390, height: 844 } });

const shot = (page: Page, name: string) => page.screenshot({ path: `${dir}/${name}.png` });
const next = (page: Page, step: string) => page.getByTestId(`screen-${step}`).getByTestId('next').click();

test('onboarding', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('screen-welcome').waitFor();
  await page.waitForTimeout(300);
  await shot(page, '1-1-selamat-datang');
  await page.getByText('Sudah punya akun? Masuk').click();
  await page.getByTestId('screen-signin').waitFor();
  await shot(page, '1-9-masuk');
  await page.goto('/');
  await page.getByTestId('screen-welcome').waitFor();
  await page.getByTestId('welcome-start').click();
  await page.getByTestId('goal-10k').click();
  await shot(page, '1-2-pilih-target');
  await next(page, 'goal');
  for (let i = 0; i < 2; i++) await page.getByRole('button', { name: 'Bulan berikutnya' }).click();
  await page.locator('[data-testid^="day-"]').nth(2).click();
  await shot(page, '1-3-tanggal-race');
  await next(page, 'race');
  await page.getByTestId('time').fill('3230');
  await shot(page, '1-4-kemampuan');
  await next(page, 'ability');
  for (let i = 0; i < 12; i++) await page.getByRole('button', { name: 'Tambah' }).click();
  await page.getByTestId('longest-7').click();
  await shot(page, '1-5-volume-mingguan');
  await next(page, 'volume');
  for (const d of [1, 3, 5]) await page.getByTestId(`wd-${d}`).click();
  await shot(page, '1-6-hari-latihan');
  await next(page, 'days');
  await page.getByTestId('disclaimer').click();
  await shot(page, '1-7-screening-kesehatan');
  await next(page, 'health');
  await page.getByTestId('screen-preview').waitFor();
  await shot(page, '1-8-preview-plan');
});
