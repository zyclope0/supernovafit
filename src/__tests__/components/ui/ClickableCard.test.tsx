import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
// import userEvent from '@testing-library/user-event';
import ClickableCard from '@/components/ui/ClickableCard';

// Mock Lucide React
vi.mock('lucide-react', () => ({
  Eye: ({ className }: { className?: string }) => (
    <div data-testid="eye-icon" className={className}>
      Eye
    </div>
  ),
  Edit: ({ className }: { className?: string }) => (
    <div data-testid="edit-icon" className={className}>
      Edit
    </div>
  ),
  Trash2: ({ className }: { className?: string }) => (
    <div data-testid="trash-icon" className={className}>
      Trash2
    </div>
  ),
}));

describe('ClickableCard', () => {
  const mockOnView = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  const defaultProps = {
    onView: mockOnView,
    onEdit: mockOnEdit,
    onDelete: mockOnDelete,
    children: <div>Card Content</div>,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render card with content', () => {
    render(<ClickableCard {...defaultProps} />);

    expect(screen.getByText('Card Content')).toBeInTheDocument();
    expect(screen.getByText('Voir détails')).toBeInTheDocument();
  });

  it('should call onView when main area is clicked', async () => {
    render(<ClickableCard {...defaultProps} />);

    const clickableArea = screen.getByRole('button', { name: 'Voir détails' });
    fireEvent.click(clickableArea);

    expect(mockOnView).toHaveBeenCalledTimes(1);
  });

  it('should call onView when Enter key is pressed', () => {
    render(<ClickableCard {...defaultProps} />);

    const clickableArea = screen.getByRole('button', { name: 'Voir détails' });
    fireEvent.keyDown(clickableArea, { key: 'Enter' });

    expect(mockOnView).toHaveBeenCalledTimes(1);
  });

  it('should call onView when Space key is pressed', () => {
    render(<ClickableCard {...defaultProps} />);

    const clickableArea = screen.getByRole('button', { name: 'Voir détails' });
    fireEvent.keyDown(clickableArea, { key: ' ' });

    expect(mockOnView).toHaveBeenCalledTimes(1);
  });

  it('should not call onView for other keys', () => {
    render(<ClickableCard {...defaultProps} />);

    const clickableArea = screen.getByRole('button', { name: 'Voir détails' });
    fireEvent.keyDown(clickableArea, { key: 'Escape' });

    expect(mockOnView).not.toHaveBeenCalled();
  });

  it('should call onEdit when edit button is clicked', async () => {
    render(<ClickableCard {...defaultProps} />);

    const editButton = screen.getByLabelText('Modifier');
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledTimes(1);
  });

  it('should call onDelete when delete button is clicked', async () => {
    render(<ClickableCard {...defaultProps} />);

    const deleteButton = screen.getByLabelText('Supprimer');
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledTimes(1);
  });

  it('should prevent event propagation on edit button click', async () => {
    render(<ClickableCard {...defaultProps} />);

    const editButton = screen.getByLabelText('Modifier');
    const clickEvent = new MouseEvent('click', { bubbles: true });
    const stopPropagationSpy = vi.spyOn(clickEvent, 'stopPropagation');
    
    fireEvent(editButton, clickEvent);

    expect(stopPropagationSpy).toHaveBeenCalled();
  });

  it('should prevent event propagation on delete button click', async () => {
    render(<ClickableCard {...defaultProps} />);

    const deleteButton = screen.getByLabelText('Supprimer');
    const clickEvent = new MouseEvent('click', { bubbles: true });
    const stopPropagationSpy = vi.spyOn(clickEvent, 'stopPropagation');
    
    fireEvent(deleteButton, clickEvent);

    expect(stopPropagationSpy).toHaveBeenCalled();
  });

  it('should render custom view label', () => {
    render(<ClickableCard {...defaultProps} viewLabel="Voir plus" />);

    expect(screen.getByText('Voir plus')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Voir plus' })).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <ClickableCard {...defaultProps} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should hide actions when showActions is false', () => {
    render(<ClickableCard {...defaultProps} showActions={false} />);

    expect(screen.queryByText('Voir détails')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Modifier')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Supprimer')).not.toBeInTheDocument();
  });

  it('should show hover icon on hover', () => {
    render(<ClickableCard {...defaultProps} />);

    const hoverIcons = screen.getAllByTestId('eye-icon');
    expect(hoverIcons).toHaveLength(2); // One in hover area, one in button
  });

  it('should render all action buttons with correct titles', () => {
    render(<ClickableCard {...defaultProps} />);

    expect(screen.getByTitle('Voir détails')).toBeInTheDocument();
    expect(screen.getByTitle('Modifier')).toBeInTheDocument();
    expect(screen.getByTitle('Supprimer')).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(<ClickableCard {...defaultProps} />);

    const mainButton = screen.getByRole('button', { name: 'Voir détails' });
    expect(mainButton).toHaveAttribute('tabIndex', '0');
    expect(mainButton).toHaveAttribute('aria-label', 'Voir détails');

    const editButton = screen.getByLabelText('Modifier');
    expect(editButton).toHaveAttribute('aria-label', 'Modifier');

    const deleteButton = screen.getByLabelText('Supprimer');
    expect(deleteButton).toHaveAttribute('aria-label', 'Supprimer');
  });

  it('should handle multiple clicks correctly', async () => {
    render(<ClickableCard {...defaultProps} />);

    const viewButton = screen.getByText('Voir détails');
    fireEvent.click(viewButton);
    fireEvent.click(viewButton);

    expect(mockOnView).toHaveBeenCalledTimes(2);
  });

  it('should render with complex children', () => {
    const complexChildren = (
      <div>
        <h3>Title</h3>
        <p>Description</p>
        <div>Additional content</div>
      </div>
    );

    render(
      <ClickableCard {...defaultProps}>
        {complexChildren}
      </ClickableCard>
    );

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Additional content')).toBeInTheDocument();
  });
});
