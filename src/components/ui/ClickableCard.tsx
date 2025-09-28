'use client';

import React from 'react';
import { Eye, Edit, Trash2 } from 'lucide-react';

interface ClickableCardProps {
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  viewLabel?: string;
  children: React.ReactNode;
  className?: string;
  showActions?: boolean;
}

export default function ClickableCard({
  onView,
  onEdit,
  onDelete,
  viewLabel = 'Voir détails',
  children,
  className = '',
  showActions = true,
}: ClickableCardProps) {
  return (
    <div
      className={`glass-effect p-4 rounded-lg border border-white/10 hover:glow-cyan transition-all group ${className}`}
    >
      {/* Zone cliquable pour voir les détails */}
      <div
        onClick={onView}
        className="cursor-pointer"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onView();
          }
        }}
        aria-label={`${viewLabel}`}
      >
        <div className="relative">
          {children}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Eye className="h-4 w-4 text-neon-cyan" />
          </div>
        </div>
      </div>

      {/* Actions (conditionnelles selon showActions) */}
      {showActions && (
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
          <button
            onClick={onView}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-neon-cyan hover:text-neon-cyan/80 transition-colors"
            title={viewLabel}
          >
            <Eye className="h-4 w-4" />
            {viewLabel}
          </button>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-2 text-muted-foreground hover:text-neon-cyan transition-colors"
              title="Modifier"
              aria-label="Modifier"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-2 text-muted-foreground hover:text-red-400 transition-colors"
              title="Supprimer"
              aria-label="Supprimer"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
