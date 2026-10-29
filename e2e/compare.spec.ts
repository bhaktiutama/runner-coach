import { test, type Page } from '@playwright/test';

// Screenshot @2x untuk dibandingkan berdampingan dengan docs/wireframes/png (bukan assertion).
// SHOTS_DIR=<folder> pnpm test:e2e e2e/compare.spec.ts lalu python3 scripts/compare-wireframes.py <folder>
const dir = process.env.SHOTS_DIR;
test.skip(!dir, 'SHOTS_DIR tidak diset');
test.use({ deviceScaleFactor: 2, viewport: { width: 390, height: 844 } });

const shot = (page: Page, name: string) => page.screenshot({ path: `${dir}/${name}.png` });
const next = (page: Page, step: string) => page.getByTestId(`screen-${step}`).getByTestId('next').click();

test('onboarding', async ({ page }) => {
  test.setTimeout(180_000);
  await page.goto('/');
  await page.getByTestId('screen-welcome').waitFor();
  await page.waitForTimeout(300);
  await shot(page, '1-1-selamat-datang');
  await page.getByText('Sudah punya akun? Masuk').click();
  await page.getByTestId('screen-signin').waitFor();
  await shot(page, '1-9-masuk');
  await page.goto('/');
  await page.getByTestId('screen-welcome').waitFor();
  await page.getByTestId('welcome-start').click();
  await page.getByTestId('goal-10k').click();
  await shot(page, '1-2-pilih-target');
  await next(page, 'goal');
  for (let i = 0; i < 2; i++) await page.getByRole('button', { name: 'Bulan berikutnya' }).click();
  await page.locator('[data-testid^="day-"]').nth(2).click();
  await shot(page, '1-3-tanggal-race');
  await next(page, 'race');
  await page.getByTestId('time').fill('3230');
  await shot(page, '1-4-kemampuan');
  await next(page, 'ability');
  for (let i = 0; i < 12; i++) await page.getByRole('button', { name: 'Tambah' }).click();
  await page.getByTestId('longest-7').click();
  await shot(page, '1-5-volume-mingguan');
  await next(page, 'volume');
  for (const d of [1, 3, 5]) await page.getByTestId(`wd-${d}`).click();
  await shot(page, '1-6-hari-latihan');
  await next(page, 'days');
  await page.getByTestId('disclaimer').click();
  await shot(page, '1-7-screening-kesehatan');
  await next(page, 'health');
  await page.getByTestId('screen-preview').waitFor();
  await shot(page, '1-8-preview-plan');
  await page.getByTestId('auth-skip').click();
  await page.getByTestId('screen-today').waitFor();
  await page.waitForTimeout(300);
  await shot(page, '2-1-hari-ini');
  // Detail: latihan kualitas pertama di plan (minggu berikut) supaya mirip wireframe 2.2.
  await page.getByRole('tab', { name: 'Plan' }).click();
  const quality = page
    .getByTestId('screen-plan')
    .locator('[data-testid^="plan-day-"]')
    .filter({ hasText: /Tempo|Interval/ });
  for (let i = 0; i < 8 && (await quality.count()) === 0; i++) {
    if (await page.getByTestId('next-week').isDisabled()) break;
    await page.getByTestId('next-week').click();
  }
  if ((await quality.count()) > 0) await quality.first().click();
  else
    await page
      .getByTestId('screen-plan')
      .locator('[data-testid^="plan-day-"]')
      .filter({ hasText: 'mnt' })
      .first()
      .click();
  await page.getByTestId('screen-detail').waitFor();
  await page.waitForTimeout(300);
  await shot(page, '2-2-detail-latihan');
});

