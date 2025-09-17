'use client'

import { useState } from 'react'
import { X, Timer, Star, Play, Dumbbell, Target } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface QuickTrainingTemplate {
  id: string
  name: string
  description: string
  emoji: string
  type: string
  duration: number // en minutes
  calories: number
  difficulty: 'facile' | 'moyen' | 'difficile'
  exercises: {
    name: string
    sets?: number
    reps?: number
    duration?: number
    rest?: number
  }[]
  category: 'cardio' | 'musculation' | 'hiit' | 'yoga' | 'stretching'
}

interface QuickTrainingModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectTemplate: (template: QuickTrainingTemplate) => void
  className?: string
}

const QUICK_TRAINING_TEMPLATES: QuickTrainingTemplate[] = [
  // HIIT Express
  {
    id: 'hiit-express',
    name: 'HIIT Express',
    description: '15 min haute intensité',
    emoji: '🔥',
    type: 'HIIT',
    duration: 15,
    calories: 180,
    difficulty: 'difficile',
    exercises: [
      { name: 'Burpees', duration: 30, rest: 10 },
      { name: 'Mountain Climbers', duration: 30, rest: 10 },
      { name: 'Jump Squats', duration: 30, rest: 10 },
      { name: 'High Knees', duration: 30, rest: 60 }
    ],
    category: 'hiit'
  },
  {
    id: 'tabata-core',
    name: 'Tabata Core',
    description: '8 min abdos intensifs',
    emoji: '💥',
    type: 'Tabata',
    duration: 8,
    calories: 80,
    difficulty: 'moyen',
    exercises: [
      { name: 'Planche', duration: 20, rest: 10 },
      { name: 'Crunches', duration: 20, rest: 10 },
      { name: 'Russian Twists', duration: 20, rest: 10 },
      { name: 'Leg Raises', duration: 20, rest: 10 }
    ],
    category: 'hiit'
  },

  // Cardio
  {
    id: 'morning-run',
    name: 'Course Matinale',
    description: '30 min course légère',
    emoji: '🏃',
    type: 'Course',
    duration: 30,
    calories: 300,
    difficulty: 'facile',
    exercises: [
      { name: 'Échauffement', duration: 5 },
      { name: 'Course modérée', duration: 20 },
      { name: 'Retour au calme', duration: 5 }
    ],
    category: 'cardio'
  },
  {
    id: 'bike-session',
    name: 'Vélo Fitness',
    description: '45 min vélo d\'appartement',
    emoji: '🚴',
    type: 'Vélo',
    duration: 45,
    calories: 400,
    difficulty: 'moyen',
    exercises: [
      { name: 'Échauffement', duration: 5 },
      { name: 'Intervalles modérés', duration: 30 },
      { name: 'Sprint final', duration: 5 },
      { name: 'Récupération', duration: 5 }
    ],
    category: 'cardio'
  },

  // Musculation
  {
    id: 'upper-body',
    name: 'Haut du Corps',
    description: '45 min musculation',
    emoji: '💪',
    type: 'Musculation',
    duration: 45,
    calories: 250,
    difficulty: 'moyen',
    exercises: [
      { name: 'Développé couché', sets: 4, reps: 10, rest: 90 },
      { name: 'Tractions', sets: 3, reps: 8, rest: 90 },
      { name: 'Dips', sets: 3, reps: 12, rest: 60 },
      { name: 'Curls biceps', sets: 3, reps: 12, rest: 60 }
    ],
    category: 'musculation'
  },
  {
    id: 'lower-body',
    name: 'Bas du Corps',
    description: '45 min jambes/fessiers',
    emoji: '🦵',
    type: 'Musculation',
    duration: 45,
    calories: 280,
    difficulty: 'moyen',
    exercises: [
      { name: 'Squats', sets: 4, reps: 12, rest: 90 },
      { name: 'Fentes', sets: 3, reps: 10, rest: 60 },
      { name: 'Soulevé de terre', sets: 4, reps: 8, rest: 120 },
      { name: 'Extensions mollets', sets: 3, reps: 15, rest: 45 }
    ],
    category: 'musculation'
  },

  // Yoga/Stretching
  {
    id: 'morning-yoga',
    name: 'Yoga Matinal',
    description: '20 min étirements',
    emoji: '🧘',
    type: 'Yoga',
    duration: 20,
    calories: 60,
    difficulty: 'facile',
    exercises: [
      { name: 'Salutation au soleil', duration: 5 },
      { name: 'Postures d\'équilibre', duration: 8 },
      { name: 'Étirements profonds', duration: 5 },
      { name: 'Relaxation', duration: 2 }
    ],
    category: 'yoga'
  }
]

