import { expect, test } from '@playwright/test';
import { onboard } from './helpers';

// F-20: Panduan dari Profil dan dari tombol (i) di layar terkait.
test('panduan dari profil dan hint (i)', async ({ page }) => {
  await onboard(page);
  await page.getByTestId('hint-volume').first().click();
  await expect(page.getByTestId('screen-help')).toBeVisible();
  await expect(page.getByTestId('help-focused')).toContainText('Total jarak lari kamu dalam satu minggu');
  await page.goto('/profile');
  await page.getByTestId('row-help').click();
  await expect(page.getByTestId('screen-help')).toBeVisible();
  await page.getByTestId('help-recovery').click();
  await expect(page.getByTestId('screen-help')).toContainText('Lari sangat pelan dan pendek');
  await page.getByTestId('help-E-06').click();
  await expect(page.getByTestId('screen-help')).toContainText('Bukti sedang');
  await page.getByTestId('screen-help').getByText('Lihat sumber').first().click();
  await expect(page.getByTestId('screen-help')).toContainText('Frandsen');
});
