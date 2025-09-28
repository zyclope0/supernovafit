'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SparklineChartProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  showTrend?: boolean;
  showPoints?: boolean;
  className?: string;
}

export default function SparklineChart({
  data,
  color = '#06b6d4',
  width = 120,
  height = 40,
  showTrend = true,
  showPoints = false,
  className = '',
}: SparklineChartProps) {
  if (!data || data.length < 2) {
    return (
      <div
        className={cn(
          'flex items-center justify-center text-xs text-gray-400',
          className,
        )}
        style={{ width, height }}
      >
        Pas de données
      </div>
    );
  }

  const minValue = Math.min(...data);
  const maxValue = Math.max(...data);
  const range = maxValue - minValue || 1;

  // Calculer les points du graphique
  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * (width - 4);
      const y = height - 4 - ((value - minValue) / range) * (height - 8);
      return `${x},${y}`;
    })
    .join(' ');

  // Calculer la tendance
  const trend = data.length > 1 ? data[data.length - 1] - data[0] : 0;
  const trendPercentage = data[0] !== 0 ? (trend / Math.abs(data[0])) * 100 : 0;

  const getTrendIcon = () => {
    if (Math.abs(trendPercentage) < 1) return '→';
    return trend > 0 ? '↗️' : '↘️';
  };

  const getTrendColor = () => {
    if (Math.abs(trendPercentage) < 1) return 'text-gray-400';
    return trend > 0 ? 'text-green-400' : 'text-red-400';
  };

  return (
    <div className={cn('relative', className)}>
      <svg
        width={width}
        height={height}
        className="overflow-visible"
        viewBox={`0 0 ${width} ${height}`}
      >
        {/* Ligne de tendance */}
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
          className="opacity-80"
        />

        {/* Points de données */}
        {showPoints &&
          data.map((value, index) => {
            const x = (index / (data.length - 1)) * (width - 4);
            const y = height - 4 - ((value - minValue) / range) * (height - 8);
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="2"
                fill={color}
                className="opacity-60"
              />
            );
          })}

        {/* Zone de remplissage */}
        <polygon
          fill={color}
          fillOpacity="0.1"
          points={`0,${height - 4} ${points} ${width - 4},${height - 4}`}
        />
      </svg>

      {/* Indicateur de tendance */}
      {showTrend && (
        <div className="absolute -bottom-1 -right-1 flex items-center gap-1">
          <span className={cn('text-xs font-medium', getTrendColor())}>
            {getTrendIcon()}
          </span>
          <span className={cn('text-xs', getTrendColor())}>
            {Math.abs(trendPercentage).toFixed(0)}%
          </span>
        </div>
      )}
    </div>
  );
}
