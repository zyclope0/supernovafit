import React from 'react'
import { cn } from '@/lib/utils'

interface AccessibleFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode
  onSubmit: (e: React.FormEvent) => void
  error?: string
  success?: string
  loading?: boolean
}

interface AccessibleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  helperText?: string
  required?: boolean
}

interface AccessibleSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  options: { value: string; label: string }[]
  error?: string
  helperText?: string
  required?: boolean
}

interface AccessibleTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
  helperText?: string
  required?: boolean
}

export const AccessibleForm: React.FC<AccessibleFormProps> = ({
  children,
  onSubmit,
  error,
  success,
  loading = false,
  className,
  ...props
}) => {
  return (
    <form
      onSubmit={onSubmit}
      className={cn('space-y-6 form-accessible', className)}
      noValidate
      {...props}
    >
      {error && (
        <div
          className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-300"
          role="alert"
          aria-live="polite"
        >
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}
      
      {success && (
        <div
          className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-300"
          role="alert"
          aria-live="polite"
        >
          <p className="text-sm font-medium">{success}</p>
        </div>
      )}
      
      <div className="space-y-4">
        {children}
      </div>
      
      {loading && (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-neon-cyan" role="status" aria-label="Chargement en cours">
            <span className="sr-only">Chargement en cours...</span>
          </div>
        </div>
      )}
    </form>
  )
}

export const AccessibleInput = React.forwardRef<HTMLInputElement, AccessibleInputProps>(
  ({ label, error, helperText, required = false, id, className, ...props }, ref) => {
    const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`
    const errorId = error ? `${inputId}-error` : undefined
    const helperId = helperText ? `${inputId}-helper` : undefined
    const describedBy = [errorId, helperId].filter(Boolean).join(' ')

    return (
      <div className="space-y-2">
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-accessible"
        >
          {label}
          {required && <span className="text-red-400 ml-1" aria-label="requis">*</span>}
        </label>
        
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50',
            'focus-accessible',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/50',
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedBy || undefined}
          required={required}
          {...props}
        />
        
        {helperText && (
          <p id={helperId} className="text-xs text-accessible-secondary">
            {helperText}
          </p>
        )}
        
        {error && (
          <p id={errorId} className="text-xs text-red-400" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  }
)

AccessibleInput.displayName = 'AccessibleInput'

export const AccessibleSelect = React.forwardRef<HTMLSelectElement, AccessibleSelectProps>(
  ({ label, options, error, helperText, required = false, id, className, ...props }, ref) => {
    const selectId = id || `select-${label.toLowerCase().replace(/\s+/g, '-')}`
    const errorId = error ? `${selectId}-error` : undefined
    const helperId = helperText ? `${selectId}-helper` : undefined
    const describedBy = [errorId, helperId].filter(Boolean).join(' ')

    return (
      <div className="space-y-2">
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-accessible"
        >
          {label}
          {required && <span className="text-red-400 ml-1" aria-label="requis">*</span>}
        </label>
        
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white',
            'focus-accessible',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/50',
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedBy || undefined}
          required={required}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-space-800 text-white">
              {option.label}
            </option>
          ))}
        </select>
        
        {helperText && (
          <p id={helperId} className="text-xs text-accessible-secondary">
            {helperText}
          </p>
        )}
        
        {error && (
          <p id={errorId} className="text-xs text-red-400" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  }
)

AccessibleSelect.displayName = 'AccessibleSelect'

export const AccessibleTextarea = React.forwardRef<HTMLTextAreaElement, AccessibleTextareaProps>(
  ({ label, error, helperText, required = false, id, className, ...props }, ref) => {
    const textareaId = id || `textarea-${label.toLowerCase().replace(/\s+/g, '-')}`
    const errorId = error ? `${textareaId}-error` : undefined
    const helperId = helperText ? `${textareaId}-helper` : undefined
    const describedBy = [errorId, helperId].filter(Boolean).join(' ')

    return (
      <div className="space-y-2">
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium text-accessible"
        >
          {label}
          {required && <span className="text-red-400 ml-1" aria-label="requis">*</span>}
        </label>
        
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50',
            'focus-accessible',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'resize-vertical min-h-[100px]',
            error && 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/50',
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedBy || undefined}
          required={required}
          {...props}
        />
        
        {helperText && (
          <p id={helperId} className="text-xs text-accessible-secondary">
            {helperText}
          </p>
        )}
        
        {error && (
          <p id={errorId} className="text-xs text-red-400" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  }
)

AccessibleTextarea.displayName = 'AccessibleTextarea'
