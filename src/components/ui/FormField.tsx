/**
 * Composant FormField réutilisable avec accessibilité ARIA complète
 *
 * Améliore l'accessibilité en fournissant :
 * - Labels associés aux inputs
 * - Messages d'erreur avec role="alert"
 * - Textes d'aide avec aria-describedby
 * - Indicateurs de champs requis
 * - Support complet des screen readers
 */

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface FormFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  type?:
    | 'text'
    | 'email'
    | 'password'
    | 'number'
    | 'tel'
    | 'url'
    | 'search'
    | 'date'
    | 'time'
    | 'datetime-local';
  variant?: 'default' | 'glass' | 'outline';
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  (
    {
      label,
      name,
      required = false,
      error,
      helpText,
      type = 'text',
      variant = 'default',
      className,
      ...props
    },
    ref,
  ) => {
    const fieldId = `field-${name}`;
    const errorId = `error-${name}`;
    const helpId = `help-${name}`;

    const baseClasses =
      'w-full px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-neon-purple/50';

    const variantClasses = {
      default:
        'bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-neon-purple',
      glass:
        'glass-effect border-white/20 text-white placeholder:text-white/50 focus:border-neon-purple',
      outline:
        'bg-transparent border-2 border-white/30 text-white placeholder:text-white/50 focus:border-neon-purple',
    };

    const inputClasses = cn(
      baseClasses,
      variantClasses[variant],
      error && 'border-neon-red focus:border-neon-red focus:ring-neon-red/50',
      className,
    );

    return (
      <div className="form-field space-y-2">
        <label
          htmlFor={fieldId}
          className="block text-sm font-medium text-white"
        >
          {label}
          {required && (
            <span className="text-neon-red ml-1" aria-label="requis">
              *
            </span>
          )}
        </label>

        <input
          ref={ref}
          id={fieldId}
          name={name}
          type={type}
          required={required}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={cn(error && errorId, helpText && helpId)}
          className={inputClasses}
          {...props}
        />

        {helpText && (
          <p id={helpId} className="text-sm text-white/70">
            {helpText}
          </p>
        )}

        {error && (
          <p id={errorId} role="alert" className="text-sm text-neon-red">
            {error}
          </p>
        )}
      </div>
    );
  },
);

FormField.displayName = 'FormField';

/**
 * Composant TextArea avec accessibilité ARIA complète
 */
export interface TextAreaFieldProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  name: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  variant?: 'default' | 'glass' | 'outline';
}

export const TextAreaField = forwardRef<
  HTMLTextAreaElement,
  TextAreaFieldProps
>(
  (
    {
      label,
      name,
      required = false,
      error,
      helpText,
      variant = 'default',
      className,
      ...props
    },
    ref,
  ) => {
    const fieldId = `field-${name}`;
    const errorId = `error-${name}`;
    const helpId = `help-${name}`;

    const baseClasses =
      'w-full px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-neon-purple/50 resize-vertical min-h-[100px]';

    const variantClasses = {
      default:
        'bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-neon-purple',
      glass:
        'glass-effect border-white/20 text-white placeholder:text-white/50 focus:border-neon-purple',
      outline:
        'bg-transparent border-2 border-white/30 text-white placeholder:text-white/50 focus:border-neon-purple',
    };

    const textareaClasses = cn(
      baseClasses,
      variantClasses[variant],
      error && 'border-neon-red focus:border-neon-red focus:ring-neon-red/50',
      className,
    );

    return (
      <div className="form-field space-y-2">
        <label
          htmlFor={fieldId}
          className="block text-sm font-medium text-white"
        >
          {label}
          {required && (
            <span className="text-neon-red ml-1" aria-label="requis">
              *
            </span>
          )}
        </label>

        <textarea
          ref={ref}
          id={fieldId}
          name={name}
          required={required}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={cn(error && errorId, helpText && helpId)}
          className={textareaClasses}
          {...props}
        />

        {helpText && (
          <p id={helpId} className="text-sm text-white/70">
            {helpText}
          </p>
        )}

        {error && (
          <p id={errorId} role="alert" className="text-sm text-neon-red">
            {error}
          </p>
        )}
      </div>
    );
  },
);

TextAreaField.displayName = 'TextAreaField';

/**
 * Composant Select avec accessibilité ARIA complète
 */
export interface SelectFieldProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  name: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  variant?: 'default' | 'glass' | 'outline';
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  (
    {
      label,
      name,
      required = false,
      error,
      helpText,
      options,
      placeholder,
      variant = 'default',
      className,
      ...props
    },
    ref,
  ) => {
    const fieldId = `field-${name}`;
    const errorId = `error-${name}`;
    const helpId = `help-${name}`;

    const baseClasses =
      'w-full px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-neon-purple/50';

    const variantClasses = {
      default: 'bg-white/5 border-white/20 text-white focus:border-neon-purple',
      glass: 'glass-effect border-white/20 text-white focus:border-neon-purple',
      outline:
        'bg-transparent border-2 border-white/30 text-white focus:border-neon-purple',
    };

    const selectClasses = cn(
      baseClasses,
      variantClasses[variant],
      error && 'border-neon-red focus:border-neon-red focus:ring-neon-red/50',
      className,
    );

    return (
      <div className="form-field space-y-2">
        <label
          htmlFor={fieldId}
          className="block text-sm font-medium text-white"
        >
          {label}
          {required && (
            <span className="text-neon-red ml-1" aria-label="requis">
              *
            </span>
          )}
        </label>

        <select
          ref={ref}
          id={fieldId}
          name={name}
          required={required}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={cn(error && errorId, helpText && helpId)}
          className={selectClasses}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-space-900 text-white"
            >
              {option.label}
            </option>
          ))}
        </select>

        {helpText && (
          <p id={helpId} className="text-sm text-white/70">
            {helpText}
          </p>
        )}

        {error && (
          <p id={errorId} role="alert" className="text-sm text-neon-red">
            {error}
          </p>
        )}
      </div>
    );
  },
);

SelectField.displayName = 'SelectField';
