'use client';

import React from 'react';
import { AlertTriangle, Clock, Settings, Code, Lightbulb } from 'lucide-react';

interface FeatureNotImplementedProps {
  title: string;
  description?: string;
  category?: 'backend' | 'frontend' | 'database' | 'integration' | 'design';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  estimatedTime?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export default function FeatureNotImplemented({
  title,
  description,
  category = 'frontend',
  priority = 'medium',
  estimatedTime,
  icon,
  children,
  className = '',
}: FeatureNotImplementedProps) {
  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'backend':
        return <Settings className="w-4 h-4" />;
      case 'frontend':
        return <Code className="w-4 h-4" />;
      case 'database':
        return <Settings className="w-4 h-4" />;
      case 'integration':
        return <Settings className="w-4 h-4" />;
      case 'design':
        return <Lightbulb className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'backend':
        return 'Backend';
      case 'frontend':
        return 'Frontend';
      case 'database':
        return 'Base de données';
      case 'integration':
        return 'Intégration';
      case 'design':
        return 'Design';
      default:
        return 'Développement';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'border-red-500/50 bg-red-500/10 text-red-400';
      case 'high':
        return 'border-orange-500/50 bg-orange-500/10 text-orange-400';
      case 'medium':
        return 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400';
      case 'low':
        return 'border-blue-500/50 bg-blue-500/10 text-blue-400';
      default:
        return 'border-gray-500/50 bg-gray-500/10 text-gray-400';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'Critique';
      case 'high':
        return 'Haute';
      case 'medium':
        return 'Moyenne';
      case 'low':
        return 'Basse';
      default:
        return 'Normale';
    }
  };

  return (
    <div
      className={`glass-effect rounded-xl p-4 border border-white/10 ${className}`}
    >
      {/* Header avec icône et statut */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            {icon || <AlertTriangle className="w-4 h-4 text-yellow-400" />}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">{title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(priority)}`}
              >
                {getCategoryIcon(category)}
                {getCategoryLabel(category)}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(priority)}`}
              >
                <Clock className="w-3 h-3" />
                {getPriorityLabel(priority)}
              </span>
            </div>
          </div>
        </div>

        {estimatedTime && (
          <div className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded">
            {estimatedTime}
          </div>
        )}
      </div>

      {/* Description */}
      {description && (
        <p className="text-sm text-gray-300 mb-3">{description}</p>
      )}

      {/* Contenu personnalisé */}
      {children && <div className="mb-3">{children}</div>}

      {/* Footer avec informations techniques */}
      <div className="pt-3 border-t border-white/10">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>🚧 Fonctionnalité en développement</span>
          <span>📋 À implémenter</span>
        </div>
      </div>
    </div>
  );
}

// Composant spécialisé pour les métriques non implémentées
export function MetricNotImplemented({
  label,
  value,
  unit,
  description,
  category = 'frontend',
  priority = 'medium',
  estimatedTime,
}: {
  label: string;
  value: string;
  unit: string;
  description?: string;
  category?: 'backend' | 'frontend' | 'database' | 'integration' | 'design';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  estimatedTime?: string;
}) {
  return (
    <FeatureNotImplemented
      title={`${label} - Données simulées`}
      description={
        description ||
        `Les données de ${label.toLowerCase()} sont actuellement simulées et nécessitent une implémentation réelle.`
      }
      category={category}
      priority={priority}
      estimatedTime={estimatedTime}
    >
      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
        <span className="text-white font-medium">{label}</span>
        <span className="text-lg font-bold text-yellow-400">
          {value} {unit}
        </span>
      </div>
    </FeatureNotImplemented>
  );
}

// Composant pour les actions non implémentées
export function ActionNotImplemented({
  label,
  description,
  category = 'frontend',
  priority = 'medium',
  estimatedTime,
  onClick,
}: {
  label: string;
  description?: string;
  category?: 'backend' | 'frontend' | 'database' | 'integration' | 'design';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  estimatedTime?: string;
  onClick?: () => void;
}) {
  return (
    <FeatureNotImplemented
      title={`${label} - Action non implémentée`}
      description={
        description ||
        `L'action "${label.toLowerCase()}" n'est pas encore fonctionnelle.`
      }
      category={category}
      priority={priority}
      estimatedTime={estimatedTime}
    >
      <button
        onClick={onClick}
        disabled
        className="w-full p-3 bg-white/5 hover:bg-white/10 rounded-lg text-white font-medium opacity-50 cursor-not-allowed transition-colors"
      >
        {label}
      </button>
    </FeatureNotImplemented>
  );
}
