'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import ClickableCard from './ClickableCard';

interface DietCardClickableProps {
  title: string;
  emoji: string;
  time: string;
  items: Array<{
    name: string;
    quantity: string;
    calories?: number;
  }>;
  totalCalories?: number;
  macros?: {
    protein: number;
    carbs: number;
    fat: number;
  };
  isEmpty?: boolean;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onAdd?: () => void;
  className?: string;
}

export default function DietCardClickable({
  title,
  emoji,
  time,
  items,
  totalCalories,
  macros,
  isEmpty = false,
  onView,
  onEdit,
  onDelete,
  onAdd,
  className = '',
}: DietCardClickableProps) {
  const handleAdd = () => {
    if (onAdd) onAdd();
  };

  const handleView = () => {
    if (onView) onView();
  };

  const handleEdit = () => {
    if (onEdit) onEdit();
  };

  const handleDelete = () => {
    if (onDelete) onDelete();
  };

  if (isEmpty) {
    return (
      <div
        className={`glass-effect p-4 rounded-xl border border-dashed border-white/20 hover:border-neon-purple/50 transition-all duration-200 ${className}`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{emoji}</span>
            <div>
              <h3 className="font-semibold text-white">{title}</h3>
              <p className="text-sm text-gray-400">{time}</p>
            </div>
          </div>
        </div>

        <div className="text-center py-6">
          <div className="text-gray-400 mb-3">
            <Plus className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Aucun aliment ajouté</p>
          </div>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-neon-purple/20 text-neon-purple rounded-lg hover:bg-neon-purple/30 transition-colors text-sm font-medium"
          >
            Ajouter des aliments
          </button>
        </div>
      </div>
    );
  }

  return (
    <ClickableCard
      onView={handleView}
      onEdit={handleEdit}
      onDelete={handleDelete}
      viewLabel="Voir détails"
      className={className}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{emoji}</span>
          <div>
            <h3 className="font-semibold text-white">{title}</h3>
            <p className="text-sm text-gray-400">{time}</p>
          </div>
        </div>
        {totalCalories && (
          <div className="text-right">
            <div className="text-lg font-bold text-neon-green">
              {Math.round(totalCalories)}
            </div>
            <div className="text-xs text-gray-400">kcal</div>
          </div>
        )}
      </div>

      {/* Liste des aliments */}
      <div className="space-y-2 mb-3">
        {items.slice(0, 3).map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-white truncate flex-1">{item.name}</span>
            <span className="text-gray-400 ml-2">{item.quantity}</span>
            {item.calories && (
              <span className="text-neon-green ml-2">
                {Math.round(item.calories)} kcal
              </span>
            )}
          </div>
        ))}
        {items.length > 3 && (
          <div className="text-xs text-gray-400 text-center">
            +{items.length - 3} autre{items.length - 3 > 1 ? 's' : ''} aliment
            {items.length - 3 > 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Macros si disponibles */}
      {macros && (
        <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10">
          <div className="flex items-center gap-4">
            <span className="text-neon-cyan">
              P: {Math.round(macros.protein)}g
            </span>
            <span className="text-neon-yellow">
              G: {Math.round(macros.carbs)}g
            </span>
            <span className="text-neon-pink">L: {Math.round(macros.fat)}g</span>
          </div>
        </div>
      )}
    </ClickableCard>
  );
}
