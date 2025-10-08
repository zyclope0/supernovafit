import { defineConfig, devices } from '@playwright/test';

/**
 * Configuration Playwright pour SuperNovaFit
 * Tests E2E pour garantir la stabilité des parcours critiques
 */

export default defineConfig({
  // Dossier des tests E2E
  testDir: './e2e',

  // Timeout par test (30s max)
  timeout: 30000,

  // Tests en série pour éviter les conflits sur la page /diete
  fullyParallel: false,

  // Interdire .only() en CI
  forbidOnly: !!process.env.CI,

  // Nombre de tentatives en cas d'échec
  retries: process.env.CI ? 2 : 0,

  // Workers (parallélisation)
  workers: process.env.CI ? 1 : undefined,

  // Reporter
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'playwright-results.json' }],
    ['list'],
  ],

  // Configuration globale
  use: {
    // URL de base (dev local ou preview)
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',

    // Trace uniquement en cas d'échec
    trace: 'on-first-retry',

    // Screenshots en cas d'échec
    screenshot: 'only-on-failure',

    // Video en cas d'échec
    video: 'retain-on-failure',

    // Timeout des actions (15s pour laisser Firebase Auth se propager)
    actionTimeout: 15000,

    // Timeout de navigation (15s)
    navigationTimeout: 15000,
  },

  // Projets de test (devices)
  projects: [
    // Mobile Chrome (priorité car mobile-first)
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
        viewport: { width: 393, height: 851 },
      },
    },

    // Desktop Chrome
    {
      name: 'Desktop Chrome',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },

    // Mobile Safari (iOS)
    {
      name: 'Mobile Safari',
      use: {
        ...devices['iPhone 12'],
        viewport: { width: 390, height: 844 },
      },
    },

    // Desktop Safari
    {
      name: 'Desktop Safari',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 720 },
      },
    },

    // Desktop Firefox
    {
      name: 'Desktop Firefox',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 720 },
      },
    },
  ],

  // Serveur de développement (optionnel)
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000, // 2 minutes pour le démarrage
  },
});
