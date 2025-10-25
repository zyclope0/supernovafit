module.exports = {
  // Environment
  testEnvironment: 'jsdom',

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/src/test/jest-setup.ts'],

  // Module resolution
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Test patterns - Tests Jest uniquement
  testMatch: [
    '<rootDir>/src/__tests__/hooks/jest-migration.test.ts',
    '<rootDir>/src/__tests__/hooks/useRepas.simple.jest.test.ts',
    '<rootDir>/src/__tests__/hooks/useEntrainements.simple.jest.test.ts',
    '<rootDir>/src/__tests__/hooks/useMesures.simple.jest.test.ts',
    '<rootDir>/src/__tests__/hooks/useJournal.simple.jest.test.ts',
    '<rootDir>/src/__tests__/hooks/useCoachComments.simple.jest.test.ts',
    '<rootDir>/src/__tests__/hooks/useAuth.simple.jest.test.ts',
    '<rootDir>/src/__tests__/hooks/useChallenges.simple.jest.test.ts',
    '<rootDir>/src/__tests__/hooks/useNotifications.simple.jest.test.ts',
  ],

  // Coverage
  collectCoverage: true,
  coverageDirectory: 'coverage-jest',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'src/hooks/**/*.{ts,tsx}',
    '!src/hooks/**/*.d.ts',
    '!src/hooks/**/*.test.{ts,tsx}',
  ],

  // Transform
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
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
