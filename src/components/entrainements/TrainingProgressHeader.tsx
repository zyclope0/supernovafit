'use client'

import React from 'react'
import { Activity, Clock, Flame, Target, TrendingUp } from 'lucide-react'

interface TrainingData {
  current: number
  target: number
  unit: string
}

interface TrainingProgressHeaderProps {
  sessions: TrainingData
  duration: TrainingData
  calories: TrainingData
  intensity: TrainingData
  period: 'today' | 'week' | 'month'
  onPeriodChange: (period: 'today' | 'week' | 'month') => void
  smartAdvice?: string
}

interface TrainingItemProps {
  icon: React.ReactNode
  label: string
  current: number
  target: number
  unit: string
  color: string
}

function TrainingItem({ icon, label, current, target, unit, color }: TrainingItemProps) {
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
              color === 'orange' ? 'from-orange-500 to-orange-400' :
              color === 'blue' ? 'from-blue-500 to-blue-400' :
              color === 'red' ? 'from-red-500 to-red-400' :
              'from-purple-500 to-purple-400'
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

export default function TrainingProgressHeader({
  sessions,
  duration,
  calories,
  intensity,
  period,
  onPeriodChange,
  smartAdvice
}: TrainingProgressHeaderProps) {
  
  // Génère un conseil intelligent basé sur les données d'entraînement
  const generateSmartAdvice = () => {
    if (smartAdvice) return smartAdvice
    
    const sessionsPercent = (sessions.current / sessions.target) * 100
    const durationPercent = (duration.current / duration.target) * 100
    const caloriesPercent = (calories.current / calories.target) * 100
    
    if (sessionsPercent < 30 && period === 'week') {
      return "Planifie 2-3 séances cette semaine pour maintenir ta progression"
    }
    if (durationPercent < 50 && sessionsPercent > 70) {
      return "Augmente légèrement la durée de tes séances pour optimiser les bénéfices"
    }
    if (caloriesPercent > 120) {
      return "Excellente dépense énergétique ! Pense à bien récupérer"
    }
    if (sessionsPercent > 80 && durationPercent > 80) {
      return "Performance exceptionnelle ! Tu es sur la bonne voie"
    }
    if (sessionsPercent < 20) {
      return "Commence par une séance courte aujourd'hui pour relancer ta motivation"
    }
    
    return "Continue tes efforts ! La régularité est la clé du progrès"
  }
  
  return (
    <div className="glass-effect rounded-xl p-6 border border-white/10">
      {/* Header avec toggle période */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-neon-orange" />
          <h2 className="text-lg font-semibold text-white">
            🏋️ PERFORMANCE {period === 'today' ? "AUJOURD'HUI" : period === 'week' ? "CETTE SEMAINE" : "CE MOIS"}
          </h2>
        </div>
        
        <div className="flex bg-space-800 rounded-lg p-1">
          <button
            onClick={() => onPeriodChange('today')}
            className={`px-3 py-1.5 text-sm rounded-md transition-all ${
              period === 'today'
                ? 'bg-neon-orange text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Aujourd&apos;hui
          </button>
          <button
            onClick={() => onPeriodChange('week')}
            className={`px-3 py-1.5 text-sm rounded-md transition-all ${
              period === 'week'
                ? 'bg-neon-orange text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Semaine
          </button>
          <button
            onClick={() => onPeriodChange('month')}
            className={`px-3 py-1.5 text-sm rounded-md transition-all ${
              period === 'month'
                ? 'bg-neon-orange text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Mois
          </button>
        </div>
      </div>

      {/* Métriques avec barres de progression */}
      <div className="space-y-4">
        <TrainingItem
          icon={<Target className="h-4 w-4" />}
          label="Séances"
          current={sessions.current}
          target={sessions.target}
          unit={sessions.unit}
          color="orange"
        />
        
        <TrainingItem
          icon={<Clock className="h-4 w-4" />}
          label="Durée"
          current={duration.current}
          target={duration.target}
          unit={duration.unit}
          color="blue"
        />
        
        <TrainingItem
          icon={<Flame className="h-4 w-4" />}
          label="Calories"
          current={calories.current}
          target={calories.target}
          unit={calories.unit}
          color="red"
        />
        
        <TrainingItem
          icon={<Activity className="h-4 w-4" />}
          label="Intensité"
          current={intensity.current}
          target={intensity.target}
          unit={intensity.unit}
          color="purple"
        />
      </div>

      {/* Conseil intelligent */}
      <div className="mt-6 p-4 bg-neon-orange/10 border border-neon-orange/20 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-neon-orange/20 rounded-full flex items-center justify-center">
            💪
          </div>
          <div>
            <p className="text-sm font-medium text-neon-orange mb-1">
              Conseil performance
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
