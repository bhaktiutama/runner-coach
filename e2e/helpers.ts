import { expect, type Page } from '@playwright/test';

export const next = (page: Page, step: string) =>
  page.getByTestId(`screen-${step}`).getByTestId('next').click();

/** Onboarding lengkap (10K, 4 hari, tahu waktu 5K) sampai Hari ini, login dilewati (mode uji). */
export async function onboard(page: Page, opts: { days?: number[] } = {}) {
  await page.goto('/');
  await page.getByTestId('welcome-start').click();
  await page.getByTestId('goal-10k').click();
  await next(page, 'goal');
  for (let i = 0; i < 3; i++) await page.getByRole('button', { name: 'Bulan berikutnya' }).click();
  await page.locator('[data-testid^="day-"]').nth(10).click();
  await next(page, 'race');
  await page.getByTestId('screen-ability').getByTestId('time').fill('3230');
  await next(page, 'ability');
  await page.getByRole('button', { name: '10-20 km' }).click();
  await page.getByTestId('longest-7').click();
  await next(page, 'volume');
  // Senin-Jumat + Minggu (long) = 6 hari, supaya hampir selalu ada latihan hari ini
  for (const d of opts.days ?? [0, 1, 2, 3, 4]) await page.getByTestId(`wd-${d}`).click();
  await next(page, 'days');
  await page.getByTestId('disclaimer').click();
  await next(page, 'health');
  await expect(page.getByTestId('screen-preview')).toBeVisible();
  await page.getByTestId('auth-skip').click();
  await expect(page.getByTestId('screen-today')).toBeVisible();
}
