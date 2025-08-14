'use client'

import { useState, useRef } from 'react'
import { Camera, Upload, X, Eye, Trash2, Edit3, ArrowLeftRight } from 'lucide-react'
import { usePhotos } from '@/hooks/useFirestore'
import { Mesure } from '@/types'
import toast from 'react-hot-toast'
import Image from 'next/image'

interface PhotoUploadProps {
  mesures: Mesure[]
}

interface PhotoData {
  id: string
  url: string
  fileName?: string
  date: string
  type: 'face' | 'profil' | 'dos' | 'libre'
  mesure_id?: string
  commentaire: string
  created_at: any
}

// Types de photos disponibles
const PHOTO_TYPES = [
  { value: 'face', label: 'Face', icon: '👤', color: 'neon-cyan' },
  { value: 'profil', label: 'Profil', icon: '↗️', color: 'neon-purple' },
  { value: 'dos', label: 'Dos', icon: '🔙', color: 'neon-pink' },
  { value: 'libre', label: 'Libre', icon: '📸', color: 'neon-green' }
] as const

// Composant pour afficher une photo
function PhotoCard({ photo, mesures, onEdit, onDelete }: {
  photo: PhotoData
  mesures: Mesure[]
  onEdit: (photo: PhotoData) => void
  onDelete: (photo: PhotoData) => void
}) {
  const [showPreview, setShowPreview] = useState(false)
  
  const typeInfo = PHOTO_TYPES.find(t => t.value === photo.type) || PHOTO_TYPES[3]
  const linkedMesure = mesures.find(m => m.id === photo.mesure_id)

  return (
    <>
      <div className="glass-effect rounded-lg border border-white/10 overflow-hidden hover:border-white/20 transition-colors">
        {/* Image */}
        <div className="relative aspect-square">
          <Image
            src={photo.url}
            alt={`Photo ${typeInfo.label}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              onClick={() => setShowPreview(true)}
              className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
            >
              <Eye className="h-4 w-4 text-white" />
            </button>
            <button
              onClick={() => onEdit(photo)}
              className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
            >
              <Edit3 className="h-4 w-4 text-white" />
            </button>
            <button
              onClick={() => onDelete(photo)}
              className="p-2 bg-red-500/20 rounded-full hover:bg-red-500/30 transition-colors"
            >
              <Trash2 className="h-4 w-4 text-red-400" />
            </button>
          </div>
        </div>

        {/* Informations */}
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className={`flex items-center gap-2 px-2 py-1 rounded-full bg-${typeInfo.color}/20`}>
              <span className="text-xs">{typeInfo.icon}</span>
              <span className={`text-xs font-medium text-${typeInfo.color}`}>{typeInfo.label}</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {new Date(photo.date).toLocaleDateString('fr-FR')}
            </span>
          </div>
          
          {linkedMesure && (
            <div className="text-xs text-muted-foreground mb-1">
              📊 Poids: {linkedMesure.poids}kg {linkedMesure.imc && `• IMC: ${linkedMesure.imc.toFixed(1)}`}
            </div>
          )}
          
          {photo.commentaire && (
            <div className="text-xs text-white/80 italic truncate">
              &quot;{photo.commentaire}&quot;
            </div>
          )}
        </div>
      </div>

      {/* Modal de prévisualisation */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setShowPreview(false)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            <Image
              src={photo.url}
              alt={`Photo ${typeInfo.label} - Preview`}
              width={800}
              height={600}
              className="max-h-[80vh] w-auto object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  )
}

export default function PhotoUpload({ mesures }: PhotoUploadProps) {
  const { photos, loading, uploading, uploadPhoto, deletePhoto, updatePhoto } = usePhotos()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [showForm, setShowForm] = useState(false)
  const [editingPhoto, setEditingPhoto] = useState<PhotoData | null>(null)
  const [showComparison, setShowComparison] = useState(false)
  const [comparisonData, setComparisonData] = useState({
    photoA: null as PhotoData | null,
    photoB: null as PhotoData | null,
    selectedType: 'face' as 'face' | 'profil' | 'dos' | 'libre'
  })
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'face' as 'face' | 'profil' | 'dos' | 'libre',
    mesure_id: '',
    commentaire: '',
    file: null as File | null
  })

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La photo ne doit pas dépasser 5MB')
        return
      }

      // Vérifier le type
      if (!file.type.startsWith('image/')) {
        toast.error('Veuillez sélectionner une image')
        return
      }

      setFormData({ ...formData, file })
      setShowForm(true)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.file) return

    const result = await uploadPhoto(formData.file, {
      date: formData.date,
      type: formData.type,
      mesure_id: formData.mesure_id || undefined,
      commentaire: formData.commentaire
    })

    if (result.success) {
      toast.success('Photo uploadée avec succès !')
      setShowForm(false)
      setFormData({
        date: new Date().toISOString().split('T')[0],
        type: 'face',
        mesure_id: '',
        commentaire: '',
        file: null
      })
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } else {
      toast.error(`Erreur: ${result.error}`)
    }
  }

  const handleEdit = (photo: PhotoData) => {
    setEditingPhoto(photo)
  }

  const handleSaveEdit = async () => {
    if (!editingPhoto) return

    const result = await updatePhoto(editingPhoto.id, {
      commentaire: editingPhoto.commentaire,
      type: editingPhoto.type,
      mesure_id: editingPhoto.mesure_id || ''
    })

    if (result.success) {
      toast.success('Photo mise à jour !')
      setEditingPhoto(null)
    } else {
      toast.error(`Erreur: ${result.error}`)
    }
  }

  const handleDelete = async (photo: PhotoData) => {
    const result = await deletePhoto(photo.id, photo.fileName || '')
    
    if (result.success) {
      toast.success('Photo supprimée')
    } else {
      toast.error(`Erreur: ${result.error}`)
    }
  }

  const handleStartComparison = () => {
    // Trouver les photos du type sélectionné, triées par date
    const photosOfType = photos
      .filter(p => p.type === comparisonData.selectedType)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    if (photosOfType.length < 2) {
      toast.error(`Vous devez avoir au moins 2 photos de type "${PHOTO_TYPES.find(t => t.value === comparisonData.selectedType)?.label}" pour faire une comparaison`)
      return
    }

    // Par défaut, prendre la plus ancienne et la plus récente
    setComparisonData({
      ...comparisonData,
      photoA: photosOfType[0] as unknown as PhotoData, // cast léger pour compat
      photoB: photosOfType[photosOfType.length - 1] as unknown as PhotoData
    })
    setShowComparison(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-cyan"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header avec bouton d'upload */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Camera className="h-5 w-5 text-neon-purple" />
          Photos de Progression ({photos.length})
        </h3>
        <div className="flex gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 bg-neon-purple/20 text-neon-purple rounded-lg font-medium hover:bg-neon-purple/30 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {uploading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-neon-purple"></div>
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {uploading ? 'Upload...' : 'Ajouter photo'}
          </button>

          {photos.length >= 2 && (
            <div className="flex items-center gap-3">
              <select
                value={comparisonData.selectedType}
                onChange={(e) => setComparisonData({...comparisonData, selectedType: e.target.value as any})}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-neon-cyan focus:outline-none"
              >
                {PHOTO_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
              <button
                onClick={handleStartComparison}
                className="px-4 py-2 bg-neon-cyan/20 text-neon-cyan rounded-lg font-medium hover:bg-neon-cyan/30 transition-colors flex items-center gap-2"
              >
                <ArrowLeftRight className="h-4 w-4" />
                Comparer
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Formulaire d'upload */}
      {showForm && formData.file && (
        <div className="glass-effect p-6 rounded-lg border border-white/10">
          <h4 className="text-lg font-semibold text-white mb-4">Détails de la photo</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-neon-purple focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1">Type de photo</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-neon-purple focus:outline-none"
                >
                  {PHOTO_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1">Associer à une mesure (optionnel)</label>
              <select
                value={formData.mesure_id}
                onChange={(e) => setFormData({ ...formData, mesure_id: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-neon-purple focus:outline-none"
              >
                <option value="">Aucune mesure</option>
                {mesures.map(mesure => (
                  <option key={mesure.id} value={mesure.id}>
                    {new Date(mesure.date).toLocaleDateString('fr-FR')} - {mesure.poids}kg
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1">Commentaire</label>
              <textarea
                value={formData.commentaire}
                onChange={(e) => setFormData({ ...formData, commentaire: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-neon-purple focus:outline-none resize-none"
                rows={3}
                placeholder="Notes sur cette photo..."
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={uploading}
                className="px-4 py-2 bg-neon-green/20 text-neon-green rounded-lg font-medium hover:bg-neon-green/30 transition-colors disabled:opacity-50"
              >
                {uploading ? 'Upload en cours...' : 'Sauvegarder'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-500/20 text-gray-400 rounded-lg font-medium hover:bg-gray-500/30 transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal d'édition */}
      {editingPhoto && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-effect p-6 rounded-lg border border-white/10 w-full max-w-md">
            <h4 className="text-lg font-semibold text-white mb-4">Modifier la photo</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1">Type</label>
                <select
                  value={editingPhoto.type}
                  onChange={(e) => setEditingPhoto({ ...editingPhoto, type: e.target.value as any })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-neon-purple focus:outline-none"
                >
                  {PHOTO_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">Mesure associée</label>
                <select
                  value={editingPhoto.mesure_id || ''}
                  onChange={(e) => setEditingPhoto({ ...editingPhoto, mesure_id: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-neon-purple focus:outline-none"
                >
                  <option value="">Aucune mesure</option>
                  {mesures.map(mesure => (
                    <option key={mesure.id} value={mesure.id}>
                      {new Date(mesure.date).toLocaleDateString('fr-FR')} - {mesure.poids}kg
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">Commentaire</label>
                <textarea
                  value={editingPhoto.commentaire}
                  onChange={(e) => setEditingPhoto({ ...editingPhoto, commentaire: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-neon-purple focus:outline-none resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-neon-green/20 text-neon-green rounded-lg font-medium hover:bg-neon-green/30 transition-colors"
                >
                  Sauvegarder
                </button>
                <button
                  onClick={() => setEditingPhoto(null)}
                  className="px-4 py-2 bg-gray-500/20 text-gray-400 rounded-lg font-medium hover:bg-gray-500/30 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Galerie de photos */}
      {photos.length === 0 ? (
        <div className="text-center py-12">
          <Camera className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-2">Aucune photo de progression</p>
          <p className="text-sm text-muted-foreground">Cliquez sur &quot;Ajouter photo&quot; pour commencer</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <PhotoCard
              key={photo.id}
              photo={photo as unknown as PhotoData}
              mesures={mesures}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modal de comparaison */}
      {showComparison && comparisonData.photoA && comparisonData.photoB && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-space-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div>
                <h3 className="text-xl font-semibold text-white">Comparaison Photos</h3>
                <p className="text-muted-foreground">
                  {PHOTO_TYPES.find(t => t.value === comparisonData.selectedType)?.icon} {PHOTO_TYPES.find(t => t.value === comparisonData.selectedType)?.label}
                </p>
              </div>
              <button
                onClick={() => setShowComparison(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>

            {/* Sélecteurs de photos */}
            <div className="p-6 border-b border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Photo A (Avant) */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Photo &quot;Avant&quot;</label>
                  <select
                    value={comparisonData.photoA?.id || ''}
                    onChange={(e) => {
                      const photo = photos.find(p => p.id === e.target.value)
                      setComparisonData({...comparisonData, photoA: (photo as unknown as PhotoData) || null})
                    }}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-neon-cyan focus:outline-none"
                  >
                    {photos
                      .filter(p => p.type === comparisonData.selectedType)
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .map(photo => (
                        <option key={photo.id} value={photo.id}>
                          {new Date(photo.date).toLocaleDateString('fr-FR')} 
                          {photo.commentaire && ` - ${photo.commentaire.substring(0, 30)}${photo.commentaire.length > 30 ? '...' : ''}`}
                        </option>
                      ))
                    }
                  </select>
                </div>

                {/* Photo B (Après) */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Photo &quot;Après&quot;</label>
                  <select
                    value={comparisonData.photoB?.id || ''}
                    onChange={(e) => {
                      const photo = photos.find(p => p.id === e.target.value)
                      setComparisonData({...comparisonData, photoB: (photo as unknown as PhotoData) || null})
                    }}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-neon-cyan focus:outline-none"
                  >
                    {photos
                      .filter(p => p.type === comparisonData.selectedType)
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .map(photo => (
                        <option key={photo.id} value={photo.id}>
                          {new Date(photo.date).toLocaleDateString('fr-FR')} 
                          {photo.commentaire && ` - ${photo.commentaire.substring(0, 30)}${photo.commentaire.length > 30 ? '...' : ''}`}
                        </option>
                      ))
                    }
                  </select>
                </div>
              </div>
            </div>

            {/* Comparaison côte à côte */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Photo Avant */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-neon-cyan">📅 AVANT</h4>
                    <span className="text-sm text-muted-foreground">
                      {new Date(comparisonData.photoA.date).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-neon-cyan/30">
                    <Image
                      src={comparisonData.photoA.url}
                      alt="Photo avant"
                      fill
                      className="object-cover"
                    />
                  </div>
                  {comparisonData.photoA.commentaire && (
                    <p className="text-sm text-muted-foreground">
                      💬 {comparisonData.photoA.commentaire}
                    </p>
                  )}
                </div>

                {/* Photo Après */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-neon-green">✨ APRÈS</h4>
                    <span className="text-sm text-muted-foreground">
                      {new Date(comparisonData.photoB.date).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-neon-green/30">
                    <Image
                      src={comparisonData.photoB.url}
                      alt="Photo après"
                      fill
                      className="object-cover"
                    />
                  </div>
                  {comparisonData.photoB.commentaire && (
                    <p className="text-sm text-muted-foreground">
                      💬 {comparisonData.photoB.commentaire}
                    </p>
                  )}
                </div>
              </div>

              {/* Statistiques de progression */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="text-center">
                  <h5 className="text-lg font-semibold text-white mb-3">📊 Progression</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-muted-foreground">Durée</div>
                      <div className="text-white font-semibold">
                        {Math.abs(
                          Math.round((new Date(comparisonData.photoB.date).getTime() - new Date(comparisonData.photoA.date).getTime()) / (1000 * 60 * 60 * 24))
                        )} jours
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-muted-foreground">Type</div>
                      <div className="text-white font-semibold">
                        {PHOTO_TYPES.find(t => t.value === comparisonData.selectedType)?.icon} {PHOTO_TYPES.find(t => t.value === comparisonData.selectedType)?.label}
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-muted-foreground">Évolution</div>
                      <div className="text-neon-green font-semibold">
                        🚀 En progression !
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}