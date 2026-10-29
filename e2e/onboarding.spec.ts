import { expect, test, type Page } from '@playwright/test';
import { next } from './helpers';

// FL-1 end-to-end di web: 1.1 -> 1.7 -> 1.8 -> 2.1. Butuh build dengan EXPO_PUBLIC_E2E=1 (login boleh dilewati).

async function onboard(page: Page) {
  await page.goto('/');
  await page.getByTestId('welcome-start').click();
  await page.getByTestId('goal-10k').click();
  await next(page, 'goal');
  await expect(page.getByTestId('screen-race')).toBeVisible();
  for (let i = 0; i < 3; i++) await page.getByRole('button', { name: 'Bulan berikutnya' }).click();
  await page.locator('[data-testid^="day-"]').nth(10).click();
  await expect(page.getByTestId('race-fit')).toBeVisible();
  await next(page, 'race');
  await page.getByTestId('screen-ability').getByTestId('time').fill('3230');
  await expect(page.getByTestId('estimate')).toBeVisible();
  await next(page, 'ability');
  await page.getByRole('button', { name: '10-20 km' }).click();
  await page.getByTestId('longest-7').click();
  await next(page, 'volume');
  for (const d of [1, 3, 5]) await page.getByTestId(`wd-${d}`).click();
  await expect(page.getByTestId('days-fit')).toContainText('4 hari');
  await next(page, 'days');
  await page.getByTestId('disclaimer').click();
  await next(page, 'health');
  await expect(page.getByTestId('screen-preview')).toBeVisible();
  await expect(page.getByText('PLAN KAMU SIAP')).toBeVisible();
  await expect(page.getByText('Kenapa plan ini?')).toBeVisible();
}

test('onboarding sampai Hari ini, data bertahan setelah reload, tanpa request keluar', async ({ page }) => {
  const external: string[] = [];
  page.on('request', (r) => {
    const u = new URL(r.url());
    if (
      !['localhost', '127.0.0.1'].includes(u.hostname) &&
      !u.protocol.startsWith('data') &&
      !u.protocol.startsWith('blob')
    )
      external.push(r.url());
  });
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));

  await onboard(page);
  await page.getByTestId('auth-skip').click();
  await expect(page.getByTestId('screen-today')).toBeVisible();
  await expect(page.getByText('Latihan hari ini')).toBeVisible();
  await expect(page.getByText(/Minggu 1\/\d+/)).toBeVisible();

  // Spike S1: data SQLite web bertahan setelah reload
  await page.reload();
  await expect(page.getByTestId('screen-today')).toBeVisible();

  // Kalender plan
  await page.getByRole('tab', { name: 'Plan' }).click();
  await expect(page.getByTestId('screen-plan')).toBeVisible();
  await expect(page.getByText('Plan 10K')).toBeVisible();
  await page.getByTestId('next-week').click();
  await expect(page.getByText('Minggu 2')).toBeVisible();

  expect(errors).toEqual([]);
  expect(external).toEqual([]);
});

test('keluar di tengah onboarding melanjutkan langkah terakhir', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('welcome-start').click();
  await page.getByTestId('goal-fitness').click();
  await next(page, 'goal');
  await expect(page.getByTestId('screen-ability')).toBeVisible();
  await page.goto('/');
  await expect(page.getByTestId('screen-ability')).toBeVisible();
});

test('detail latihan dan pindah hari', async ({ page }) => {
  await onboard(page);
  await page.getByTestId('auth-skip').click();
  await page.getByRole('tab', { name: 'Plan' }).click();
  await page.getByTestId('next-week').click();
  const first = page.locator('[data-testid^="plan-day-"]').filter({ hasText: 'mnt' }).first();
  await first.click();
  await expect(page.getByTestId('screen-detail')).toBeVisible();
  await expect(page.getByText('Kenapa latihan ini?')).toBeVisible();
  await page.getByTestId('move').click();
  await expect(page.getByTestId('move-sheet')).toBeVisible();
  await expect(page.getByTestId('move-verdict')).toContainText('jadwal awal');
});
