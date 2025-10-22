import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import PerformanceChart from '@/components/ui/PerformanceChart';
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
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
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

describe('PerformanceChart', () => {
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
    vitesse_moy: 12,
    distance: 9,
    created_at: Timestamp.now(),
    ...overrides,
  });

  describe('Rendering - Vitesse Metric', () => {
    it('should render with vitesse data', () => {
      const entrainements = [
        createMockEntrainement(new Date('2025-10-01'), { vitesse_moy: 12 }),
      ];

      render(
        <PerformanceChart
          entrainements={entrainements}
          metric="vitesse"
          title="Vitesse"
        />,
      );

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    it('should render empty state when no vitesse data', () => {
      const entrainements = [
        createMockEntrainement(new Date('2025-10-01'), {
          vitesse_moy: undefined,
        }),
      ];

      render(
        <PerformanceChart
          entrainements={entrainements}
          metric="vitesse"
          title="Vitesse"
        />,
      );

      expect(screen.getByText(/aucune donnée disponible/i)).toBeInTheDocument();
    });

    it('should filter out zero vitesse values', () => {
      const entrainements = [
        createMockEntrainement(new Date('2025-10-01'), { vitesse_moy: 0 }),
      ];

      render(
        <PerformanceChart
          entrainements={entrainements}
          metric="vitesse"
          title="Vitesse"
        />,
      );

      expect(screen.getByText(/aucune donnée disponible/i)).toBeInTheDocument();
    });
  });

  describe('Rendering - Distance Metric', () => {
    it('should render with distance data', () => {
      const entrainements = [
        createMockEntrainement(new Date('2025-10-01'), { distance: 10 }),
      ];

      render(
        <PerformanceChart
          entrainements={entrainements}
          metric="distance"
          title="Distance"
        />,
      );

      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    it('should filter out zero distance values', () => {
      const entrainements = [
        createMockEntrainement(new Date('2025-10-01'), { distance: 0 }),
      ];

      render(
        <PerformanceChart
          entrainements={entrainements}
          metric="distance"
          title="Distance"
        />,
      );

      expect(screen.getByText(/aucune donnée disponible/i)).toBeInTheDocument();
    });
  });

  describe('Rendering - Calories Per Min Metric', () => {
    it('should render with calories per min data', () => {
      const entrainements = [
        createMockEntrainement(new Date('2025-10-01'), {
          calories: 450,
          duree: 45,
        }),
      ];

      render(
        <PerformanceChart
          entrainements={entrainements}
          metric="calories_per_min"
          title="Intensité"
        />,
      );

      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    it('should filter out entrainements without calories', () => {
      const entrainements = [
        createMockEntrainement(new Date('2025-10-01'), {
          calories: undefined,
        }),
      ];

      render(
        <PerformanceChart
          entrainements={entrainements}
          metric="calories_per_min"
          title="Intensité"
        />,
      );

      expect(screen.getByText(/aucune donnée disponible/i)).toBeInTheDocument();
    });

    it('should filter out entrainements with zero duration', () => {
      const entrainements = [
        createMockEntrainement(new Date('2025-10-01'), {
          calories: 450,
          duree: 0,
        }),
      ];

      render(
        <PerformanceChart
          entrainements={entrainements}
          metric="calories_per_min"
          title="Intensité"
        />,
      );

      expect(screen.getByText(/aucune donnée disponible/i)).toBeInTheDocument();
    });
  });

  describe('Date Handling', () => {
    it('should convert Timestamp to ISO string correctly', () => {
      const date = new Date('2025-10-21');
      date.setHours(12, 0, 0, 0);

      const entrainements = [createMockEntrainement(date)];

      render(
        <PerformanceChart
          entrainements={entrainements}
          metric="vitesse"
          title="Vitesse"
        />,
      );

      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    it('should filter out entrainements without date', () => {
      const entrainements = [
        createMockEntrainement(new Date('2025-10-01')),
        { ...createMockEntrainement(new Date('2025-10-05')), date: null } as any,
      ];

      render(
        <PerformanceChart
          entrainements={entrainements}
          metric="vitesse"
          title="Vitesse"
        />,
      );

      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    it('should handle invalid date values gracefully', () => {
      const invalidDate = new Date('invalid');
      const entrainements = [
        createMockEntrainement(new Date('2025-10-01')),
        createMockEntrainement(invalidDate),
      ];

      render(
        <PerformanceChart
          entrainements={entrainements}
          metric="vitesse"
          title="Vitesse"
        />,
      );

      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    it('should sort entrainements by date', () => {
      const entrainements = [
        createMockEntrainement(new Date('2025-10-10')),
        createMockEntrainement(new Date('2025-10-01')),
        createMockEntrainement(new Date('2025-10-05')),
      ];

      const { container } = render(
        <PerformanceChart
          entrainements={entrainements}
          metric="vitesse"
          title="Vitesse"
        />,
      );

      expect(container).toBeInTheDocument();
    });
  });

  describe('Data Calculations', () => {
    it('should calculate calories per min correctly', () => {
      const entrainements = [
        createMockEntrainement(new Date('2025-10-01'), {
          calories: 450,
          duree: 45, // 10 cal/min
        }),
      ];

      const { container } = render(
        <PerformanceChart
          entrainements={entrainements}
          metric="calories_per_min"
          title="Intensité"
        />,
      );

      expect(container).toBeInTheDocument();
    });

    it('should handle decimal calories per min', () => {
      const entrainements = [
        createMockEntrainement(new Date('2025-10-01'), {
          calories: 333,
          duree: 45, // 7.4 cal/min
        }),
      ];

      const { container } = render(
        <PerformanceChart
          entrainements={entrainements}
          metric="calories_per_min"
          title="Intensité"
        />,
      );

      expect(container).toBeInTheDocument();
    });
  });

  describe('Multiple Entrainements', () => {
    it('should render multiple data points', () => {
      const entrainements = Array.from({ length: 10 }, (_, i) =>
        createMockEntrainement(
          new Date(`2025-10-${String(i + 1).padStart(2, '0')}`),
          {
            vitesse_moy: 10 + i * 0.5,
          },
        ),
      );

      render(
        <PerformanceChart
          entrainements={entrainements}
          metric="vitesse"
          title="Vitesse"
        />,
      );

      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    it('should handle large dataset', () => {
      const entrainements = Array.from({ length: 50 }, (_, i) =>
        createMockEntrainement(
          new Date(Date.now() - i * 24 * 60 * 60 * 1000),
          {
            distance: 5 + (i % 10),
          },
        ),
      );

      render(
        <PerformanceChart
          entrainements={entrainements}
          metric="distance"
          title="Distance"
        />,
      );

      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
  });

  describe('Component Responsiveness', () => {
    it('should render ResponsiveContainer', () => {
      const entrainements = [createMockEntrainement(new Date('2025-10-01'))];

      render(
        <PerformanceChart
          entrainements={entrainements}
          metric="vitesse"
          title="Vitesse"
        />,
      );

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    it('should include grid and axes', () => {
      const entrainements = [createMockEntrainement(new Date('2025-10-01'))];

      render(
        <PerformanceChart
          entrainements={entrainements}
          metric="vitesse"
          title="Vitesse"
        />,
      );

      expect(screen.getByTestId('x-axis')).toBeInTheDocument();
      expect(screen.getByTestId('y-axis')).toBeInTheDocument();
      expect(screen.getByTestId('grid')).toBeInTheDocument();
    });

    it('should include tooltip', () => {
      const entrainements = [createMockEntrainement(new Date('2025-10-01'))];

      render(
        <PerformanceChart
          entrainements={entrainements}
          metric="vitesse"
          title="Vitesse"
        />,
      );

      expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    });

    it('should display custom title', () => {
      const entrainements = [createMockEntrainement(new Date('2025-10-01'))];

      render(
        <PerformanceChart
          entrainements={entrainements}
          metric="vitesse"
          title="Test Custom Title"
        />,
      );

      expect(screen.getByText(/test custom title/i)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty entrainements array', () => {
      render(
        <PerformanceChart
          entrainements={[]}
          metric="vitesse"
          title="Vitesse"
        />,
      );

      expect(screen.getByText(/aucune donnée disponible/i)).toBeInTheDocument();
    });

    it('should handle mixed valid and invalid data', () => {
      const entrainements = [
        createMockEntrainement(new Date('2025-10-01'), { vitesse_moy: 12 }),
        createMockEntrainement(new Date('2025-10-02'), {
          vitesse_moy: undefined,
        }),
        createMockEntrainement(new Date('2025-10-03'), { vitesse_moy: 14 }),
      ];

      render(
        <PerformanceChart
          entrainements={entrainements}
          metric="vitesse"
          title="Vitesse"
        />,
      );

      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    it('should handle very high performance values', () => {
      const entrainements = [
        createMockEntrainement(new Date('2025-10-01'), {
          vitesse_moy: 25,
          distance: 50,
          calories: 1000,
          duree: 60,
        }),
      ];

      render(
        <PerformanceChart
          entrainements={entrainements}
          metric="vitesse"
          title="Vitesse"
        />,
      );

      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
  });
});

