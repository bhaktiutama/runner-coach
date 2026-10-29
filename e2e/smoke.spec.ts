import { expect, test } from '@playwright/test';

test('app baru terbuka di layar Selamat datang tanpa error', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(page.getByTestId('screen-welcome')).toBeVisible();
  await expect(page.getByText('Tahu harus lari apa, setiap hari.')).toBeVisible();
  await expect(page.getByText('Data latihanmu tersimpan di HP ini')).toBeVisible();
  expect(errors).toEqual([]);
});
