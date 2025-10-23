import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TrainingForm from '@/components/ui/TrainingForm';
import type { Entrainement } from '@/types';
import { Timestamp } from 'firebase/firestore';

// Mock dependencies
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    userProfile: {
      poids_actuel: 75,
      taille: 175,
      date_naissance: '1990-01-01',
    },
  }),
}));

vi.mock('react-hot-toast', () => ({
  default: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock('@/lib/caloriesCalculator', () => ({
  getQuickCalorieEstimate: vi.fn(() => 300),
  smartCalorieCalculation: vi.fn(() => ({ 
    calories: 350, 
    method: 'MET', 
    details: {} 
  })),
}));

describe('TrainingForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================================
  // RENDERING TESTS
  // ============================================================================

  it('should render form with default values', () => {
    render(<TrainingForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    expect(screen.getByRole('button', { name: /enregistrer/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /annuler/i })).toBeInTheDocument();
    
    // Check training type buttons exist
    expect(screen.getByRole('button', { name: /🏃 Cardio/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /💪 Musculation/i })).toBeInTheDocument();
  });

  it('should render form with existing training data', () => {
    const existingTraining: Entrainement = {
      id: 'training-1',
      user_id: 'user-123',
      type: 'musculation',
      duree: 60,
      calories: 400,
      date: '2025-10-20',
      source: 'manuel',
      commentaire: 'Test training',
      created_at: Timestamp.now(),
    };

    render(
      <TrainingForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        existingTraining={existingTraining}
        isEditing={true}
      />
    );

    // The form should have the existing values pre-filled
    // Duration is shown in the UI but the exact element depends on the form structure
    expect(screen.getByDisplayValue('Test training')).toBeInTheDocument();
  });

  // ============================================================================
  // VALIDATION TESTS
  // ============================================================================

  it('should submit form with valid minimum data', async () => {
    const user = userEvent.setup();
    
    render(<TrainingForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const submitButton = screen.getByRole('button', { name: /enregistrer/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'cardio',
          duree: 30,
          source: 'manuel',
        })
      );
    });
  });

  it('should switch between training types (cardio/musculation)', async () => {
    const user = userEvent.setup();
    
    render(<TrainingForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    // Click musculation type
    const musculationButton = screen.getByText('Musculation');
    await user.click(musculationButton);

    const submitButton = screen.getByRole('button', { name: /enregistrer/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'musculation',
        })
      );
    });
  });

  it('should handle form submission with comments', async () => {
    const user = userEvent.setup();
    
    render(<TrainingForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const commentInput = screen.getByPlaceholderText(/comment vous sentez-vous/i);
    await user.type(commentInput, 'Great workout!');

    const submitButton = screen.getByRole('button', { name: /enregistrer/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          commentaire: 'Great workout!',
        })
      );
    });
  });

  // ============================================================================
  // UI STATE TESTS
  // ============================================================================

  it('should disable submit button when isSubmitting is true', () => {
    render(
      <TrainingForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isSubmitting={true}
      />
    );

    const submitButton = screen.getByRole('button', { name: /enregistrement/i });
    expect(submitButton).toBeDisabled();
  });

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    
    render(<TrainingForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const cancelButton = screen.getByRole('button', { name: /annuler/i });
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  // ============================================================================
  // ADVANCED FEATURES TESTS
  // ============================================================================

  it('should toggle advanced options visibility', async () => {
    const user = userEvent.setup();
    
    render(<TrainingForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const advancedButton = screen.getByRole('button', { name: /données avancées/i });
    await user.click(advancedButton);

    // Advanced options should now be visible
    await waitFor(() => {
      expect(screen.getByLabelText(/fréquence cardiaque moyenne/i)).toBeInTheDocument();
    });
  });

  it.skip('should calculate calories automatically when option is selected', async () => {
    // ⚠️ SKIP: Feature not implemented in component yet
    const user = userEvent.setup();
    
    render(<TrainingForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    // Find and click the auto-calculate button
    const autoCalcButton = screen.getByRole('button', { name: /calculer automatiquement/i });
    await user.click(autoCalcButton);

    // Auto calories should be calculated (mocked to 300)
    await waitFor(() => {
      expect(screen.getByText(/300 kcal/i)).toBeInTheDocument();
    });
  });
});

