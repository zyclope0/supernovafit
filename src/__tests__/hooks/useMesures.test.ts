import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useMesures } from '@/hooks/useFirestore';
import { useAuth } from '@/hooks/useAuth';
import { Timestamp } from 'firebase/firestore';
import type { Mesure } from '@/types';

/**
 * ⚠️ TESTS SKIPPÉS TEMPORAIREMENT
 * Raison: Fuite mémoire mocks Firestore (Memory ID: 6110058)
 * À réactiver après optimisation CI/CD ou objectif coverage 25%
 */

// Mock Firebase
vi.mock('@/lib/firebase', () => ({
  db: {},
  storage: {},
}));

// Mock useAuth
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

// Mock useFirebaseError
vi.mock('@/hooks/useFirebaseError', () => ({
  useFirebaseError: vi.fn(() => ({
    handleError: vi.fn((error) => {
      console.error('Firebase error:', error);
      return error instanceof Error ? error.message : 'Unknown error';
    }),
  })),
}));

// Mock Firestore functions
const mockOnSnapshot = vi.fn();
const mockAddDoc = vi.fn();
const mockUpdateDoc = vi.fn();
const mockDeleteDoc = vi.fn();
const mockCollection = vi.fn();
const mockQuery = vi.fn();
const mockWhere = vi.fn();
const mockDoc = vi.fn();
const mockServerTimestamp = vi.fn(() => ({ _methodName: 'serverTimestamp' }));

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');
  return {
    ...actual,
    collection: (...args: unknown[]) => mockCollection(...args),
    query: (...args: unknown[]) => mockQuery(...args),
    where: (...args: unknown[]) => mockWhere(...args),
    onSnapshot: (...args: unknown[]) => mockOnSnapshot(...args),
    addDoc: (...args: unknown[]) => mockAddDoc(...args),
    updateDoc: (...args: unknown[]) => mockUpdateDoc(...args),
    deleteDoc: (...args: unknown[]) => mockDeleteDoc(...args),
    doc: (...args: unknown[]) => mockDoc(...args),
    serverTimestamp: () => mockServerTimestamp(),
    orderBy: vi.fn(),
    limit: vi.fn(),
  };
});

// Mock dateUtils
vi.mock('@/lib/dateUtils', () => ({
  timestampToDateString: vi.fn((timestamp) => {
    if (!timestamp || !timestamp.toDate) return 'Invalid Date';
    try {
      return timestamp.toDate().toISOString().split('T')[0];
    } catch {
      return 'Invalid Date';
    }
  }),
  dateToTimestamp: vi.fn((dateStr: string) => {
    const date = new Date(dateStr);
    date.setHours(12, 0, 0, 0);
    return Timestamp.fromDate(date);
  }),
  compareDates: vi.fn(() => (a: Mesure, b: Mesure) => {
    const dateA = a.date?.toDate?.() || new Date(0);
    const dateB = b.date?.toDate?.() || new Date(0);
    return dateB.getTime() - dateA.getTime();
  }),
}));

