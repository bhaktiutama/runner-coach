import { test, type Page } from '@playwright/test';

// Screenshot layar utama untuk dibandingkan dengan docs/wireframes/png (bukan assertion).
// Jalankan: SHOTS_DIR=<folder> pnpm test:e2e e2e/screens.spec.ts
const dir = process.env.SHOTS_DIR;

const shot = (page: Page, name: string) => page.screenshot({ path: `${dir}/${name}.png`, fullPage: true });
const next = (page: Page, step: string) => page.getByTestId(`screen-${step}`).getByTestId('next').click();

test.skip(!dir, 'SHOTS_DIR tidak diset');

test('screenshot alur utama', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('screen-welcome').waitFor();
  await shot(page, '1-1');
  await page.getByTestId('welcome-start').click();
  await page.getByTestId('goal-10k').click();
  await shot(page, '1-2');
  await next(page, 'goal');
  for (let i = 0; i < 2; i++) await page.getByRole('button', { name: 'Bulan berikutnya' }).click();
  await page.locator('[data-testid^="day-"]').nth(20).click();
  await shot(page, '1-3');
  await next(page, 'race');
  await page.getByTestId('screen-ability').getByTestId('time-m').fill('32');
  await page.getByTestId('screen-ability').getByTestId('time-s').fill('30');
  await shot(page, '1-4');
  await next(page, 'ability');
  await page.getByRole('button', { name: '10-20 km' }).click();
  await page.getByTestId('longest-7').click();
  await shot(page, '1-5');
  await next(page, 'volume');
  for (const d of [1, 3, 5]) await page.getByTestId(`wd-${d}`).click();
  await shot(page, '1-6');
  await next(page, 'days');
  await page.getByTestId('disclaimer').click();
  await shot(page, '1-7');
  await next(page, 'health');
  await page.getByTestId('screen-preview').waitFor();
  await shot(page, '1-8');
  await page.getByTestId('auth-skip').click();
  await page.getByTestId('screen-today').waitFor();
  await shot(page, '2-1');
  await page.getByRole('tab', { name: 'Plan' }).click();
  await page.getByTestId('screen-plan').waitFor();
  await page.getByTestId('next-week').click();
  await shot(page, '3-1');
  for (let i = 0; i < 3; i++) await page.getByTestId('next-week').click();
  await page
    .locator('[data-testid^="plan-day-"]')
    .filter({ hasText: /Tempo|Interval/ })
    .first()
    .click();
  await page.getByTestId('screen-detail').waitFor();
  await shot(page, '2-2');
  await page.getByTestId('move').click();
  await page.getByTestId('move-sheet').waitFor();
  await shot(page, '3-2');
});
