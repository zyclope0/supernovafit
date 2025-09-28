'use client';

import React from 'react';

// Émojis pour les niveaux 1-10
const LEVEL_EMOJIS = {
  1: '😞',
  2: '😔',
  3: '😐',
  4: '🙂',
  5: '😊',
  6: '😄',
  7: '😁',
  8: '🤩',
  9: '😍',
  10: '🚀',
};

interface CompactSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  color?: string;
  icon: React.ComponentType<{ className?: string }>;
  min?: number;
  max?: number;
}

export default function CompactSlider({
  label,
  value,
  onChange,
  color = 'neon-green',
  icon: Icon,
  min = 1,
  max = 10,
}: CompactSliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-neon-cyan" />
          <span className="text-sm font-medium text-white">{label}</span>
        </div>
        <span className="text-sm text-neon-cyan font-bold">
          {value}/{max}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">{min}</span>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className={`flex-1 h-2 bg-space-700 rounded-lg appearance-none cursor-pointer slider-${color}`}
        />
        <span className="text-xs text-muted-foreground">{max}</span>
      </div>
      <div className="text-center">
        <span className="text-lg">
          {LEVEL_EMOJIS[value as keyof typeof LEVEL_EMOJIS] || '😐'}
        </span>
      </div>
    </div>
  );
}
