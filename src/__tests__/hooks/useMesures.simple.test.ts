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
import { useMesures } from '@/hooks/useFirestore';

describe('useMesures - Simple Tests', () => {
  it('should initialize with empty array', () => {
    const { result } = renderHook(() => useMesures());
    
    expect(result.current.mesures).toEqual([]);
    expect(result.current.loading).toBe(true);
  });

  it('should have correct hook structure', () => {
    const { result } = renderHook(() => useMesures());
    
    expect(result.current).toHaveProperty('mesures');
    expect(result.current).toHaveProperty('loading');
    expect(result.current).toHaveProperty('addMesure');
    expect(result.current).toHaveProperty('updateMesure');
    expect(result.current).toHaveProperty('deleteMesure');
  });

  it('should have functions defined', () => {
    const { result } = renderHook(() => useMesures());
    
    expect(typeof result.current.addMesure).toBe('function');
    expect(typeof result.current.updateMesure).toBe('function');
    expect(typeof result.current.deleteMesure).toBe('function');
  });
});
