'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { PhotoLibre } from '@/types'
import { usePhotosLibres } from '@/hooks/useFirestore'
import { 
  Camera, 
  Upload, 
  X, 
  Heart, 
  Edit3, 
  Trash2, 
  Tag, 
  Calendar,
  Image as ImageIcon
} from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'

interface PhotosLibresGalleryProps {
  date?: string // Pour filtrer par date si besoin
}

// Tags prédéfinis populaires
const TAGS_SUGGESTIONS = [
  'Repas', 'Sport', 'Nature', 'Famille', 'Amis', 'Voyage', 
  'Détente', 'Travail', 'Loisir', 'Motivation', 'Achievement', 'Mood'
]

// Composant Modal avec Portal pour éviter les problèmes de z-index
function Modal({ children, isOpen }: { children: React.ReactNode; isOpen: boolean }) {
  if (!isOpen) return null
  
  return createPortal(
    children,
    document.body
  )
}

export default function PhotosLibresGallery({ date }: PhotosLibresGalleryProps) {
  const { photos, loading, uploading, uploadPhoto, updatePhoto, deletePhoto, toggleFavoris } = usePhotosLibres()
  
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoLibre | null>(null)
  const [editingPhoto, setEditingPhoto] = useState<PhotoLibre | null>(null)
  const [filterFavoris, setFilterFavoris] = useState(false)
  const [filterTag, setFilterTag] = useState('')
  
  const modalRef = useRef<HTMLDivElement>(null)

  // Filtrer les photos
  const filteredPhotos = photos.filter(photo => {
    if (date && photo.date !== date) return false
    if (filterFavoris && !photo.favoris) return false
    if (filterTag && !photo.tags?.includes(filterTag)) return false
    return true
  })

  // Obtenir tous les tags uniques
  const allTags = Array.from(new Set(photos.flatMap(p => p.tags || [])))

  // Auto-focus sur le modal et gestion Escape
  useEffect(() => {
    if (showUploadForm && modalRef.current) {
      modalRef.current.focus()
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showUploadForm) setShowUploadForm(false)
        if (selectedPhoto) setSelectedPhoto(null)
        if (editingPhoto) setEditingPhoto(null)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [showUploadForm, selectedPhoto, editingPhoto])

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation() // Empêcher la propagation vers le formulaire parent
    const formData = new FormData(e.currentTarget)
    const file = formData.get('photo') as File
    
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image valide')
      return
    }

    const titre = formData.get('titre') as string
    const description = formData.get('description') as string
    const tagsInput = formData.get('tags') as string
    const tags = tagsInput.split(',').map(t => t.trim()).filter(t => t.length > 0)
    const photoDate = formData.get('date') as string

    const result = await uploadPhoto(file, {
      date: photoDate,
      titre,
      description,
      tags
    })

    if (result.success) {
      toast.success('Photo ajoutée avec succès !')
      setShowUploadForm(false)
    } else {
      toast.error(`Erreur : ${result.error}`)
    }
  }

  const handleEdit = async (photo: PhotoLibre, updates: {
    titre?: string
    description?: string
    tags?: string[]
  }) => {
    const result = await updatePhoto(photo.id, updates)
    if (result.success) {
      toast.success('Photo modifiée !')
      setEditingPhoto(null)
    } else {
      toast.error(`Erreur : ${result.error}`)
    }
  }

  const handleDelete = async (photo: PhotoLibre) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer cette photo "${photo.titre || 'Sans titre'}" ?`)) return

    const result = await deletePhoto(photo.id, photo.fileName)
    if (result.success) {
      toast.success('Photo supprimée')
      setSelectedPhoto(null)
    } else {
      toast.error(`Erreur : ${result.error}`)
    }
  }

  const handleToggleFavoris = async (photo: PhotoLibre) => {
    const result = await toggleFavoris(photo.id, photo.favoris)
    if (result.success) {
      toast.success(photo.favoris ? 'Retiré des favoris' : 'Ajouté aux favoris')
    } else {
      toast.error('Erreur lors de la modification')
    }
  }

  if (loading) {
    return <div className="text-center py-4 text-muted-foreground">Chargement des photos...</div>
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-neon-purple" />
          <h3 className="text-lg font-semibold text-white">Galerie Photos</h3>
          <span className="text-sm text-muted-foreground">({filteredPhotos.length})</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            setShowUploadForm(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-neon-purple/20 text-neon-purple rounded-lg hover:bg-neon-purple/30 transition-colors"
        >
          <Upload className="h-4 w-4" />
          Ajouter une photo
        </button>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2 items-center">
        <button
          onClick={() => setFilterFavoris(!filterFavoris)}
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
            filterFavoris 
              ? 'bg-red-500/20 text-red-400 border border-red-500/50' 
              : 'bg-white/10 text-muted-foreground hover:bg-white/20'
          }`}
        >
          <Heart className={`h-3 w-3 ${filterFavoris ? 'fill-current' : ''}`} />
          Favoris
        </button>

        <select
          value={filterTag}
          onChange={(e) => setFilterTag(e.target.value)}
          className="px-3 py-1 bg-white/10 border border-white/20 rounded text-sm text-white focus:border-neon-purple focus:outline-none"
        >
          <option value="">Tous les tags</option>
          {allTags.map(tag => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>

        {(filterFavoris || filterTag) && (
          <button
            onClick={() => {
              setFilterFavoris(false)
              setFilterTag('')
            }}
            className="px-2 py-1 text-xs text-muted-foreground hover:text-white"
          >
            Réinitialiser
          </button>
        )}
      </div>

      {/* Galerie */}
      {filteredPhotos.length === 0 ? (
        <div className="glass-effect p-8 rounded-lg text-center">
          <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground mb-4">
            {date ? `Aucune photo pour le ${date}` : 'Aucune photo dans votre galerie'}
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowUploadForm(true)
            }}
            className="px-4 py-2 bg-neon-purple/20 text-neon-purple rounded-lg hover:bg-neon-purple/30 transition-colors"
          >
            Ajouter votre première photo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              className="glass-effect rounded-lg overflow-hidden group relative cursor-pointer hover:scale-105 transition-transform"
              onClick={() => setSelectedPhoto(photo)}
            >
              <div className="aspect-square relative">
                <Image
                  src={photo.url}
                  alt={photo.titre || 'Photo'}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  quality={85}
                  className="object-cover"
                />
                {photo.favoris && (
                  <Heart className="absolute top-2 right-2 h-4 w-4 text-red-400 fill-current" />
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="text-white text-sm text-center p-2">
                    {photo.titre && <div className="font-medium">{photo.titre}</div>}
                    <div className="text-xs opacity-75">{photo.date}</div>
                  </div>
                </div>
              </div>
              {photo.tags && photo.tags.length > 0 && (
                <div className="p-2">
                  <div className="flex flex-wrap gap-1">
                    {photo.tags.slice(0, 2).map((tag, index) => (
                      <span key={index} className="text-xs bg-neon-purple/20 text-neon-purple px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                    {photo.tags.length > 2 && (
                      <span className="text-xs text-muted-foreground">+{photo.tags.length - 2}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal d'upload */}
      <Modal isOpen={showUploadForm}>
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4" style={{ zIndex: 99999 }}>
          <div 
            ref={modalRef}
            tabIndex={-1}
            className="bg-space-800/95 backdrop-blur-xl p-6 rounded-lg border border-white/20 w-full max-w-md shadow-2xl focus:outline-none"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Ajouter une photo</h3>
              <button
                type="button"
                onClick={() => setShowUploadForm(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Photo</label>
                <input
                  type="file"
                  name="photo"
                  accept="image/*"
                  required
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-neon-purple focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Date</label>
                <input
                  type="date"
                  name="date"
                  defaultValue={date || new Date().toISOString().split('T')[0]}
                  required
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-neon-purple focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Titre (optionnel)</label>
                <input
                  type="text"
                  name="titre"
                  placeholder="Ex: Petit déjeuner healthy"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-muted-foreground focus:border-neon-purple focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Description (optionnel)</label>
                <textarea
                  name="description"
                  rows={2}
                  placeholder="Décrivez cette photo..."
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-muted-foreground focus:border-neon-purple focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Tags (séparés par des virgules)</label>
                <input
                  type="text"
                  name="tags"
                  placeholder="Ex: Repas, Healthy, Motivation"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-muted-foreground focus:border-neon-purple focus:outline-none"
                />
                <div className="flex flex-wrap gap-1 mt-2">
                  {TAGS_SUGGESTIONS.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={(e) => {
                        const input = e.currentTarget.parentElement?.previousElementSibling as HTMLInputElement
                        const current = input.value
                        const tags = current ? current.split(',').map(t => t.trim()) : []
                        if (!tags.includes(tag)) {
                          tags.push(tag)
                          input.value = tags.join(', ')
                        }
                      }}
                      className="text-xs px-2 py-1 bg-white/10 text-white rounded hover:bg-white/20 transition-colors"
                    >
                      +{tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowUploadForm(false)}
                  className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-6 py-2 bg-neon-purple/20 text-neon-purple rounded-lg font-medium hover:bg-neon-purple/30 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {uploading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-neon-purple"></div>
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {uploading ? 'Upload...' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Modal>

      {/* Modal de visualisation */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4" style={{ zIndex: 99999 }}>
          <div className="bg-space-800/95 backdrop-blur-xl rounded-lg border border-white/20 max-w-4xl w-full max-h-[90vh] overflow-auto shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-lg font-semibold text-white">
                {selectedPhoto.titre || 'Photo'}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleFavoris(selectedPhoto)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Heart className={`h-4 w-4 ${selectedPhoto.favoris ? 'text-red-400 fill-current' : 'text-white'}`} />
                </button>
                <button
                  onClick={() => setEditingPhoto(selectedPhoto)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Edit3 className="h-4 w-4 text-white" />
                </button>
                <button
                  onClick={() => handleDelete(selectedPhoto)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4 text-red-400" />
                </button>
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <div className="w-full h-96 relative rounded-lg overflow-hidden mb-4">
                <Image
                  src={selectedPhoto.url}
                  alt={selectedPhoto.titre || 'Photo'}
                  fill
                  sizes="100vw"
                  quality={95}
                  priority
                  className="object-contain"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {selectedPhoto.date}
                </div>
                
                {selectedPhoto.description && (
                  <p className="text-white">{selectedPhoto.description}</p>
                )}
                
                {selectedPhoto.tags && selectedPhoto.tags.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-wrap gap-1">
                      {selectedPhoto.tags.map((tag, index) => (
                        <span key={index} className="text-xs bg-neon-purple/20 text-neon-purple px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'édition */}
      {editingPhoto && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4" style={{ zIndex: 99999 }}>
          <div className="bg-space-800/95 backdrop-blur-xl p-6 rounded-lg border border-white/20 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Modifier la photo</h3>
              <button
                onClick={() => setEditingPhoto(null)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation() // Empêcher la propagation vers le formulaire parent
              const formData = new FormData(e.currentTarget)
              const titre = formData.get('titre') as string
              const description = formData.get('description') as string
              const tagsInput = formData.get('tags') as string
              const tags = tagsInput.split(',').map(t => t.trim()).filter(t => t.length > 0)

              handleEdit(editingPhoto, { titre, description, tags })
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Titre</label>
                <input
                  type="text"
                  name="titre"
                  defaultValue={editingPhoto.titre}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-neon-purple focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={editingPhoto.description}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-neon-purple focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Tags</label>
                <input
                  type="text"
                  name="tags"
                  defaultValue={editingPhoto.tags?.join(', ')}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-neon-purple focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingPhoto(null)}
                  className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-neon-purple/20 text-neon-purple rounded-lg font-medium hover:bg-neon-purple/30 transition-colors"
                >
                  Sauvegarder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}