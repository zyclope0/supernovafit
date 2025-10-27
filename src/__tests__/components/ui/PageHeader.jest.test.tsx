/**
 * Tests Jest pour le composant PageHeader
 * Migration depuis Vitest pour résoudre fuite mémoire
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import PageHeader from '../../../components/ui/PageHeader';
import { Plus } from 'lucide-react';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
}));

describe('PageHeader Component', () => {
  it('should render title and description correctly', () => {
    render(<PageHeader title="Test Title" description="Test Description" />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('should render with icon when provided', () => {
    render(
      <PageHeader
        title="Test Title"
        description="Test Description"
        icon={Plus}
      />,
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('should render action button when provided', () => {
    const mockAction = jest.fn();
    render(
      <PageHeader
        title="Test Title"
        description="Test Description"
        action={{
          label: 'Test Action',
          onClick: mockAction,
          icon: Plus,
          color: 'purple',
        }}
      />,
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Action')).toBeInTheDocument();
  });

  it('should render multiple actions when provided', () => {
    const mockAction1 = jest.fn();
    const mockAction2 = jest.fn();
    render(
      <PageHeader
        title="Test Title"
        description="Test Description"
        actions={[
          { label: 'Action 1', onClick: mockAction1, color: 'purple' },
          { label: 'Action 2', onClick: mockAction2, color: 'cyan' },
        ]}
      />,
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    // Utiliser getAllByText car le composant affiche le texte pour desktop et mobile
    expect(screen.getAllByText('Action 1')).toHaveLength(2);
    expect(screen.getAllByText('Action 2')).toHaveLength(2);
  });

  it('should render custom content when provided', () => {
    render(
      <PageHeader
        title="Test Title"
        description="Test Description"
        customContent={<div>Custom Content</div>}
      />,
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Custom Content')).toBeInTheDocument();
  });

  it('should render with custom className', () => {
    render(
      <PageHeader
        title="Test Title"
        description="Test Description"
        className="custom-class"
      />,
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });
});
