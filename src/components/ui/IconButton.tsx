import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ElementType;
  label: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      icon: Icon,
      label,
      variant = 'primary',
      size = 'md',
      className,
      ...props
    },
    ref,
  ) => {
    const variants = {
      primary: 'bg-primary hover:bg-primary/80 text-white',
      secondary: 'bg-gray-700 hover:bg-gray-600 text-gray-100',
      danger: 'bg-red-600 hover:bg-red-700 text-white',
      ghost: 'hover:bg-gray-800 text-gray-400 hover:text-gray-100',
    };

    const sizes = {
      sm: 'p-1.5',
      md: 'p-2',
      lg: 'p-3',
    };

    const iconSizes = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
    };

    return (
      <button
        ref={ref}
        aria-label={label}
        title={label}
        className={cn(
          'rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-gray-900',
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      >
        <Icon className={iconSizes[size]} aria-hidden="true" />
      </button>
    );
  },
);

IconButton.displayName = 'IconButton';
