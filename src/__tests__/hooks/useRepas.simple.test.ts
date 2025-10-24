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
import { useRepas } from '@/hooks/useFirestore';

describe('useRepas - Simple Tests', () => {
  it('should initialize with empty array', () => {
    const { result } = renderHook(() => useRepas());
    
    expect(result.current.repas).toEqual([]);
    expect(result.current.loading).toBe(true);
  });

  it('should have correct hook structure', () => {
    const { result } = renderHook(() => useRepas());
    
    expect(result.current).toHaveProperty('repas');
    expect(result.current).toHaveProperty('loading');
    expect(result.current).toHaveProperty('addRepas');
    expect(result.current).toHaveProperty('updateRepas');
    expect(result.current).toHaveProperty('deleteRepas');
  });

  it('should have functions defined', () => {
    const { result } = renderHook(() => useRepas());
    
    expect(typeof result.current.addRepas).toBe('function');
    expect(typeof result.current.updateRepas).toBe('function');
    expect(typeof result.current.deleteRepas).toBe('function');
  });
});
