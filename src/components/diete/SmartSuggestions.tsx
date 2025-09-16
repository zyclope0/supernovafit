'use client';

import React, { useState } from 'react';
import { 
  Lightbulb, 
  Plus, 
  Info, 
  Target, 
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react';
import { 
  SmartSuggestion, 
  NutritionalData,
  generateSmartSuggestions,
  calculateNutritionalGap
} from '@/lib/nutritional-database';

interface SmartSuggestionsProps {
  currentMacros: NutritionalData;
  targetMacros: NutritionalData;
  userGoal: 'weight_loss' | 'muscle_gain' | 'maintenance';
  onAddFood: (food: SmartSuggestion) => void;
  className?: string;
}

export default function SmartSuggestions({
  currentMacros,
  targetMacros,
  userGoal,
  onAddFood,
  className = ''
}: SmartSuggestionsProps) {
  const [expandedSuggestion, setExpandedSuggestion] = useState<string | null>(null);
  const [addedSuggestions, setAddedSuggestions] = useState<Set<string>>(new Set());

  // Calculer les gaps nutritionnels
  const gap = calculateNutritionalGap(currentMacros, targetMacros);
  
  // Générer les suggestions intelligentes
  const suggestions = generateSmartSuggestions(gap, userGoal, 3);

  // Vérifier si on a des gaps significatifs
  const hasSignificantGaps = gap.calories > 100 || gap.protein > 15 || gap.carbs > 30 || gap.fat > 10;

  if (!hasSignificantGaps || suggestions.length === 0) {
    return (
      <div className={`glass-effect rounded-xl p-4 border border-white/20 ${className}`}>
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              🎯 Objectifs atteints
            </h3>
            <p className="text-xs text-white/70">
              Vos macros sont bien équilibrés aujourd&apos;hui !
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-blue-400 bg-blue-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <Target className="w-3 h-3" />;
      case 'medium': return <TrendingUp className="w-3 h-3" />;
      case 'low': return <Clock className="w-3 h-3" />;
      default: return <Info className="w-3 h-3" />;
    }
  };

  const getFoodEmoji = (category: string) => {
    switch (category) {
      case 'protein': return '🥩';
      case 'carbs': return '🍚';
      case 'fat': return '🥑';
      case 'balanced': return '🥗';
      case 'snack': return '🍎';
      default: return '🍽️';
    }
  };

  return (
    <div className={`glass-effect rounded-xl p-4 border border-white/20 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <Lightbulb className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">
            💡 Suggestions Intelligentes
          </h3>
          <p className="text-xs text-white/70">
            Pour compléter vos objectifs nutritionnels
          </p>
        </div>
      </div>

      {/* Gaps Summary */}
      <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
        <div className="text-xs text-white/60 mb-2">Gaps nutritionnels restants :</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {gap.calories > 0 && (
            <div className="flex justify-between">
              <span className="text-white/70">Calories:</span>
              <span className="text-orange-400 font-medium">{Math.round(gap.calories)} kcal</span>
            </div>
          )}
          {gap.protein > 0 && (
            <div className="flex justify-between">
              <span className="text-white/70">Protéines:</span>
              <span className="text-blue-400 font-medium">{Math.round(gap.protein)}g</span>
            </div>
          )}
          {gap.carbs > 0 && (
            <div className="flex justify-between">
              <span className="text-white/70">Glucides:</span>
              <span className="text-cyan-400 font-medium">{Math.round(gap.carbs)}g</span>
            </div>
          )}
          {gap.fat > 0 && (
            <div className="flex justify-between">
              <span className="text-white/70">Lipides:</span>
              <span className="text-purple-400 font-medium">{Math.round(gap.fat)}g</span>
            </div>
          )}
        </div>
      </div>

      {/* Suggestions */}
      <div className="space-y-3">
        {suggestions.map((suggestion) => {
          const isExpanded = expandedSuggestion === suggestion.food.id;
          const isAdded = addedSuggestions.has(suggestion.food.id);
          
          return (
            <div
              key={suggestion.food.id}
              className="bg-white/5 rounded-lg border border-white/10 overflow-hidden transition-all duration-200 hover:border-white/20"
            >
              {/* Suggestion Header */}
              <div className="p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="text-2xl">
                      {getFoodEmoji(suggestion.food.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-white truncate">
                          {suggestion.food.name}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${getPriorityColor(suggestion.priority)}`}>
                          {getPriorityIcon(suggestion.priority)}
                          {suggestion.priority === 'high' ? 'Priorité' : suggestion.priority === 'medium' ? 'Moyen' : 'Faible'}
                        </span>
                      </div>
                      <p className="text-xs text-white/70 mb-2">
                        {suggestion.quantity} • {suggestion.estimatedCalories} kcal
                      </p>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-blue-400">
                          P: {suggestion.nutritionalValue.protein}g
                        </span>
                        <span className="text-cyan-400">
                          G: {suggestion.nutritionalValue.carbs}g
                        </span>
                        <span className="text-purple-400">
                          L: {suggestion.nutritionalValue.fat}g
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setExpandedSuggestion(isExpanded ? null : suggestion.food.id)}
                      className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                      title="Voir les détails"
                    >
                      <Info className="w-4 h-4 text-white/60" />
                    </button>
                    <button
                      onClick={() => {
                        onAddFood(suggestion);
                        setAddedSuggestions(prev => new Set(Array.from(prev).concat(suggestion.food.id)));
                      }}
                      disabled={isAdded}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isAdded
                          ? 'bg-green-500/20 text-green-400 cursor-not-allowed'
                          : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                      }`}
                    >
                      {isAdded ? (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Ajouté
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <Plus className="w-3 h-3" />
                          Ajouter
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-3 pb-3 border-t border-white/10">
                  <div className="pt-3 space-y-3">
                    {/* Reason */}
                    <div>
                      <div className="text-xs text-white/60 mb-1">Pourquoi cette suggestion ?</div>
                      <p className="text-xs text-white/80">{suggestion.reason}</p>
                    </div>

                    {/* Benefits */}
                    <div>
                      <div className="text-xs text-white/60 mb-1">Bénéfices nutritionnels :</div>
                      <div className="flex flex-wrap gap-1">
                        {suggestion.food.benefits.map((benefit, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-white/10 rounded-full text-xs text-white/70"
                          >
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Detailed Nutrition */}
                    <div>
                      <div className="text-xs text-white/60 mb-2">Valeur nutritionnelle détaillée :</div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-white/70">Calories:</span>
                          <span className="text-orange-400">{suggestion.nutritionalValue.calories} kcal</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/70">Protéines:</span>
                          <span className="text-blue-400">{suggestion.nutritionalValue.protein}g</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/70">Glucides:</span>
                          <span className="text-cyan-400">{suggestion.nutritionalValue.carbs}g</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/70">Lipides:</span>
                          <span className="text-purple-400">{suggestion.nutritionalValue.fat}g</span>
                        </div>
                        {suggestion.nutritionalValue.fiber && (
                          <div className="flex justify-between">
                            <span className="text-white/70">Fibres:</span>
                            <span className="text-green-400">{suggestion.nutritionalValue.fiber}g</span>
                          </div>
                        )}
                        {suggestion.nutritionalValue.sodium && (
                          <div className="flex justify-between">
                            <span className="text-white/70">Sodium:</span>
                            <span className="text-yellow-400">{suggestion.nutritionalValue.sodium}mg</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-white/10">
        <p className="text-xs text-white/50 text-center">
          💡 Suggestions basées sur vos objectifs {userGoal === 'muscle_gain' ? 'de prise de masse' : userGoal === 'weight_loss' ? 'de perte de poids' : 'de maintien'}
        </p>
      </div>
    </div>
  );
}
