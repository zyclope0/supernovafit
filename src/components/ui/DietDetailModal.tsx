'use client'

import React from 'react'
import { Edit3, Trash2, Clock, Flame, Zap, Wheat, Droplets } from 'lucide-react'
import StandardModal from './StandardModal'

interface DietDetailModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  emoji: string
  time: string
  items: Array<{
    name: string
    quantity: string
    calories: number
    protein: number
    carbs: number
    fat: number
  }>
  totalCalories: number
  totalMacros: {
    protein: number
    carbs: number
    fat: number
  }
  onEdit?: () => void
  onDelete?: () => void
}

export default function DietDetailModal({
  isOpen,
  onClose,
  title,
  emoji,
  time,
  items,
  totalCalories,
  totalMacros,
  onEdit,
  onDelete
}: DietDetailModalProps) {
  return (
    <StandardModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={`${emoji} ${time}`}
      icon={emoji}
      onEdit={onEdit}
      maxWidth="2xl"
      height="90vh"
    >
      <div className="space-y-6">
        {/* Résumé calorique */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-effect p-4 rounded-lg border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="h-4 w-4 text-neon-green" />
              <span className="text-sm font-medium text-white">Calories totales</span>
            </div>
            <div className="text-2xl font-bold text-neon-green">{Math.round(totalCalories)}</div>
            <div className="text-xs text-gray-400">kcal</div>
          </div>
          
          <div className="glass-effect p-4 rounded-lg border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-neon-cyan" />
              <span className="text-sm font-medium text-white">Nombre d&apos;aliments</span>
            </div>
            <div className="text-2xl font-bold text-neon-cyan">{items.length}</div>
            <div className="text-xs text-gray-400">aliments</div>
          </div>
        </div>

        {/* Macros détaillées */}
        <div className="glass-effect p-4 rounded-lg border border-white/10">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-neon-purple" />
            Répartition nutritionnelle
          </h4>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Wheat className="h-4 w-4 text-neon-cyan" />
                <span className="text-sm text-gray-400">Protéines</span>
              </div>
              <div className="text-xl font-bold text-neon-cyan">{Math.round(totalMacros.protein)}g</div>
              <div className="text-xs text-gray-400">
                {Math.round((totalMacros.protein * 4 / totalCalories) * 100)}% des calories
              </div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Zap className="h-4 w-4 text-neon-yellow" />
                <span className="text-sm text-gray-400">Glucides</span>
              </div>
              <div className="text-xl font-bold text-neon-yellow">{Math.round(totalMacros.carbs)}g</div>
              <div className="text-xs text-gray-400">
                {Math.round((totalMacros.carbs * 4 / totalCalories) * 100)}% des calories
              </div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Droplets className="h-4 w-4 text-neon-pink" />
                <span className="text-sm text-gray-400">Lipides</span>
              </div>
              <div className="text-xl font-bold text-neon-pink">{Math.round(totalMacros.fat)}g</div>
              <div className="text-xs text-gray-400">
                {Math.round((totalMacros.fat * 9 / totalCalories) * 100)}% des calories
              </div>
            </div>
          </div>
        </div>

        {/* Liste détaillée des aliments */}
        <div className="glass-effect p-4 rounded-lg border border-white/10">
          <h4 className="text-lg font-semibold text-white mb-4">Aliments consommés</h4>
          
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-white">{item.name}</div>
                  <div className="text-sm text-gray-400">{item.quantity}</div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-semibold text-neon-green">{Math.round(item.calories)} kcal</div>
                  <div className="text-xs text-gray-400">
                    P: {Math.round(item.protein)}g | G: {Math.round(item.carbs)}g | L: {Math.round(item.fat)}g
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        {(onEdit || onDelete) && (
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            {onEdit && (
              <button
                onClick={onEdit}
                className="flex items-center gap-2 px-4 py-2 bg-neon-purple/20 text-neon-purple rounded-lg hover:bg-neon-purple/30 transition-colors"
              >
                <Edit3 className="h-4 w-4" />
                Modifier
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Supprimer
              </button>
            )}
          </div>
        )}
      </div>
    </StandardModal>
  )
}
