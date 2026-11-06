import { expect, test } from '@playwright/test';
import { restoreSeed } from './helpers';

// Ikon spot (UI/UX 14): tampil bawaan, bisa dimatikan di Profil; mati = tampilan lama (garis warna).
const shots = process.env.SPOT_SHOTS;

test('ikon spot tampil bawaan dan sakelar Profil mengembalikan tampilan tanpa ikon', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await restoreSeed(page);
  const spots = page.locator('[data-testid^="spot-"]');
  await expect(spots.first()).toBeVisible();
  if (shots) await page.screenshot({ path: `${shots}/today-on.png`, fullPage: true });

  await page.getByRole('tab', { name: 'Plan' }).click();
  await expect(page.getByTestId('screen-plan')).toBeVisible();
  if (shots) await page.screenshot({ path: `${shots}/plan-on.png`, fullPage: true });

  await page.getByRole('tab', { name: 'Progres' }).click();
  await expect(page.getByTestId('open-week-summary')).toBeVisible();
  if (shots) await page.screenshot({ path: `${shots}/progress-on.png`, fullPage: true });
  await page.locator('[data-testid^="activity-"]').first().click();
  await expect(page.getByTestId('spot-title')).toBeVisible();
  if (shots) await page.screenshot({ path: `${shots}/activity-on.png`, fullPage: true });
  await page.goBack();

  await page.getByRole('tab', { name: 'Profil' }).click();
  const sw = page.getByTestId('spot-icons-switch');
  await sw.scrollIntoViewIfNeeded();
  await sw.click();

  await page.getByRole('tab', { name: 'Hari ini' }).click();
  await expect(page.getByTestId('screen-today')).toBeVisible();
  await expect(page.getByTestId('screen-today').locator('[data-testid^="spot-"]')).toHaveCount(0);
  if (shots) await page.screenshot({ path: `${shots}/today-off.png`, fullPage: true });
  await page.getByRole('tab', { name: 'Plan' }).click();
  await expect(page.getByTestId('screen-plan')).toBeVisible();
  await expect(page.locator('[data-testid="screen-plan"] svg')).not.toHaveCount(0);
  if (shots) await page.screenshot({ path: `${shots}/plan-off.png`, fullPage: true });
});
