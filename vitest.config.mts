import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['packages/*/test/**/*.test.ts', 'apps/app/test/**/*.test.ts'],
    exclude: ['apps/app/test/privacy/**', '**/node_modules/**'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      include: ['packages/training-engine/src/**'],
      exclude: ['packages/training-engine/src/i18n/**'],
      thresholds: { lines: 90, functions: 90, branches: 85, statements: 90 },
    },
  },
});
