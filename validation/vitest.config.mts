import { defineConfig } from 'vitest/config';

// Suite validasi engine. Dijalankan manual (pnpm validate:engine), tidak termasuk `pnpm test` / CI.
export default defineConfig({
  test: {
    include: ['validation/**/*.val.ts'],
    environment: 'node',
    testTimeout: 600_000,
    fileParallelism: false,
  },
});
