import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ENGINE_VERSION } from '../../packages/training-engine/src/generator';
import { chip, code, esc, page, table, type Status } from './html';

// Lokasi paket bukti: docs/validation/engine-<versi>/ (satu folder per versi engine).

/** Akar repo: naik dari cwd sampai package.json bernama runner-coach (jalan di Vitest ESM maupun Playwright CJS). */
function findRoot(): string {
  let d = process.cwd();
  for (let i = 0; i < 8; i++) {
    try {
      if (
        (JSON.parse(readFileSync(join(d, 'package.json'), 'utf8')) as { name?: string }).name ===
        'runner-coach'
      )
        return d;
    } catch {
      /* lanjut naik */
    }
    d = join(d, '..');
  }
  return process.cwd();
}
export const ROOT = findRoot();
export const OUT_DIR = join(ROOT, 'docs', 'validation', `engine-${ENGINE_VERSION}`);
export const DATA_DIR = join(OUT_DIR, 'data');

export function ensureDirs() {
  mkdirSync(DATA_DIR, { recursive: true });
}

export function runMeta() {
  let commit = 'tidak diketahui';
  try {
    commit = execSync('git rev-parse --short HEAD', { cwd: ROOT }).toString().trim();
    const dirty = execSync('git status --porcelain -- packages/training-engine', { cwd: ROOT })
      .toString()
      .trim();
    if (dirty) commit += ' (+ perubahan engine belum di-commit)';
  } catch {
    /* tanpa git: biarkan */
  }
  const now = new Date();
  const wib = new Date(now.getTime() + 7 * 3600_000).toISOString().replace('T', ' ').slice(0, 16);
  return {
    engineVersion: ENGINE_VERSION,
    commit,
    generatedAt: `${wib} WIB`,
    generatedIso: now.toISOString(),
  };
}

export type LayerSummary = {
  layer: 'lapisan-1' | 'lapisan-2' | 'lapisan-3' | 'review-pelatih';
  title: string;
  file: string;
  status: Status;
  headline: string;
  counts: { label: string; value: string }[];
  meta: ReturnType<typeof runMeta>;
};

export function writeJson(name: string, data: unknown) {
  ensureDirs();
  writeFileSync(
    join(DATA_DIR, name),
    JSON.stringify(data, (_k, v) => (v instanceof Set ? [...v] : v)),
  );
}

export function writeHtml(name: string, html: string) {
  ensureDirs();
  writeFileSync(join(OUT_DIR, name), html);
}

export const NAV = [
  { href: 'index.html', label: 'Ringkasan' },
  { href: 'lapisan-1.html', label: 'Lapisan 1: app = engine' },
  { href: 'lapisan-2.html', label: 'Lapisan 2: engine = aturan' },
  { href: 'lapisan-3.html', label: 'Lapisan 3: aturan = referensi' },
  { href: 'review-pelatih.html', label: 'Paket review pelatih' },
];
export const navFor = (file: string) => NAV.map((n) => ({ ...n, href: n.href === file ? '#' : n.href }));

