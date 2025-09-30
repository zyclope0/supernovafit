import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/auth/AuthGuard';
import { useAuth } from '@/hooks/useAuth';

// Mock des dépendances
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/components/layout/MainLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="main-layout">{children}</div>
  ),
}));

describe('AuthGuard', () => {
  const mockPush = vi.fn();
  const mockUseAuth = vi.mocked(useAuth);
  const mockUseRouter = vi.mocked(useRouter);

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    });
  });

  describe('Authentification requise', () => {
    it('devrait rediriger vers /auth si utilisateur non connecté', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        userProfile: null,
        loading: false,
        signIn: vi.fn(),
        signOut: vi.fn(),
        signUp: vi.fn(),
      });

      render(
        <AuthGuard requireAuth={true}>
          <div>Contenu protégé</div>
        </AuthGuard>
      );

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/auth');
      });
    });

    it('devrait afficher le contenu si utilisateur connecté', () => {
      mockUseAuth.mockReturnValue({
        user: { uid: 'test-uid', email: 'test@example.com' },
        userProfile: { role: 'sportif' },
        loading: false,
        signIn: vi.fn(),
        signOut: vi.fn(),
        signUp: vi.fn(),
      });

      render(
        <AuthGuard requireAuth={true}>
          <div data-testid="protected-content">Contenu protégé</div>
        </AuthGuard>
      );

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    it('devrait afficher le loading pendant le chargement', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        userProfile: null,
        loading: true,
        signIn: vi.fn(),
        signOut: vi.fn(),
        signUp: vi.fn(),
      });

      render(
        <AuthGuard requireAuth={true}>
          <div>Contenu protégé</div>
        </AuthGuard>
      );

      expect(screen.getByTestId('main-layout')).toBeInTheDocument();
      expect(document.querySelector('.animate-spin')).toBeInTheDocument(); // Spinner
    });
  });

  describe('Rôle coach requis', () => {
    it('devrait rediriger vers / si utilisateur non coach', async () => {
      mockUseAuth.mockReturnValue({
        user: { uid: 'test-uid', email: 'test@example.com' },
        userProfile: { role: 'sportif' },
        loading: false,
        signIn: vi.fn(),
        signOut: vi.fn(),
        signUp: vi.fn(),
      });

      render(
        <AuthGuard requireAuth={true} requireCoach={true}>
          <div>Contenu coach</div>
        </AuthGuard>
      );

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    });

    it('devrait afficher le contenu si utilisateur est coach', () => {
      mockUseAuth.mockReturnValue({
        user: { uid: 'test-uid', email: 'test@example.com' },
        userProfile: { role: 'coach' },
        loading: false,
        signIn: vi.fn(),
        signOut: vi.fn(),
        signUp: vi.fn(),
      });

      render(
        <AuthGuard requireAuth={true} requireCoach={true}>
          <div data-testid="coach-content">Contenu coach</div>
        </AuthGuard>
      );

      expect(screen.getByTestId('coach-content')).toBeInTheDocument();
    });
  });

  describe('Accès public', () => {
    it('devrait afficher le contenu sans authentification si requireAuth=false', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        userProfile: null,
        loading: false,
        signIn: vi.fn(),
        signOut: vi.fn(),
        signUp: vi.fn(),
      });

      render(
        <AuthGuard requireAuth={false}>
          <div data-testid="public-content">Contenu public</div>
        </AuthGuard>
      );

      expect(screen.getByTestId('public-content')).toBeInTheDocument();
    });
  });

  describe('Messages d\'erreur', () => {
    it('devrait afficher le message d\'accès refusé pour utilisateur non connecté', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        userProfile: null,
        loading: false,
        signIn: vi.fn(),
        signOut: vi.fn(),
        signUp: vi.fn(),
      });

      render(
        <AuthGuard requireAuth={true}>
          <div>Contenu protégé</div>
        </AuthGuard>
      );

      expect(screen.getByText('Accès refusé')).toBeInTheDocument();
      expect(
        screen.getByText('Vous devez être connecté pour accéder à cette page.')
      ).toBeInTheDocument();
      expect(screen.getByText('Se connecter')).toBeInTheDocument();
    });

    it('devrait afficher le message d\'accès refusé pour non-coach', () => {
      mockUseAuth.mockReturnValue({
        user: { uid: 'test-uid', email: 'test@example.com' },
        userProfile: { role: 'sportif' },
        loading: false,
        signIn: vi.fn(),
        signOut: vi.fn(),
        signUp: vi.fn(),
      });

      render(
        <AuthGuard requireAuth={true} requireCoach={true}>
          <div>Contenu coach</div>
        </AuthGuard>
      );

      expect(screen.getByText('Accès refusé')).toBeInTheDocument();
      expect(
        screen.getByText('Cette page est réservée aux coaches.')
      ).toBeInTheDocument();
      expect(screen.getByText("Retour à l'accueil")).toBeInTheDocument();
    });
  });

  describe('Boutons d\'action', () => {
    it('devrait rediriger vers /auth quand on clique sur "Se connecter"', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        userProfile: null,
        loading: false,
        signIn: vi.fn(),
        signOut: vi.fn(),
        signUp: vi.fn(),
      });

      render(
        <AuthGuard requireAuth={true}>
          <div>Contenu protégé</div>
        </AuthGuard>
      );

      const loginButton = screen.getByText('Se connecter');
      loginButton.click();

      expect(mockPush).toHaveBeenCalledWith('/auth');
    });

    it('devrait rediriger vers / quand on clique sur "Retour à l\'accueil"', () => {
      mockUseAuth.mockReturnValue({
        user: { uid: 'test-uid', email: 'test@example.com' },
        userProfile: { role: 'sportif' },
        loading: false,
        signIn: vi.fn(),
        signOut: vi.fn(),
        signUp: vi.fn(),
      });

      render(
        <AuthGuard requireAuth={true} requireCoach={true}>
          <div>Contenu coach</div>
        </AuthGuard>
      );

      const homeButton = screen.getByText("Retour à l'accueil");
      homeButton.click();

      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });
});
