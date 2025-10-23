import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useRepas } from '@/hooks/useFirestore';
import { useAuth } from '@/hooks/useAuth';
import { Timestamp } from 'firebase/firestore';
import type { Repas } from '@/types';

// Mock Firebase
vi.mock('@/lib/firebase', () => ({
  db: {},
  storage: {},
}));

// Mock useAuth - Must be before importing the hook
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
    startAfter: vi.fn(),
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
  compareDates: vi.fn(() => (a: Repas, b: Repas) => {
    const dateA = a.date?.toDate?.() || new Date(0);
    const dateB = b.date?.toDate?.() || new Date(0);
    return dateB.getTime() - dateA.getTime();
  }),
}));

describe('useRepas', () => {
  const mockUser = { uid: 'test-user-123', email: 'test@example.com' };
  const mockUseAuth = vi.mocked(useAuth);
  
  let unsubscribeMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset mock implementations
    unsubscribeMock = vi.fn();
    mockOnSnapshot.mockReturnValue(unsubscribeMock);
    mockCollection.mockReturnValue({ _type: 'collection' });
    mockQuery.mockReturnValue({ _type: 'query' });
    mockWhere.mockReturnValue({ _type: 'where' });
    mockDoc.mockReturnValue({ _type: 'doc' });
    mockAddDoc.mockResolvedValue({ id: 'new-repas-id' });
    mockUpdateDoc.mockResolvedValue(undefined);
    mockDeleteDoc.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ==================== TESTS RENDERING & LOADING ====================
  
  it('should return initial loading state', () => {
    mockUseAuth.mockReturnValue({ user: mockUser });

    const { result } = renderHook(() => useRepas());

    expect(result.current.loading).toBe(true);
    expect(result.current.repas).toEqual([]);
  });

  it('should return empty array when user is null', async () => {
    mockUseAuth.mockReturnValue({ user: null });

    const { result } = renderHook(() => useRepas());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.repas).toEqual([]);
  });

  // ==================== TESTS REAL-TIME DATA FETCHING ====================

  it('should fetch and set repas data via onSnapshot', async () => {
    mockUseAuth.mockReturnValue({ user: mockUser });

    const mockRepasData: Partial<Repas>[] = [
      {
        user_id: 'test-user-123',
        date: Timestamp.fromDate(new Date('2025-10-20T12:00:00')),
        repas: 'dejeuner',
        aliments: [
          {
            id: 'aliment-1',
            nom: 'Poulet',
            nom_lower: 'poulet',
            quantite: 150,
            unite: 'g',
            user_id: 'test-user-123',
            created_at: Timestamp.now(),
            macros: { kcal: 250, prot: 35, glucides: 0, lipides: 12 },
            macros_base: { kcal: 165, prot: 23, glucides: 0, lipides: 8 },
          },
        ],
        macros: { kcal: 250, prot: 35, glucides: 0, lipides: 12 },
        created_at: Timestamp.now(),
      },
    ];

    mockOnSnapshot.mockImplementation((query, successCallback) => {
      const snapshot = {
        docs: mockRepasData.map((data, index) => ({
          id: `repas-${index + 1}`,
          data: () => data,
        })),
      };
      successCallback(snapshot);
      return unsubscribeMock;
    });

    const { result } = renderHook(() => useRepas());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.repas).toHaveLength(1);
    expect(result.current.repas[0].id).toBe('repas-1');
    expect(result.current.repas[0].repas).toBe('dejeuner');
    expect(result.current.repas[0].macros.kcal).toBe(250);
  });

  it('should filter out repas with invalid dates', async () => {
    mockUseAuth.mockReturnValue({ user: mockUser });

    const mockRepasData = [
      {
        id: 'repas-1',
        user_id: 'test-user-123',
        date: Timestamp.fromDate(new Date('2025-10-20T12:00:00')),
        repas: 'dejeuner',
        aliments: [],
        macros: { kcal: 250, prot: 35, glucides: 0, lipides: 12 },
        created_at: Timestamp.now(),
      },
      {
        id: 'repas-2',
        user_id: 'test-user-123',
        date: null, // Invalid date
        repas: 'diner',
        aliments: [],
        macros: { kcal: 400, prot: 25, glucides: 50, lipides: 10 },
        created_at: Timestamp.now(),
      },
    ];

    mockOnSnapshot.mockImplementation((query, successCallback) => {
      const snapshot = {
        docs: mockRepasData.map((data) => ({
          id: data.id,
          data: () => data,
        })),
      };
      successCallback(snapshot);
      return unsubscribeMock;
    });

    const { result } = renderHook(() => useRepas());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Only valid repas should be included
    expect(result.current.repas).toHaveLength(1);
    expect(result.current.repas[0].id).toBe('repas-1');
  });

  // ==================== TESTS CLEANUP (UNSUBSCRIBE) ====================

  it('should cleanup onSnapshot subscription on unmount', () => {
    mockUseAuth.mockReturnValue({ user: mockUser });

    mockOnSnapshot.mockReturnValue(unsubscribeMock);

    const { unmount } = renderHook(() => useRepas());

    expect(mockOnSnapshot).toHaveBeenCalledTimes(1);

    unmount();

    expect(unsubscribeMock).toHaveBeenCalledTimes(1);
  });

  // ==================== TESTS CREATE (addRepas) ====================

  it('should add a new repas successfully', async () => {
    mockUseAuth.mockReturnValue({ user: mockUser });

    mockOnSnapshot.mockImplementation((query, successCallback) => {
      successCallback({ docs: [] });
      return unsubscribeMock;
    });

    const { result } = renderHook(() => useRepas());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const newRepasData: Omit<Repas, 'id'> = {
      user_id: 'test-user-123',
      date: '2025-10-22' as unknown as Timestamp,
      repas: 'petit_dej',
      aliments: [
        {
          id: 'aliment-1',
          nom: 'Banane',
          nom_lower: 'banane',
          quantite: 120,
          unite: 'g',
          user_id: 'test-user-123',
          created_at: Timestamp.now(),
          macros: { kcal: 108, prot: 1.3, glucides: 23, lipides: 0.3 },
          macros_base: { kcal: 90, prot: 1.1, glucides: 19.2, lipides: 0.25 },
        },
      ],
      macros: { kcal: 108, prot: 1.3, glucides: 23, lipides: 0.3 },
      created_at: Timestamp.now(),
    };

    let addResult;
    await act(async () => {
      addResult = await result.current.addRepas(newRepasData);
    });

    expect(addResult).toEqual({ success: true, id: 'new-repas-id' });
    expect(mockAddDoc).toHaveBeenCalledTimes(1);
  });

  it('should return error when adding repas without user', async () => {
    mockUseAuth.mockReturnValue({ user: null });

    const { result } = renderHook(() => useRepas());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const newRepasData: Omit<Repas, 'id'> = {
      user_id: 'test-user-123',
      date: Timestamp.fromDate(new Date('2025-10-22T12:00:00')),
      repas: 'dejeuner',
      aliments: [],
      macros: { kcal: 0, prot: 0, glucides: 0, lipides: 0 },
      created_at: Timestamp.now(),
    };

    let addResult;
    await act(async () => {
      addResult = await result.current.addRepas(newRepasData);
    });

    expect(addResult).toEqual({ success: false, error: 'Non connecté' });
    expect(mockAddDoc).not.toHaveBeenCalled();
  });

  it('should filter undefined values when adding repas', async () => {
    mockUseAuth.mockReturnValue({ user: mockUser });

    mockOnSnapshot.mockImplementation((query, successCallback) => {
      successCallback({ docs: [] });
      return unsubscribeMock;
    });

    const { result } = renderHook(() => useRepas());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const newRepasData = {
      user_id: 'test-user-123',
      date: '2025-10-22' as unknown as Timestamp,
      repas: 'dejeuner' as const,
      aliments: [],
      macros: { kcal: 500, prot: 30, glucides: 50, lipides: 15 },
      created_at: Timestamp.now(),
      optionalField: undefined, // Should be filtered out
    };

    await act(async () => {
      await result.current.addRepas(newRepasData as unknown as Omit<Repas, 'id'>);
    });

    expect(mockAddDoc).toHaveBeenCalledTimes(1);
    const addedData = mockAddDoc.mock.calls[0][1];
    expect(addedData).not.toHaveProperty('optionalField');
  });

  // ==================== TESTS UPDATE (updateRepas) ====================

  it('should update an existing repas successfully', async () => {
    mockUseAuth.mockReturnValue({ user: mockUser });

    mockOnSnapshot.mockImplementation((query, successCallback) => {
      successCallback({ docs: [] });
      return unsubscribeMock;
    });

    const { result } = renderHook(() => useRepas());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const updateData: Partial<Omit<Repas, 'id' | 'created_at'>> = {
      macros: { kcal: 600, prot: 40, glucides: 60, lipides: 20 },
    };

    let updateResult;
    await act(async () => {
      updateResult = await result.current.updateRepas('repas-1', updateData);
    });

    expect(updateResult).toEqual({ success: true });
    expect(mockUpdateDoc).toHaveBeenCalledTimes(1);
  });

  it('should return error when updating repas without user', async () => {
    mockUseAuth.mockReturnValue({ user: null });

    const { result } = renderHook(() => useRepas());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let updateResult;
    await act(async () => {
      updateResult = await result.current.updateRepas('repas-1', {});
    });

    expect(updateResult).toEqual({ success: false, error: 'Non connecté' });
    expect(mockUpdateDoc).not.toHaveBeenCalled();
  });

  // ==================== TESTS DELETE (deleteRepas) ====================

  it('should delete a repas successfully', async () => {
    mockUseAuth.mockReturnValue({ user: mockUser });

    mockOnSnapshot.mockImplementation((query, successCallback) => {
      successCallback({ docs: [] });
      return unsubscribeMock;
    });

    const { result } = renderHook(() => useRepas());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let deleteResult;
    await act(async () => {
      deleteResult = await result.current.deleteRepas('repas-1');
    });

    expect(deleteResult).toEqual({ success: true });
    expect(mockDeleteDoc).toHaveBeenCalledTimes(1);
  });

  // ==================== TESTS ERROR HANDLING ====================

  it('should handle onSnapshot error gracefully', async () => {
    mockUseAuth.mockReturnValue({ user: mockUser });

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    mockOnSnapshot.mockImplementation((query, successCallback, errorCallback) => {
      errorCallback(new Error('Firestore connection failed'));
      return unsubscribeMock;
    });

    const { result } = renderHook(() => useRepas());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.repas).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Firebase error:', expect.any(Error));

    consoleErrorSpy.mockRestore();
  });

  it('should handle addRepas error', async () => {
    mockUseAuth.mockReturnValue({ user: mockUser });

    mockOnSnapshot.mockImplementation((query, successCallback) => {
      successCallback({ docs: [] });
      return unsubscribeMock;
    });

    mockAddDoc.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useRepas());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const newRepasData: Omit<Repas, 'id'> = {
      user_id: 'test-user-123',
      date: Timestamp.fromDate(new Date('2025-10-22T12:00:00')),
      repas: 'dejeuner',
      aliments: [],
      macros: { kcal: 0, prot: 0, glucides: 0, lipides: 0 },
      created_at: Timestamp.now(),
    };

    let addResult;
    await act(async () => {
      addResult = await result.current.addRepas(newRepasData);
    });

    expect(addResult).toEqual({ success: false, error: 'Network error' });
  });

  // ==================== TESTS DATE CONVERSION ====================

  it('should convert date string to Timestamp when adding repas', async () => {
    mockUseAuth.mockReturnValue({ user: mockUser });

    mockOnSnapshot.mockImplementation((query, successCallback) => {
      successCallback({ docs: [] });
      return unsubscribeMock;
    });

    const { result } = renderHook(() => useRepas());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const newRepasData = {
      user_id: 'test-user-123',
      date: '2025-10-22', // String date
      repas: 'dejeuner' as const,
      aliments: [],
      macros: { kcal: 500, prot: 30, glucides: 50, lipides: 15 },
      created_at: Timestamp.now(),
    };

    await act(async () => {
      await result.current.addRepas(newRepasData as unknown as Omit<Repas, 'id'>);
    });

    expect(mockAddDoc).toHaveBeenCalledTimes(1);
    const addedData = mockAddDoc.mock.calls[0][1];
    
    // Verify date was converted to Timestamp
    expect(addedData.date).toBeDefined();
    expect(typeof addedData.date).toBe('object');
  });
});

