import { expect, test } from '@playwright/test';
import { onboard } from './helpers';

// Mode gelap (F-24): app mengikuti tema perangkat, warna sesuai wireframe png/dark/.
const DARK_BG = 'rgb(22, 27, 31)'; // tokens color.dark.bg #161B1F
const LIGHT_BG = 'rgb(245, 244, 242)'; // tokens color.bg #F5F4F2

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
});

test('berganti tema saat app terbuka', async ({ page }) => {
  await onboard(page);
  expect(await bgOf(page, 'screen-today')).toBe(LIGHT_BG);
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect.poll(() => bgOf(page, 'screen-today')).toBe(DARK_BG);
  await page.emulateMedia({ colorScheme: 'light' });
  await expect.poll(() => bgOf(page, 'screen-today')).toBe(LIGHT_BG);
});
