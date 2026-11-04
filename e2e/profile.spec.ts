import { expect, test } from '@playwright/test';
import { onboard } from './helpers';

// Lebar iPhone SE / 13 mini: nilai baris pengaturan yang tidak muat turun ke bawah label.
test.use({ viewport: { width: 375, height: 667 } });

test('4.1 di layar kecil: nilai turun ke baris kedua, label tidak terpotong', async ({ page }) => {
  await onboard(page);
  await page.getByRole('tab', { name: 'Profil' }).click();
  const row = page.getByTestId('row-privacy');
  await row.scrollIntoViewIfNeeded();
  const label = row.getByText('Data & privasi', { exact: true });
  const value = row.getByText('Tersimpan di HP ini', { exact: true });
  const [l, v] = [await label.boundingBox(), await value.boundingBox()];
  expect(l && v).toBeTruthy();
  // Label tetap satu baris; nilai di kanan pada baris yang sama atau turun ke bawah, tidak bertumpuk.
  expect(l!.height).toBeLessThan(30);
  expect(v!.x >= l!.x + l!.width || v!.y >= l!.y + l!.height - 1).toBe(true);
});

test('4.1 ganti target memakai dialog konfirmasi', async ({ page }) => {
  await onboard(page);
  await page.getByRole('tab', { name: 'Profil' }).click();
  await page.getByTestId('row-goal').click();
  await expect(page.getByTestId('new-goal-confirm')).toBeVisible();
  await page.getByTestId('new-goal-confirm').getByRole('button', { name: 'Batal' }).click();
  await expect(page.getByTestId('new-goal-confirm')).toHaveCount(0);
  await page.getByTestId('row-goal').click();
  await page.getByTestId('new-goal').click();
  await expect(page.getByTestId('screen-goal')).toBeVisible();
});
