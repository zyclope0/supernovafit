import { renderHook, act, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useAuth } from '@/hooks/useAuth';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getDoc } from 'firebase/firestore';

// Mock Firebase
vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  sendSignInLinkToEmail: vi.fn(),
  isSignInWithEmailLink: vi.fn(),
  signInWithEmailLink: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
}));

vi.mock('@/lib/firebase', () => ({
  auth: {},
  db: {},
}));

vi.mock('@/hooks/useFirebaseError', () => ({
  useFirebaseError: () => ({
    handleError: vi.fn(),
  }),
}));

describe('useAuth - Tests étendus', () => {
  const mockOnAuthStateChanged = vi.mocked(onAuthStateChanged);
  const mockSignInWithEmailAndPassword = vi.mocked(signInWithEmailAndPassword);
  const mockSignOut = vi.mocked(signOut);
  const mockGetDoc = vi.mocked(getDoc);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Gestion des états de chargement', () => {
    it('devrait gérer correctement l\'état de chargement initial', () => {
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        // Simuler un délai avant le callback
        setTimeout(() => callback(null), 100);
        return vi.fn(); // unsubscribe function
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.loading).toBe(true);
      expect(result.current.user).toBe(null);
      expect(result.current.userProfile).toBe(null);
    });

    it('devrait gérer l\'état de chargement du profil séparément', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
      };

      const mockUserProfile = {
        nom: 'Test User',
        email: 'test@example.com',
        role: 'sportif',
      };

      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        callback(mockUser as any);
        return vi.fn();
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockUserProfile,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.profileLoading).toBe(false);
        expect(result.current.user).toEqual(mockUser);
        expect(result.current.userProfile).toEqual(mockUserProfile);
      });
    });
  });

  describe('Gestion des erreurs de profil', () => {
    it('devrait gérer les erreurs lors du chargement du profil', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
      };

      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        callback(mockUser as any);
        return vi.fn();
      });

      mockGetDoc.mockRejectedValue(new Error('Erreur Firestore'));

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
        expect(result.current.userProfile).toBe(null);
        expect(result.current.profileLoading).toBe(false);
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Erreur lors du chargement du profil:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('devrait gérer le cas où le profil n\'existe pas', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
      };

      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        callback(mockUser as any);
        return vi.fn();
      });

      mockGetDoc.mockResolvedValue({
        exists: () => false,
        data: () => null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
        expect(result.current.userProfile).toBe(null);
        expect(result.current.profileLoading).toBe(false);
      });
    });
  });

  describe('Fonctions d\'authentification', () => {
    it('devrait appeler signInWithEmailAndPassword avec les bons paramètres', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
      };

      mockSignInWithEmailAndPassword.mockResolvedValue({
        user: mockUser,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn('test@example.com', 'password123');
      });

      expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.any(Object), // auth object
        'test@example.com',
        'password123'
      );
    });

    it('devrait gérer les erreurs de connexion', async () => {
      const authError = new Error('Invalid credentials');
      mockSignInWithEmailAndPassword.mockRejectedValue(authError);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        try {
          await result.current.signIn('test@example.com', 'wrongpassword');
        } catch (error) {
          expect(error).toBe(authError);
        }
      });
    });

    it('devrait appeler signOut correctement', async () => {
      mockSignOut.mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signOut();
      });

      expect(mockSignOut).toHaveBeenCalledWith(expect.any(Object));
    });

    it('devrait gérer les erreurs de déconnexion', async () => {
      const signOutError = new Error('Sign out failed');
      mockSignOut.mockRejectedValue(signOutError);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        try {
          await result.current.signOut();
        } catch (error) {
          expect(error).toBe(signOutError);
        }
      });
    });
  });

  describe('Nettoyage des listeners', () => {
    it('devrait nettoyer le listener onAuthStateChanged au démontage', () => {
      const mockUnsubscribe = vi.fn();
      mockOnAuthStateChanged.mockReturnValue(mockUnsubscribe);

      const { unmount } = renderHook(() => useAuth());

      unmount();

      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });

  describe('États de l\'utilisateur', () => {
    it('devrait mettre à jour l\'utilisateur lors du changement d\'état', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
      };

      let authCallback: (user: unknown) => void;
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        authCallback = callback;
        return vi.fn();
      });

      const { result } = renderHook(() => useAuth());

      // Simuler la connexion
      act(() => {
        authCallback(mockUser);
      });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
        expect(result.current.loading).toBe(false);
      });

      // Simuler la déconnexion
      act(() => {
        authCallback(null);
      });

      await waitFor(() => {
        expect(result.current.user).toBe(null);
        expect(result.current.userProfile).toBe(null);
      });
    });
  });

  describe('Performance et optimisations', () => {
    it('devrait éviter les re-renders inutiles', () => {
      let renderCount = 0;
      
      renderHook(() => {
        renderCount++;
        return useAuth();
      });

      // Le hook devrait se rendre une seule fois initialement
      expect(renderCount).toBe(1);
    });

    it('devrait gérer les mises à jour rapides de l\'état', async () => {
      const mockUser1 = { uid: 'user1', email: 'user1@example.com' };
      const mockUser2 = { uid: 'user2', email: 'user2@example.com' };

      let authCallback: (user: unknown) => void;
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        authCallback = callback;
        return vi.fn();
      });

      const { result } = renderHook(() => useAuth());

      // Mises à jour rapides
      act(() => {
        authCallback(mockUser1);
        authCallback(mockUser2);
        authCallback(null);
      });

      await waitFor(() => {
        expect(result.current.user).toBe(null);
        expect(result.current.loading).toBe(false);
      });
    });
  });
});
