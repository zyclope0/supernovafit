import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import HealthIndicator from '@/components/ui/HealthIndicator';
import StandardModal from '@/components/ui/StandardModal';
import SmartNotifications from '@/components/ui/SmartNotifications';

expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
  test('HealthIndicator should not have accessibility violations', async () => {
    const { container } = render(
      <HealthIndicator
        value={75}
        unit="kg"
        label="Poids"
        type="weight"
        target={{ min: 70, max: 80 }}
        trend="stable"
      />,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('StandardModal should not have accessibility violations', async () => {
    const { container } = render(
      <StandardModal
        isOpen={true}
        onClose={() => {}}
        title="Test Modal"
        subtitle="Test subtitle"
      >
        <p>Test content</p>
      </StandardModal>,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('SmartNotifications should not have accessibility violations', async () => {
    const { container } = render(
      <div>
        <SmartNotifications />
      </div>,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('Modal should have proper ARIA attributes', () => {
    render(
      <StandardModal
        isOpen={true}
        onClose={() => {}}
        title="Test Modal"
        subtitle="Test subtitle"
      >
        <p>Test content</p>
      </StandardModal>,
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText('Fermer')).toBeInTheDocument();
  });

  test('HealthIndicator should have proper ARIA labels', () => {
    render(
      <HealthIndicator
        value={75}
        unit="kg"
        label="Poids"
        type="weight"
        target={{ min: 70, max: 80 }}
        trend="stable"
      />,
    );

    expect(screen.getByRole('region')).toBeInTheDocument();
    expect(screen.getByText('Poids')).toBeInTheDocument();
  });
});