describe.skip('useMesures', () => {
  const mockUser = { uid: 'test-user-123', email: 'test@example.com' };
  const mockUseAuth = vi.mocked(useAuth);
  
  let unsubscribeMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    
    unsubscribeMock = vi.fn();
    mockOnSnapshot.mockReturnValue(unsubscribeMock);
    mockCollection.mockReturnValue({ _type: 'collection' });
    mockQuery.mockReturnValue({ _type: 'query' });
    mockWhere.mockReturnValue({ _type: 'where' });
    mockDoc.mockReturnValue({ _type: 'doc' });
    mockAddDoc.mockResolvedValue({ id: 'new-mesure-id' });
    mockUpdateDoc.mockResolvedValue(undefined);
    mockDeleteDoc.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ==================== TESTS RENDERING & LOADING ====================
  
  it('should return initial loading state', () => {
    mockUseAuth.mockReturnValue({ user: mockUser });

    const { result } = renderHook(() => useMesures());

    expect(result.current.loading).toBe(true);
    expect(result.current.mesures).toEqual([]);
  });

  it('should return empty array when user is null', async () => {
    mockUseAuth.mockReturnValue({ user: null });

    const { result } = renderHook(() => useMesures());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.mesures).toEqual([]);
  });

  // ==================== TESTS REAL-TIME DATA FETCHING ====================

  it('should fetch and set mesures data via onSnapshot', async () => {
    mockUseAuth.mockReturnValue({ user: mockUser });

    const mockMesuresData: Partial<Mesure>[] = [
      {
        user_id: 'test-user-123',
        date: Timestamp.fromDate(new Date('2025-10-20T12:00:00')),
        poids: 75,
        taille: 180,
        imc: 23.1,
        masse_grasse: 15,
        tour_taille: 85,
        created_at: Timestamp.now(),
      },
    ];

    mockOnSnapshot.mockImplementation((query, successCallback) => {
      const snapshot = {
        docs: mockMesuresData.map((data, index) => ({
          id: `mesure-${index + 1}`,
          data: () => data,
        })),
      };
      successCallback(snapshot);
      return unsubscribeMock;
    });

    const { result } = renderHook(() => useMesures());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.mesures).toHaveLength(1);
    expect(result.current.mesures[0].id).toBe('mesure-1');
    expect(result.current.mesures[0].poids).toBe(75);
    expect(result.current.mesures[0].imc).toBe(23.1);
  });

  it('should filter out mesures with invalid dates', async () => {
    mockUseAuth.mockReturnValue({ user: mockUser });

    const mockMesuresData = [
      {
        id: 'mesure-1',
        user_id: 'test-user-123',
        date: Timestamp.fromDate(new Date('2025-10-20T12:00:00')),
        poids: 75,
        taille: 180,
        created_at: Timestamp.now(),
      },
      {
        id: 'mesure-2',
        user_id: 'test-user-123',
        date: null, // Invalid date
        poids: 80,
        taille: 180,
        created_at: Timestamp.now(),
      },
    ];

    mockOnSnapshot.mockImplementation((query, successCallback) => {
      const snapshot = {
        docs: mockMesuresData.map((data) => ({
          id: data.id,
          data: () => data,
        })),
      };
      successCallback(snapshot);
      return unsubscribeMock;
    });

    const { result } = renderHook(() => useMesures());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.mesures).toHaveLength(1);
    expect(result.current.mesures[0].id).toBe('mesure-1');
  });

  // ==================== TESTS CREATE (addMesure) WITH IMC CALCULATION ====================

  it('should add a new mesure successfully with IMC calculation', async () => {
    mockUseAuth.mockReturnValue({ user: mockUser });

    mockOnSnapshot.mockImplementation((query, successCallback) => {
      successCallback({ docs: [] });
      return unsubscribeMock;
    });

    const { result } = renderHook(() => useMesures());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const newMesureData: Omit<Mesure, 'id' | 'user_id'> = {
      date: '2025-10-22' as unknown as Timestamp,
      poids: 75,
      taille: 180,
      masse_grasse: 15,
      tour_taille: 85,
      created_at: Timestamp.now(),
    };

    let addResult;
    await act(async () => {
      addResult = await result.current.addMesure(newMesureData);
    });

    expect(addResult).toEqual({ success: true, id: 'new-mesure-id' });
    expect(mockAddDoc).toHaveBeenCalledTimes(1);
    
    // Verify IMC was calculated
    const addedData = mockAddDoc.mock.calls[0][1];
    expect(addedData.imc).toBeDefined();
    expect(typeof addedData.imc).toBe('number');
  });

  it('should return error when adding mesure without user', async () => {
    mockUseAuth.mockReturnValue({ user: null });

    const { result } = renderHook(() => useMesures());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const newMesureData: Omit<Mesure, 'id' | 'user_id'> = {
      date: Timestamp.fromDate(new Date('2025-10-22T12:00:00')),
      poids: 75,
      taille: 180,
      created_at: Timestamp.now(),
    };

    let addResult;
    await act(async () => {
      addResult = await result.current.addMesure(newMesureData);
    });

    expect(addResult).toEqual({ success: false, error: 'Non connecté' });
    expect(mockAddDoc).not.toHaveBeenCalled();
  });

  it('should return error when adding mesure without date', async () => {
    mockUseAuth.mockReturnValue({ user: mockUser });

    const { result } = renderHook(() => useMesures());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const newMesureData: Omit<Mesure, 'id' | 'user_id'> = {
      date: undefined as unknown as Timestamp,
      poids: 75,
      taille: 180,
      created_at: Timestamp.now(),
    };

    let addResult;
    await act(async () => {
      addResult = await result.current.addMesure(newMesureData);
    });

    expect(addResult).toEqual({ success: false, error: 'Date requise' });
    expect(mockAddDoc).not.toHaveBeenCalled();
  });

  // ==================== TESTS UPDATE (updateMesure) ====================

  it('should update an existing mesure successfully', async () => {
    mockUseAuth.mockReturnValue({ user: mockUser });

    const existingMesure: Mesure = {
      id: 'mesure-1',
      user_id: 'test-user-123',
      date: Timestamp.fromDate(new Date('2025-10-20T12:00:00')),
      poids: 75,
      taille: 180,
      imc: 23.1,
      created_at: Timestamp.now(),
    };

    mockOnSnapshot.mockImplementation((query, successCallback) => {
      const snapshot = {
        docs: [{
          id: 'mesure-1',
          data: () => existingMesure,
        }],
      };
      successCallback(snapshot);
      return unsubscribeMock;
    });

    const { result } = renderHook(() => useMesures());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.mesures).toHaveLength(1);
    });

    const updateData: Partial<Mesure> = {
      poids: 76,
    };

    let updateResult;
    await act(async () => {
      updateResult = await result.current.updateMesure('mesure-1', updateData);
    });

    expect(updateResult).toEqual({ success: true });
    expect(mockUpdateDoc).toHaveBeenCalledTimes(1);
  });

  // ==================== TESTS DELETE (deleteMesure) ====================

  it('should delete a mesure successfully', async () => {
    mockUseAuth.mockReturnValue({ user: mockUser });

    mockOnSnapshot.mockImplementation((query, successCallback) => {
      successCallback({ docs: [] });
      return unsubscribeMock;
    });

    const { result } = renderHook(() => useMesures());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let deleteResult;
    await act(async () => {
      deleteResult = await result.current.deleteMesure('mesure-1');
    });

    expect(deleteResult).toEqual({ success: true });
    expect(mockDeleteDoc).toHaveBeenCalledTimes(1);
  });
});

