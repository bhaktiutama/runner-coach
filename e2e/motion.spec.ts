import { expect, test } from '@playwright/test';
import { onboard } from './helpers';

// UI/UX bagian 11 (G1, G3): centang "Selesai" dan cincin Progres benar-benar bergerak saat layar terlihat.
test('centang selesai dan cincin Progres beranimasi saat layar terlihat', async ({ page }) => {
  await onboard(page);
  const card = page.getByTestId('workout-card');
  test.skip(!(await card.isVisible()), 'Hari ini istirahat di plan ini');
  await card.getByTestId('start').click();
  await expect(page.getByTestId('timer-remaining')).toBeVisible({ timeout: 10_000 });
  await page.waitForTimeout(1500);
  await page.getByTestId('timer-end').click();
  await page.getByTestId('timer-confirm-yes').click();
  await page.getByTestId('finish-distance').fill('1,2');
  await page.getByTestId('rpe-6').click();
  await page.getByTestId('finish-save').click();
  // Latihan terakhir minggu itu membuka 2.5 dulu; tutup supaya Today terlihat.
  const week = await page
    .getByTestId('screen-week')
    .waitFor({ timeout: 4000 })
    .then(
      () => true,
      () => false,
    );
  if (week)
    await page
      .getByRole('button', { name: /Tutup|Close/ })
      .first()
      .click();

  // Ukur skala/opacity centang tiap 40 ms: harus pernah di bawah 1 lalu berakhir di 1.
  const readCheck = () =>
    page.evaluate(() => {
      let n: Element | null = document.querySelector('[data-testid="workout-bib"]');
      let min = 1;
      for (let k = 0; k < 6 && n; k++, n = n.parentElement)
        min = Math.min(min, Number(getComputedStyle(n).opacity));
      return min;
    });
  const seen: number[] = [];
  for (let i = 0; i < 25; i++) {
    seen.push(await readCheck());
    await page.waitForTimeout(40);
  }
  expect(Math.min(...seen)).toBeLessThan(1);
  expect(seen[seen.length - 1]).toBe(1);

  // Cincin kepatuhan tumbuh dari 0 setiap tab Progres terlihat (bukan langsung penuh).
  await page.getByRole('tab', { name: 'Progres' }).click();
  const readRing = () =>
    page.evaluate(() => {
      const r = document.querySelectorAll('[role="progressbar"] svg rect')[1];
      return r ? Number((r.getAttribute('stroke-dasharray') ?? '0').split(' ')[0]) : -1;
    });
  const ring: number[] = [];
  for (let i = 0; i < 40; i++) {
    ring.push(await readRing());
    await page.waitForTimeout(50);
  }
  const full = Math.max(...ring);
  expect(full).toBeGreaterThan(0);
  expect(ring.some((v) => v >= 0 && v < full * 0.9)).toBe(true);
});
