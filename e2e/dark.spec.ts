import { expect, test } from '@playwright/test';
import { next, onboard, restoreSeed } from './helpers';

// Mode gelap (F-24): app mengikuti tema perangkat, warna sesuai wireframe png/dark/.
const DARK_BG = 'rgb(22, 27, 31)'; // tokens color.dark.bg #161B1F
const LIGHT_BG = 'rgb(245, 244, 242)'; // tokens color.bg #F5F4F2
const ON_STATUS = 'rgb(36, 44, 50)'; // tokens color.status.onStatus #242C32

const bgOf = (page: import('@playwright/test').Page, testId: string) =>
  page.getByTestId(testId).evaluate((el) => getComputedStyle(el).backgroundColor);

test.describe('tema gelap perangkat', () => {
  test.use({ colorScheme: 'dark' });

  test('layar utama memakai palet gelap tanpa error', async ({ page }, info) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await onboard(page, { strength: true });
    await expect(page.getByTestId('screen-today')).toBeVisible();
    expect(await bgOf(page, 'screen-today')).toBe(DARK_BG);
    if (process.env.DARK_SHOTS)
      await page.screenshot({ path: `${process.env.DARK_SHOTS}/2-1.png`, fullPage: true });
    for (const [tab, id, file] of [
      ['Plan', 'screen-plan', '3-1'],
      ['Progres', 'screen-progress', '3-3'],
      ['Profil', 'screen-profile', '4-1'],
    ] as const) {
      await page.getByRole('tab', { name: tab }).click();
      await expect(page.getByTestId(id)).toBeVisible();
      expect(await bgOf(page, id)).toBe(DARK_BG);
      if (process.env.DARK_SHOTS)
        await page.screenshot({ path: `${process.env.DARK_SHOTS}/${file}.png`, fullPage: true });
    }
    expect(errors).toEqual([]);
    void info;
  });

  // Teks di kotak status (InfoBox, pesan 3.2, kotak adaptasi) selalu on-status, juga di mode gelap.
  test('teks kotak status tetap gelap dan terbaca', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('welcome-start').click();
    await page.getByTestId('goal-10k').click();
    await next(page, 'goal');
    for (let i = 0; i < 3; i++) await page.getByRole('button', { name: 'Bulan berikutnya' }).click();
    await page.locator('[data-testid^="day-"]').nth(10).click();
    const box = page.getByTestId('race-fit');
    await expect(box).toBeVisible();
    const colors = await box.evaluate((el) =>
      [...el.querySelectorAll('div[dir], span, div')]
        .filter(
          (n) =>
            n.childNodes.length && [...n.childNodes].some((c) => c.nodeType === 3 && c.textContent!.trim()),
        )
        .map((n) => getComputedStyle(n).color),
    );
    expect(colors.length).toBeGreaterThan(0);
    for (const c of colors) expect(c).toBe(ON_STATUS);
  });
});

test('3.1 menandai latihan selesai dengan centang', async ({ page }) => {
  await restoreSeed(page);
  await page.getByRole('tab', { name: 'Plan' }).click();
  await expect(page.getByTestId('screen-plan')).toBeVisible();
  const done = page.locator('[data-testid^="plan-done-"]');
  for (let i = 0; i < 12 && (await done.count()) === 0; i++) {
    if (await page.getByTestId('prev-week').isDisabled()) break;
    await page.getByTestId('prev-week').click();
  }
  await expect(done.first()).toBeVisible();
  await expect(done.first()).toHaveAttribute('aria-label', 'Selesai');
});

test('berganti tema saat app terbuka', async ({ page }) => {
  await onboard(page);
  expect(await bgOf(page, 'screen-today')).toBe(LIGHT_BG);
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect.poll(() => bgOf(page, 'screen-today')).toBe(DARK_BG);
  await page.emulateMedia({ colorScheme: 'light' });
  await expect.poll(() => bgOf(page, 'screen-today')).toBe(LIGHT_BG);
});
