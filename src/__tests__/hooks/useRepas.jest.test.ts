/**
 * Tests Jest pour useRepas - Migration depuis Vitest
 * Objectif: Réactiver les tests hooks sans fuite mémoire
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import { useRepas } from '@/hooks/useFirestore';
import { useAuth } from '@/hooks/useAuth';
import { Timestamp } from 'firebase/firestore';
import type { Repas } from '@/types';

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  db: {},
  storage: {},
}));

// Mock useAuth
jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

// Mock Firebase Firestore
const mockOnSnapshot = jest.fn();
const mockAddDoc = jest.fn();
const mockUpdateDoc = jest.fn();
const mockDeleteDoc = jest.fn();

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  addDoc: mockAddDoc,
  updateDoc: mockUpdateDoc,
  deleteDoc: mockDeleteDoc,
  onSnapshot: mockOnSnapshot,
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  Timestamp: {
    fromDate: jest.fn((date) => ({ toDate: () => date })),
    now: jest.fn(() => ({ toDate: () => new Date() })),
  },
}));

describe('useRepas (Jest)', () => {
  const mockUser = {
    uid: 'test-user-id',
    email: 'test@example.com',
  };

  const mockRepas: Repas = {
    id: 'test-repas-id',
    user_id: 'test-user-id',
    date: Timestamp.fromDate(new Date('2025-10-24')),
    repas: 'dejeuner',
    aliments: [
      {
        id: 'aliment-1',
        nom: 'Poulet',
        nom_lower: 'poulet',
        quantite: 150,
        unite: 'g',
        user_id: 'test-user-id',
        created_at: Timestamp.now(),
        macros: {
          kcal: 250,
          prot: 30,
          glucides: 0,
          lipides: 15,
        },
        macros_base: {
          kcal: 167,
          prot: 20,
          glucides: 0,
          lipides: 10,
        },
      },
    ],
    macros: {
      kcal: 250,
      prot: 30,
      glucides: 0,
      lipides: 15,
    },
    created_at: Timestamp.now(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock useAuth
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      loading: false,
    });

    // Mock onSnapshot pour retourner des données
    mockOnSnapshot.mockImplementation((query, callback) => {
      setTimeout(() => {
        callback({
          docs: [{
            id: 'test-repas-id',
            data: () => mockRepas,
          }],
        });
      }, 0);
      return () => {}; // Cleanup function
    });
  });

  describe('Rendering & Loading', () => {
    it('should render hook with initial loading state', () => {
      const { result } = renderHook(() => useRepas());
      
      expect(result.current.loading).toBe(true);
      expect(result.current.repas).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it('should render hook with user data', async () => {
      const { result } = renderHook(() => useRepas());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.repas).toHaveLength(1);
      expect(result.current.repas[0]).toEqual(mockRepas);
    });
  });

  describe('Real-time data fetching', () => {
    it('should fetch repas data on mount', async () => {
      renderHook(() => useRepas());
      
      await waitFor(() => {
        expect(mockOnSnapshot).toHaveBeenCalled();
      });
    });

    it('should handle onSnapshot callback', async () => {
      const { result } = renderHook(() => useRepas());
      
      await waitFor(() => {
        expect(result.current.repas).toHaveLength(1);
      });
    });
  });

  describe('Cleanup onSnapshot', () => {
    it('should cleanup onSnapshot on unmount', () => {
      const mockUnsubscribe = jest.fn();
      mockOnSnapshot.mockReturnValue(mockUnsubscribe);
      
      const { unmount } = renderHook(() => useRepas());
      
      unmount();
      
      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });

  describe('Create addRepas', () => {
    it('should create repas successfully', async () => {
      mockAddDoc.mockResolvedValue({ id: 'new-repas-id' });
      
      const { result } = renderHook(() => useRepas());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      await act(async () => {
        await result.current.addRepas({
          date: new Date('2025-10-24'),
          repas: 'petit_dej',
          aliments: [],
          macros: { kcal: 0, prot: 0, glucides: 0, lipides: 0 },
        });
      });
      
      expect(mockAddDoc).toHaveBeenCalled();
    });

    it('should handle addRepas error', async () => {
      mockAddDoc.mockRejectedValue(new Error('Firestore error'));
      
      const { result } = renderHook(() => useRepas());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      await act(async () => {
        await result.current.addRepas({
          date: new Date('2025-10-24'),
          repas: 'petit_dej',
          aliments: [],
          macros: { kcal: 0, prot: 0, glucides: 0, lipides: 0 },
        });
      });
      
      expect(result.current.error).toBeTruthy();
    });
  });

  describe('Update updateRepas', () => {
    it('should update repas successfully', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);
      
      const { result } = renderHook(() => useRepas());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      await act(async () => {
        await result.current.updateRepas('test-repas-id', {
          repas: 'diner',
        });
      });
      
      expect(mockUpdateDoc).toHaveBeenCalled();
    });
  });

  describe('Delete deleteRepas', () => {
    it('should delete repas successfully', async () => {
      mockDeleteDoc.mockResolvedValue(undefined);
      
      const { result } = renderHook(() => useRepas());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      await act(async () => {
        await result.current.deleteRepas('test-repas-id');
      });
      
      expect(mockDeleteDoc).toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    it('should handle onSnapshot error', async () => {
      mockOnSnapshot.mockImplementation((query, callback, errorCallback) => {
        setTimeout(() => {
          errorCallback(new Error('Snapshot error'));
        }, 0);
        return () => {};
      });
      
      const { result } = renderHook(() => useRepas());
      
      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });
    });
  });

  describe('Date conversion', () => {
    it('should convert Timestamp to Date correctly', async () => {
      const { result } = renderHook(() => useRepas());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.repas[0].date).toBeDefined();
    });
  });
});
