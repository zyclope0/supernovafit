/**
 * Setup Jest pour les tests SuperNovaFit
 * Basé sur setup.ts Vitest existant
 */

import '@testing-library/jest-dom';
import React from 'react';

// Mock Firebase
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));

// Mock Firebase Firestore optimisé pour Jest
jest.mock('firebase/firestore', () => {
  const mockTimestamp = {
    fromDate: jest.fn((date) => ({ toDate: () => date })),
    now: jest.fn(() => ({ toDate: () => new Date() })),
  };

  return {
    getFirestore: jest.fn(),
    collection: jest.fn(),
    doc: jest.fn(),
    addDoc: jest.fn(),
    updateDoc: jest.fn(),
    deleteDoc: jest.fn(),
    getDoc: jest.fn(),
    getDocs: jest.fn(),
    onSnapshot: jest.fn((query, callback) => {
      // Mock optimisé qui retourne immédiatement
      if (callback) {
        setTimeout(() => callback({ docs: [] }), 0);
      }
      return () => {}; // Cleanup function
    }),
    query: jest.fn(),
    where: jest.fn(),
    orderBy: jest.fn(),
    limit: jest.fn(),
    Timestamp: mockTimestamp,
  };
});

jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(),
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(),
}));

// Mock Next.js
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

jest.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) =>
    React.createElement('img', { src, alt, ...props }),
}));

// Mock Recharts
jest.mock('recharts', () => ({
  LineChart: jest.fn(({ children }) =>
    React.createElement('div', { 'data-testid': 'line-chart' }, children),
  ),
  BarChart: jest.fn(({ children }) =>
    React.createElement('div', { 'data-testid': 'bar-chart' }, children),
  ),
  PieChart: jest.fn(({ children }) =>
    React.createElement('div', { 'data-testid': 'pie-chart' }, children),
  ),
  XAxis: jest.fn(() => React.createElement('div', { 'data-testid': 'x-axis' })),
  YAxis: jest.fn(() => React.createElement('div', { 'data-testid': 'y-axis' })),
  CartesianGrid: jest.fn(() =>
    React.createElement('div', { 'data-testid': 'cartesian-grid' }),
  ),
  Tooltip: jest.fn(() =>
    React.createElement('div', { 'data-testid': 'tooltip' }),
  ),
  Legend: jest.fn(() =>
    React.createElement('div', { 'data-testid': 'legend' }),
  ),
  Line: jest.fn(() => React.createElement('div', { 'data-testid': 'line' })),
  Bar: jest.fn(() => React.createElement('div', { 'data-testid': 'bar' })),
  Pie: jest.fn(() => React.createElement('div', { 'data-testid': 'pie' })),
}));

// Mock React Hot Toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
    dismiss: jest.fn(),
  },
}));

// Mock fetch
global.fetch = jest.fn();

// Mock window.alert
global.alert = jest.fn();

// Mock window.confirm
global.confirm = jest.fn(() => true);

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock crypto
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn(() => 'test-uuid'),
  },
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

// Mock FileReader
global.FileReader = jest.fn(() => ({
  readAsText: jest.fn(),
  readAsDataURL: jest.fn(),
  result: 'mock-result',
  onload: null,
  onerror: null,
}));

// Mock Date.now pour les tests (sans fake timers pour les tests async)
// const mockDate = new Date('2025-10-24T12:00:00Z'); // Temporarily unused
// jest.useFakeTimers(); // Désactivé pour les tests async
// jest.setSystemTime(mockDate);

// Cleanup après chaque test
afterEach(() => {
  jest.clearAllMocks();
  localStorageMock.clear();
  sessionStorageMock.clear();
});

// Configuration globale
beforeAll(() => {
  // Configuration des tests
  jest.setTimeout(30000);
});
