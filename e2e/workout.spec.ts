import { expect, test } from '@playwright/test';
import { onboard } from './helpers';

// M5 verifikasi: alur 2.1 -> 2.3 -> 2.4 -> 3.3 end-to-end di web.
test('latihan hari ini: timer, selesai + RPE, progres, detail aktivitas', async ({ page }) => {
  await page.clock.install();
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  // 6 hari tersedia -> latihan hampir setiap hari; jika hari ini istirahat, test memakai log manual.
  await onboard(page);
  const card = page.getByTestId('workout-card');
  test.skip(!(await card.isVisible()), 'Hari ini istirahat di plan ini');
  await card.getByTestId('start').click();
  await expect(page.getByTestId('screen-timer')).toBeVisible();
  await expect(page.getByTestId('timer-countdown')).toBeVisible();
  // Hitung mundur 3 detik (jam dimajukan bertahap supaya React sempat render).
  await expect(async () => {
    await page.clock.runFor(1000);
    await expect(page.getByTestId('timer-remaining')).toBeVisible({ timeout: 200 });
  }).toPass({ timeout: 15_000 });
  const before = await page.getByTestId('timer-remaining').textContent();
  for (let i = 0; i < 6; i++) await page.clock.runFor(10_000);
  await expect(page.getByTestId('timer-remaining')).not.toHaveText(before ?? '');
  // jeda + lanjutkan
  await page.getByTestId('timer-toggle').click();
  await expect(page.getByText('DIJEDA')).toBeVisible();
  await page.getByTestId('timer-toggle').click();
  // akhiri di tengah -> konfirmasi -> 2.4
  await page.getByTestId('timer-end').click();
  await page.getByTestId('timer-confirm-yes').click();
  await expect(page.getByTestId('screen-finish')).toBeVisible();
  await expect(page.getByTestId('finish-segments')).toContainText('segmen tuntas');
  await page.getByTestId('finish-distance').fill('1,2');
  await page.getByTestId('finish-save').click();
  await expect(page.getByText('Pilih RPE dulu.')).toBeVisible();
  await page.getByTestId('rpe-6').click();
  await page.getByTestId('tag-hot').click();
  await page.getByTestId('finish-save').click();
  await expect(page.getByTestId('screen-today')).toBeVisible();
  await expect(page.getByTestId('workout-card')).toContainText('Selesai');
  await expect(page.getByTestId('week-km')).toContainText('1,2');
  // 3.3 Progres -> 3.4
  await page.getByRole('tab', { name: 'Progres' }).click();
  await expect(page.getByTestId('screen-progress')).toBeVisible();
  await expect(page.getByText('1 dari 1 latihan')).toBeVisible();
  await page.locator('[data-testid^="activity-"]').first().click();
  await expect(page.getByTestId('screen-activity')).toBeVisible();
  await expect(page.getByTestId('screen-activity').getByText('1,2 km')).toBeVisible();
  await expect(page.getByTestId('screen-activity').getByText(/6 \/ 10/)).toBeVisible();
  expect(errors).toEqual([]);
});

test('catat lari manual sebagai lari tambahan', async ({ page }) => {
  await onboard(page);
  await page.getByTestId('manual-log').click();
  await expect(page.getByTestId('screen-log')).toBeVisible();
  await page.getByTestId('log-extra').click();
  await page.getByTestId('log-km').fill('5,0');
  await page.getByTestId('log-duration').fill('40:00');
  await expect(page.getByText('Pace rata-rata: 8:00 /km')).toBeVisible();
  await page.getByTestId('screen-log').getByTestId('rpe-4').click();
  await page.getByTestId('log-save').click();
  await expect(page.getByTestId('screen-today')).toBeVisible();
  await page.getByRole('tab', { name: 'Progres' }).click();
  await expect(page.getByText('Lari tambahan')).toBeVisible();
});
