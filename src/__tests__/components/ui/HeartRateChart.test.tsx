import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import HeartRateChart from '@/components/ui/HeartRateChart';
import type { Entrainement } from '@/types';

// Import real Timestamp
let Timestamp: any;

beforeAll(async () => {
  const firestore =
    await vi.importActual<typeof import('firebase/firestore')>(
      'firebase/firestore',
    );
  Timestamp = firestore.Timestamp;
});

// Mock Recharts
vi.mock('recharts', () => ({
  AreaChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="area-chart">{children}</div>
  ),
  Area: ({ dataKey }: { dataKey: string }) => (
    <div data-testid={`area-${dataKey}`}>{dataKey}</div>
  ),
  Line: ({ dataKey }: { dataKey: string }) => (
    <div data-testid={`line-${dataKey}`}>{dataKey}</div>
  ),
  XAxis: () => <div data-testid="x-axis">XAxis</div>,
  YAxis: () => <div data-testid="y-axis">YAxis</div>,
  CartesianGrid: () => <div data-testid="grid">Grid</div>,
  Tooltip: () => <div data-testid="tooltip">Tooltip</div>,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}));

// Mock date-fns
vi.mock('date-fns', () => ({
  format: (date: Date) => date.toISOString(),
  parseISO: (dateStr: string) => new Date(dateStr),
}));

vi.mock('date-fns/locale', () => ({
  fr: {},
}));