/** Susun ulang index.html dari ringkasan semua lapisan yang sudah pernah dijalankan. */
export function buildIndex() {
  ensureDirs();
  const order = ['lapisan-1', 'lapisan-2', 'lapisan-3', 'review-pelatih'];
  const sums: LayerSummary[] = readdirSync(DATA_DIR)
    .filter((f) => f.startsWith('ringkasan-') && f.endsWith('.json'))
    .map((f) => JSON.parse(readFileSync(join(DATA_DIR, f), 'utf8')) as LayerSummary)
    .sort((a, b) => order.indexOf(a.layer) - order.indexOf(b.layer));
  const missing = order.filter((l) => !sums.some((s) => s.layer === l));
  const worst: Status = sums.some((s) => s.status === 'kritis')
    ? 'kritis'
    : sums.some((s) => s.status === 'mayor')
      ? 'mayor'
      : missing.length
        ? 'skip'
        : 'pass';
  const meta = runMeta();
  const verdictText =
    worst === 'kritis'
      ? `Engine ${esc(meta.engineVersion)} <b>belum bisa dinyatakan valid</b>: ada pelanggaran Kritis. Rincian per lapisan di bawah.`
      : worst === 'mayor'
        ? `Engine ${esc(meta.engineVersion)} belum memenuhi kriteria lulus: ada pelanggaran Mayor tanpa pengecualian yang disetujui.`
        : worst === 'skip'
          ? 'Belum semua lapisan dijalankan.'
          : `Engine ${esc(meta.engineVersion)} memenuhi kriteria lulus otomatis. Review pelatih tetap wajib (D6).`;
  const html = page({
    title: 'Validasi Engine Run Coach',
    eyebrow: `Paket bukti validasi · engine ${meta.engineVersion}`,
    heading: 'Apakah saran latihan Run Coach bisa dipertanggungjawabkan?',
    lead: 'Hasil menjalankan dokumen <i>Plan Validity Testing Engine Run Coach</i> pada satu versi engine. Tiga lapisan diperiksa dengan pembanding terpisah: app dibanding engine, engine dibanding aturan, aturan dibanding referensi dan pelatih.',
    meta: [
      ['Versi engine', meta.engineVersion],
      ['Commit', meta.commit],
      ['Diperbarui', meta.generatedAt],
    ],
    tiles: sums.map((s) => ({
      label: s.title,
      value: s.counts[0]?.value ?? '-',
      note: s.counts[0]?.label,
      status: s.status,
    })),
    verdict: { status: worst, text: verdictText },
    nav: navFor('index.html'),
    sections: [
      {
        id: 'lapisan',
        title: 'Hasil per lapisan',
        html: table(
          ['Lapisan', 'Status', 'Ringkasan', 'Angka utama', 'Dijalankan'],
          [
            ...sums.map((s) => [
              `<a href="${esc(s.file)}">${esc(s.title)}</a>`,
              chip(s.status),
              s.headline,
              s.counts.map((c) => `${esc(c.label)}: <b>${esc(c.value)}</b>`).join('<br>'),
              esc(s.meta.generatedAt),
            ]),
            ...missing.map((l) => [
              esc(NAV.find((n) => n.href === `${l}.html`)?.label ?? l),
              chip('skip'),
              'Belum dijalankan untuk versi ini.',
              '-',
              '-',
            ]),
          ],
        ),
      },
      {
        id: 'kriteria',
        title: 'Kriteria lulus',
        intro:
          'Dari dokumen Plan Validity Testing, bagian Kriteria lulus. Versi engine dinyatakan bisa dipertanggungjawabkan jika semua baris terpenuhi pada commit yang sama.',
        html: table(
          ['Kriteria', 'Batas lulus'],
          [
            [`${code('L1.1')}-${code('L1.6')} diff app vs engine (10 persona, ID dan EN)`, '0 beda'],
            ['Lapisan 2: pelanggaran Kritis di matriks penuh', '0'],
            [
              'Lapisan 2: pelanggaran Mayor',
              '0, atau tiap pengecualian tercatat dan disetujui pemilik produk',
            ],
            ['Lapisan 2: pelanggaran Minor', 'Dicatat dan dilacak, tidak menghalangi'],
            [`Kasus regresi ${code('H1')}-${code('H4')}`, 'Lulus setelah perbaikan; tetap ada di suite'],
            ['Lapisan 3: paritas dokumen-kode dan klaim teks', '0 selisih tanpa catatan'],
            [
              'Lapisan 3: review pelatih',
              '10 dari 10 plan tanpa "Tidak setuju" terbuka, formulir ditandatangani',
            ],
          ],
        ),
      },
      {
        id: 'cara',
        title: 'Cara menjalankan ulang',
        html: `<div class="callout"><p>Suite ini <b>tidak</b> masuk CI. Jalankan kapan saja dari akar repo:</p><ul><li><code>pnpm validate:engine</code> menjalankan Lapisan 2, Lapisan 3 dan paket review pelatih (sekitar 1 menit).</li><li><code>pnpm validate:app</code> menjalankan Lapisan 1 lewat Playwright. Ekspor web dulu dengan <code>EXPO_PUBLIC_E2E=1</code>.</li></ul><p class="note">Setiap run menimpa laporan di folder versi engine yang sama. Detail di <code>validation/README.md</code>.</p></div>`,
      },
    ],
  });
  writeFileSync(join(OUT_DIR, 'index.html'), html);
  return existsSync(join(OUT_DIR, 'index.html'));
}

export function writeSummary(s: LayerSummary) {
  writeJson(`ringkasan-${s.layer}.json`, s);
  buildIndex();
}
