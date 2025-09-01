/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

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
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        'src/types/',
        'next.config.js',
        'tailwind.config.js',
        'src/app/layout.tsx', // Layout spécifique Next.js
        '**/*.stories.tsx',   // Storybook si ajouté plus tard
        '.next/**',           // Build Next.js
        '.firebase/**',       // Firebase build
        'dist/**',           // Distribution
        'build/**',          // Build générique
        'coverage/**',       // Éviter récursion
        '**/.next/**',       // Build Next.js dans subdirs
        '**/.firebase/**',   // Firebase dans subdirs
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    // Timeout pour tests Firebase
    testTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
