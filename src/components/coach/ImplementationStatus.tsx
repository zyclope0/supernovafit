'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  Code,
  Database,
  TrendingUp,
  Target,
  Lightbulb,
} from 'lucide-react';
import FeatureNotImplemented from '@/components/ui/FeatureNotImplemented';

interface ImplementationStatus {
  realDataAvailable: boolean;
  realDataPercentage: number;
  simulatedFeatures: string[];
  missingFeatures: string[];
  recommendations: string[];
}

interface ImplementationStatusProps {
  status: ImplementationStatus;
  className?: string;
}

export default function ImplementationStatus({
  status,
  className = '',
}: ImplementationStatusProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = (percentage: number) => {
    if (percentage >= 80)
      return 'text-green-400 bg-green-500/10 border-green-500/20';
    if (percentage >= 60)
      return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    if (percentage >= 40)
      return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
    return 'text-red-400 bg-red-500/10 border-red-500/20';
  };

  const getStatusIcon = (percentage: number) => {
    if (percentage >= 80) return <CheckCircle className="w-5 h-5" />;
    if (percentage >= 60) return <TrendingUp className="w-5 h-5" />;
    if (percentage >= 40) return <Clock className="w-5 h-5" />;
    return <AlertTriangle className="w-5 h-5" />;
  };

  const getStatusLabel = (percentage: number) => {
    if (percentage >= 80) return 'Excellent';
    if (percentage >= 60) return 'Bon';
    if (percentage >= 40) return 'En développement';
    return 'En cours';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header du statut */}
      <div className="glass-effect rounded-xl p-4 border border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg border ${getStatusColor(status.realDataPercentage)}`}
            >
              {getStatusIcon(status.realDataPercentage)}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                Statut d&apos;Implémentation
              </h3>
              <p className="text-sm text-gray-400">
                {status.realDataPercentage}% de données réelles •{' '}
                {getStatusLabel(status.realDataPercentage)}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <Settings
              className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        {/* Barre de progression */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
            <span>Progression</span>
            <span>{status.realDataPercentage}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                status.realDataPercentage >= 80
                  ? 'bg-green-500'
                  : status.realDataPercentage >= 60
                    ? 'bg-yellow-500'
                    : status.realDataPercentage >= 40
                      ? 'bg-orange-500'
                      : 'bg-red-500'
              }`}
              style={{ width: `${status.realDataPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Contenu détaillé (expandable) */}
      {isExpanded && (
        <div className="space-y-4">
          {/* Fonctionnalités simulées */}
          {status.simulatedFeatures.length > 0 && (
            <div className="glass-effect rounded-xl p-4 border border-yellow-500/20">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <h4 className="text-lg font-semibold text-white">
                  Fonctionnalités Simulées
                </h4>
                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                  {status.simulatedFeatures.length}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {status.simulatedFeatures.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-white/5 rounded-lg"
                  >
                    <Code className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fonctionnalités manquantes */}
          {status.missingFeatures.length > 0 && (
            <div className="glass-effect rounded-xl p-4 border border-red-500/20">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-red-400" />
                <h4 className="text-lg font-semibold text-white">
                  Fonctionnalités Manquantes
                </h4>
                <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                  {status.missingFeatures.length}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {status.missingFeatures.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-white/5 rounded-lg"
                  >
                    <Settings className="w-4 h-4 text-red-400" />
                    <span className="text-sm text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommandations */}
          {status.recommendations.length > 0 && (
            <div className="glass-effect rounded-xl p-4 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-5 h-5 text-blue-400" />
                <h4 className="text-lg font-semibold text-white">
                  Recommandations
                </h4>
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                  {status.recommendations.length}
                </span>
              </div>
              <div className="space-y-2">
                {status.recommendations.map((recommendation, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-2 bg-white/5 rounded-lg"
                  >
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm text-gray-300">
                      {recommendation}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Métriques de qualité */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-effect rounded-xl p-4 border border-white/10 text-center">
              <Database className="w-8 h-8 text-neon-cyan mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {status.realDataPercentage}%
              </div>
              <div className="text-sm text-gray-400">Données Réelles</div>
            </div>

            <div className="glass-effect rounded-xl p-4 border border-white/10 text-center">
              <Code className="w-8 h-8 text-neon-yellow mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {status.simulatedFeatures.length}
              </div>
              <div className="text-sm text-gray-400">Simulées</div>
            </div>

            <div className="glass-effect rounded-xl p-4 border border-white/10 text-center">
              <Target className="w-8 h-8 text-neon-red mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {status.missingFeatures.length}
              </div>
              <div className="text-sm text-gray-400">Manquantes</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Composant pour afficher des métriques avec statut d'implémentation
export function MetricWithStatus({
  label,
  value,
  unit,
  dataSource,
  category = 'frontend',
  priority = 'medium',
  estimatedTime,
  className = '',
}: {
  label: string;
  value: number | string;
  unit: string;
  dataSource: 'real' | 'simulated';
  category?: 'backend' | 'frontend' | 'database' | 'integration' | 'design';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  estimatedTime?: string;
  className?: string;
}) {
  const isReal = dataSource === 'real';

  return (
    <div
      className={`glass-effect rounded-xl p-4 border border-white/10 ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-white">{label}</h4>
        {!isReal && (
          <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
            <AlertTriangle className="w-3 h-3" />
            Simulé
          </div>
        )}
      </div>

      <div className="text-2xl font-bold text-white mb-1">
        {typeof value === 'number' ? value.toLocaleString() : value} {unit}
      </div>

      {!isReal && (
        <FeatureNotImplemented
          title={`${label} - Données simulées`}
          description={`Les données de ${label.toLowerCase()} sont actuellement simulées.`}
          category={category}
          priority={priority}
          estimatedTime={estimatedTime}
          className="mt-2"
        />
      )}
    </div>
  );
}
