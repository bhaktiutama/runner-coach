import js from '@eslint/js';
import react from 'eslint-plugin-react';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.expo/**',
      '**/coverage/**',
      'docs/**',
      'test-results/**',
      'playwright-report/**',
      'apps/app/expo-env.d.ts',
      'supabase/functions/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    // TRD 8: tidak ada teks literal di JSX; semua lewat katalog i18n/id.ts.
    files: ['apps/app/src/**/*.tsx', 'packages/ui/src/**/*.tsx'],
    plugins: { react },
    rules: {
      'react/jsx-no-literals': [
        'error',
        { noStrings: true, ignoreProps: true, allowedStrings: ['/', '·', '-', '@', ':', '%', '~', 'x', '+'] },
      ],
    },
  },
  {
    // training-engine: TS murni, tanpa React/Expo/Supabase (TRD 2 aturan 1).
    files: ['packages/training-engine/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: ['react', 'react-*', 'expo*', '@supabase/*', '@run-coach/ui'] },
      ],
    },
  },
  {
    // Komponen tidak memanggil Supabase langsung (TRD 2 aturan 2).
    files: ['apps/app/src/app/**/*.tsx', 'apps/app/src/components/**/*.tsx', 'packages/ui/src/**/*.tsx'],
    rules: { 'no-restricted-imports': ['error', { patterns: ['@supabase/*', '@/auth/supabase'] }] },
  },
);
