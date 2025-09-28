/**
 * Composant ExportButton réutilisable pour SuperNovaFit
 * Suit les patterns UI du projet avec thème espace/néon
 */

import React from 'react';
import { Download, Loader2 } from 'lucide-react';

interface ExportButtonProps {
  onClick: () => Promise<void> | void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  children: React.ReactNode;
}

export function ExportButton({
  onClick,
  loading = false,
  children,
  disabled,
  variant = 'default',
  size = 'default',
  className = '',
  ...props
}: ExportButtonProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleClick = async () => {
    if (loading || isLoading) return;

    setIsLoading(true);
    try {
      await onClick();
    } finally {
      setIsLoading(false);
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'outline':
        return 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50';
      case 'secondary':
        return 'bg-gray-100 text-gray-900 hover:bg-gray-200';
      default:
        return 'bg-blue-600 text-white hover:bg-blue-700';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'lg':
        return 'px-6 py-3 text-base';
      default:
        return 'px-4 py-2 text-sm';
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || loading || isLoading}
      className={`
        inline-flex items-center justify-center rounded-lg font-medium transition-all
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${className}
      `}
      {...props}
    >
      {isLoading || loading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Download className="h-4 w-4 mr-2" />
      )}
      {children}
    </button>
  );
}
