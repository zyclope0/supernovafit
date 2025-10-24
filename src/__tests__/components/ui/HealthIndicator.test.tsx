import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import HealthIndicator from '@/components/ui/HealthIndicator';

// Mock du composant dynamique SparklineChart
vi.mock('next/dynamic', () => ({
  default: vi.fn(() => {
    const MockSparklineChart = ({ data, color, width, height }: any) => (
      <div data-testid="sparkline-chart" style={{ width, height, color }}>
        Sparkline: {data?.length || 0} points
      </div>
    );
    return MockSparklineChart;
  }),
}));

describe('HealthIndicator', () => {
  const defaultProps = {
    value: 22.5,
    unit: 'kg/m²',
    label: 'IMC',
    type: 'imc' as const,
  };

  it('should render basic health indicator', () => {
    render(<HealthIndicator {...defaultProps} />);

    expect(screen.getByText('IMC')).toBeInTheDocument();
    expect(screen.getByText('22.5')).toBeInTheDocument();
    expect(screen.getByText('kg/m²')).toBeInTheDocument();
    expect(screen.getByText('Normal')).toBeInTheDocument();
  });

  it('should display correct health zone for IMC', () => {
    const { rerender } = render(<HealthIndicator {...defaultProps} value={17} />);
    expect(screen.getByText('Sous-poids')).toBeInTheDocument();

    rerender(<HealthIndicator {...defaultProps} value={22} />);
    expect(screen.getByText('Normal')).toBeInTheDocument();

    rerender(<HealthIndicator {...defaultProps} value={27} />);
    expect(screen.getByText('Surpoids')).toBeInTheDocument();

    rerender(<HealthIndicator {...defaultProps} value={32} />);
    expect(screen.getByText('Obésité')).toBeInTheDocument();
  });

  it('should display correct health zone for body fat', () => {
    const bodyFatProps = { ...defaultProps, type: 'bodyfat' as const, unit: '%' };

    const { rerender } = render(<HealthIndicator {...bodyFatProps} value={8} />);
    expect(screen.getByText('Très bas')).toBeInTheDocument();

    rerender(<HealthIndicator {...bodyFatProps} value={15} />);
    expect(screen.getByText('Athlétique')).toBeInTheDocument();

    rerender(<HealthIndicator {...bodyFatProps} value={22} />);
    expect(screen.getByText('Normal')).toBeInTheDocument();

    rerender(<HealthIndicator {...bodyFatProps} value={28} />);
    expect(screen.getByText('Élevé')).toBeInTheDocument();

    rerender(<HealthIndicator {...bodyFatProps} value={35} />);
    expect(screen.getByText('Très élevé')).toBeInTheDocument();
  });

  it('should display correct health zone for muscle', () => {
    const muscleProps = { ...defaultProps, type: 'muscle' as const, unit: 'kg' };

    const { rerender } = render(<HealthIndicator {...muscleProps} value={3} />);
    expect(screen.getByText('Débutant')).toBeInTheDocument();

    rerender(<HealthIndicator {...muscleProps} value={10} />);
    expect(screen.getByText('Régulier')).toBeInTheDocument();

    rerender(<HealthIndicator {...muscleProps} value={20} />);
    expect(screen.getByText('Actif')).toBeInTheDocument();

    rerender(<HealthIndicator {...muscleProps} value={35} />);
    expect(screen.getByText('Expert')).toBeInTheDocument();
  });

  it('should display trend indicators', () => {
    const { rerender } = render(<HealthIndicator {...defaultProps} trend="up" />);
    expect(screen.getByTitle('Tendance: up')).toBeInTheDocument();

    rerender(<HealthIndicator {...defaultProps} trend="down" />);
    expect(screen.getByTitle('Tendance: down')).toBeInTheDocument();

    rerender(<HealthIndicator {...defaultProps} trend="stable" />);
    expect(screen.getByTitle('Tendance: stable')).toBeInTheDocument();
  });

  it('should display target range when provided', () => {
    const target = { min: 18.5, max: 24.9 };
    render(<HealthIndicator {...defaultProps} target={target} />);

    expect(screen.getByText('Fourchette: 18.5-24.9kg/m²')).toBeInTheDocument();
  });

  it('should render sparkline chart when history is provided', () => {
    const history = [20, 21, 22, 21.5, 22.5];
    render(<HealthIndicator {...defaultProps} history={history} />);

    expect(screen.getByTestId('sparkline-chart')).toBeInTheDocument();
    expect(screen.getByText('Sparkline: 5 points')).toBeInTheDocument();
  });

  it('should not render sparkline with insufficient history', () => {
    const history = [22.5];
    render(<HealthIndicator {...defaultProps} history={history} />);

    expect(screen.queryByTestId('sparkline-chart')).not.toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <HealthIndicator {...defaultProps} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should format values correctly', () => {
    const { rerender } = render(<HealthIndicator {...defaultProps} value={22.567} />);
    expect(screen.getByText('22.6')).toBeInTheDocument(); // IMC with 1 decimal

    rerender(<HealthIndicator {...defaultProps} type="weight" value={75.8} />);
    expect(screen.getByText('76')).toBeInTheDocument(); // Weight with 0 decimals
  });

  it('should have proper accessibility attributes', () => {
    render(<HealthIndicator {...defaultProps} />);

    const region = screen.getByRole('region');
    expect(region).toHaveAttribute('aria-labelledby', 'health-imc-label');
    expect(region).toHaveAttribute('aria-describedby', 'health-imc-value health-imc-zone');

    expect(screen.getByText('kg/m²')).toHaveAttribute('aria-label', 'unité: kg/m²');
  });

  it('should handle weight type correctly', () => {
    render(<HealthIndicator {...defaultProps} type="weight" value={75} unit="kg" />);
    
    expect(screen.getByText('75')).toBeInTheDocument();
    expect(screen.getByText('kg')).toBeInTheDocument();
  });
});
