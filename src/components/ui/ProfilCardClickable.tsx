'use client';

import React from 'react';
// Composant spécialisé pour les cards de profil utilisant ClickableCard universel
import ClickableCard from './ClickableCard';

interface ProfilCardData {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle?: string;
  color: 'purple' | 'cyan' | 'green' | 'pink' | 'yellow' | 'orange' | 'red';
}

interface ProfilCardClickableProps {
  data: ProfilCardData;
  onView: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  viewLabel?: string;
  className?: string;
  showActions?: boolean;
}

export default function ProfilCardClickable({
  data,
  onView,
  onEdit,
  onDelete,
  viewLabel = 'Voir détails',
  className = '',
  showActions = true,
}: ProfilCardClickableProps) {
  return (
    <ClickableCard
      onView={onView}
      onEdit={onEdit || (() => {})}
      onDelete={onDelete || (() => {})}
      viewLabel={viewLabel}
      className={className}
      showActions={showActions}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className={`text-neon-${data.color}`}>{data.icon}</div>
        <span className="text-sm text-muted-foreground">{data.label}</span>
      </div>
      <div className="text-lg font-semibold text-white">{data.value}</div>
      {data.subtitle && (
        <div className="text-xs text-muted-foreground">{data.subtitle}</div>
      )}
    </ClickableCard>
  );
}