test('latihan', async ({ page }) => {
  test.setTimeout(180_000);
  const { onboard } = await import('./helpers');
  await onboard(page);
  await page.getByTestId('manual-log').click();
  await page.getByTestId('screen-log').waitFor();
  await page.getByTestId('log-km').fill('5,0');
  await page.getByTestId('log-duration').fill('40:00');
  await page.getByTestId('screen-log').getByTestId('rpe-6').click();
  await shot(page, '2-6-catat-lari');
  await page.goto('/plan');
  await page.getByTestId('screen-plan').waitFor();
  const q = page
    .getByTestId('screen-plan')
    .locator('[data-testid^="plan-day-"]')
    .filter({ hasText: /Tempo|Interval/ });
  for (let i = 0; i < 8 && (await q.count()) === 0; i++) {
    if (await page.getByTestId('next-week').isDisabled()) break;
    await page.getByTestId('next-week').click();
  }
  if ((await q.count()) > 0) await q.first().click();
  else
    await page
      .getByTestId('screen-plan')
      .locator('[data-testid^="plan-day-"]')
      .filter({ hasText: 'mnt' })
      .first()
      .click();
  await page.getByTestId('screen-detail').getByTestId('start').click();
  await page.getByTestId('screen-timer').waitFor();
  await page.waitForTimeout(4500);
  await shot(page, '2-3-timer');
  if (
    await page
      .getByTestId('drill-next')
      .isVisible()
      .catch(() => false)
  )
    await shot(page, '2-3b-timer-drill');
  await page.getByTestId('timer-end').click();
  await page.getByTestId('timer-confirm-yes').click();
  await page.getByTestId('screen-finish').waitFor();
  await page.getByTestId('rpe-6').click();
  await shot(page, '2-4-selesai-rpe');
});

test('plan-akun', async ({ page }) => {
  test.setTimeout(180_000);
  const { onboard } = await import('./helpers');
  await onboard(page);
  await page.getByTestId('manual-log').click();
  await page.getByTestId('log-km').fill('5,2');
  await page.getByTestId('log-duration').fill('38:45');
  await page.getByTestId('screen-log').getByTestId('rpe-6').click();
  await page.getByTestId('log-save').click();
  await page.getByTestId('screen-today').waitFor();
  await page.getByRole('tab', { name: 'Plan' }).click();
  await page.getByTestId('screen-plan').waitFor();
  await page.waitForTimeout(300);
  await shot(page, '3-1-kalender-plan');
  const q = page
    .getByTestId('screen-plan')
    .locator('[data-testid^="plan-day-"]')
    .filter({ hasText: /Tempo|Interval/ });
  for (let i = 0; i < 8 && (await q.count()) === 0; i++) {
    if (await page.getByTestId('next-week').isDisabled()) break;
    await page.getByTestId('next-week').click();
  }
  await q.first().click();
  await page.getByTestId('screen-detail').getByTestId('move').click();
  await page.getByTestId('move-sheet').waitFor();
  await page.waitForTimeout(300);
  await shot(page, '3-2-pindah-latihan');
  await page.goto('/progress');
  await page.getByTestId('screen-progress').waitFor();
  await page.waitForTimeout(300);
  await shot(page, '3-3-progres');
  await page.locator('[data-testid^="activity-"]').first().click();
  await page.getByTestId('screen-activity').waitFor();
  await shot(page, '3-4-detail-aktivitas');
  await page.goto('/profile');
  await page.getByTestId('screen-profile').waitFor();
  await page.waitForTimeout(300);
  await shot(page, '4-1-profil');
  await page.getByTestId('row-pause').click();
  await page.getByTestId('screen-pause').waitFor();
  await shot(page, '4-3-jeda-plan');
  await page.goto('/profile');
  await page.getByTestId('row-privacy').click();
  await page.getByTestId('screen-privacy').waitFor();
  await shot(page, '4-5-data-privasi');
  await page.getByTestId('delete-account').click();
  await page.getByTestId('screen-delete').waitFor();
  await page.getByTestId('delete-word').fill('HAPUS');
  await shot(page, '4-6-hapus-akun');
});
