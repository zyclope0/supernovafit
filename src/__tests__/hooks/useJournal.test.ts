import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useJournal } from '@/hooks/useFirestore';
import { useAuth } from '@/hooks/useAuth';
import { Timestamp } from 'firebase/firestore';
import type { JournalEntry } from '@/types';

// Mock Firebase
vi.mock('@/lib/firebase', () => ({
  db: {},
  storage: {},
}));

// Mock useAuth
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

// Mock Sentry
vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
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
  compareDates: vi.fn(() => (a: JournalEntry, b: JournalEntry) => {
    const dateA = a.date?.toDate?.() || new Date(0);
    const dateB = b.date?.toDate?.() || new Date(0);
    return dateB.getTime() - dateA.getTime();
  }),
}));

describe('useJournal', () => {
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
    mockAddDoc.mockResolvedValue({ id: 'new-entry-id' });
    mockUpdateDoc.mockResolvedValue(undefined);
    mockDeleteDoc.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ==================== TESTS RENDERING & LOADING ====================
  
  it('should return initial loading state', () => {
    mockUseAuth.mockReturnValue({ user: mockUser });

    const { result } = renderHook(() => useJournal());

    expect(result.current.loading).toBe(true);
    expect(result.current.entries).toEqual([]);
  });

  it('should return empty array when user is null', async () => {
    mockUseAuth.mockReturnValue({ user: null });

    const { result } = renderHook(() => useJournal());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.entries).toEqual([]);
  });

  // ==================== TESTS REAL-TIME DATA FETCHING ====================

  it('should fetch and set journal entries via onSnapshot', async () => {
    mockUseAuth.mockReturnValue({ user: mockUser });

    const mockEntriesData: Partial<JournalEntry>[] = [
      {
        user_id: 'test-user-123',
        date: Timestamp.fromDate(new Date('2025-10-20T12:00:00')),
        humeur: 8,
        energie: 7,
        sommeil: 7.5,
        stress: 3,
        note: 'Bonne journée',
        created_at: Timestamp.now(),
      },
    ];

    mockOnSnapshot.mockImplementation((query, successCallback) => {
      const snapshot = {
        docs: mockEntriesData.map((data, index) => ({
          id: `entry-${index + 1}`,
          data: () => data,
        })),
      };
      successCallback(snapshot);
      return unsubscribeMock;
    });

    const { result } = renderHook(() => useJournal());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.entries).toHaveLength(1);
    expect(result.current.entries[0].id).toBe('entry-1');
    expect(result.current.entries[0].humeur).toBe(8);
    expect(result.current.entries[0].note).toBe('Bonne journée');
  });

  it('should filter out entries with invalid dates', async () => {
    mockUseAuth.mockReturnValue({ user: mockUser });

    const mockEntriesData = [
      {
        id: 'entry-1',
        user_id: 'test-user-123',
        date: Timestamp.fromDate(new Date('2025-10-20T12:00:00')),
        humeur: 8,
        energie: 7,
        created_at: Timestamp.now(),
      },
      {
        id: 'entry-2',
        user_id: 'test-user-123',
        date: null, // Invalid date
        humeur: 5,
        energie: 5,
        created_at: Timestamp.now(),
      },
    ];

    mockOnSnapshot.mockImplementation((query, successCallback) => {
      const snapshot = {
        docs: mockEntriesData.map((data) => ({
          id: data.id,
          data: () => data,
        })),
      };
      successCallback(snapshot);
      return unsubscribeMock;
    });

    const { result } = renderHook(() => useJournal());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.entries).toHaveLength(1);
    expect(result.current.entries[0].id).toBe('entry-1');
  });

  // ==================== TESTS CREATE (addEntry) ====================

  it('should add a new journal entry successfully', async () => {
    mockUseAuth.mockReturnValue({ user: mockUser });

    mockOnSnapshot.mockImplementation((query, successCallback) => {
      successCallback({ docs: [] });
      return unsubscribeMock;
    });

    const { result } = renderHook(() => useJournal());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const newEntryData: Omit<JournalEntry, 'id' | 'user_id'> = {
      date: '2025-10-22' as unknown as Timestamp,
      humeur: 9,
      energie: 8,
      sommeil: 8,
      stress: 2,
      note: 'Excellente journée',
      created_at: Timestamp.now(),
    };

    let addResult;
    await act(async () => {
      addResult = await result.current.addEntry(newEntryData);
    });

    expect(addResult).toEqual({ success: true, id: 'new-entry-id' });
    expect(mockAddDoc).toHaveBeenCalledTimes(1);
  });

  it('should return error when adding entry without user', async () => {
    mockUseAuth.mockReturnValue({ user: null });

    const { result } = renderHook(() => useJournal());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const newEntryData: Omit<JournalEntry, 'id' | 'user_id'> = {
      date: Timestamp.fromDate(new Date('2025-10-22T12:00:00')),
      humeur: 8,
      energie: 7,
      created_at: Timestamp.now(),
    };

    let addResult;
    await act(async () => {
      addResult = await result.current.addEntry(newEntryData);
    });

    expect(addResult).toEqual({ success: false, error: 'Non connecté' });
    expect(mockAddDoc).not.toHaveBeenCalled();
  });

  it('should filter undefined values when adding entry', async () => {
    mockUseAuth.mockReturnValue({ user: mockUser });

    mockOnSnapshot.mockImplementation((query, successCallback) => {
      successCallback({ docs: [] });
      return unsubscribeMock;
    });

    const { result } = renderHook(() => useJournal());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const newEntryData = {
      date: '2025-10-22' as unknown as Timestamp,
      humeur: 8,
      energie: 7,
      sommeil: undefined, // Optional field
      stress: undefined, // Optional field
      note: 'Test entry',
      created_at: Timestamp.now(),
    };

    await act(async () => {
      await result.current.addEntry(newEntryData as unknown as Omit<JournalEntry, 'id' | 'user_id'>);
    });

    expect(mockAddDoc).toHaveBeenCalledTimes(1);
    const addedData = mockAddDoc.mock.calls[0][1];
    expect(addedData).not.toHaveProperty('sommeil');
    expect(addedData).not.toHaveProperty('stress');
  });

  // ==================== TESTS UPDATE (updateEntry) ====================

  it('should update an existing journal entry successfully', async () => {
    mockUseAuth.mockReturnValue({ user: mockUser });

    mockOnSnapshot.mockImplementation((query, successCallback) => {
      successCallback({ docs: [] });
      return unsubscribeMock;
    });

    const { result } = renderHook(() => useJournal());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const updateData: Partial<Omit<JournalEntry, 'id' | 'user_id' | 'created_at'>> = {
      humeur: 9,
      note: 'Journée mise à jour',
    };

    let updateResult;
    await act(async () => {
      updateResult = await result.current.updateEntry('entry-1', updateData);
    });

    expect(updateResult).toEqual({ success: true });
    expect(mockUpdateDoc).toHaveBeenCalledTimes(1);
  });

  it('should return error when updating entry without user', async () => {
    mockUseAuth.mockReturnValue({ user: null });

    const { result } = renderHook(() => useJournal());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let updateResult;
    await act(async () => {
      updateResult = await result.current.updateEntry('entry-1', {});
    });

    expect(updateResult).toEqual({ success: false, error: 'Non connecté' });
    expect(mockUpdateDoc).not.toHaveBeenCalled();
  });

  // ==================== TESTS DELETE (deleteEntry) ====================

  it('should delete a journal entry successfully', async () => {
    mockUseAuth.mockReturnValue({ user: mockUser });

    mockOnSnapshot.mockImplementation((query, successCallback) => {
      successCallback({ docs: [] });
      return unsubscribeMock;
    });

    const { result } = renderHook(() => useJournal());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let deleteResult;
    await act(async () => {
      deleteResult = await result.current.deleteEntry('entry-1');
    });

    expect(deleteResult).toEqual({ success: true });
    expect(mockDeleteDoc).toHaveBeenCalledTimes(1);
  });
});

