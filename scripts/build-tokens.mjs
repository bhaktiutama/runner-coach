// Mengubah docs/design-system/tokens.json (W3C DTCG) jadi packages/ui/src/tokens.ts.
// Jalankan: pnpm tokens. Jangan edit tokens.ts manual.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = JSON.parse(readFileSync(join(root, 'docs/design-system/tokens.json'), 'utf8'));

const camel = (k) => k.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

function lookup(path) {
  let node = src;
  for (const p of path.split('.')) node = node[p];
  if (!node || !('$value' in node)) throw new Error(`Token tidak ditemukan: ${path}`);
  return resolve(node.$value);
}

function resolve(v) {
  if (typeof v === 'string') {
    const ref = v.match(/^\{(.+)\}$/);
    if (ref) return lookup(ref[1]);
    const px = v.match(/^(-?\d+(?:\.\d+)?)px$/);
    if (px) return Number(px[1]);
    const ms = v.match(/^(\d+)ms$/);
    if (ms) return Number(ms[1]);
    return v;
  }
  if (Array.isArray(v)) return v.map(resolve);
  if (v && typeof v === 'object') {
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, resolve(x)]));
  }
  return v;
}

function walk(node) {
  if (node && typeof node === 'object' && '$value' in node) return resolve(node.$value);
  const out = {};
  for (const [k, v] of Object.entries(node)) {
    if (k.startsWith('$')) continue;
    out[camel(k)] = walk(v);
  }
  return out;
}

const tokens = walk(src);
const body = `// File ini dihasilkan oleh scripts/build-tokens.mjs dari docs/design-system/tokens.json.
// Jangan edit manual; jalankan \`pnpm tokens\`.
export const tokens = ${JSON.stringify(tokens, null, 2)} as const;

export type Tokens = typeof tokens;
`;
writeFileSync(join(root, 'packages/ui/src/tokens.ts'), body);
console.log('packages/ui/src/tokens.ts ditulis');

// Ikon ikut disalin agar packages/ui selalu sama dengan design system.
import { copyFileSync } from 'node:fs';
copyFileSync(
  join(root, 'docs/design-system/assets/icons/icons.json'),
  join(root, 'packages/ui/src/icons.json'),
);

// Logo SVG sebagai string untuk komponen Logo (react-native-svg SvgXml).
const logo = (f) => readFileSync(join(root, 'docs/design-system/assets/logo', f), 'utf8').trim();
writeFileSync(
  join(root, 'packages/ui/src/logos.ts'),
  `// Dihasilkan oleh scripts/build-tokens.mjs dari docs/design-system/assets/logo. Jangan edit manual.
export const logos = ${JSON.stringify(
    {
      mark: logo('logo-mark.svg'),
      markDark: logo('logo-mark-dark.svg'),
      horizontal: logo('logo-horizontal.svg'),
      horizontalDark: logo('logo-horizontal-dark.svg'),
    },
    null,
    2,
  )} as const;
`,
);
