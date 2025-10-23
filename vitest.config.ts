/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  esbuild: {
    jsx: 'transform',
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    css: true,
    exclude: [
      'node_modules/**',
      'e2e/**', // Exclure les tests E2E Playwright
      '**/*.e2e.ts',
      '**/*.e2e.tsx',
      '.firebase/**', // Exclure les tests Firebase
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        'src/types/',
        'next.config.js',
        'tailwind.config.js',
        'src/app/layout.tsx', // Layout spécifique Next.js
        '**/*.stories.tsx', // Storybook si ajouté plus tard
        '.next/**', // Build Next.js
        '.firebase/**', // Firebase build
        'dist/**', // Distribution
        'build/**', // Build générique
        'coverage/**', // Éviter récursion
        '**/.next/**', // Build Next.js dans subdirs
        '**/.firebase/**', // Firebase dans subdirs
        '**/*.config.*', // Fichiers de config
      ],
      thresholds: {
        global: {
          branches: 25,
          functions: 30,
          lines: 30,
          statements: 30,
        },
      },
    },
    // Isolation pour éviter les fuites mémoire
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: false, // Revenir à multi-fork (hooks skippés de toute façon)
        minForks: 1,
        maxForks: 4,
      },
    },
    // Timeout pour tests Firebase
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
