import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/auth/AuthGuard';
import { useAuth } from '@/hooks/useAuth';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock useAuth hook
jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

// Mock MainLayout
jest.mock('@/components/layout/MainLayout', () => {
  return function MockMainLayout({ children }: { children: React.ReactNode }) {
    return <div data-testid="main-layout">{children}</div>;
  };
});

describe('AuthGuard', () => {
  const mockPush = jest.fn();
  const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
  const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    } as any);
  });

  describe('Loading State', () => {
    it('should show loading spinner while authenticating', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        userProfile: null,
        loading: true,
      } as any);

      const { container } = render(
        <AuthGuard>
          <div>Protected Content</div>
        </AuthGuard>,
      );

      // Check for spinner by class
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  describe('Authentication Required (requireAuth=true)', () => {
    it('should redirect to /auth if not authenticated', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        userProfile: null,
        loading: false,
      } as any);

      render(
        <AuthGuard requireAuth={true}>
          <div>Protected Content</div>
        </AuthGuard>,
      );

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/auth');
      });
    });

    it('should show access denied UI if not authenticated', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        userProfile: null,
        loading: false,
      } as any);

      render(
        <AuthGuard requireAuth={true}>
          <div>Protected Content</div>
        </AuthGuard>,
      );

      expect(screen.getByText('Accès refusé')).toBeInTheDocument();
      expect(
        screen.getByText('Vous devez être connecté pour accéder à cette page.'),
      ).toBeInTheDocument();
      expect(screen.getByText('Se connecter')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should render children if authenticated', () => {
      mockUseAuth.mockReturnValue({
        user: { uid: 'test-user-id', email: 'test@example.com' },
        userProfile: { role: 'sportif' },
        loading: false,
      } as any);

      render(
        <AuthGuard requireAuth={true}>
          <div>Protected Content</div>
        </AuthGuard>,
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
      expect(screen.queryByText('Accès refusé')).not.toBeInTheDocument();
    });
  });

  describe('Coach Role Required (requireCoach=true)', () => {
    it('should redirect to / if not coach', async () => {
      mockUseAuth.mockReturnValue({
        user: { uid: 'test-user-id', email: 'test@example.com' },
        userProfile: { role: 'sportif' },
        loading: false,
      } as any);

      render(
        <AuthGuard requireCoach={true}>
          <div>Coach Content</div>
        </AuthGuard>,
      );

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    });

    it('should show access denied UI if not coach', () => {
      mockUseAuth.mockReturnValue({
        user: { uid: 'test-user-id', email: 'test@example.com' },
        userProfile: { role: 'sportif' },
        loading: false,
      } as any);

      render(
        <AuthGuard requireCoach={true}>
          <div>Coach Content</div>
        </AuthGuard>,
      );

      expect(screen.getByText('Accès refusé')).toBeInTheDocument();
      expect(
        screen.getByText('Cette page est réservée aux coaches.'),
      ).toBeInTheDocument();
      expect(screen.getByText("Retour à l'accueil")).toBeInTheDocument();
      expect(screen.queryByText('Coach Content')).not.toBeInTheDocument();
    });

    it('should render children if user is coach', () => {
      mockUseAuth.mockReturnValue({
        user: { uid: 'coach-user-id', email: 'coach@example.com' },
        userProfile: { role: 'coach' },
        loading: false,
      } as any);

      render(
        <AuthGuard requireCoach={true}>
          <div>Coach Content</div>
        </AuthGuard>,
      );

      expect(screen.getByText('Coach Content')).toBeInTheDocument();
      expect(screen.queryByText('Accès refusé')).not.toBeInTheDocument();
    });

    it('should redirect to /auth if not authenticated when requireCoach is true', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        userProfile: null,
        loading: false,
      } as any);

      render(
        <AuthGuard requireCoach={true}>
          <div>Coach Content</div>
        </AuthGuard>,
      );

      // requireCoach implies requireAuth (default true)
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/auth');
      });
    });
  });

  describe('No Auth Required (requireAuth=false)', () => {
    it('should render children even if not authenticated', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        userProfile: null,
        loading: false,
      } as any);

      render(
        <AuthGuard requireAuth={false}>
          <div>Public Content</div>
        </AuthGuard>,
      );

      expect(screen.getByText('Public Content')).toBeInTheDocument();
      expect(screen.queryByText('Accès refusé')).not.toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should navigate to /auth when clicking login button', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        userProfile: null,
        loading: false,
      } as any);

      render(
        <AuthGuard requireAuth={true}>
          <div>Protected Content</div>
        </AuthGuard>,
      );

      const loginButton = screen.getByText('Se connecter');
      loginButton.click();

      expect(mockPush).toHaveBeenCalledWith('/auth');
    });

    it('should navigate to / when clicking return home button', async () => {
      mockUseAuth.mockReturnValue({
        user: { uid: 'test-user-id', email: 'test@example.com' },
        userProfile: { role: 'sportif' },
        loading: false,
      } as any);

      render(
        <AuthGuard requireCoach={true}>
          <div>Coach Content</div>
        </AuthGuard>,
      );

      const homeButton = screen.getByText("Retour à l'accueil");
      homeButton.click();

      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing userProfile gracefully', () => {
      mockUseAuth.mockReturnValue({
        user: { uid: 'test-user-id', email: 'test@example.com' },
        userProfile: null,
        loading: false,
      } as any);

      render(
        <AuthGuard requireAuth={true}>
          <div>Protected Content</div>
        </AuthGuard>,
      );

      // Should render content because user exists (requireAuth only)
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should handle missing userProfile with requireCoach', async () => {
      mockUseAuth.mockReturnValue({
        user: { uid: 'test-user-id', email: 'test@example.com' },
        userProfile: null,
        loading: false,
      } as any);

      render(
        <AuthGuard requireCoach={true}>
          <div>Coach Content</div>
        </AuthGuard>,
      );

      // Should show access denied because no profile = not coach
      await waitFor(() => {
        expect(screen.getByText('Accès refusé')).toBeInTheDocument();
      });
    });

    it('should update when auth state changes from loading to loaded', async () => {
      const { rerender } = render(
        <AuthGuard requireAuth={true}>
          <div>Protected Content</div>
        </AuthGuard>,
      );

      // Initial: loading
      mockUseAuth.mockReturnValue({
        user: null,
        userProfile: null,
        loading: true,
      } as any);

      rerender(
        <AuthGuard requireAuth={true}>
          <div>Protected Content</div>
        </AuthGuard>,
      );

      expect(document.querySelector('.animate-spin')).toBeInTheDocument();

      // After loading: authenticated
      mockUseAuth.mockReturnValue({
        user: { uid: 'test-user-id', email: 'test@example.com' },
        userProfile: { role: 'sportif' },
        loading: false,
      } as any);

      rerender(
        <AuthGuard requireAuth={true}>
          <div>Protected Content</div>
        </AuthGuard>,
      );

      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
      });
    });
  });
});

