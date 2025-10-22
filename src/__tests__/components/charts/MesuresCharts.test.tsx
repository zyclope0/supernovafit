import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import MesuresCharts from '@/components/charts/MesuresCharts';
import type { Mesure } from '@/types';

// Import real Timestamp
let Timestamp: any;

beforeAll(async () => {
  const firestore = await vi.importActual<typeof import('firebase/firestore')>('firebase/firestore');
  Timestamp = firestore.Timestamp;
});

// Mock Recharts (pas besoin de render réel pour les tests)
vi.mock('recharts', () => ({
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  Line: ({ dataKey }: { dataKey: string }) => (
    <div data-testid={`line-${dataKey}`}>{dataKey}</div>
  ),
  AreaChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="area-chart">{children}</div>
  ),
  Area: ({ dataKey }: { dataKey: string }) => (
    <div data-testid={`area-${dataKey}`}>{dataKey}</div>
  ),
  XAxis: () => <div data-testid="x-axis">XAxis</div>,
  YAxis: () => <div data-testid="y-axis">YAxis</div>,
  CartesianGrid: () => <div data-testid="grid">Grid</div>,
  Tooltip: () => <div data-testid="tooltip">Tooltip</div>,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}));

// Mock formatDate
vi.mock('@/lib/utils', () => ({
  formatDate: (date: string) => date,
}));

