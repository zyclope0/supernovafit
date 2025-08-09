'use client'

import { useState, useEffect } from 'react'
import { JournalEntry } from '@/types'
import { X, Save, Sun, Cloud, CloudRain, Zap, Snowflake } from 'lucide-react'
import toast from 'react-hot-toast'

interface JournalFormProps {
  onSubmit: (entryData: Omit<JournalEntry, 'id'>) => Promise<{ success: boolean; error?: string }>
  onCancel: () => void
  existingEntry?: JournalEntry | null
  isSubmitting?: boolean
}

// Émojis pour les niveaux 1-10
const LEVEL_EMOJIS = {
  1: '😞', 2: '😔', 3: '😐', 4: '🙂', 5: '😊',
  6: '😄', 7: '😁', 8: '🤩', 9: '😍', 10: '🚀'
}

// Options météo
const METEO_OPTIONS = [
  { value: 'soleil', label: 'Soleil', icon: Sun, emoji: '☀️' },
  { value: 'nuage', label: 'Nuageux', icon: Cloud, emoji: '☁️' },
  { value: 'pluie', label: 'Pluie', icon: CloudRain, emoji: '🌧️' },
  { value: 'orage', label: 'Orage', icon: Zap, emoji: '⛈️' },
  { value: 'neige', label: 'Neige', icon: Snowflake, emoji: '❄️' }
] as const

// Activités prédéfinies
const ACTIVITES_SUGGESTIONS = [
  'Marche', 'Jardinage', 'Ménage', 'Shopping', 'Lecture', 'Méditation', 
  'Cuisine', 'Bricolage', 'Jeux vidéo', 'Film/Série', 'Socialisation', 'Travail'
]

// Composant Slider avec émojis
function EmojiSlider({ 
  label, 
  value, 
  onChange, 
  color = 'neon-green' 
}: {
  label: string
  value: number
  onChange: (value: number) => void
  color?: string
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-white">{label}</label>
        <div className="flex items-center gap-2">
          <span className="text-lg">{LEVEL_EMOJIS[value as keyof typeof LEVEL_EMOJIS]}</span>
          <span className={`text-sm font-semibold text-${color}`}>{value}/10</span>
        </div>
      </div>
      <div className="relative">
        <input
          type="range"
          min="1"
          max="10"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className={`w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider-${color}`}
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>1</span>
          <span>5</span>
          <span>10</span>
        </div>
      </div>
    </div>
  )
}

