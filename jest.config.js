module.exports = {
  // Environment
  testEnvironment: 'jsdom',

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/src/test/jest-setup.ts'],

  // Module resolution
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Test patterns - Tests Jest uniquement (hooks + composants UI)
  testMatch: [
    // Hooks simples
    '<rootDir>/src/__tests__/hooks/*.simple.jest.test.ts',
    '<rootDir>/src/__tests__/hooks/jest-migration.test.ts',
    // Hooks avancés (Phase 1 Coverage 25%)
    '<rootDir>/src/__tests__/hooks/*.advanced.jest.test.ts',
    // Composants UI (Phase 1)
    '<rootDir>/src/__tests__/components/ui/FormField.jest.test.tsx',
    '<rootDir>/src/__tests__/components/ui/PageHeader.jest.test.tsx',
    '<rootDir>/src/__tests__/components/ui/Skeletons.jest.test.tsx',
  ],

  // Coverage
  collectCoverage: true,
  coverageDirectory: 'coverage-jest',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'src/hooks/**/*.{ts,tsx}',
    // Phase 1: Composants UI - Coverage désactivé temporairement (JSX parsing)
    // 'src/components/ui/FormField.tsx',
    // 'src/components/ui/PageHeader.tsx',
    // 'src/components/ui/Skeletons.tsx',
    '!src/hooks/**/*.d.ts',
    '!src/hooks/**/*.test.{ts,tsx}',
    '!src/components/**/*.d.ts',
    '!src/components/**/*.test.{ts,tsx}',
  ],

  // Transform
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react',
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          moduleResolution: 'node',
        },
      },
    ],
  },

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // Timeout
  testTimeout: 10000,

  // Max workers (éviter fuite mémoire)
  maxWorkers: 1,

  // Verbose
  verbose: true,
};
