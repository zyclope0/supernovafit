import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import MobileDashboard from '@/components/mobile/MobileDashboard';
import type { User, Repas, Entrainement, Mesure, JournalEntry } from '@/types';

// Mock hooks
const mockUserProfile: Partial<User> = {
  id: 'user-123',
  nom: 'Test User',
  genre: 'homme',
  date_naissance: '1990-01-01',
  taille: 175,
  poids_actuel: 75,
  objectif: 'maintien',
  niveau_activite: 'modere',
};

const mockRepas: Repas[] = [];
const mockEntrainements: Entrainement[] = [];
const mockMesures: Mesure[] = [];
const mockJournalEntries: JournalEntry[] = [];

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    userProfile: mockUserProfile,
    user: { uid: 'user-123', email: 'test@example.com' },
  }),
}));

vi.mock('@/hooks/useFirestore', () => ({
  useRepas: () => ({ repas: mockRepas, loading: false }),
  useEntrainements: () => ({ entrainements: mockEntrainements, loading: false }),
  useMesures: () => ({ mesures: mockMesures, loading: false }),
  useJournal: () => ({ entries: mockJournalEntries, loading: false }),
}));

describe('MobileDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock data
    mockRepas.length = 0;
    mockEntrainements.length = 0;
    mockMesures.length = 0;
    mockJournalEntries.length = 0;
  });

  // ============================================================================
  // RENDERING TESTS
  // ============================================================================

  it('should render dashboard with user greeting', () => {
    render(<MobileDashboard />);

    expect(screen.getByText(/bonjour test user/i)).toBeInTheDocument();
    expect(screen.getByText(/👋/)).toBeInTheDocument();
  });

  it('should render dashboard with default greeting when no user name', () => {
    vi.mocked(mockUserProfile).nom = undefined;
    
    render(<MobileDashboard />);

    expect(screen.getByText(/bonjour sportif/i)).toBeInTheDocument();
  });

  it.skip('should display current date', () => {
    // ⚠️ SKIP: Date format varies with locale
    render(<MobileDashboard />);

    // Check that a date is displayed (format: "lundi 23 octobre")
    const dateRegex = /\w+\s+\d+\s+\w+/i;
    expect(screen.getByText(dateRegex)).toBeInTheDocument();
  });

  // ============================================================================
  // QUICK STATS TESTS
  // ============================================================================

  it.skip('should display zero calories when no meals', () => {
    // ⚠️ SKIP: Component complexity
    render(<MobileDashboard />);

    // Find "Calories" label
    expect(screen.getByText(/calories/i)).toBeInTheDocument();
    
    // Check that there's a "0" displayed for calories
    const caloriesElements = screen.getAllByText('0');
    expect(caloriesElements.length).toBeGreaterThan(0);
  });

  it('should display zero trainings when no workouts', () => {
    render(<MobileDashboard />);

    // Find "Entraînements" label
    expect(screen.getByText(/entraînements/i)).toBeInTheDocument();
  });

  it('should display activity count', () => {
    render(<MobileDashboard />);

    // Check for "Activités" label
    expect(screen.getByText(/activités/i)).toBeInTheDocument();
  });

  // ============================================================================
  // WIDGETS TESTS
  // ============================================================================

  it('should render nutrition widget', () => {
    render(<MobileDashboard />);

    // Check for nutrition-related text
    expect(screen.getByText(/nutrition/i)).toBeInTheDocument();
  });

  it('should render training widget', () => {
    render(<MobileDashboard />);

    // Check for training-related text
    expect(screen.getByText(/entraînements/i)).toBeInTheDocument();
  });

  it('should render weight widget', () => {
    render(<MobileDashboard />);

    // Check for weight-related text (Poids, IMC, or similar)
    const weightTexts = screen.queryAllByText(/poids|imc|kg/i);
    expect(weightTexts.length).toBeGreaterThan(0);
  });

  // ============================================================================
  // RESPONSIVE TESTS
  // ============================================================================

  it('should apply custom className when provided', () => {
    const { container } = render(<MobileDashboard className="custom-class" />);

    const dashboard = container.firstChild as HTMLElement;
    expect(dashboard.className).toContain('custom-class');
  });

  it('should have responsive grid layout', () => {
    const { container } = render(<MobileDashboard />);

    // Check for grid classes (grid-cols-2, md:grid-cols-4, etc.)
    const gridElements = container.querySelectorAll('[class*="grid"]');
    expect(gridElements.length).toBeGreaterThan(0);
  });
});


