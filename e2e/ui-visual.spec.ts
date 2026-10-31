import { expect, test } from '@playwright/test';
import { next, onboard } from './helpers';

// Regresi visual: bandingkan screenshot layar utama dengan baseline di
// e2e/ui-visual.spec.ts-snapshots/. Baseline dibuat oleh CI (workflow "UI" dengan
// input update_snapshots) supaya font dan render sama dengan runner.
// Lokal: pnpm test:visual (butuh baseline linux; di OS lain tambahkan --update-snapshots).
test.skip(!process.env.VISUAL, 'VISUAL tidak diset (jalankan lewat pnpm test:visual)');

// Selasa 27 Okt 2026, supaya tanggal/minggu di layar deterministik.
const NOW = new Date('2026-10-27T08:00:00+07:00');
const shot = { maxDiffPixelRatio: 0.01, animations: 'disabled' as const, fullPage: true };

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`visual ${scheme}`, () => {
    test.use({ colorScheme: scheme, viewport: { width: 390, height: 844 } });

    test('onboarding', async ({ page }) => {
      test.setTimeout(120_000);
      await page.clock.setFixedTime(NOW);
      await page.goto('/');
      await expect(page.getByTestId('screen-welcome')).toBeVisible();
      await expect(page).toHaveScreenshot(`welcome-${scheme}.png`, shot);
      await page.getByTestId('welcome-start').click();
      await page.getByTestId('goal-10k').click();
      await expect(page).toHaveScreenshot(`goal-${scheme}.png`, shot);
      await next(page, 'goal');
      for (let i = 0; i < 3; i++) await page.getByRole('button', { name: 'Bulan berikutnya' }).click();
      await page.locator('[data-testid^="day-"]').nth(10).click();
      await expect(page).toHaveScreenshot(`race-${scheme}.png`, shot);
      await next(page, 'race');
      await page.getByTestId('screen-ability').getByTestId('time').fill('3230');
      await expect(page).toHaveScreenshot(`ability-${scheme}.png`, shot);
    });

    test('app', async ({ page }) => {
      test.setTimeout(120_000);
      await page.clock.setFixedTime(NOW);
      await onboard(page);
      await expect(page).toHaveScreenshot(`today-${scheme}.png`, shot);
      for (const [tab, id, name] of [
        ['Plan', 'screen-plan', 'plan'],
        ['Progres', 'screen-progress', 'progress'],
        ['Profil', 'screen-profile', 'profile'],
      ] as const) {
        await page.getByRole('tab', { name: tab }).click();
        await expect(page.getByTestId(id)).toBeVisible();
        await expect(page).toHaveScreenshot(`${name}-${scheme}.png`, shot);
      }
    });
  });
}