export default function JournalForm({ onSubmit, onCancel, existingEntry, isSubmitting = false }: JournalFormProps) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    note: '',
    humeur: 5 as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
    energie: 5 as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
    stress: 5 as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
    motivation: 5 as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
    sommeil_duree: 8,
    sommeil_qualite: 5 as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
    meteo: 'soleil' as 'soleil' | 'nuage' | 'pluie' | 'orage' | 'neige',
    activites_annexes: [] as string[]
  })

  const [newActivite, setNewActivite] = useState('')

  // Charger les données existantes
  useEffect(() => {
    if (existingEntry) {
      setFormData({
        date: existingEntry.date,
        note: existingEntry.note || '',
        humeur: existingEntry.humeur || 5,
        energie: existingEntry.energie || 5,
        stress: existingEntry.stress || 5,
        motivation: existingEntry.motivation || 5,
        sommeil_duree: existingEntry.sommeil_duree || 8,
        sommeil_qualite: existingEntry.sommeil_qualite || 5,
        meteo: existingEntry.meteo || 'soleil',
        activites_annexes: existingEntry.activites_annexes || []
      })
    }
  }, [existingEntry])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Préparer les données en filtrant les valeurs par défaut/vides
    const entryData: Omit<JournalEntry, 'id'> = {
      user_id: '', // Sera rempli par le hook
      date: formData.date
    }

    // Ajouter seulement les champs modifiés (sauf meteo que l'on persiste toujours)
    if (formData.note.trim()) entryData.note = formData.note.trim()
    if (formData.humeur !== 5) entryData.humeur = formData.humeur
    if (formData.energie !== 5) entryData.energie = formData.energie
    if (formData.stress !== 5) entryData.stress = formData.stress
    if (formData.motivation !== 5) entryData.motivation = formData.motivation
    if (formData.sommeil_duree !== 8) entryData.sommeil_duree = formData.sommeil_duree
    if (formData.sommeil_qualite !== 5) entryData.sommeil_qualite = formData.sommeil_qualite
    entryData.meteo = formData.meteo
    if (formData.activites_annexes.length > 0) entryData.activites_annexes = formData.activites_annexes

    const result = await onSubmit(entryData)
    if (result.success) {
      onCancel() // Fermer le formulaire
    }
  }

  const addActivite = (activite: string) => {
    if (activite.trim() && !formData.activites_annexes.includes(activite.trim())) {
      setFormData({
        ...formData,
        activites_annexes: [...formData.activites_annexes, activite.trim()]
      })
      setNewActivite('')
    }
  }

  const removeActivite = (index: number) => {
    setFormData({
      ...formData,
      activites_annexes: formData.activites_annexes.filter((_, i) => i !== index)
    })
  }

  return (
    <div className="glass-effect p-6 rounded-lg border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">
          {existingEntry ? 'Modifier l\'entrée' : 'Nouvelle entrée journal'}
        </h3>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="h-4 w-4 text-white" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">Date</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-neon-purple focus:outline-none"
            required
          />
        </div>

        {/* Indicateurs avec sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <EmojiSlider
            label="😊 Humeur"
            value={formData.humeur}
            onChange={(value) => setFormData({ ...formData, humeur: value as any })}
            color="neon-pink"
          />
          <EmojiSlider
            label="⚡ Énergie"
            value={formData.energie}
            onChange={(value) => setFormData({ ...formData, energie: value as any })}
            color="neon-green"
          />
          <EmojiSlider
            label="😰 Stress"
            value={formData.stress}
            onChange={(value) => setFormData({ ...formData, stress: value as any })}
            color="neon-purple"
          />
          <EmojiSlider
            label="🎯 Motivation"
            value={formData.motivation}
            onChange={(value) => setFormData({ ...formData, motivation: value as any })}
            color="neon-cyan"
          />
        </div>

        {/* Sommeil */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">😴 Durée sommeil (heures)</label>
            <input
              type="number"
              min="0"
              max="24"
              step="0.5"
              value={formData.sommeil_duree}
              onChange={(e) => setFormData({ ...formData, sommeil_duree: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-neon-purple focus:outline-none"
            />
          </div>
          <EmojiSlider
            label="😴 Qualité sommeil"
            value={formData.sommeil_qualite}
            onChange={(value) => setFormData({ ...formData, sommeil_qualite: value as any })}
            color="neon-cyan"
          />
        </div>

        {/* Météo */}
        <div>
          <label className="block text-sm font-medium text-white mb-3">🌤️ Météo du jour</label>
          <div className="grid grid-cols-5 gap-2">
            {METEO_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormData({ ...formData, meteo: option.value })}
                className={`p-3 rounded-lg border transition-colors ${
                  formData.meteo === option.value
                    ? 'border-neon-cyan bg-neon-cyan/20 text-neon-cyan'
                    : 'border-white/10 bg-white/5 text-white hover:border-white/20'
                }`}
              >
                <div className="text-lg mb-1">{option.emoji}</div>
                <div className="text-xs">{option.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">📝 Notes du jour</label>
          <textarea
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            placeholder="Comment s'est passée votre journée ? Que ressentez-vous ?"
            rows={4}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-muted-foreground focus:border-neon-purple focus:outline-none resize-none"
          />
        </div>

        {/* Activités annexes */}
        <div>
          <label className="block text-sm font-medium text-white mb-3">🏃 Activités de la journée</label>
          
          {/* Suggestions rapides */}
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2 mb-3">
            {ACTIVITES_SUGGESTIONS.map((activite) => (
              <button
                key={activite}
                type="button"
                onClick={() => addActivite(activite)}
                disabled={formData.activites_annexes.includes(activite)}
                className={`px-2 py-1 text-xs rounded border transition-colors ${
                  formData.activites_annexes.includes(activite)
                    ? 'border-neon-green bg-neon-green/20 text-neon-green cursor-not-allowed'
                    : 'border-white/20 bg-white/5 text-white hover:border-white/40'
                }`}
              >
                {activite}
              </button>
            ))}
          </div>

          {/* Ajout custom */}
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newActivite}
              onChange={(e) => setNewActivite(e.target.value)}
              placeholder="Ajouter une activité..."
              className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-muted-foreground focus:border-neon-purple focus:outline-none"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addActivite(newActivite)
                }
              }}
            />
            <button
              type="button"
              onClick={() => addActivite(newActivite)}
              className="px-4 py-2 bg-neon-purple/20 text-neon-purple rounded-lg hover:bg-neon-purple/30 transition-colors"
            >
              Ajouter
            </button>
          </div>

          {/* Activités sélectionnées */}
          {formData.activites_annexes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.activites_annexes.map((activite, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-neon-purple/20 text-neon-purple text-sm rounded flex items-center gap-2"
                >
                  {activite}
                  <button
                    type="button"
                    onClick={() => removeActivite(index)}
                    className="hover:text-red-400 transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Boutons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-neon-purple/20 text-neon-purple rounded-lg font-medium hover:bg-neon-purple/30 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-neon-purple"></div>
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSubmitting ? 'Enregistrement...' : existingEntry ? 'Modifier' : 'Enregistrer'}
          </button>
        </div>
      </form>

      {/* Styles CSS pour les sliders */}
      <style jsx>{`
        .slider-neon-pink::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #ec4899;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 0 10px #ec4899;
        }
        .slider-neon-green::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #10b981;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 0 10px #10b981;
        }
        .slider-neon-purple::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #a855f7;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 0 10px #a855f7;
        }
        .slider-neon-cyan::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #06b6d4;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 0 10px #06b6d4;
        }
      `}</style>
    </div>
  )
}