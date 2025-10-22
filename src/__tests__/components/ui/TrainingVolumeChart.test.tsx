import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import TrainingVolumeChart from '@/components/ui/TrainingVolumeChart';
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
  ComposedChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="composed-chart">{children}</div>
  ),
  Bar: ({ dataKey }: { dataKey: string }) => (
    <div data-testid={`bar-${dataKey}`}>{dataKey}</div>
  ),
  Line: ({ dataKey }: { dataKey: string }) => (
    <div data-testid={`line-${dataKey}`}>{dataKey}</div>
  ),
  XAxis: () => <div data-testid="x-axis">XAxis</div>,
  YAxis: () => <div data-testid="y-axis">YAxis</div>,
  CartesianGrid: () => <div data-testid="grid">Grid</div>,
  Tooltip: () => <div data-testid="tooltip">Tooltip</div>,
  Legend: () => <div data-testid="legend">Legend</div>,
  ReferenceLine: () => <div data-testid="reference-line">ReferenceLine</div>,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}));

// Mock date-fns
vi.mock('date-fns', () => ({
  format: (date: Date, formatStr: string) => {
    if (formatStr === "'S'w") return 'S42';
    if (formatStr === 'dd/MM') return '21/10';
    return date.toISOString();
  },
  subWeeks: (date: Date, weeks: number) =>
    new Date(date.getTime() - weeks * 7 * 24 * 60 * 60 * 1000),
  startOfWeek: (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  },
  endOfWeek: (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() + (day === 0 ? 0 : 7 - day);
    return new Date(d.setDate(diff));
  },
}));

vi.mock('date-fns/locale', () => ({
  fr: {},
}));