export default function QuickTrainingModal({ 
  isOpen, 
  onClose, 
  onSelectTemplate,
  className 
}: QuickTrainingModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  const categories = [
    { id: 'all', label: 'Tous', emoji: '🏋️' },
    { id: 'hiit', label: 'HIIT', emoji: '🔥' },
    { id: 'cardio', label: 'Cardio', emoji: '🏃' },
    { id: 'musculation', label: 'Muscu', emoji: '💪' },
    { id: 'yoga', label: 'Yoga', emoji: '🧘' }
  ]

  const filteredTemplates = selectedCategory === 'all' 
    ? QUICK_TRAINING_TEMPLATES 
    : QUICK_TRAINING_TEMPLATES.filter(t => t.category === selectedCategory)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'facile': return 'text-green-400 bg-green-500/10'
      case 'moyen': return 'text-yellow-400 bg-yellow-500/10'
      case 'difficile': return 'text-red-400 bg-red-500/10'
      default: return 'text-white/60 bg-white/10'
    }
  }

  const handleSelectTemplate = (template: QuickTrainingTemplate) => {
    onSelectTemplate(template)
    toast.success(`Entraînement "${template.name}" démarré !`)
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'bg-black/95 backdrop-blur-xl',
        'border-t border-white/10',
        'rounded-t-3xl',
        'max-h-[80vh] overflow-hidden',
        'transform transition-all duration-300 ease-out',
        isOpen ? 'translate-y-0' : 'translate-y-full',
        className
      )}>
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-white/20 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pb-4">
          <div className="flex items-center gap-3">
            <Dumbbell className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">
              Entraînements Express
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Categories */}
        <div className="px-6 pb-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all',
                  selectedCategory === category.id
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'
                )}
              >
                <span>{category.emoji}</span>
                <span className="text-sm font-medium">{category.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Templates List */}
        <div className="px-6 pb-6 overflow-y-auto max-h-96">
          <div className="space-y-3">
            {filteredTemplates.map((template) => {
              const isFavorite = favorites.has(template.id)
              
              return (
                <div
                  key={template.id}
                  className="glass-effect rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200"
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="text-2xl">{template.emoji}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-white">
                              {template.name}
                            </h3>
                            <span className={cn(
                              'px-2 py-1 rounded-full text-xs font-medium',
                              getDifficultyColor(template.difficulty)
                            )}>
                              {template.difficulty}
                            </span>
                          </div>
                          <p className="text-sm text-white/60 mb-2">
                            {template.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-white/50">
                            <div className="flex items-center gap-1">
                              <Timer className="w-3 h-3" />
                              {template.duration} min
                            </div>
                            <div className="flex items-center gap-1">
                              <Target className="w-3 h-3" />
                              {template.calories} kcal
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => toggleFavorite(template.id)}
                        className={cn(
                          'p-2 rounded-lg transition-colors',
                          isFavorite 
                            ? 'text-yellow-400 bg-yellow-500/10' 
                            : 'text-white/40 hover:text-yellow-400 hover:bg-yellow-500/10'
                        )}
                      >
                        <Star className={cn('w-4 h-4', isFavorite && 'fill-current')} />
                      </button>
                    </div>

                    {/* Exercises Preview */}
                    <div className="mb-4">
                      <div className="text-xs text-white/60 mb-2">Exercices :</div>
                      <div className="space-y-1">
                        {template.exercises.slice(0, 3).map((exercise, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span className="text-white/80">{exercise.name}</span>
                            <span className="text-white/50">
                              {exercise.sets && exercise.reps 
                                ? `${exercise.sets}×${exercise.reps}`
                                : exercise.duration 
                                  ? `${exercise.duration}min`
                                  : ''
                              }
                            </span>
                          </div>
                        ))}
                        {template.exercises.length > 3 && (
                          <div className="text-xs text-white/40">
                            +{template.exercises.length - 3} autres exercices
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => onSelectTemplate(template)}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      Démarrer cet entraînement
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-8">
              <Dumbbell className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/60">Aucun template dans cette catégorie</p>
            </div>
          )}
        </div>

        {/* Safe area for iPhone */}
        <div className="h-safe-area-inset-bottom" />
      </div>
    </>
  )
}
