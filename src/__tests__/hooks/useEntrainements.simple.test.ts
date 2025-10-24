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
import { useEntrainements } from '@/hooks/useFirestore';

describe('useEntrainements - Simple Tests', () => {
  it('should initialize with empty array', () => {
    const { result } = renderHook(() => useEntrainements());
    
    expect(result.current.entrainements).toEqual([]);
    expect(result.current.loading).toBe(true);
  });

  it('should have correct hook structure', () => {
    const { result } = renderHook(() => useEntrainements());
    
    expect(result.current).toHaveProperty('entrainements');
    expect(result.current).toHaveProperty('loading');
    expect(result.current).toHaveProperty('addEntrainement');
    expect(result.current).toHaveProperty('updateEntrainement');
    expect(result.current).toHaveProperty('deleteEntrainement');
  });

  it('should have functions defined', () => {
    const { result } = renderHook(() => useEntrainements());
    
    expect(typeof result.current.addEntrainement).toBe('function');
    expect(typeof result.current.updateEntrainement).toBe('function');
    expect(typeof result.current.deleteEntrainement).toBe('function');
  });
});
