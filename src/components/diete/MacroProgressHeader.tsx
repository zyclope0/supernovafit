'use client'

import React from 'react'
import { Flame, Zap, Wheat, Droplets, TrendingUp } from 'lucide-react'

interface MacroData {
  current: number
  target: number
  unit: string
}

interface MacroProgressHeaderProps {
  calories: MacroData
  proteins: MacroData
  carbs: MacroData
  fats: MacroData
  period: 'today' | 'week'
  onPeriodChange: (period: 'today' | 'week') => void
  smartAdvice?: string
}

interface MacroItemProps {
  icon: React.ReactNode
  label: string
  current: number
  target: number
  unit: string
  color: string
}

function MacroItem({ icon, label, current, target, unit, color }: MacroItemProps) {
  const percentage = Math.min((current / target) * 100, 100)
  const remaining = Math.max(target - current, 0)
  const isComplete = current >= target
  
  return (
    <div className="flex items-center gap-4">
      <div className={`flex items-center gap-2 min-w-[120px] text-${color}-400`}>
        {icon}
        <span className="text-sm font-medium text-white">{label}</span>
      </div>
      
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-white">
            <span className="font-semibold">{current}</span>
            <span className="text-gray-400">/{target}{unit}</span>
          </span>
          <span className={`text-xs px-2 py-1 rounded-full ${
            isComplete 
              ? 'bg-green-500/20 text-green-400' 
              : 'bg-gray-500/20 text-gray-400'
          }`}>
            {Math.round(percentage)}%
          </span>
        </div>
        
        <div className="w-full bg-space-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 bg-gradient-to-r ${
              color === 'red' ? 'from-red-500 to-red-400' :
              color === 'blue' ? 'from-blue-500 to-blue-400' :
              color === 'yellow' ? 'from-yellow-500 to-yellow-400' :
              'from-green-500 to-green-400'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        {remaining > 0 && (
          <p className="text-xs text-gray-400 mt-1">
            reste {remaining}{unit}
          </p>
        )}
      </div>
    </div>
  )
}

export default function MacroProgressHeader({
  calories,
  proteins,
  carbs,
  fats,
  period,
  onPeriodChange,
  smartAdvice
}: MacroProgressHeaderProps) {
  
  // Génère un conseil intelligent basé sur les macros
  const generateSmartAdvice = () => {
    if (smartAdvice) return smartAdvice
    
    const caloriesPercent = (calories.current / calories.target) * 100
    const proteinsPercent = (proteins.current / proteins.target) * 100
    const carbsPercent = (carbs.current / carbs.target) * 100
    
    if (proteinsPercent < 30 && caloriesPercent < 50) {
      return "Ajoute une collation riche en protéines (yaourt grec, œufs)"
    }
    if (carbsPercent < 25 && caloriesPercent > 40) {
      return "Privilégie les glucides complexes pour ton prochain repas"
    }
    if (caloriesPercent > 80) {
      return "Excellent ! Tu es sur la bonne voie pour atteindre tes objectifs"
    }
    if (caloriesPercent < 20) {
      return "N'oublie pas de prendre un petit-déjeuner nutritif pour bien commencer"
    }
    
    return "Continue comme ça ! Pense à équilibrer tes macronutriments"
  }
  
  return (
    <div className="glass-effect rounded-xl p-6 border border-white/10">
      {/* Header avec toggle période */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-neon-green" />
          <h2 className="text-lg font-semibold text-white">
            📊 MACROS {period === 'today' ? "AUJOURD'HUI" : "CETTE SEMAINE"}
          </h2>
        </div>
        
        <div className="flex bg-space-800 rounded-lg p-1">
          <button
            onClick={() => onPeriodChange('today')}
            className={`px-3 py-1.5 text-sm rounded-md transition-all ${
              period === 'today'
                ? 'bg-neon-purple text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Aujourd&apos;hui
          </button>
          <button
            onClick={() => onPeriodChange('week')}
            className={`px-3 py-1.5 text-sm rounded-md transition-all ${
              period === 'week'
                ? 'bg-neon-purple text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Semaine
          </button>
        </div>
      </div>

      {/* Macros avec barres de progression */}
      <div className="space-y-4">
        <MacroItem
          icon={<Flame className="h-4 w-4" />}
          label="Calories"
          current={calories.current}
          target={calories.target}
          unit={calories.unit}
          color="red"
        />
        
        <MacroItem
          icon={<Zap className="h-4 w-4" />}
          label="Protéines"
          current={proteins.current}
          target={proteins.target}
          unit={proteins.unit}
          color="blue"
        />
        
        <MacroItem
          icon={<Wheat className="h-4 w-4" />}
          label="Glucides"
          current={carbs.current}
          target={carbs.target}
          unit={carbs.unit}
          color="yellow"
        />
        
        <MacroItem
          icon={<Droplets className="h-4 w-4" />}
          label="Lipides"
          current={fats.current}
          target={fats.target}
          unit={fats.unit}
          color="green"
        />
      </div>

      {/* Conseil intelligent */}
      <div className="mt-6 p-4 bg-neon-purple/10 border border-neon-purple/20 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-neon-purple/20 rounded-full flex items-center justify-center">
            💡
          </div>
          <div>
            <p className="text-sm font-medium text-neon-purple mb-1">
              Conseil nutrition
            </p>
            <p className="text-sm text-gray-300">
              {generateSmartAdvice()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
