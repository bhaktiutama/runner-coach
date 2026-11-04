import { expect, test } from '@playwright/test';

// 1.1 carousel (UI/UX 13): 3 halaman digeser manual, tombol utama ada di setiap halaman.
test('1.1 carousel tiga halaman, pindah lewat titik, CTA tetap terlihat', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('screen-welcome')).toBeVisible();
  await expect(page.getByText('1/3')).toBeVisible();
  await expect(page.getByText('Latihan pintar, bukan asal capek.')).toBeInViewport();
  for (const [i, title] of [
    [2, 'Data larimu, ya punyamu.'],
    [3, 'Strava tetap jalan, kami yang atur menunya.'],
  ] as const) {
    await page.getByTestId(`welcome-dot-${i}`).click();
    await expect(page.getByText(`${i}/3`)).toBeVisible();
    await expect(page.getByText(title)).toBeInViewport();
    await expect(page.getByTestId('welcome-start')).toBeInViewport();
  }
  await page.getByTestId('welcome-start').click();
  await expect(page.getByTestId('screen-goal')).toBeVisible();
});
