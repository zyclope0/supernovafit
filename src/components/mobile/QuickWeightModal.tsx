'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Scale, TrendingUp, TrendingDown, Save } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMesures } from '@/hooks/useFirestore'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'

interface QuickWeightModalProps {
  isOpen: boolean
  onClose: () => void
  className?: string
}

export default function QuickWeightModal({ 
  isOpen, 
  onClose, 
  className 
}: QuickWeightModalProps) {
  const { user } = useAuth()
  const { mesures, addMesure } = useMesures()
  const [weight, setWeight] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-focus sur l'input quand le modal s'ouvre
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 300)
    }
  }, [isOpen])

  // Récupérer le dernier poids pour comparaison
  const lastWeight = mesures
    .filter(m => m.poids)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

  const handleSave = async () => {
    if (!user || !weight || isSubmitting) return

    const weightValue = parseFloat(weight.replace(',', '.'))
    
    if (isNaN(weightValue) || weightValue < 30 || weightValue > 300) {
      toast.error('Poids invalide (30-300kg)')
      return
    }

    setIsSubmitting(true)
    
    try {
      const today = new Date().toISOString().split('T')[0]
      
      // Calculer l'IMC si on a la taille
      // TODO: Récupérer la taille depuis le profil utilisateur
      const taille = 175 // cm - à récupérer du profil
      const imc = (weightValue / Math.pow(taille / 100, 2))

      const mesureData = {
        user_id: user.uid,
        date: today,
        poids: weightValue,
        imc: Math.round(imc * 10) / 10,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const result = await addMesure(mesureData)
      
      if (result.success) {
        const variation = lastWeight && lastWeight.poids ? weightValue - lastWeight.poids : 0
        const variationText = variation > 0 
          ? `+${variation.toFixed(1)}kg` 
          : variation < 0 
            ? `${variation.toFixed(1)}kg`
            : 'Stable'

        toast.success(
          `Poids enregistré : ${weightValue}kg (${variationText})`,
          { duration: 3000 }
        )
        
        onClose()
        setWeight('')
      } else {
        toast.error('Erreur lors de l\'enregistrement')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de l\'enregistrement')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    }
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
        'transform transition-all duration-300 ease-out',
        isOpen ? 'translate-y-0' : 'translate-y-full',
        className
      )}>
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-white/20 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pb-6">
          <div className="flex items-center gap-3">
            <Scale className="w-6 h-6 text-green-400" />
            <h2 className="text-xl font-bold text-white">
              Saisie Rapide Poids
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        <div className="px-6 pb-8">
          {/* Dernier poids */}
          {lastWeight && (
            <div className="glass-effect rounded-xl p-4 border border-white/10 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60">Dernier poids</p>
                  <p className="text-2xl font-bold text-white">
                    {lastWeight.poids}kg
                  </p>
                  <p className="text-xs text-white/50">
                    {new Date(lastWeight.date).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="text-3xl">⚖️</div>
              </div>
            </div>
          )}

          {/* Input Poids */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-white/80 mb-2 block">
                Nouveau poids
              </label>
              <div className="relative">
                <input
                  ref={inputRef}
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ex: 75.5"
                  step="0.1"
                  min="30"
                  max="300"
                  className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white text-center text-2xl font-bold focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/40 text-xl">
                  kg
                </div>
              </div>
            </div>

            {/* Variation Preview */}
            {weight && lastWeight && (
              <div className="glass-effect rounded-lg p-3 border border-white/10">
                <div className="flex items-center justify-center gap-2">
                  {(() => {
                    const newWeight = parseFloat(weight.replace(',', '.'))
                    if (isNaN(newWeight)) return null
                    
                    const variation = newWeight - (lastWeight.poids || 0)
                    const isPositive = variation > 0
                    const isNeutral = Math.abs(variation) < 0.1
                    
                    return (
                      <>
                        {isNeutral ? (
                          <div className="text-white/60">≈ Stable</div>
                        ) : (
                          <>
                            {isPositive ? (
                              <TrendingUp className="w-4 h-4 text-red-400" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-green-400" />
                            )}
                            <span className={cn(
                              'font-medium',
                              isPositive ? 'text-red-400' : 'text-green-400'
                            )}>
                              {isPositive ? '+' : ''}{variation.toFixed(1)}kg
                            </span>
                          </>
                        )}
                      </>
                    )
                  })()}
                </div>
              </div>
            )}

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={!weight || isSubmitting}
              className={cn(
                'w-full py-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2',
                weight && !isSubmitting
                  ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white hover:from-green-600 hover:to-teal-600'
                  : 'bg-white/10 text-white/40 cursor-not-allowed'
              )}
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Enregistrer
                </>
              )}
            </button>

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-2">
              {lastWeight && [
                { label: '-0.5kg', value: ((lastWeight.poids || 0) - 0.5).toFixed(1) },
                { label: 'Identique', value: (lastWeight.poids || 0).toString() },
                { label: '+0.5kg', value: ((lastWeight.poids || 0) + 0.5).toFixed(1) }
              ].map((quick) => (
                <button
                  key={quick.label}
                  onClick={() => setWeight(quick.value)}
                  className="py-2 px-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white/70 hover:bg-white/10 hover:text-white transition-all"
                >
                  {quick.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Safe area for iPhone */}
        <div className="h-safe-area-inset-bottom" />
      </div>
    </>
  )
}
