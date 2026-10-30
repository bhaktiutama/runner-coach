import { expect, test } from '@playwright/test';
import { onboard } from './helpers';

test.use({ actionTimeout: 10_000 });

// Fase 2: strength + core (F-21), bahasa (F-22), gerbang Premium nonaktif (F-23).
test('strength: kalender, detail 2.2s dengan placeholder animasi, timer gerakan, selesai', async ({
  page,
}) => {
  await page.clock.install();
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await onboard(page, { strength: true });
  // Kalender minggu ini memuat sesi strength (baris sendiri atau "+ Strength" di bawah lari).
  await page.getByRole('tab', { name: 'Plan' }).click();
  const strength = page.getByText(/Strength/).first();
  await expect(strength).toBeVisible();
  await strength.click();
  await expect(page.getByTestId('screen-detail')).toBeVisible();
  await expect(page.getByTestId('exercise-list')).toBeVisible();
  await expect(page.getByTestId('exercise-animation-squat')).toBeVisible();
  await expect(page.getByText('Animasi gerakan menyusul').first()).toBeVisible();
  await expect(page.getByText(/Latihan kekuatan \dx seminggu/)).toBeVisible();
  await page.getByTestId('screen-detail').getByTestId('start').click();
  await expect(page.getByTestId('screen-timer')).toBeVisible();
  await expect(async () => {
    await page.clock.runFor(1000);
    await expect(page.getByTestId('timer-exercise')).toBeVisible({ timeout: 200 });
  }).toPass({ timeout: 15_000 });
  await expect(page.getByTestId('timer-exercise')).toContainText('Squat');
  await expect(page.getByTestId('timer-exercise')).toContainText('Set 1 dari 2');
  await page.getByTestId('exercise-next').click();
  await expect(page.getByTestId('timer-rest')).toBeVisible();
  await page.getByTestId('rest-skip').click();
  await expect(page.getByTestId('timer-exercise')).toContainText('Set 2 dari 2');
  await page.getByTestId('timer-end').click();
  await page.getByTestId('timer-confirm-yes').click();
  await expect(page.getByTestId('screen-finish')).toBeVisible();
  await expect(page.getByTestId('finish-distance')).toHaveCount(0);
  await page.getByRole('tab', { name: 'Terlalu berat' }).click();
  await expect(page.getByText('Sesi strength berikutnya akan kami ringankan 1 level.')).toBeVisible();
  await page.getByTestId('rpe-7').click();
  await page.getByTestId('finish-save').click();
  await expect(page.getByTestId('screen-today').or(page.getByTestId('screen-week-summary'))).toBeVisible();
  expect(errors).toEqual([]);
});

test('sakelar strength di Profil menambah sesi ke plan', async ({ page }) => {
  await onboard(page);
  await page.getByRole('tab', { name: 'Plan' }).click();
  await page.getByTestId('next-week').click();
  await expect(page.getByText(/Strength/)).toHaveCount(0);
  await page.getByRole('tab', { name: 'Profil' }).click();
  await page.getByTestId('strength-switch').click();
  await page.getByRole('tab', { name: 'Plan' }).click();
  await page.getByTestId('next-week').click();
  await expect(page.getByText(/Strength/).first()).toBeVisible();
});

test('ganti bahasa ke English lalu kembali', async ({ page }) => {
  await onboard(page);
  await page.getByRole('tab', { name: 'Profil' }).click();
  await expect(page.getByTestId('row-premium')).toHaveCount(0); // paywall mati
  await page.getByTestId('row-language').click();
  await expect(page.getByTestId('screen-language')).toBeVisible();
  await page.getByTestId('lang-en-US').click();
  await expect(page.getByTestId('screen-language').getByText('Language', { exact: true })).toBeVisible();
  await page.getByTestId('back').click();
  await expect(page.getByRole('tab', { name: 'Today' })).toBeVisible();
  await page.getByRole('tab', { name: 'Today' }).click();
  await expect(page.getByText("Today's workout").or(page.getByText('Rest')).first()).toBeVisible();
  // Bertahan setelah reload (tersimpan di profile.locale lokal).
  // Navigasi klien expo-router bisa membatalkan goto pertama (ERR_ABORTED); ulangi sampai termuat.
  await expect(async () => {
    await page.goto('/');
    await expect(page.getByRole('tab', { name: 'Profile' })).toBeVisible({ timeout: 3000 });
  }).toPass({ timeout: 20_000 });
  await page.getByRole('tab', { name: 'Profile' }).click();
  await page.getByTestId('row-language').click();
  await page.getByTestId('lang-id-ID').click();
  await page.getByTestId('back').click();
  await expect(page.getByRole('tab', { name: 'Profil' })).toBeVisible();
});

test('layar Premium (4.4) ada, pembelian belum aktif', async ({ page }) => {
  await onboard(page);
  await page.goto('/premium');
  await expect(page.getByTestId('screen-premium')).toBeVisible();
  await expect(page.getByText('Lari tetap gratis. Strength penuh dengan Premium.')).toBeVisible();
  await expect(page.getByTestId('premium-buy')).toBeDisabled();
});
