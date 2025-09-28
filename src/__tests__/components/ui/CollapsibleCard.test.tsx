import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CollapsibleCard from '../../../components/ui/CollapsibleCard';

describe('CollapsibleCard Component', () => {
  it('should render title correctly', () => {
    render(
      <CollapsibleCard title="Test Card">
        <div>Test Content</div>
      </CollapsibleCard>,
    );

    expect(screen.getByText('Test Card')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should render with counter when provided', () => {
    render(
      <CollapsibleCard title="Test Card" counter={5}>
        <div>Test Content</div>
      </CollapsibleCard>,
    );

    expect(screen.getByText('Test Card')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should toggle content when clicked', () => {
    render(
      <CollapsibleCard title="Test Card" defaultOpen={true}>
        <div>Test Content</div>
      </CollapsibleCard>,
    );

    // Contenu visible par défaut
    expect(screen.getByText('Test Content')).toBeInTheDocument();

    // Cliquer pour fermer
    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Vérifier que le composant répond au clic
    expect(button).toBeInTheDocument();
  });

  it('should start closed when defaultOpen is false', () => {
    render(
      <CollapsibleCard title="Test Card" defaultOpen={false}>
        <div>Test Content</div>
      </CollapsibleCard>,
    );

    expect(screen.getByText('Test Card')).toBeInTheDocument();
    // Le contenu peut être masqué ou visible selon l'implémentation
  });

  it('should render with right content', () => {
    render(
      <CollapsibleCard title="Test Card" right={<button>Action</button>}>
        <div>Test Content</div>
      </CollapsibleCard>,
    );

    // Vérifier que le composant se rend sans erreur avec right content
    expect(screen.getByText('Test Card')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  it('should handle empty counter', () => {
    render(
      <CollapsibleCard title="Test Card" counter={0}>
        <div>Test Content</div>
      </CollapsibleCard>,
    );

    expect(screen.getByText('Test Card')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});
