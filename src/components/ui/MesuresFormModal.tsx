'use client'

import React, { useState } from 'react'
import { Mesure } from '@/types'
import StandardModal from './StandardModal'
import { useAriaAnnouncer } from '@/hooks/useAriaAnnouncer'

interface MesureFormData {
  date: string
  poids: string
  taille: string
  masse_grasse: string
  masse_musculaire: string
  tour_taille: string
  tour_hanches: string
  tour_bras: string
  tour_cuisses: string
  tour_cou: string
  tour_poitrine: string
  commentaire: string
}

interface MesuresFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (formData: MesureFormData) => Promise<void>
  editingMesure?: Mesure | null
  isSubmitting?: boolean
}

export default function MesuresFormModal({
  isOpen,
  onClose,
  onSubmit,
  editingMesure,
  isSubmitting = false
}: MesuresFormModalProps) {
  const { announceValidationError } = useAriaAnnouncer()
  
  // Données du formulaire
  const [formData, setFormData] = useState({
    date: editingMesure?.date || new Date().toISOString().split('T')[0],
    poids: editingMesure?.poids?.toString() || '',
    taille: editingMesure?.taille?.toString() || '',
    masse_grasse: editingMesure?.masse_grasse?.toString() || '',
    masse_musculaire: editingMesure?.masse_musculaire?.toString() || '',
    tour_taille: editingMesure?.tour_taille?.toString() || '',
    tour_hanches: editingMesure?.tour_hanches?.toString() || '',
    tour_bras: editingMesure?.tour_bras?.toString() || '',
    tour_cuisses: editingMesure?.tour_cuisses?.toString() || '',
    tour_cou: editingMesure?.tour_cou?.toString() || '',
    tour_poitrine: editingMesure?.tour_poitrine?.toString() || '',
    commentaire: editingMesure?.commentaire || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation stricte des données
    const errors: string[] = []
    
    // Validation des valeurs numériques
    const poids = parseFloat(formData.poids)
    if (formData.poids && (isNaN(poids) || poids <= 0 || poids > 300)) {
      errors.push('Le poids doit être compris entre 0 et 300 kg')
    }
    
    const taille = parseFloat(formData.taille)
    if (formData.taille && (isNaN(taille) || taille <= 0 || taille > 250)) {
      errors.push('La taille doit être comprise entre 0 et 250 cm')
    }
    
    const masseGrasse = parseFloat(formData.masse_grasse)
    if (formData.masse_grasse && (isNaN(masseGrasse) || masseGrasse < 0 || masseGrasse > 100)) {
      errors.push('La masse grasse doit être comprise entre 0 et 100%')
    }
    
    const masseMusculaire = parseFloat(formData.masse_musculaire)
    if (formData.masse_musculaire && (isNaN(masseMusculaire) || masseMusculaire < 0 || masseMusculaire > 100)) {
      errors.push('La masse musculaire doit être comprise entre 0 et 100%')
    }
    
    // Validation des mensurations
    const tourTaille = parseFloat(formData.tour_taille)
    if (formData.tour_taille && (isNaN(tourTaille) || tourTaille <= 0 || tourTaille > 200)) {
      errors.push('Le tour de taille doit être compris entre 0 et 200 cm')
    }
    
    const tourHanches = parseFloat(formData.tour_hanches)
    if (formData.tour_hanches && (isNaN(tourHanches) || tourHanches <= 0 || tourHanches > 200)) {
      errors.push('Le tour de hanches doit être compris entre 0 et 200 cm')
    }
    
    const tourBras = parseFloat(formData.tour_bras)
    if (formData.tour_bras && (isNaN(tourBras) || tourBras <= 0 || tourBras > 100)) {
      errors.push('Le tour de bras doit être compris entre 0 et 100 cm')
    }
    
    const tourCuisses = parseFloat(formData.tour_cuisses)
    if (formData.tour_cuisses && (isNaN(tourCuisses) || tourCuisses <= 0 || tourCuisses > 150)) {
      errors.push('Le tour de cuisses doit être compris entre 0 et 150 cm')
    }
    
    const tourCou = parseFloat(formData.tour_cou)
    if (formData.tour_cou && (isNaN(tourCou) || tourCou <= 0 || tourCou > 100)) {
      errors.push('Le tour de cou doit être compris entre 0 et 100 cm')
    }
    
    const tourPoitrine = parseFloat(formData.tour_poitrine)
    if (formData.tour_poitrine && (isNaN(tourPoitrine) || tourPoitrine <= 0 || tourPoitrine > 200)) {
      errors.push('Le tour de poitrine doit être compris entre 0 et 200 cm')
    }
    
    // Validation : au moins une mesure importante doit être remplie
    const hasImportantData = formData.poids || formData.taille || formData.masse_grasse || 
                            formData.masse_musculaire || formData.tour_hanches || 
                            formData.tour_bras || formData.tour_cuisses || 
                            formData.tour_cou || formData.tour_poitrine || formData.commentaire

    if (!hasImportantData) {
      errors.push('Veuillez remplir au moins une mesure importante (poids, taille, masse grasse, etc.)')
    }

    // Si des erreurs sont détectées, les annoncer et afficher
    if (errors.length > 0) {
      const errorMessage = errors.join(', ')
      announceValidationError('Formulaire', errorMessage)
      alert('Erreurs de validation :\n\n' + errors.join('\n'))
      return
    }

    await onSubmit(formData)
  }

  if (!isOpen) return null

  return (
    <StandardModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingMesure ? 'Modifier la mesure' : 'Nouvelle mesure'}
      subtitle={editingMesure ? 'Modifiez les données de votre mesure' : 'Ajoutez une nouvelle mesure corporelle'}
      icon="📏"
      maxWidth="4xl"
      height="85vh"
    >
      <div className="p-6 pb-4">
        <form id="mesure-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">Date</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-white focus:border-neon-purple focus:outline-none"
            required
          />
        </div>

        {/* Poids et Taille */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Poids (kg)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="300"
              value={formData.poids}
              onChange={(e) => setFormData({ ...formData, poids: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-white focus:border-neon-purple focus:outline-none"
              placeholder="70.5"
              aria-label="Poids en kilogrammes"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Taille (cm)</label>
            <input
              type="number"
              min="0"
              max="250"
              value={formData.taille}
              onChange={(e) => setFormData({ ...formData, taille: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-white focus:border-neon-purple focus:outline-none"
              placeholder="175"
              aria-label="Taille en centimètres"
            />
          </div>
        </div>

        {/* Composition corporelle */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Masse grasse (%)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={formData.masse_grasse}
              onChange={(e) => setFormData({ ...formData, masse_grasse: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-white focus:border-neon-purple focus:outline-none"
              placeholder="15.5"
              aria-label="Masse grasse en pourcentage"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Masse musculaire (%)</label>
            <input
              type="number"
              step="0.1"
              value={formData.masse_musculaire}
              onChange={(e) => setFormData({ ...formData, masse_musculaire: e.target.value })}
              className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-white focus:border-neon-purple focus:outline-none"
              placeholder="40.0"
            />
          </div>
        </div>

        {/* Mensurations */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Mensurations (cm)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Tour de taille</label>
              <input
                type="number"
                step="0.5"
                value={formData.tour_taille}
                onChange={(e) => setFormData({ ...formData, tour_taille: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-white focus:border-neon-purple focus:outline-none"
                placeholder="80"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Tour de hanches</label>
              <input
                type="number"
                step="0.5"
                value={formData.tour_hanches}
                onChange={(e) => setFormData({ ...formData, tour_hanches: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-white focus:border-neon-purple focus:outline-none"
                placeholder="95"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Tour de bras</label>
              <input
                type="number"
                step="0.5"
                value={formData.tour_bras}
                onChange={(e) => setFormData({ ...formData, tour_bras: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-white focus:border-neon-purple focus:outline-none"
                placeholder="32"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Tour de cuisses</label>
              <input
                type="number"
                step="0.5"
                value={formData.tour_cuisses}
                onChange={(e) => setFormData({ ...formData, tour_cuisses: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-white focus:border-neon-purple focus:outline-none"
                placeholder="55"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Tour de cou</label>
              <input
                type="number"
                step="0.5"
                value={formData.tour_cou}
                onChange={(e) => setFormData({ ...formData, tour_cou: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-white focus:border-neon-purple focus:outline-none"
                placeholder="38"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Tour de poitrine</label>
              <input
                type="number"
                step="0.5"
                value={formData.tour_poitrine}
                onChange={(e) => setFormData({ ...formData, tour_poitrine: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-white focus:border-neon-purple focus:outline-none"
                placeholder="100"
              />
            </div>
          </div>
        </div>

        {/* Commentaire */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">Commentaire (optionnel)</label>
          <textarea
            value={formData.commentaire}
            onChange={(e) => setFormData({ ...formData, commentaire: e.target.value })}
            className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-white focus:border-neon-purple focus:outline-none"
            rows={3}
            placeholder="Ajoutez un commentaire sur cette mesure..."
          />
        </div>

        </form>
        
        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-muted-foreground hover:text-white transition-colors"
            disabled={isSubmitting}
          >
            Annuler
          </button>
          <button
            type="submit"
            form="mesure-form"
            disabled={isSubmitting}
            className="px-6 py-2 bg-neon-purple text-white rounded-lg font-medium hover:bg-neon-purple/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Enregistrement...' : (editingMesure ? 'Modifier' : 'Ajouter')}
          </button>
        </div>
      </div>
    </StandardModal>
  )
}
