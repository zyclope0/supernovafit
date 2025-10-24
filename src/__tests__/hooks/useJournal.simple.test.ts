import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';

// Mock simple sans Firebase
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  onSnapshot: vi.fn(() => () => {}), // Retourne une fonction de cleanup
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  Timestamp: {
    fromDate: vi.fn((date) => ({ toDate: () => date })),
    now: vi.fn(() => ({ toDate: () => new Date() })),
  },
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({ user: { uid: 'test-user' } })),
}));

// Import du hook après les mocks
import { useJournal } from '@/hooks/useFirestore';

describe('useJournal - Simple Tests', () => {
  it('should initialize with empty array', () => {
    const { result } = renderHook(() => useJournal());
    
    expect(result.current.entries).toEqual([]);
    expect(result.current.loading).toBe(true);
  });

  it('should have correct hook structure', () => {
    const { result } = renderHook(() => useJournal());
    
    expect(result.current).toHaveProperty('entries');
    expect(result.current).toHaveProperty('loading');
    expect(result.current).toHaveProperty('addEntry');
    expect(result.current).toHaveProperty('updateEntry');
    expect(result.current).toHaveProperty('deleteEntry');
  });

  it('should have functions defined', () => {
    const { result } = renderHook(() => useJournal());
    
    expect(typeof result.current.addEntry).toBe('function');
    expect(typeof result.current.updateEntry).toBe('function');
    expect(typeof result.current.deleteEntry).toBe('function');
  });
});
