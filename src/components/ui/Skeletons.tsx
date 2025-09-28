'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

// Skeleton de base
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse bg-white/10 rounded-md', className)}
      {...props}
    />
  );
}

// Skeleton pour cartes
export function CardSkeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'glass-effect p-4 rounded-lg border border-white/10',
        className,
      )}
    >
      <div className="space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="space-y-2">
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-2 w-4/5" />
        </div>
      </div>
    </div>
  );
}

// Skeleton pour graphiques
export function ChartSkeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'glass-effect p-4 rounded-lg border border-white/10',
        className,
      )}
    >
      <div className="space-y-4">
        <Skeleton className="h-4 w-1/3" />
        <div className="h-48 bg-white/5 rounded flex items-center justify-center">
          <div className="text-white/40 text-sm">
            Chargement du graphique...
          </div>
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}

// Skeleton pour tableaux
export function TableSkeleton({
  rows = 5,
  cols = 4,
  className,
}: SkeletonProps & { rows?: number; cols?: number }) {
  return (
    <div
      className={cn(
        'glass-effect rounded-lg border border-white/10 overflow-hidden',
        className,
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={`header-${i}`} className="h-4 w-20" />
          ))}
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-white/10">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className="p-4">
            <div
              className="grid gap-4"
              style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
            >
              {Array.from({ length: cols }).map((_, colIndex) => (
                <Skeleton
                  key={`cell-${rowIndex}-${colIndex}`}
                  className={cn(
                    'h-3',
                    colIndex === 0 ? 'w-24' : 'w-16', // Première colonne plus large
                  )}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Skeleton pour listes
export function ListSkeleton({
  items = 6,
  className,
}: SkeletonProps & { items?: number }) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: items }).map((_, index) => (
        <div
          key={index}
          className="glass-effect p-4 rounded-lg border border-white/10"
        >
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-8 w-20 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Skeleton pour page complète
export function PageSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={`stat-${i}`} />
        ))}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <div className="space-y-4">
          <Skeleton className="h-6 w-1/4" />
          <ListSkeleton items={4} />
        </div>
      </div>
    </div>
  );
}

// Skeleton pour modal
export function ModalSkeleton({ className }: SkeletonProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className={cn(
          'glass-effect p-6 rounded-xl border border-white/10 max-w-2xl w-full',
          className,
        )}
      >
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-6 w-6 rounded-full" />
          </div>

          {/* Content */}
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          {/* Form fields */}
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={`field-${i}`} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Skeleton className="h-10 w-20 rounded-md" />
            <Skeleton className="h-10 w-24 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Skeleton pour formulaires
export function FormSkeleton({
  fields = 4,
  className,
}: SkeletonProps & { fields?: number }) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      ))}

      <div className="flex justify-end space-x-3 pt-4">
        <Skeleton className="h-10 w-20 rounded-md" />
        <Skeleton className="h-10 w-28 rounded-md" />
      </div>
    </div>
  );
}

// Skeleton pour navigation/menu
export function NavSkeleton({
  items = 5,
  className,
}: SkeletonProps & { items?: number }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center space-x-3 p-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}

// Skeleton pour profil utilisateur
export function ProfileSkeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'glass-effect p-6 rounded-lg border border-white/10',
        className,
      )}
    >
      <div className="flex items-center space-x-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="text-center space-y-2">
            <Skeleton className="h-8 w-16 mx-auto" />
            <Skeleton className="h-3 w-20 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
