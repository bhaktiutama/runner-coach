import { expect, test } from '@playwright/test';
import { onboard, restoreSeed } from './helpers';

test.use({ actionTimeout: 10_000 });

// Review 2026-11-05: Progress 3 rentang, jalan masuk 2.5, 3.4 baru, Today tanpa kata berulang.
test('Progress: rentang berbeda, ringkasan minggu dari menu, detail aktivitas tanpa judul berulang', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await restoreSeed(page);
  await page.getByRole('tab', { name: 'Progres' }).click();
  const prog = page.getByTestId('screen-progress');
  await expect(page.getByTestId('volume-axis-8w')).toBeVisible();
  const total8 = await page.getByTestId('range-totals').textContent();
  await prog.getByRole('tab', { name: 'Plan' }).click();
  await expect(page.getByTestId('volume-axis-plan')).toContainText('M1');
  await expect(page.getByTestId('range-totals')).toContainText('dari target');
  expect(await page.getByTestId('range-totals').textContent()).not.toBe(total8);
  await prog.getByRole('tab', { name: 'Semua' }).click();
  await expect(page.getByTestId('volume-axis-all')).toBeVisible();
  // 3.4: judul tipe hanya sekali, stat dalam satu kartu.
  await page.locator('[data-testid^="activity-"]').first().click();
  await expect(page.getByTestId('screen-activity')).toBeVisible();
  const title = (await page.getByTestId('activity-title').textContent()) ?? '';
  await expect(page.getByTestId('screen-activity').getByText(title, { exact: true })).toHaveCount(1);
  await expect(page.getByTestId('activity-stats')).toBeVisible();
  await page.goBack();
  // 2.5 dari menu, Tutup kembali ke Progres.
  await page.getByTestId('open-week-summary').click();
  await expect(page.getByTestId('screen-week')).toBeVisible();
  await page.getByRole('button', { name: 'Tutup' }).click();
  await expect(page.getByTestId('screen-progress')).toBeVisible();
  expect(errors).toEqual([]);
});

test('Today: latihan satu segmen tanpa kata berulang', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-11-03T07:00:00') });
  await onboard(page);
  const card = page.getByTestId('workout-card');
  test.skip(!(await card.isVisible()), 'Hari ini istirahat di plan ini');
  const name = (await card.locator('[data-testid="workout-minutes"]').count()) > 0;
  expect(name).toBe(true);
  const text = (await card.textContent()) ?? '';
  // Nama tipe (mis. "Easy") muncul paling banyak sekali di kartu (bib).
  const easy = text.match(/Easy/g)?.length ?? 0;
  expect(easy).toBeLessThanOrEqual(1);
});

test('strength: tampilan jarak jauh (U3), ringkasan per gerakan di 2.4 dan 3.4 (U6)', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-11-03T07:00:00') });
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await onboard(page, { strength: true });
  await page.getByRole('tab', { name: 'Plan' }).click();
  await page
    .getByText(/Strength/)
    .first()
    .click();
  await page.getByTestId('screen-detail').getByTestId('start').click();
  await expect(async () => {
    await page.clock.runFor(1000);
    await expect(page.getByTestId('timer-exercise')).toBeVisible({ timeout: 200 });
  }).toPass({ timeout: 20_000 });
  // U3: ketuk angka = tampilan jarak jauh; ketuk lagi = kembali.
  await page.getByTestId('set-clock').click();
  await expect(page.getByTestId('timer-far')).toBeVisible();
  await expect(page.getByTestId('timer-far')).toContainText('Squat');
  await page.getByTestId('timer-far').click();
  await expect(page.getByTestId('timer-exercise')).toBeVisible();
  // 2 set squat selesai, sisanya dilewati lewat Akhiri.
  for (let k = 0; k < 2; k++) {
    await page.getByTestId('exercise-next').click();
    await page.getByTestId('rest-skip').click();
  }
  await page.getByTestId('timer-end').click();
  await page.getByTestId('timer-confirm-yes').click();
  await expect(page.getByTestId('exercise-summary')).toContainText('Squat');
  await expect(page.getByTestId('exercise-summary')).toContainText('2/2 set');
  await page.getByRole('tab', { name: 'Pas' }).click();
  await page.getByTestId('rpe-6').click();
  await page.getByTestId('finish-save').click();
  await page.getByRole('tab', { name: 'Progres' }).click();
  await page.locator('[data-testid^="activity-"]').first().click();
  await expect(page.getByTestId('activity-stats')).toContainText('Set');
  await expect(page.getByTestId('exercise-summary')).toContainText('2/2 set');
  expect(errors).toEqual([]);
});
