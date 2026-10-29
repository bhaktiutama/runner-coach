import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { include: ['apps/app/test/privacy/**/*.test.ts'], environment: 'node', testTimeout: 30_000 },
});