describe('TrainingVolumeChart', () => {
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
    created_at: Timestamp.now(),
    ...overrides,
  });

  describe('Rendering', () => {
    it('should render with valid data for 4 weeks', () => {
      const entrainements = [
        createMockEntrainement(new Date('2025-10-01')),
        createMockEntrainement(new Date('2025-10-08')),
        createMockEntrainement(new Date('2025-10-15')),
      ];

      render(
        <TrainingVolumeChart entrainements={entrainements} weeks={4} />,
      );

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
      expect(screen.getByTestId('composed-chart')).toBeInTheDocument();
    });

    it('should render with 8 weeks parameter', () => {
      const entrainements = [createMockEntrainement(new Date('2025-10-01'))];

      render(
        <TrainingVolumeChart entrainements={entrainements} weeks={8} />,
      );

      expect(screen.getByText(/8 semaines/i)).toBeInTheDocument();
    });

    it('should render with 12 weeks parameter', () => {
      const entrainements = [createMockEntrainement(new Date('2025-10-01'))];

      render(
        <TrainingVolumeChart entrainements={entrainements} weeks={12} />,
      );

      expect(screen.getByText(/12 semaines/i)).toBeInTheDocument();
    });

    it('should render with empty entrainements array', () => {
      render(<TrainingVolumeChart entrainements={[]} weeks={4} />);

      expect(screen.getByTestId('composed-chart')).toBeInTheDocument();
    });

    it('should display chart title', () => {
      const entrainements = [createMockEntrainement(new Date('2025-10-01'))];

      render(
        <TrainingVolumeChart entrainements={entrainements} weeks={4} />,
      );

      expect(screen.getByText(/volume d'entraînement/i)).toBeInTheDocument();
    });
  });

  describe('Date Handling', () => {
    it('should convert Timestamp to ISO string correctly', () => {
      const date = new Date('2025-10-21');
      date.setHours(12, 0, 0, 0);

      const entrainements = [createMockEntrainement(date)];

      render(
        <TrainingVolumeChart entrainements={entrainements} weeks={4} />,
      );

      expect(screen.getByTestId('composed-chart')).toBeInTheDocument();
    });

    it('should filter out entrainements without date', () => {
      const entrainements = [
        createMockEntrainement(new Date('2025-10-01')),
        { ...createMockEntrainement(new Date('2025-10-08')), date: null } as any,
      ];

      render(
        <TrainingVolumeChart entrainements={entrainements} weeks={4} />,
      );

      expect(screen.getByTestId('composed-chart')).toBeInTheDocument();
    });

    it('should handle invalid date values gracefully', () => {
      const invalidDate = new Date('invalid');
      const entrainements = [
        createMockEntrainement(new Date('2025-10-01')),
        createMockEntrainement(invalidDate),
      ];

      render(
        <TrainingVolumeChart entrainements={entrainements} weeks={4} />,
      );

      expect(screen.getByTestId('composed-chart')).toBeInTheDocument();
    });

    it('should group entrainements by week correctly', () => {
      const entrainements = [
        createMockEntrainement(new Date('2025-10-01')),
        createMockEntrainement(new Date('2025-10-02')),
        createMockEntrainement(new Date('2025-10-08')),
      ];

      const { container } = render(
        <TrainingVolumeChart entrainements={entrainements} weeks={4} />,
      );

      expect(container).toBeInTheDocument();
    });
  });

  describe('Data Aggregation', () => {
    it('should calculate total duration per week', () => {
      const entrainements = [
        createMockEntrainement(new Date('2025-10-01'), { duree: 30 }),
        createMockEntrainement(new Date('2025-10-02'), { duree: 45 }),
      ];

      const { container } = render(
        <TrainingVolumeChart entrainements={entrainements} weeks={4} />,
      );

      expect(container).toBeInTheDocument();
    });

    it('should calculate total calories per week', () => {
      const entrainements = [
        createMockEntrainement(new Date('2025-10-01'), { calories: 300 }),
        createMockEntrainement(new Date('2025-10-02'), { calories: 450 }),
      ];

      const { container } = render(
        <TrainingVolumeChart entrainements={entrainements} weeks={4} />,
      );

      expect(container).toBeInTheDocument();
    });

    it('should handle missing calories values', () => {
      const entrainements = [
        createMockEntrainement(new Date('2025-10-01'), {
          calories: undefined,
        }),
        createMockEntrainement(new Date('2025-10-02'), { calories: 400 }),
      ];

      const { container } = render(
        <TrainingVolumeChart entrainements={entrainements} weeks={4} />,
      );

      expect(container).toBeInTheDocument();
    });

    it('should count number of sessions per week', () => {
      const entrainements = [
        createMockEntrainement(new Date('2025-10-01')),
        createMockEntrainement(new Date('2025-10-02')),
        createMockEntrainement(new Date('2025-10-03')),
      ];

      const { container } = render(
        <TrainingVolumeChart entrainements={entrainements} weeks={4} />,
      );

      expect(container).toBeInTheDocument();
    });
  });

  describe('Chart Components', () => {
    it('should render bars for seances', () => {
      const entrainements = [createMockEntrainement(new Date('2025-10-01'))];

      render(
        <TrainingVolumeChart entrainements={entrainements} weeks={4} />,
      );

      expect(screen.getByTestId('bar-seances')).toBeInTheDocument();
    });

    it('should render line for duree', () => {
      const entrainements = [createMockEntrainement(new Date('2025-10-01'))];

      render(
        <TrainingVolumeChart entrainements={entrainements} weeks={4} />,
      );

      expect(screen.getByTestId('line-duree')).toBeInTheDocument();
    });

    it('should include grid', () => {
      const entrainements = [createMockEntrainement(new Date('2025-10-01'))];

      render(
        <TrainingVolumeChart entrainements={entrainements} weeks={4} />,
      );

      expect(screen.getByTestId('grid')).toBeInTheDocument();
    });

    it('should include tooltip', () => {
      const entrainements = [createMockEntrainement(new Date('2025-10-01'))];

      render(
        <TrainingVolumeChart entrainements={entrainements} weeks={4} />,
      );

      expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    });

    it('should include legend', () => {
      const entrainements = [createMockEntrainement(new Date('2025-10-01'))];

      render(
        <TrainingVolumeChart entrainements={entrainements} weeks={4} />,
      );

      expect(screen.getByTestId('legend')).toBeInTheDocument();
    });

    it('should include reference line for average', () => {
      const entrainements = [createMockEntrainement(new Date('2025-10-01'))];

      render(
        <TrainingVolumeChart entrainements={entrainements} weeks={4} />,
      );

      expect(screen.getByTestId('reference-line')).toBeInTheDocument();
    });
  });

  describe('Multiple Weeks', () => {
    it('should handle 1 week parameter', () => {
      const entrainements = [createMockEntrainement(new Date('2025-10-01'))];

      render(
        <TrainingVolumeChart entrainements={entrainements} weeks={1} />,
      );

      expect(screen.getByText(/1 semaine/i)).toBeInTheDocument();
    });

    it('should handle large week parameter (24 weeks)', () => {
      const entrainements = Array.from({ length: 50 }, (_, i) =>
        createMockEntrainement(
          new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000),
        ),
      );

      render(
        <TrainingVolumeChart entrainements={entrainements} weeks={24} />,
      );

      expect(screen.getByText(/24 semaines/i)).toBeInTheDocument();
    });

    it('should show all weeks even with no data', () => {
      render(<TrainingVolumeChart entrainements={[]} weeks={4} />);

      expect(screen.getByTestId('composed-chart')).toBeInTheDocument();
    });
  });

  describe('Component Responsiveness', () => {
    it('should render ResponsiveContainer', () => {
      const entrainements = [createMockEntrainement(new Date('2025-10-01'))];

      render(
        <TrainingVolumeChart entrainements={entrainements} weeks={4} />,
      );

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    it('should include axes', () => {
      const entrainements = [createMockEntrainement(new Date('2025-10-01'))];

      render(
        <TrainingVolumeChart entrainements={entrainements} weeks={4} />,
      );

      expect(screen.getAllByTestId('x-axis').length).toBeGreaterThan(0);
      expect(screen.getAllByTestId('y-axis').length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero duration entrainements', () => {
      const entrainements = [
        createMockEntrainement(new Date('2025-10-01'), { duree: 0 }),
      ];

      render(
        <TrainingVolumeChart entrainements={entrainements} weeks={4} />,
      );

      expect(screen.getByTestId('composed-chart')).toBeInTheDocument();
    });

    it('should handle very high values', () => {
      const entrainements = [
        createMockEntrainement(new Date('2025-10-01'), {
          duree: 180,
          calories: 1500,
        }),
      ];

      render(
        <TrainingVolumeChart entrainements={entrainements} weeks={4} />,
      );

      expect(screen.getByTestId('composed-chart')).toBeInTheDocument();
    });

    it('should handle entrainements from different weeks', () => {
      const entrainements = [
        createMockEntrainement(new Date('2025-09-01')),
        createMockEntrainement(new Date('2025-09-15')),
        createMockEntrainement(new Date('2025-10-01')),
        createMockEntrainement(new Date('2025-10-15')),
      ];

      render(
        <TrainingVolumeChart entrainements={entrainements} weeks={8} />,
      );

      expect(screen.getByTestId('composed-chart')).toBeInTheDocument();
    });

    it('should handle future dates (should not display)', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      const entrainements = [
        createMockEntrainement(new Date('2025-10-01')),
        createMockEntrainement(futureDate),
      ];

      render(
        <TrainingVolumeChart entrainements={entrainements} weeks={4} />,
      );

      expect(screen.getByTestId('composed-chart')).toBeInTheDocument();
    });
  });
});

