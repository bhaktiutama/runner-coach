import { expect, test } from '@playwright/test';

test('app terbuka dengan 4 tab', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  for (const tab of ['Hari ini', 'Plan', 'Progres', 'Profil']) {
    await expect(page.getByRole('tab', { name: tab })).toBeVisible();
  }
  await page.getByRole('tab', { name: 'Plan' }).click();
  await expect(page.getByText('Plan').first()).toBeVisible();
  expect(errors).toEqual([]);
});
