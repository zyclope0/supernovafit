/**
 * Setup global pour les tests SuperNovaFit
 * Usage: importé automatiquement par Vitest
 */

import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// Mock Firebase
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
}));

// Mock Firebase Firestore optimisé pour éviter les fuites mémoire
vi.mock('firebase/firestore', () => {
  const mockTimestamp = {
    fromDate: vi.fn((date) => ({ toDate: () => date })),
    now: vi.fn(() => ({ toDate: () => new Date() })),
  };

  return {
    getFirestore: vi.fn(),
    collection: vi.fn(),
    doc: vi.fn(),
    addDoc: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    getDoc: vi.fn(),
    getDocs: vi.fn(),
    onSnapshot: vi.fn((query, callback) => {
      // Mock optimisé qui retourne immédiatement
      if (callback) {
        setTimeout(() => callback({ docs: [] }), 0);
      }
      return () => {}; // Cleanup function
    }),
    query: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    Timestamp: mockTimestamp,
  };
});

vi.mock('firebase/storage', () => ({
  getStorage: vi.fn(),
  ref: vi.fn(),
  uploadBytes: vi.fn(),
  getDownloadURL: vi.fn(),
}));

// Mock Next.js
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  })),
  usePathname: vi.fn(() => '/'),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) =>
    React.createElement('img', { src, alt, ...props }),
}));

// Mock Recharts
vi.mock('recharts', () => ({
  LineChart: vi.fn(({ children }) =>
    React.createElement('div', { 'data-testid': 'line-chart' }, children),
  ),
  BarChart: vi.fn(({ children }) =>
    React.createElement('div', { 'data-testid': 'bar-chart' }, children),
  ),
  PieChart: vi.fn(({ children }) =>
    React.createElement('div', { 'data-testid': 'pie-chart' }, children),
  ),
  XAxis: vi.fn(() => React.createElement('div', { 'data-testid': 'x-axis' })),
  YAxis: vi.fn(() => React.createElement('div', { 'data-testid': 'y-axis' })),
  CartesianGrid: vi.fn(() =>
    React.createElement('div', { 'data-testid': 'cartesian-grid' }),
  ),
  Tooltip: vi.fn(() =>
    React.createElement('div', { 'data-testid': 'tooltip' }),
  ),
  Legend: vi.fn(() => React.createElement('div', { 'data-testid': 'legend' })),
  Line: vi.fn(() => React.createElement('div', { 'data-testid': 'line' })),
  Bar: vi.fn(() => React.createElement('div', { 'data-testid': 'bar' })),
  Pie: vi.fn(() => React.createElement('div', { 'data-testid': 'pie' })),
}));

// Mock React Hot Toast
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  },
}));

// Mock fetch
global.fetch = vi.fn();

// Mock window.alert
global.alert = vi.fn();

// Mock window.confirm
global.confirm = vi.fn(() => true);

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock crypto
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'test-uuid'),
  },
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-url');
global.URL.revokeObjectURL = vi.fn();

// Mock FileReader
global.FileReader = vi.fn(() => ({
  readAsText: vi.fn(),
  readAsDataURL: vi.fn(),
  result: 'mock-result',
  onload: null,
  onerror: null,
}));

// Mock Date.now pour les tests
const mockDate = new Date('2025-10-24T12:00:00Z');
vi.setSystemTime(mockDate);

// Cleanup après chaque test
afterEach(() => {
  vi.clearAllMocks();
  localStorageMock.clear();
  sessionStorageMock.clear();
});

// Configuration globale
beforeAll(() => {
  // Configuration des tests
  vi.setConfig({
    testTimeout: 30000,
    slowThreshold: 1000,
  });
});

// Export pour usage dans les tests
export { vi };
