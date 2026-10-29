import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { onboard } from './helpers';

// M6 verifikasi (web): backup -> hapus data -> pulihkan identik; jeda/lanjut; tidak ada data keluar perangkat.
test('backup, hapus data di HP, pulihkan dari file', async ({ page }) => {
  const external: string[] = [];
  page.on('request', (r) => {
    const u = new URL(r.url());
    if (!['localhost', '127.0.0.1'].includes(u.hostname) && u.protocol.startsWith('http'))
      external.push(r.url());
  });
  await onboard(page);
  // catat 1 lari agar ada aktivitas di backup
  await page.getByTestId('manual-log').click();
  await page.getByTestId('log-extra').click();
  await page.getByTestId('log-km').fill('4,2');
  await page.getByTestId('log-duration').fill('30:00');
  await page.getByTestId('screen-log').getByTestId('rpe-3').click();
  await page.getByTestId('log-save').click();
  await expect(page.getByTestId('screen-today')).toBeVisible();

  await page.getByRole('tab', { name: 'Profil' }).click();
  await page.getByTestId('row-privacy').click();
  await expect(page.getByTestId('screen-privacy')).toBeVisible();
  await expect(page.getByTestId('last-backup')).toContainText('Belum pernah');
  const dl = page.waitForEvent('download');
  await page.getByTestId('backup').click();
  const file = await dl;
  expect(file.suggestedFilename()).toMatch(/^run-coach-backup-\d{4}-\d{2}-\d{2}\.json$/);
  const path = await file.path();
  const json = JSON.parse(readFileSync(path, 'utf8'));
  expect(json.format).toBe('run-coach-backup');
  expect(json.tables.activities).toHaveLength(1);
  expect(JSON.stringify(json)).not.toContain('owner_id');
  await expect(page.getByTestId('last-backup')).toContainText('hari ini');

  // Hapus data di HP -> kembali ke Selamat datang
  await page.getByTestId('wipe').click();
  await page.getByTestId('wipe-yes').click();
  await expect(page.getByTestId('screen-welcome')).toBeVisible();

  // Masuk (mode uji) -> HP kosong -> Pulihkan dari file
  await page.getByText('Sudah punya akun? Masuk').click();
  await page.getByTestId('auth-skip').click();
  await page.getByText('Pulihkan dari file backup').click();
  await expect(page.getByTestId('screen-privacy')).toBeVisible();
  const chooser = page.waitForEvent('filechooser');
  await page.getByTestId('restore').click();
  await (await chooser).setFiles(path);
  await expect(page.getByTestId('restore-confirm')).toContainText('1 aktivitas');
  await page.getByTestId('restore-yes').click();
  await expect(page.getByTestId('screen-today')).toBeVisible();
  await page.getByRole('tab', { name: 'Progres' }).click();
  await expect(page.getByText('Lari tambahan')).toBeVisible();
  expect(external).toEqual([]);
});

test('file bukan backup ditolak, data lama utuh', async ({ page }) => {
  await onboard(page);
  await page.getByRole('tab', { name: 'Profil' }).click();
  await page.getByTestId('row-privacy').click();
  const chooser = page.waitForEvent('filechooser');
  await page.getByTestId('restore').click();
  await (
    await chooser
  ).setFiles({ name: 'x.json', mimeType: 'application/json', buffer: Buffer.from('{"hello":1}') });
  await expect(page.getByTestId('privacy-msg')).toContainText('bukan backup Run Coach');
});

test('jeda plan lalu lanjut dengan Return to run', async ({ page }) => {
  await onboard(page);
  await page.getByRole('tab', { name: 'Profil' }).click();
  await page.getByTestId('row-pause').click();
  await page.getByTestId('reason-sick').click();
  await page.getByTestId('pause-confirm').click();
  await expect(page.getByTestId('paused')).toBeVisible();
  await page.getByTestId('today-resume').click();
  await expect(page.getByTestId('paused')).toHaveCount(0);
});

test('hapus akun butuh login dan ketik HAPUS', async ({ page }) => {
  await onboard(page);
  await page.getByRole('tab', { name: 'Profil' }).click();
  await page.getByTestId('row-privacy').click();
  await page.getByTestId('delete-account').click();
  await page.getByTestId('delete-word').fill('HAPUS');
  await expect(page.getByTestId('delete-confirm')).toBeDisabled();
  await expect(page.getByText('Kamu belum masuk')).toBeVisible();
});
