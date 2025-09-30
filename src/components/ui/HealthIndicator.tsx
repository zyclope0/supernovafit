'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';

const SparklineChart = dynamic(() => import('./SparklineChart'), {
  ssr: false,
  loading: () => <div className="h-8 w-16 bg-gray-200 animate-pulse rounded" />,
});

interface HealthIndicatorProps {
  value: number;
  unit: string;
  label: string;
  type: 'imc' | 'weight' | 'bodyfat' | 'muscle';
  target?: { min: number; max: number };
  trend?: 'up' | 'down' | 'stable';
  history?: number[]; // Données historiques pour le sparkline
  className?: string;
}

const getHealthZone = (type: string, value: number) => {
  switch (type) {
    case 'imc':
      if (value < 18.5)
        return {
          zone: 'Sous-poids',
          color: 'blue',
          icon: '⚠️',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/30',
        };
      if (value < 25)
        return {
          zone: 'Normal',
          color: 'green',
          icon: '✅',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/30',
        };
      if (value < 30)
        return {
          zone: 'Surpoids',
          color: 'yellow',
          icon: '⚠️',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/30',
        };
      return {
        zone: 'Obésité',
        color: 'red',
        icon: '🚨',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/30',
      };

    case 'bodyfat':
      if (value < 10)
        return {
          zone: 'Très bas',
          color: 'blue',
          icon: '⚠️',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/30',
        };
      if (value < 20)
        return {
          zone: 'Athlétique',
          color: 'green',
          icon: '💪',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/30',
        };
      if (value < 25)
        return {
          zone: 'Normal',
          color: 'green',
          icon: '✅',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/30',
        };
      if (value < 30)
        return {
          zone: 'Élevé',
          color: 'yellow',
          icon: '⚠️',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/30',
        };
      return {
        zone: 'Très élevé',
        color: 'red',
        icon: '🚨',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/30',
      };

    case 'muscle':
      if (value < 5)
        return {
          zone: 'Débutant',
          color: 'blue',
          icon: '🌱',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/30',
        };
      if (value < 15)
        return {
          zone: 'Régulier',
          color: 'green',
          icon: '📈',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/30',
        };
      if (value < 30)
        return {
          zone: 'Actif',
          color: 'green',
          icon: '💪',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/30',
        };
      return {
        zone: 'Expert',
        color: 'purple',
        icon: '🏆',
        bgColor: 'bg-purple-500/10',
        borderColor: 'border-purple-500/30',
      };

    default:
      return {
        zone: '',
        color: 'gray',
        icon: '',
        bgColor: 'bg-gray-500/10',
        borderColor: 'border-gray-500/30',
      };
  }
};

const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
  switch (trend) {
    case 'up':
      return '📈';
    case 'down':
      return '📉';
    case 'stable':
      return '➡️';
    default:
      return '';
  }
};

export default function HealthIndicator({
  value,
  unit,
  label,
  type,
  target,
  trend,
  history,
  className = '',
}: HealthIndicatorProps) {
  const healthZone = getHealthZone(type, value);
  const trendIcon = getTrendIcon(trend);

  return (
    <div
      className={cn(
        'glass-effect p-4 rounded-lg border transition-all duration-300 hover:scale-105',
        healthZone.bgColor,
        healthZone.borderColor,
        className,
      )}
      role="region"
      aria-labelledby={`health-${type}-label`}
      aria-describedby={`health-${type}-value health-${type}-zone`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden="true">
            {healthZone.icon}
          </span>
          <span
            id={`health-${type}-label`}
            className="text-sm font-medium text-white"
          >
            {label}
          </span>
        </div>
        {trendIcon && (
          <span
            className="text-sm"
            title={`Tendance: ${trend}`}
            aria-label={`Tendance: ${trend}`}
          >
            {trendIcon}
          </span>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex items-baseline gap-2">
          <span
            id={`health-${type}-value`}
            className="text-2xl font-bold text-white"
          >
            {value.toFixed(type === 'imc' ? 1 : 0)}
          </span>
          <span className="text-sm text-gray-400" aria-label={`unité: ${unit}`}>
            {unit}
          </span>
        </div>

        {healthZone.zone && (
          <div className="flex items-center gap-2">
            <span
              id={`health-${type}-zone`}
              className="text-xs px-2 py-1 rounded-full bg-white/10 text-white"
            >
              {healthZone.zone}
            </span>
          </div>
        )}

        {target && (
          <div className="text-xs text-gray-400 mb-2">
            Fourchette: {target.min}-{target.max}
            {unit}
          </div>
        )}

        {/* Sparkline chart pour les tendances */}
        {history && history.length > 1 && (
          <div className="mt-3">
            <SparklineChart
              data={history}
              color={
                healthZone.color === 'green'
                  ? '#10b981'
                  : healthZone.color === 'yellow'
                    ? '#eab308'
                    : healthZone.color === 'red'
                      ? '#ef4444'
                      : '#06b6d4'
              }
              width={100}
              height={30}
              showTrend={false}
              showPoints={false}
            />
          </div>
        )}
      </div>
    </div>
  );
}
