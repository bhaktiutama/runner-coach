import { LEGEND, type LegendRow } from './legend';

// Pembuat halaman laporan HTML. Satu file mandiri per lapisan: CSS inline, tanpa script,
// palet Lintas yang sama dengan docs/engine-review.html (terang dan gelap).

export const esc = (s: unknown) =>
  String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

export type Status = 'pass' | 'kritis' | 'mayor' | 'minor' | 'skip' | 'known' | 'info';

const STATUS_LABEL: Record<Status, string> = {
  pass: 'Lulus',
  kritis: 'Gagal Kritis',
  mayor: 'Gagal Mayor',
  minor: 'Minor',
  skip: 'Tidak dijalankan',
  known: 'Gagal (sudah diketahui)',
  info: 'Catatan',
};

export const chip = (s: Status, label?: string) =>
  `<span class="chip s-${s}">${esc(label ?? STATUS_LABEL[s])}</span>`;

/** Tabel sederhana. Sel berupa HTML mentah; panggil esc() untuk teks. */
export function table(head: string[], rows: string[][], opts: { num?: number[] } = {}) {
  const num = new Set(opts.num ?? []);
  return `<div class="tw"><table><thead><tr>${head.map((h, i) => `<th${num.has(i) ? ' class="n"' : ''}>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows
    .map((r) => `<tr>${r.map((c, i) => `<td${num.has(i) ? ' class="n"' : ''}>${c}</td>`).join('')}</tr>`)
    .join('')}</tbody></table></div>`;
}

export type Tile = { label: string; value: string; note?: string; status?: Status };
export type Section = { id: string; title: string; intro?: string; html: string };

export type PageArgs = {
  title: string;
  eyebrow: string;
  heading: string;
  lead: string;
  meta: [string, string][];
  tiles: Tile[];
  verdict: { status: Status; text: string };
  sections: Section[];
  nav?: { href: string; label: string }[];
  legend?: LegendRow[];
};

const CSS = `
/* Layout: satu kolom baca 980px; ringkasan dulu (putusan + angka), lalu bagian detail, legenda kode di akhir. Palet = design system Lintas, sama dengan engine-review.html. */
:root {
  --bg: #F5F4F2; --surface: #FFFFFF; --sunken: #EAE8E5; --fg: #242C32; --muted: #5E6670; --line: #DDDAD6;
  --primary: #F26B38; --primary-ink: #C63F0D;
  --ok: #70D6B3; --ok-ink: #247F60; --warn: #F2C66D; --warn-ink: #95680D; --bad: #FF806E; --bad-ink: #C42F1C; --rec: #A6B8FF;
  --on-chip: #242C32;
  --display: "Bricolage Grotesque", system-ui, sans-serif;
  --ui: "Plus Jakarta Sans", system-ui, sans-serif;
  --mono: ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace;
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {
  --bg: #161B1F; --surface: #242C32; --sunken: #1D2328; --fg: #FFF9F2; --muted: #A9B0B7; --line: #343D44;
  --primary-ink: #F58A5F; --ok-ink: #6FB394; --warn-ink: #E3B65A; --bad-ink: #FF8A78; color-scheme: dark } }
:root[data-theme="dark"] {
  --bg: #161B1F; --surface: #242C32; --sunken: #1D2328; --fg: #FFF9F2; --muted: #A9B0B7; --line: #343D44;
  --primary-ink: #F58A5F; --ok-ink: #6FB394; --warn-ink: #E3B65A; --bad-ink: #FF8A78; color-scheme: dark }
* { box-sizing: border-box }
body { background: var(--bg); color: var(--fg); font: 500 15px/1.55 var(--ui); margin: 0;
  padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); padding-block: 32px 64px }
.wrap { max-width: 980px; margin: 0 auto; display: flex; flex-direction: column; gap: 36px }
h1, h2, h3 { font-family: var(--display); font-weight: 800; letter-spacing: -0.02em; text-wrap: balance; margin: 0 }
h1 { font-size: clamp(28px, 5.5vw, 40px); line-height: 1.08 }
h2 { font-size: 22px; line-height: 1.2 }
h3 { font-size: 16px; line-height: 1.3; letter-spacing: 0 }
p { margin: 0; max-width: 72ch }
a { color: var(--primary-ink) }
a:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px }
code { font-family: var(--mono); font-size: .88em; background: var(--sunken); padding: 1px 5px; border-radius: 5px }
.eyebrow { font-size: 12px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: var(--muted) }
.muted { color: var(--muted) }
header { display: flex; flex-direction: column; gap: 12px }
nav { display: flex; flex-wrap: wrap; gap: 8px }
nav a { font-size: 13px; font-weight: 700; text-decoration: none; padding: 6px 12px; border-radius: 99px; background: var(--surface); box-shadow: 0 0 0 1px var(--line) inset; color: var(--fg) }
nav a[aria-current="page"] { background: var(--fg); color: var(--bg) }
.meta { display: flex; flex-wrap: wrap; gap: 6px 18px; font-size: 13px; color: var(--muted) }
.meta b { color: var(--fg); font-weight: 700 }
.verdict { border-radius: 16px; padding: 18px 20px; display: flex; gap: 14px; align-items: flex-start; background: var(--surface); box-shadow: 0 0 0 1px var(--line) inset }
.verdict.s-kritis { box-shadow: 0 0 0 2px var(--bad) inset }
.verdict.s-mayor { box-shadow: 0 0 0 2px var(--warn) inset }
.verdict.s-pass { box-shadow: 0 0 0 2px var(--ok) inset }
.verdict p { font-size: 16px; font-weight: 600 }
.tiles { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 10px }
.tile { background: var(--surface); border-radius: 14px; padding: 14px 16px; display: flex; flex-direction: column; gap: 2px; min-width: 0; box-shadow: 0 1px 0 var(--line) }
.tile .v { font-family: var(--display); font-weight: 800; font-size: 28px; font-variant-numeric: tabular-nums; line-height: 1.1 }
.tile.s-kritis .v { color: var(--bad-ink) } .tile.s-mayor .v { color: var(--warn-ink) } .tile.s-pass .v { color: var(--ok-ink) }
.tile .l { font-size: 13px; font-weight: 700 }
.tile .note { font-size: 12px; color: var(--muted) }
section { display: flex; flex-direction: column; gap: 14px; scroll-margin-top: 16px }
.tw { overflow-x: auto; background: var(--surface); border-radius: 14px; box-shadow: 0 0 0 1px var(--line) inset }
table { border-collapse: collapse; width: 100%; font-size: 13.5px }
th, td { text-align: left; vertical-align: top; padding: 9px 12px; border-bottom: 1px solid var(--line) }
th { font-size: 12px; font-weight: 800; letter-spacing: .04em; text-transform: uppercase; color: var(--muted); background: var(--sunken); white-space: nowrap }
tr:last-child td { border-bottom: 0 }
td.n, th.n { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap }
td .sub { display: block; font-size: 12px; color: var(--muted) }
.chip { display: inline-block; font-size: 12px; font-weight: 800; padding: 2px 9px; border-radius: 99px; white-space: nowrap; color: var(--on-chip) }
.s-pass.chip { background: var(--ok) } .s-kritis.chip { background: var(--bad) } .s-mayor.chip { background: var(--warn) }
.s-minor.chip { background: var(--sunken); color: var(--fg); box-shadow: 0 0 0 1px var(--line) inset }
.s-skip.chip { background: var(--sunken); color: var(--muted) } .s-known.chip { background: var(--warn) } .s-info.chip { background: var(--rec) }
abbr[title] { text-decoration: underline dotted; text-underline-offset: 3px; cursor: help }
.note { font-size: 13px; color: var(--muted) }
.callout { background: var(--surface); border-radius: 14px; padding: 14px 16px; box-shadow: 0 0 0 1px var(--line) inset; display: flex; flex-direction: column; gap: 6px }
ul { margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 4px }
.legend td:first-child { font-weight: 800; white-space: nowrap }
@media (prefers-reduced-motion: reduce) { * { scroll-behavior: auto } }
`;

/** Bungkus kode E-xx / R-xx / H1 dst. dengan tooltip artinya. */
const ABBR: [RegExp, string][] = [
  [/^E-O\d$/, 'Keputusan terbuka engine (07 bagian 4)'],
  [/^E-\d\d[a-z]?$/, 'Aturan engine (TRD 4.2/4.3); huruf kecil = sub-pemeriksaan validator'],
  [/^R\d+$/, 'Referensi penelitian (07 bagian 5)'],
  [/^H\d$/, 'Temuan prioritas tinggi yang sudah diketahui (dokumen Plan Validity Testing)'],
  [/^N\d$/, 'Temuan minor yang sudah diketahui (dokumen Plan Validity Testing)'],
  [/^P\d+$/, 'Persona golden (dokumen Plan Validity Testing)'],
  [/^L[13]\.\d$/, 'Uji di dokumen Plan Validity Testing'],
];
export const code = (c: string) => {
  const hit = ABBR.find(([re]) => re.test(c));
  return hit ? `<abbr title="${esc(hit[1])}">${esc(c)}</abbr>` : esc(c);
};

/** Pembungkus dokumen lengkap supaya file bisa dibuka langsung dari repo (bukan mode quirks). */
export const DOC_OPEN =
  '<!doctype html>\n<html lang="id">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n';
export const DOC_CLOSE = '\n</body>\n</html>\n';

export function page(a: PageArgs): string {
  const legend = a.legend ?? LEGEND;
  const nav = a.nav?.length
    ? `<nav aria-label="Laporan lain">${a.nav.map((n) => `<a href="${esc(n.href)}"${n.href === '#' ? ' aria-current="page"' : ''}>${esc(n.label)}</a>`).join('')}</nav>`
    : '';
  const toc = a.sections.map((s) => `<a href="#${s.id}">${esc(s.title)}</a>`).join('');
  return `${DOC_OPEN}<title>${esc(a.title)}</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap">
<style>${CSS}</style>
</head>
<body>
<div class="wrap">
<header>
${nav}
<span class="eyebrow">${esc(a.eyebrow)}</span>
<h1>${esc(a.heading)}</h1>
<p>${a.lead}</p>
<div class="meta">${a.meta.map(([k, v]) => `<span>${esc(k)}: <b>${esc(v)}</b></span>`).join('')}</div>
</header>
<div class="verdict s-${a.verdict.status}">${chip(a.verdict.status)}<p>${a.verdict.text}</p></div>
<div class="tiles">${a.tiles
    .map(
      (t) =>
        `<div class="tile${t.status ? ` s-${t.status}` : ''}"><span class="v">${esc(t.value)}</span><span class="l">${esc(t.label)}</span>${t.note ? `<span class="note">${esc(t.note)}</span>` : ''}</div>`,
    )
    .join('')}</div>
<nav aria-label="Isi laporan">${toc}<a href="#legenda">Legenda kode</a></nav>
${a.sections
  .map(
    (s) =>
      `<section id="${s.id}"><h2>${esc(s.title)}</h2>${s.intro ? `<p class="muted">${s.intro}</p>` : ''}${s.html}</section>`,
  )
  .join('\n')}
<section id="legenda" class="legend"><h2>Legenda kode</h2><p class="muted">Arti setiap kode huruf-angka di laporan ini dan dokumen asalnya. Arahkan kursor ke kode bergaris titik untuk melihat artinya langsung.</p>
${table(
  ['Kode', 'Artinya', 'Dari dokumen'],
  legend.map((r) => [esc(r.code), esc(r.meaning), esc(r.source)]),
)}</section>
</div>${DOC_CLOSE}`;
}