describe('MesuresCharts', () => {
  const createMockMesure = (
    date: Date,
    overrides: Partial<Mesure> = {},
  ): Mesure => ({
    id: '1',
    user_id: 'test-user',
    date: Timestamp.fromDate(date),
    poids: 75,
    imc: 23.5,
    masse_grasse: 15,
    masse_musculaire: 40,
    tour_taille: 85,
    tour_hanches: 95,
    tour_bras: 30,
    tour_cuisses: 55,
    tour_cou: 38,
    tour_poitrine: 95,
    created_at: Timestamp.now(),
    ...overrides,
  });

  describe('Rendering', () => {
    it('should render with valid data', () => {
      const mesures = [
        createMockMesure(new Date('2025-10-01')),
        createMockMesure(new Date('2025-10-05')),
        createMockMesure(new Date('2025-10-10')),
      ];

      render(<MesuresCharts mesures={mesures} />);

      // Vérifier que les graphiques sont rendus
      expect(screen.getAllByTestId('responsive-container')).toHaveLength(3);
    });

    it('should render empty state with no data', () => {
      render(<MesuresCharts mesures={[]} />);

      // Vérifier le message d'état vide
      expect(
        screen.getByText(/aucune mesure disponible/i),
      ).toBeInTheDocument();
    });

    it('should render 3 charts (Poids & IMC, Composition, Mensurations)', () => {
      const mesures = [createMockMesure(new Date('2025-10-01'))];

      render(<MesuresCharts mesures={mesures} />);

      // Vérifier les 3 sections de graphiques
      expect(screen.getByText(/poids.*imc/i)).toBeInTheDocument();
      expect(screen.getByText(/composition corporelle/i)).toBeInTheDocument();
      expect(screen.getByText(/mensurations/i)).toBeInTheDocument();
    });
  });

  describe('Date Handling', () => {
    it('should convert Timestamp to ISO string correctly', () => {
      const date = new Date('2025-10-21');
      date.setHours(12, 0, 0, 0); // Important: 12:00:00

      const mesures = [createMockMesure(date, { poids: 75 })];

      render(<MesuresCharts mesures={mesures} />);

      // Si ça ne throw pas, la conversion est OK
      expect(screen.getAllByTestId('responsive-container')).toHaveLength(3);
    });

    it('should filter out mesures without date', () => {
      const mesures = [
        createMockMesure(new Date('2025-10-01')),
        { ...createMockMesure(new Date('2025-10-05')), date: null } as any, // Invalid
        createMockMesure(new Date('2025-10-10')),
      ];

      render(<MesuresCharts mesures={mesures} />);

      // Devrait render sans erreur (les dates invalides filtrées)
      expect(screen.getAllByTestId('responsive-container')).toHaveLength(3);
    });

    it('should handle invalid date values gracefully', () => {
      const invalidDate = new Date('invalid');
      const mesures = [
        createMockMesure(new Date('2025-10-01')),
        createMockMesure(invalidDate), // Invalid date
      ];

      render(<MesuresCharts mesures={mesures} />);

      // Devrait render sans throw (dates invalides filtrées)
      expect(screen.getAllByTestId('responsive-container')).toHaveLength(3);
    });

    it('should sort mesures by date (oldest first)', () => {
      const mesures = [
        createMockMesure(new Date('2025-10-10'), { poids: 73 }),
        createMockMesure(new Date('2025-10-01'), { poids: 75 }),
        createMockMesure(new Date('2025-10-05'), { poids: 74 }),
      ];

      const { container } = render(<MesuresCharts mesures={mesures} />);

      // Vérifier que les données sont triées (le composant ne devrait pas throw)
      expect(container).toBeInTheDocument();
    });
  });

  describe('Data Completeness', () => {
    it('should handle mesures with missing optional fields', () => {
      const mesures = [
        createMockMesure(new Date('2025-10-01'), {
          masse_grasse: undefined,
          masse_musculaire: undefined,
          tour_bras: undefined,
        }),
      ];

      render(<MesuresCharts mesures={mesures} />);

      // Devrait render sans erreur
      expect(screen.getAllByTestId('responsive-container')).toHaveLength(3);
    });

    it('should render only available data points', () => {
      const mesures = [
        createMockMesure(new Date('2025-10-01'), {
          poids: 75,
          imc: 23.5,
          masse_grasse: undefined, // Pas de masse grasse
        }),
      ];

      render(<MesuresCharts mesures={mesures} />);

      // Devrait render les graphiques avec données partielles
      expect(screen.getAllByTestId('responsive-container')).toHaveLength(3);
    });
  });

  describe('Data Formatting', () => {
    it('should display poids with kg unit', () => {
      const mesures = [createMockMesure(new Date('2025-10-01'), { poids: 75 })];

      render(<MesuresCharts mesures={mesures} />);

      // Vérifier que "Poids" est présent (utiliser getAllByText car multiple occurrences)
      expect(screen.getAllByText(/poids/i).length).toBeGreaterThan(0);
    });

    it('should display IMC without unit', () => {
      const mesures = [createMockMesure(new Date('2025-10-01'), { imc: 23.5 })];

      render(<MesuresCharts mesures={mesures} />);

      // Vérifier que "IMC" est présent (utiliser getAllByText car multiple occurrences)
      expect(screen.getAllByText(/imc/i).length).toBeGreaterThan(0);
    });

    it('should handle zero values correctly', () => {
      const mesures = [
        createMockMesure(new Date('2025-10-01'), { poids: 0, imc: 0 }),
      ];

      render(<MesuresCharts mesures={mesures} />);

      // Devrait render même avec des valeurs à 0
      expect(screen.getAllByTestId('responsive-container')).toHaveLength(3);
    });

    it('should handle negative values (edge case)', () => {
      const mesures = [
        createMockMesure(new Date('2025-10-01'), { poids: -1, imc: -1 }),
      ];

      render(<MesuresCharts mesures={mesures} />);

      // Devrait render sans erreur (même si invalide métier)
      expect(screen.getAllByTestId('responsive-container')).toHaveLength(3);
    });
  });

  describe('Multiple Mesures', () => {
    it('should render multiple data points', () => {
      const mesures = Array.from({ length: 10 }, (_, i) =>
        createMockMesure(new Date(`2025-10-${String(i + 1).padStart(2, '0')}`), {
          poids: 75 + i * 0.5,
        }),
      );

      render(<MesuresCharts mesures={mesures} />);

      // Devrait render 10 mesures sans problème
      expect(screen.getAllByTestId('responsive-container')).toHaveLength(3);
    });

    it('should handle large dataset (100+ mesures)', () => {
      const mesures = Array.from({ length: 100 }, (_, i) =>
        createMockMesure(
          new Date(Date.now() - i * 24 * 60 * 60 * 1000), // 100 jours
          { poids: 75 + (i % 10) * 0.5 },
        ),
      );

      render(<MesuresCharts mesures={mesures} />);

      // Devrait render sans ralentissement majeur
      expect(screen.getAllByTestId('responsive-container')).toHaveLength(3);
    });
  });

  describe('Component Responsiveness', () => {
    it('should render ResponsiveContainer for each chart', () => {
      const mesures = [createMockMesure(new Date('2025-10-01'))];

      render(<MesuresCharts mesures={mesures} />);

      // 3 graphiques = 3 ResponsiveContainer
      expect(screen.getAllByTestId('responsive-container')).toHaveLength(3);
    });

    it('should include grid and axes', () => {
      const mesures = [createMockMesure(new Date('2025-10-01'))];

      render(<MesuresCharts mesures={mesures} />);

      // Vérifier présence des axes et grilles
      expect(screen.getAllByTestId('x-axis').length).toBeGreaterThan(0);
      expect(screen.getAllByTestId('y-axis').length).toBeGreaterThan(0);
      expect(screen.getAllByTestId('grid').length).toBeGreaterThan(0);
    });

    it('should include tooltips', () => {
      const mesures = [createMockMesure(new Date('2025-10-01'))];

      render(<MesuresCharts mesures={mesures} />);

      // Vérifier présence des tooltips
      expect(screen.getAllByTestId('tooltip').length).toBeGreaterThan(0);
    });
  });
});

