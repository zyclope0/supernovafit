import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useCoachCommentsByModule } from '@/hooks/useFirestore';
import { useAuth } from '@/hooks/useAuth';
import { Timestamp } from 'firebase/firestore';
import type { CoachComment } from '@/types';

// Mock Firebase
vi.mock('@/lib/firebase', () => ({
  db: {},
  storage: {},
}));

// Mock useAuth
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

// Mock Firestore functions
const mockOnSnapshot = vi.fn();
const mockCollection = vi.fn();
const mockQuery = vi.fn();
const mockWhere = vi.fn();

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');
  return {
    ...actual,
    collection: (...args: unknown[]) => mockCollection(...args),
    query: (...args: unknown[]) => mockQuery(...args),
    where: (...args: unknown[]) => mockWhere(...args),
    onSnapshot: (...args: unknown[]) => mockOnSnapshot(...args),
    orderBy: vi.fn(),
    limit: vi.fn(),
  };
});

describe('useCoachCommentsByModule', () => {
  const mockUser = { uid: 'athlete-123', email: 'athlete@example.com' };
  const mockUseAuth = vi.mocked(useAuth);
  
  let unsubscribeMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    
    unsubscribeMock = vi.fn();
    mockOnSnapshot.mockReturnValue(unsubscribeMock);
    mockCollection.mockReturnValue({ _type: 'collection' });
    mockQuery.mockReturnValue({ _type: 'query' });
    mockWhere.mockReturnValue({ _type: 'where' });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ==================== TESTS RENDERING & LOADING ====================
  
  it('should return initial loading state', () => {
    mockUseAuth.mockReturnValue({ user: mockUser });

    const { result } = renderHook(() => useCoachCommentsByModule('diete'));

    expect(result.current.loading).toBe(true);
    expect(result.current.comments).toEqual([]);
  });

  it('should return empty array when user is null', async () => {
    mockUseAuth.mockReturnValue({ user: null });

    const { result } = renderHook(() => useCoachCommentsByModule('diete'));

    // No loading state changes when user is null
    expect(result.current.loading).toBe(true);
    expect(result.current.comments).toEqual([]);
  });

  // ==================== TESTS MODULE-SPECIFIC FETCHING ====================

  it('should fetch diete comments with date filter', async () => {
    mockUseAuth.mockReturnValue({ user: mockUser });

    const mockCommentsData: Partial<CoachComment>[] = [
      {
        coach_id: 'coach-123',
        athlete_id: 'athlete-123',
        module: 'diete',
        date: '2025-10-20',
        comment: 'Bonne nutrition aujourd\'hui!',
        read_by_athlete: false,
        created_at: Timestamp.now(),
      },
    ];

    mockOnSnapshot.mockImplementation((query, successCallback) => {
      const snapshot = {
        docs: mockCommentsData.map((data, index) => ({
          id: `comment-${index + 1}`,
          data: () => data,
        })),
      };
      successCallback(snapshot);
      return unsubscribeMock;
    });

    const { result } = renderHook(() => useCoachCommentsByModule('diete', '2025-10-20'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.comments).toHaveLength(1);
    expect(result.current.comments[0].module).toBe('diete');
    expect(result.current.comments[0].date).toBe('2025-10-20');
    
    // Verify where clauses were called with correct parameters
    expect(mockWhere).toHaveBeenCalledWith('athlete_id', '==', 'athlete-123');
    expect(mockWhere).toHaveBeenCalledWith('module', '==', 'diete');
    expect(mockWhere).toHaveBeenCalledWith('date', '==', '2025-10-20');
  });

  it('should fetch entrainements comments with training_id filter', async () => {
    mockUseAuth.mockReturnValue({ user: mockUser });

    const mockCommentsData: Partial<CoachComment>[] = [
      {
        coach_id: 'coach-123',
        athlete_id: 'athlete-123',
        module: 'entrainements',
        training_id: 'training-456',
        comment: 'Bonne séance de cardio!',
        read_by_athlete: false,
        created_at: Timestamp.now(),
      },
    ];

    mockOnSnapshot.mockImplementation((query, successCallback) => {
      const snapshot = {
        docs: mockCommentsData.map((data, index) => ({
          id: `comment-${index + 1}`,
          data: () => data,
        })),
      };
      successCallback(snapshot);
      return unsubscribeMock;
    });

    const { result } = renderHook(() => 
      useCoachCommentsByModule('entrainements', undefined, 'training-456')
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.comments).toHaveLength(1);
    expect(result.current.comments[0].module).toBe('entrainements');
    expect(result.current.comments[0].training_id).toBe('training-456');
    
    // Verify where clauses
    expect(mockWhere).toHaveBeenCalledWith('athlete_id', '==', 'athlete-123');
    expect(mockWhere).toHaveBeenCalledWith('module', '==', 'entrainements');
    expect(mockWhere).toHaveBeenCalledWith('training_id', '==', 'training-456');
  });

  it('should fetch journal comments with entry_id filter', async () => {
    mockUseAuth.mockReturnValue({ user: mockUser });

    const mockCommentsData: Partial<CoachComment>[] = [
      {
        coach_id: 'coach-123',
        athlete_id: 'athlete-123',
        module: 'journal',
        entry_id: 'entry-789',
        comment: 'Continue comme ça!',
        read_by_athlete: true,
        created_at: Timestamp.now(),
      },
    ];

    mockOnSnapshot.mockImplementation((query, successCallback) => {
      const snapshot = {
        docs: mockCommentsData.map((data, index) => ({
          id: `comment-${index + 1}`,
          data: () => data,
        })),
      };
      successCallback(snapshot);
      return unsubscribeMock;
    });

    const { result } = renderHook(() => 
      useCoachCommentsByModule('journal', undefined, 'entry-789')
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.comments).toHaveLength(1);
    expect(result.current.comments[0].module).toBe('journal');
    expect(result.current.comments[0].entry_id).toBe('entry-789');
    
    // Verify where clauses
    expect(mockWhere).toHaveBeenCalledWith('athlete_id', '==', 'athlete-123');
    expect(mockWhere).toHaveBeenCalledWith('module', '==', 'journal');
    expect(mockWhere).toHaveBeenCalledWith('entry_id', '==', 'entry-789');
  });

  it('should fetch comments without optional filters', async () => {
    mockUseAuth.mockReturnValue({ user: mockUser });

    const mockCommentsData: Partial<CoachComment>[] = [
      {
        coach_id: 'coach-123',
        athlete_id: 'athlete-123',
        module: 'mesures',
        comment: 'Bonnes mesures ce mois-ci',
        read_by_athlete: false,
        created_at: Timestamp.now(),
      },
    ];

    mockOnSnapshot.mockImplementation((query, successCallback) => {
      const snapshot = {
        docs: mockCommentsData.map((data, index) => ({
          id: `comment-${index + 1}`,
          data: () => data,
        })),
      };
      successCallback(snapshot);
      return unsubscribeMock;
    });

    const { result } = renderHook(() => useCoachCommentsByModule('mesures'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.comments).toHaveLength(1);
    expect(result.current.comments[0].module).toBe('mesures');
    
    // Verify only athlete_id and module filters were used
    expect(mockWhere).toHaveBeenCalledWith('athlete_id', '==', 'athlete-123');
    expect(mockWhere).toHaveBeenCalledWith('module', '==', 'mesures');
    // Date and itemId filters should NOT be called
    expect(mockWhere).not.toHaveBeenCalledWith('date', expect.anything(), expect.anything());
  });

  // ==================== TESTS SORTING ====================

  it('should sort comments by created_at descending', async () => {
    mockUseAuth.mockReturnValue({ user: mockUser });

    const date1 = new Date('2025-10-19T10:00:00');
    const date2 = new Date('2025-10-20T10:00:00');
    const date3 = new Date('2025-10-21T10:00:00');

    const mockCommentsData: Partial<CoachComment>[] = [
      {
        id: 'comment-1',
        coach_id: 'coach-123',
        athlete_id: 'athlete-123',
        module: 'diete',
        comment: 'Ancien commentaire',
        created_at: Timestamp.fromDate(date1),
      },
      {
        id: 'comment-2',
        coach_id: 'coach-123',
        athlete_id: 'athlete-123',
        module: 'diete',
        comment: 'Commentaire récent',
        created_at: Timestamp.fromDate(date3),
      },
      {
        id: 'comment-3',
        coach_id: 'coach-123',
        athlete_id: 'athlete-123',
        module: 'diete',
        comment: 'Commentaire moyen',
        created_at: Timestamp.fromDate(date2),
      },
    ];

    mockOnSnapshot.mockImplementation(async (query, successCallback) => {
      const snapshot = {
        docs: mockCommentsData.map((data) => ({
          id: data.id,
          data: () => data,
        })),
      };
      successCallback(snapshot);
      return unsubscribeMock;
    });

    const { result } = renderHook(() => useCoachCommentsByModule('diete'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Verify sorting (most recent first)
    expect(result.current.comments).toHaveLength(3);
    expect(result.current.comments[0].id).toBe('comment-2'); // Most recent
    expect(result.current.comments[1].id).toBe('comment-3'); // Middle
    expect(result.current.comments[2].id).toBe('comment-1'); // Oldest
  });

  // ==================== TESTS CLEANUP (UNSUBSCRIBE) ====================

  it('should cleanup onSnapshot subscription on unmount', () => {
    mockUseAuth.mockReturnValue({ user: mockUser });

    mockOnSnapshot.mockReturnValue(unsubscribeMock);

    const { unmount } = renderHook(() => useCoachCommentsByModule('diete'));

    unmount();

    expect(unsubscribeMock).toHaveBeenCalledTimes(1);
  });

  // ==================== TESTS ERROR HANDLING ====================

  it('should handle onSnapshot error gracefully', async () => {
    mockUseAuth.mockReturnValue({ user: mockUser });

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    mockOnSnapshot.mockImplementation(async (query, successCallback, errorCallback) => {
      // Call errorCallback instead of successCallback
      if (errorCallback) {
        errorCallback(new Error('Firestore connection failed'));
      }
      return unsubscribeMock;
    });

    const { result } = renderHook(() => useCoachCommentsByModule('diete'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.comments).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Erreur récupération commentaires coach:',
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });

  // ==================== TESTS REAL-TIME UPDATES ====================

  it('should update comments when new data arrives via onSnapshot', async () => {
    mockUseAuth.mockReturnValue({ user: mockUser });

    let snapshotCallback: ((snapshot: unknown) => void) | null = null;

    mockOnSnapshot.mockImplementation(async (query, successCallback) => {
      snapshotCallback = successCallback;
      
      // Initial empty state
      successCallback({ docs: [] });
      
      return unsubscribeMock;
    });

    const { result } = renderHook(() => useCoachCommentsByModule('diete'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.comments).toEqual([]);

    // Simulate new comment arriving
    const newCommentData: Partial<CoachComment> = {
      coach_id: 'coach-123',
      athlete_id: 'athlete-123',
      module: 'diete',
      date: '2025-10-22',
      comment: 'Nouveau commentaire!',
      read_by_athlete: false,
      created_at: Timestamp.now(),
    };

    if (snapshotCallback) {
      snapshotCallback({
        docs: [{
          id: 'new-comment-1',
          data: () => newCommentData,
        }],
      });
    }

    await waitFor(() => {
      expect(result.current.comments).toHaveLength(1);
    });

    expect(result.current.comments[0].id).toBe('new-comment-1');
    expect(result.current.comments[0].comment).toBe('Nouveau commentaire!');
  });
});

