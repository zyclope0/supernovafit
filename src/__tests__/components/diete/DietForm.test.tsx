import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DietForm from '@/components/diete/DietForm';
import type { MealType } from '@/types';

// Mock dependencies
vi.mock('@/hooks/useFirestore', () => ({
  useFavoris: () => ({
    favoris: [],
    addToFavoris: vi.fn(),
    isFavori: vi.fn(() => false),
  }),
}));

vi.mock('react-hot-toast', () => ({
  default: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock('@/components/ui/FoodSearch', () => ({
  default: () => <div data-testid="food-search">Food Search Mock</div>,
}));

vi.mock('@/components/ui/ManualFoodForm', () => ({
  default: () => <div data-testid="manual-food-form">Manual Food Form Mock</div>,
}));

describe('DietForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();
  const mealType: MealType = 'dejeuner';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================================
  // RENDERING TESTS
  // ============================================================================

  it('should render form with meal type', () => {
    render(
      <DietForm
        mealType={mealType}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Check tabs exist
    expect(screen.getByText('Recherche')).toBeInTheDocument();
    expect(screen.getByText('Manuel')).toBeInTheDocument();
    expect(screen.getByText('Favoris')).toBeInTheDocument();
    expect(screen.getByText('Mon Repas')).toBeInTheDocument();
  });

  it('should render cancel button', () => {
    render(
      <DietForm
        mealType={mealType}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /annuler/i });
    expect(cancelButton).toBeInTheDocument();
  });

  // ============================================================================
  // TAB NAVIGATION TESTS
  // ============================================================================

  it('should switch between tabs', async () => {
    const user = userEvent.setup();
    
    render(
      <DietForm
        mealType={mealType}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Click on Manuel tab
    const manuelTab = screen.getByText('Manuel');
    await user.click(manuelTab);

    // Manual food form should be visible
    expect(screen.getByTestId('manual-food-form')).toBeInTheDocument();
  });

  // ============================================================================
  // UI STATE TESTS
  // ============================================================================

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <DietForm
        mealType={mealType}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /annuler/i });
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('should start with search tab active by default', () => {
    render(
      <DietForm
        mealType={mealType}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Search should be the default active tab
    expect(screen.getByTestId('food-search')).toBeInTheDocument();
  });

  // ============================================================================
  // DISABLED STATE TESTS
  // ============================================================================

  it('should disable cancel button when isSubmitting is true', () => {
    render(
      <DietForm
        mealType={mealType}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isSubmitting={true}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /annuler/i });
    expect(cancelButton).toBeDisabled();
  });
});

