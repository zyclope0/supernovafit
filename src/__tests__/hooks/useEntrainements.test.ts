import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useEntrainements } from '@/hooks/useFirestore';
import { useAuth } from '@/hooks/useAuth';
import { Timestamp } from 'firebase/firestore';
import type { Entrainement } from '@/types';

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
const mockGetDocs = vi.fn();
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
    getDocs: (...args: unknown[]) => mockGetDocs(...args),
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
  compareDates: vi.fn(() => (a: Entrainement, b: Entrainement) => {
    const dateA = a.date?.toDate?.() || new Date(0);
    const dateB = b.date?.toDate?.() || new Date(0);
    return dateB.getTime() - dateA.getTime();
  }),
}));

describe('useEntrainements', () => {
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
    mockAddDoc.mockResolvedValue({ id: 'new-entrainement-id' });
    mockUpdateDoc.mockResolvedValue(undefined);
    mockDeleteDoc.mockResolvedValue(undefined);
    mockGetDocs.mockResolvedValue({ empty: false, docs: [] });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ==================== TESTS RENDERING & LOADING ====================
  
  it('should return initial loading state', () => {
    mockUseAuth.mockReturnValue({ user: mockUser });

    const { result } = renderHook(() => useEntrainements());

    expect(result.current.loading).toBe(true);
    expect(result.current.entrainements).toEqual([]);
  });

  it('should return empty array when user is null', async () => {
    mockUseAuth.mockReturnValue({ user: null });

    const { result } = renderHook(() => useEntrainements());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.entrainements).toEqual([]);
  });

  // ==================== TESTS REAL-TIME DATA FETCHING ====================

  it('should fetch and set entrainements data via onSnapshot', async () => {
    mockUseAuth.mockReturnValue({ user: mockUser });

    const mockEntrainementsData: Partial<Entrainement>[] = [
      {
        user_id: 'test-user-123',
        date: Timestamp.fromDate(new Date('2025-10-20T12:00:00')),
        type: 'cardio',
        duree: 45,
        calories: 450,
        source: 'manuel',
        distance: 8,
        vitesse_moy: 10.5,
        fc_moyenne: 145,
        created_at: Timestamp.now(),
      },
    ];

    mockOnSnapshot.mockImplementation((query, successCallback) => {
      const snapshot = {
        docs: mockEntrainementsData.map((data, index) => ({
          id: `entrainement-${index + 1}`,
          data: () => data,
        })),
      };
      successCallback(snapshot);
      return unsubscribeMock;
    });

    const { result } = renderHook(() => useEntrainements());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.entrainements).toHaveLength(1);
    expect(result.current.entrainements[0].id).toBe('entrainement-1');
    expect(result.current.entrainements[0].type).toBe('cardio');
    expect(result.current.entrainements[0].calories).toBe(450);
  });

  it('should filter out entrainements with invalid dates', async () => {
    mockUseAuth.mockReturnValue({ user: mockUser });

    const mockEntrainementsData = [
      {
        id: 'entrainement-1',
        user_id: 'test-user-123',
        date: Timestamp.fromDate(new Date('2025-10-20T12:00:00')),
        type: 'cardio',
        duree: 45,
        calories: 450,
        created_at: Timestamp.now(),
      },
      {
        id: 'entrainement-2',
        user_id: 'test-user-123',
        date: null, // Invalid date
        type: 'musculation',
        duree: 60,
        calories: 200,
        created_at: Timestamp.now(),
      },
    ];

    mockOnSnapshot.mockImplementation((query, successCallback) => {
      const snapshot = {
        docs: mockEntrainementsData.map((data) => ({
          id: data.id,
          data: () => data,
        })),
      };
      successCallback(snapshot);
      return unsubscribeMock;
    });

    const { result } = renderHook(() => useEntrainements());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.entrainements).toHaveLength(1);
    expect(result.current.entrainements[0].id).toBe('entrainement-1');
  });

  // ==================== TESTS CLEANUP (UNSUBSCRIBE) ====================

  it('should cleanup onSnapshot subscription on unmount', () => {
    mockUseAuth.mockReturnValue({ user: mockUser });

    mockOnSnapshot.mockReturnValue(unsubscribeMock);

    const { unmount } = renderHook(() => useEntrainements());

    expect(mockOnSnapshot).toHaveBeenCalledTimes(1);

    unmount();

    expect(unsubscribeMock).toHaveBeenCalledTimes(1);
  });

  // ==================== TESTS CREATE (addEntrainement) ====================

  it('should add a new entrainement successfully', async () => {
    mockUseAuth.mockReturnValue({ user: mockUser });

    mockOnSnapshot.mockImplementation((query, successCallback) => {
      successCallback({ docs: [] });
      return unsubscribeMock;
    });

    const { result } = renderHook(() => useEntrainements());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const newEntrainementData: Omit<Entrainement, 'id'> = {
      user_id: 'test-user-123',
      date: '2025-10-22' as unknown as Timestamp,
      type: 'cardio',
      duree: 30,
      calories: 300,
      source: 'manuel',
      distance: 5,
      vitesse_moy: 10,
      created_at: Timestamp.now(),
    };

    let addResult;
    await act(async () => {
      addResult = await result.current.addEntrainement(newEntrainementData);
    });

    expect(addResult).toEqual({ success: true, id: 'new-entrainement-id' });
    expect(mockAddDoc).toHaveBeenCalledTimes(1);
  });

  it('should return error when adding entrainement without user', async () => {
    mockUseAuth.mockReturnValue({ user: null });

    const { result } = renderHook(() => useEntrainements());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const newEntrainementData: Omit<Entrainement, 'id'> = {
      user_id: 'test-user-123',
      date: Timestamp.fromDate(new Date('2025-10-22T12:00:00')),
      type: 'cardio',
      duree: 30,
      calories: 300,
      source: 'manuel',
      created_at: Timestamp.now(),
    };

    await expect(async () => {
      await result.current.addEntrainement(newEntrainementData);
    }).rejects.toThrow('Non connecté');
  });

  it('should check for duplicate Garmin entrainements', async () => {
    mockUseAuth.mockReturnValue({ user: mockUser });

    mockOnSnapshot.mockImplementation((query, successCallback) => {
      successCallback({ docs: [] });
      return unsubscribeMock;
    });

    // Mock getDocs to return existing entrainement
    mockGetDocs.mockResolvedValue({
      empty: false,
      docs: [{ id: 'existing-garmin-1' }],
    });

    const { result } = renderHook(() => useEntrainements());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const newEntrainementData: Omit<Entrainement, 'id'> = {
      user_id: 'test-user-123',
      date: '2025-10-22' as unknown as Timestamp,
      type: 'cardio',
      duree: 30,
      calories: 300,
      source: 'garmin',
      garmin_id: 'garmin-activity-123',
      created_at: Timestamp.now(),
    };

    let addResult;
    await act(async () => {
      addResult = await result.current.addEntrainement(newEntrainementData);
    });

    expect(addResult).toEqual({
      success: false,
      error: 'Entraînement déjà importé',
      isDuplicate: true,
    });
    expect(mockAddDoc).not.toHaveBeenCalled();
  });

  it('should filter undefined values when adding entrainement', async () => {
    mockUseAuth.mockReturnValue({ user: mockUser });

    mockOnSnapshot.mockImplementation((query, successCallback) => {
      successCallback({ docs: [] });
      return unsubscribeMock;
    });

    const { result } = renderHook(() => useEntrainements());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const newEntrainementData = {
      user_id: 'test-user-123',
      date: '2025-10-22' as unknown as Timestamp,
      type: 'cardio' as const,
      duree: 45,
      calories: 450,
      source: 'manuel' as const,
      distance: 8,
      created_at: Timestamp.now(),
      optionalField: undefined, // Should be filtered out
    };

    await act(async () => {
      await result.current.addEntrainement(newEntrainementData as unknown as Omit<Entrainement, 'id'>);
    });

    expect(mockAddDoc).toHaveBeenCalledTimes(1);
    const addedData = mockAddDoc.mock.calls[0][1];
    expect(addedData).not.toHaveProperty('optionalField');
  });

  // ==================== TESTS UPDATE (updateEntrainement) ====================

  it('should update an existing entrainement successfully', async () => {
    mockUseAuth.mockReturnValue({ user: mockUser });

    mockOnSnapshot.mockImplementation((query, successCallback) => {
      successCallback({ docs: [] });
      return unsubscribeMock;
    });

    const { result } = renderHook(() => useEntrainements());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const updateData: Partial<Omit<Entrainement, 'id' | 'user_id'>> = {
      duree: 60,
      calories: 600,
    };

    let updateResult;
    await act(async () => {
      updateResult = await result.current.updateEntrainement('entrainement-1', updateData);
    });

    expect(updateResult).toEqual({ success: true });
    expect(mockUpdateDoc).toHaveBeenCalledTimes(1);
  });

  it('should return error when updating entrainement without user', async () => {
    mockUseAuth.mockReturnValue({ user: null });

    const { result } = renderHook(() => useEntrainements());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let updateResult;
    await act(async () => {
      updateResult = await result.current.updateEntrainement('entrainement-1', {});
    });

    expect(updateResult).toEqual({ success: false, error: 'Non connecté' });
    expect(mockUpdateDoc).not.toHaveBeenCalled();
  });

  // ==================== TESTS DELETE (deleteEntrainement) ====================

  it('should delete an entrainement successfully', async () => {
    mockUseAuth.mockReturnValue({ user: mockUser });

    mockOnSnapshot.mockImplementation((query, successCallback) => {
      successCallback({ docs: [] });
      return unsubscribeMock;
    });

    const { result } = renderHook(() => useEntrainements());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let deleteResult;
    await act(async () => {
      deleteResult = await result.current.deleteEntrainement('entrainement-1');
    });

    expect(deleteResult).toEqual({ success: true });
    expect(mockDeleteDoc).toHaveBeenCalledTimes(1);
  });

  it('should return error when deleting entrainement without user', async () => {
    mockUseAuth.mockReturnValue({ user: null });

    const { result } = renderHook(() => useEntrainements());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let deleteResult;
    await act(async () => {
      deleteResult = await result.current.deleteEntrainement('entrainement-1');
    });

    expect(deleteResult).toEqual({ success: false, error: 'Non connecté' });
    expect(mockDeleteDoc).not.toHaveBeenCalled();
  });

  // ==================== TESTS ERROR HANDLING ====================

  it('should handle onSnapshot error gracefully', async () => {
    mockUseAuth.mockReturnValue({ user: mockUser });

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    mockOnSnapshot.mockImplementation((query, successCallback, errorCallback) => {
      errorCallback(new Error('Firestore connection failed'));
      return unsubscribeMock;
    });

    const { result } = renderHook(() => useEntrainements());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.entrainements).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Firebase error:', expect.any(Error));

    consoleErrorSpy.mockRestore();
  });

  // ==================== TESTS DATE CONVERSION ====================

  it('should convert date string to Timestamp when adding entrainement', async () => {
    mockUseAuth.mockReturnValue({ user: mockUser });

    mockOnSnapshot.mockImplementation((query, successCallback) => {
      successCallback({ docs: [] });
      return unsubscribeMock;
    });

    const { result } = renderHook(() => useEntrainements());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const newEntrainementData = {
      user_id: 'test-user-123',
      date: '2025-10-22', // String date
      type: 'cardio' as const,
      duree: 30,
      calories: 300,
      source: 'manuel' as const,
      created_at: Timestamp.now(),
    };

    await act(async () => {
      await result.current.addEntrainement(newEntrainementData as unknown as Omit<Entrainement, 'id'>);
    });

    expect(mockAddDoc).toHaveBeenCalledTimes(1);
    const addedData = mockAddDoc.mock.calls[0][1];
    
    // Verify date was converted to Timestamp
    expect(addedData.date).toBeDefined();
    expect(typeof addedData.date).toBe('object');
  });
});