describe('HeartRateChart', () => {
  const createMockEntrainement = (
    date: Date,
    overrides: Partial<Entrainement> = {},
  ): Entrainement => ({
    id: '1',
    user_id: 'test-user',
    date: Timestamp.fromDate(date),
    type: 'cardio',
    duree: 45,
    calories: 350,
    source: 'manuel',
    fc_moyenne: 140,
    fc_max: 170,
    fc_min: 120,
    created_at: Timestamp.now(),
    ...overrides,
  });

  describe('Rendering', () => {
    it('should render with valid heart rate data', () => {
      const entrainements = [
        createMockEntrainement(new Date('2025-10-01')),
        createMockEntrainement(new Date('2025-10-05')),
      ];

      render(<HeartRateChart entrainements={entrainements} />);

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });

    it('should render empty state when no HR data', () => {
      const entrainements = [
        createMockEntrainement(new Date('2025-10-01'), {
          fc_moyenne: undefined,
          fc_max: undefined,
          fc_min: undefined,
        }),
      ];

      render(<HeartRateChart entrainements={entrainements} />);

      expect(screen.getByText(/aucune donnée fc disponible/i)).toBeInTheDocument();
    });

    it('should render empty state with empty array', () => {
      render(<HeartRateChart entrainements={[]} />);

      expect(screen.getByText(/aucune donnée fc disponible/i)).toBeInTheDocument();
    });

    it('should display chart title', () => {
      const entrainements = [createMockEntrainement(new Date('2025-10-01'))];

      render(<HeartRateChart entrainements={entrainements} />);

      expect(
        screen.getByText(/fréquence cardiaque|évolution fc/i),
      ).toBeInTheDocument();
    });
  });

  describe('Date Handling', () => {
    it('should convert Timestamp to ISO string correctly', () => {
      const date = new Date('2025-10-21');
      date.setHours(12, 0, 0, 0);

      const entrainements = [createMockEntrainement(date)];

      render(<HeartRateChart entrainements={entrainements} />);

      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });

    it('should filter out entrainements without date', () => {
      const entrainements = [
        createMockEntrainement(new Date('2025-10-01')),
        {
          ...createMockEntrainement(new Date('2025-10-05')),
          date: null,
        } as any,
      ];

      render(<HeartRateChart entrainements={entrainements} />);

      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });

    it('should handle invalid date values gracefully', () => {
      const invalidDate = new Date('invalid');
      const entrainements = [
        createMockEntrainement(new Date('2025-10-01')),
        createMockEntrainement(invalidDate),
      ];

      render(<HeartRateChart entrainements={entrainements} />);

      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });

    it('should sort entrainements by date', () => {
      const entrainements = [
        createMockEntrainement(new Date('2025-10-10')),
        createMockEntrainement(new Date('2025-10-01')),
        createMockEntrainement(new Date('2025-10-05')),
      ];

      const { container } = render(
        <HeartRateChart entrainements={entrainements} />,
      );

      expect(container).toBeInTheDocument();
    });
  });

  describe('Heart Rate Data', () => {
    it('should display fc_moyenne', () => {
      const entrainements = [
        createMockEntrainement(new Date('2025-10-01'), { fc_moyenne: 145 }),
      ];

      render(<HeartRateChart entrainements={entrainements} />);

      // fc_moyenne est une Line, pas une Area
      expect(screen.getByTestId('line-fc_moyenne')).toBeInTheDocument();
    });

    it('should display fc_max', () => {
      const entrainements = [
        createMockEntrainement(new Date('2025-10-01'), { fc_max: 180 }),
      ];

      render(<HeartRateChart entrainements={entrainements} />);

      expect(screen.getByTestId('area-fc_max')).toBeInTheDocument();
    });

    it('should display fc_min', () => {
      const entrainements = [
        createMockEntrainement(new Date('2025-10-01'), { fc_min: 115 }),
      ];

      render(<HeartRateChart entrainements={entrainements} />);

      expect(screen.getByTestId('area-fc_min')).toBeInTheDocument();
    });

    it('should handle missing fc values', () => {
      const entrainements = [
        createMockEntrainement(new Date('2025-10-01'), {
          fc_moyenne: 140,
          fc_max: undefined,
          fc_min: undefined,
        }),
      ];

      render(<HeartRateChart entrainements={entrainements} />);

      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });

    it('should filter entrainements without any HR data', () => {
      const entrainements = [
        createMockEntrainement(new Date('2025-10-01'), { fc_moyenne: 140 }),
        createMockEntrainement(new Date('2025-10-05'), {
          fc_moyenne: undefined,
          fc_max: undefined,
          fc_min: undefined,
        }),
      ];

      render(<HeartRateChart entrainements={entrainements} />);

      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });
  });

  describe('Data Formatting', () => {
    it('should handle zero HR values', () => {
      const entrainements = [
        createMockEntrainement(new Date('2025-10-01'), {
          fc_moyenne: 0,
          fc_max: 0,
          fc_min: 0,
        }),
      ];

      render(<HeartRateChart entrainements={entrainements} />);

      // Valeurs à 0 sont considérées comme "no data"
      expect(screen.getByText(/aucune donnée fc disponible/i)).toBeInTheDocument();
    });

    it('should handle negative HR values (edge case)', () => {
      const entrainements = [
        createMockEntrainement(new Date('2025-10-01'), {
          fc_moyenne: -1,
          fc_max: -1,
          fc_min: -1,
        }),
      ];

      render(<HeartRateChart entrainements={entrainements} />);

      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });

    it('should handle very high HR values', () => {
      const entrainements = [
        createMockEntrainement(new Date('2025-10-01'), {
          fc_moyenne: 200,
          fc_max: 220,
          fc_min: 180,
        }),
      ];

      render(<HeartRateChart entrainements={entrainements} />);

      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });
  });

  describe('Multiple Entrainements', () => {
    it('should render multiple data points', () => {
      const entrainements = Array.from({ length: 10 }, (_, i) =>
        createMockEntrainement(
          new Date(`2025-10-${String(i + 1).padStart(2, '0')}`),
          {
            fc_moyenne: 140 + i * 2,
          },
        ),
      );

      render(<HeartRateChart entrainements={entrainements} />);

      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });

    it('should handle large dataset', () => {
      const entrainements = Array.from({ length: 50 }, (_, i) =>
        createMockEntrainement(
          new Date(Date.now() - i * 24 * 60 * 60 * 1000),
          {
            fc_moyenne: 130 + (i % 20),
          },
        ),
      );

      render(<HeartRateChart entrainements={entrainements} />);

      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });
  });

  describe('Component Responsiveness', () => {
    it('should render ResponsiveContainer', () => {
      const entrainements = [createMockEntrainement(new Date('2025-10-01'))];

      render(<HeartRateChart entrainements={entrainements} />);

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    it('should include grid and axes', () => {
      const entrainements = [createMockEntrainement(new Date('2025-10-01'))];

      render(<HeartRateChart entrainements={entrainements} />);

      expect(screen.getByTestId('x-axis')).toBeInTheDocument();
      expect(screen.getByTestId('y-axis')).toBeInTheDocument();
      expect(screen.getByTestId('grid')).toBeInTheDocument();
    });

    it('should include tooltip', () => {
      const entrainements = [createMockEntrainement(new Date('2025-10-01'))];

      render(<HeartRateChart entrainements={entrainements} />);

      expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    });
  });
});

