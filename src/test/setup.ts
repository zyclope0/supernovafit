import '@testing-library/jest-dom';
import { vi, beforeAll, afterAll, afterEach } from 'vitest';

// Mock Firebase - Critique pour tests
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({ name: 'mock-app' })),
  getApps: vi.fn(() => []),
  getApp: vi.fn(() => ({ name: 'mock-app' })),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  onAuthStateChanged: vi.fn((auth, callback) => {
    // Mock user connecté par défaut
    callback({ uid: 'test-user-id', email: 'test@supernovafit.com' });
    return vi.fn(); // unsubscribe function
  }),
  signInWithEmailAndPassword: vi.fn(() =>
    Promise.resolve({
      user: { uid: 'test-user-id', email: 'test@supernovafit.com' },
    }),
  ),
  signOut: vi.fn(() => Promise.resolve()),
  sendPasswordResetEmail: vi.fn(() => Promise.resolve()),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  collection: vi.fn(),
  doc: vi.fn(),
  addDoc: vi.fn(() => Promise.resolve({ id: 'mock-doc-id' })),
  updateDoc: vi.fn(() => Promise.resolve()),
  deleteDoc: vi.fn(() => Promise.resolve()),
  getDocs: vi.fn(() => Promise.resolve({ docs: [] })),
  getDoc: vi.fn(() => Promise.resolve({ exists: () => false })),
  setDoc: vi.fn(() => Promise.resolve()),
  query: vi.fn(() => ({ __isFirestoreQuery: true })), // Retourner un mock query
  where: vi.fn(() => ({ __isFirestoreWhere: true })), // Chain
  orderBy: vi.fn(() => ({ __isFirestoreOrderBy: true })), // Chain
  limit: vi.fn(),
  startAt: vi.fn(),
  endAt: vi.fn(),
  onSnapshot: vi.fn((query, callback) => {
    // Simuler des données vides en async pour éviter les boucles
    setTimeout(() => {
      callback({ docs: [] });
    }, 0);
    // Retourner une fonction unsubscribe
    return vi.fn();
  }),
  serverTimestamp: vi.fn(() => ({ __type: 'timestamp' })),
}));

vi.mock('firebase/storage', () => ({
  getStorage: vi.fn(),
  ref: vi.fn(),
  uploadBytes: vi.fn(() => Promise.resolve({ ref: { fullPath: 'test-path' } })),
  getDownloadURL: vi.fn(() =>
    Promise.resolve('https://example.com/test-image.jpg'),
  ),
  deleteObject: vi.fn(() => Promise.resolve()),
}));

// Mock Next.js - Critique pour composants
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
  useParams: () => ({}),
}));

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    ...props
  }: {
    src: string;
    alt: string;
    [key: string]: unknown;
  }) => {
    return {
      type: 'img',
      props: { src, alt, ...props },
    };
  },
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  },
  Toaster: () => null,
}));

// Mock Recharts pour éviter erreurs SVG
vi.mock('recharts', () => ({
  ResponsiveContainer: vi.fn(() => null),
  LineChart: vi.fn(() => null),
  BarChart: vi.fn(() => null),
  PieChart: vi.fn(() => null),
  XAxis: vi.fn(() => null),
  YAxis: vi.fn(() => null),
  CartesianGrid: vi.fn(() => null),
  Tooltip: vi.fn(() => null),
  Legend: vi.fn(() => null),
  Line: vi.fn(() => null),
  Bar: vi.fn(() => null),
  Cell: vi.fn(() => null),
}));

// Mock ResizeObserver (utilisé par Recharts)
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock fetch pour API externes (Open Food Facts)
global.fetch = vi.fn();

// Mock window.matchMedia (pour responsive)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Clean up after each test pour éviter les fuites mémoire
afterEach(() => {
  vi.clearAllMocks();
  // Nettoyer les timers si utilisés
  vi.clearAllTimers();
});

// Supprimer les console.error en tests pour réduire le bruit
const originalError = console.error;
beforeAll(() => {
  console.error = vi.fn();
});

afterAll(() => {
  console.error = originalError;
});
