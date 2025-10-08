/**
 * Tests pour le composant FormField avec accessibilité ARIA
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { FormField, TextAreaField, SelectField } from '@/components/ui/FormField';

describe('FormField Component', () => {
  it('renders with label and input', () => {
    render(
      <FormField 
        label="Test Field" 
        name="test" 
        placeholder="Enter text"
      />
    );
    
    expect(screen.getByLabelText('Test Field')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('shows required indicator', () => {
    render(
      <FormField 
        label="Required Field" 
        name="required" 
        required 
      />
    );
    
    expect(screen.getByText('*')).toBeInTheDocument();
    expect(screen.getByDisplayValue('')).toHaveAttribute('aria-required', 'true');
  });

  it('displays error message with role="alert"', () => {
    render(
      <FormField 
        label="Error Field" 
        name="error" 
        error="This field is required"
      />
    );
    
    const errorMessage = screen.getByRole('alert');
    expect(errorMessage).toHaveTextContent('This field is required');
    expect(screen.getByLabelText('Error Field')).toHaveAttribute('aria-invalid', 'true');
  });

  it('displays help text', () => {
    render(
      <FormField 
        label="Help Field" 
        name="help" 
        helpText="This is helpful information"
      />
    );
    
    expect(screen.getByText('This is helpful information')).toBeInTheDocument();
  });

  it('associates help text and error with input via aria-describedby', () => {
    render(
      <FormField 
        label="Complex Field" 
        name="complex" 
        error="Error message"
        helpText="Help text"
        required
      />
    );
    
    const input = screen.getByDisplayValue('');
    const describedBy = input.getAttribute('aria-describedby');
    
    expect(describedBy).toContain('error-complex');
    expect(describedBy).toContain('help-complex');
  });

  it('applies glass variant styling', () => {
    render(
      <FormField 
        label="Glass Field" 
        name="glass" 
        variant="glass"
      />
    );
    
    const input = screen.getByLabelText('Glass Field');
    expect(input).toHaveClass('glass-effect');
  });

  it('handles different input types', () => {
    render(
      <FormField 
        label="Email Field" 
        name="email" 
        type="email"
      />
    );
    
    expect(screen.getByLabelText('Email Field')).toHaveAttribute('type', 'email');
  });
});

describe('TextAreaField Component', () => {
  it('renders textarea with label', () => {
    render(
      <TextAreaField 
        label="Description" 
        name="description"
      />
    );
    
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Description').tagName).toBe('TEXTAREA');
  });

  it('has minimum height and resize-vertical', () => {
    render(
      <TextAreaField 
        label="Textarea" 
        name="textarea"
      />
    );
    
    const textarea = screen.getByLabelText('Textarea');
    expect(textarea).toHaveClass('min-h-[100px]', 'resize-vertical');
  });
});

describe('SelectField Component', () => {
  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
  ];

  it('renders select with options', () => {
    render(
      <SelectField 
        label="Select Field" 
        name="select"
        options={options}
      />
    );
    
    expect(screen.getByLabelText('Select Field')).toBeInTheDocument();
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('shows placeholder option', () => {
    render(
      <SelectField 
        label="Select with Placeholder" 
        name="select"
        options={options}
        placeholder="Choose an option"
      />
    );
    
    expect(screen.getByText('Choose an option')).toBeInTheDocument();
  });

  it('handles selection', () => {
    const handleChange = vi.fn();
    
    render(
      <SelectField 
        label="Select Field" 
        name="select"
        options={options}
        onChange={handleChange}
      />
    );
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'option2' } });
    
    expect(handleChange).toHaveBeenCalled();
    expect(select).toHaveValue('option2');
  });
});

describe('Accessibility Features', () => {
  it('generates unique IDs for each field', () => {
    render(
      <>
        <FormField label="Field 1" name="field1" />
        <FormField label="Field 2" name="field2" />
      </>
    );
    
    const field1 = screen.getByLabelText('Field 1');
    const field2 = screen.getByLabelText('Field 2');
    
    expect(field1).toHaveAttribute('id', 'field-field1');
    expect(field2).toHaveAttribute('id', 'field-field2');
  });

  it('associates labels with inputs correctly', () => {
    render(
      <FormField 
        label="Associated Field" 
        name="associated"
      />
    );
    
    const label = screen.getByText('Associated Field');
    const input = screen.getByLabelText('Associated Field');
    
    expect(label).toHaveAttribute('for', 'field-associated');
    expect(input).toHaveAttribute('id', 'field-associated');
  });

  it('supports screen reader announcements', () => {
    render(
      <FormField 
        label="Screen Reader Field" 
        name="screenreader"
        error="This is an error"
        helpText="This is help text"
        required
      />
    );
    
    const input = screen.getByDisplayValue('');
    
    // Screen readers will announce:
    // - "Screen Reader Field, required, invalid, This is help text, This is an error"
    expect(input).toHaveAttribute('aria-required', 'true');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby');
  });
});
