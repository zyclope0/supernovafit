'use client'

import { useState, useEffect } from 'react'
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs,
  getDoc, 
  query, 
  where, 
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
  QueryConstraint
} from 'firebase/firestore'
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage'
import type { DocumentData } from 'firebase/firestore'
import { db, storage } from '@/lib/firebase'
import { useAuth } from './useAuth'
import { generateId } from '@/lib/utils'
import { Repas, Entrainement, Mesure, JournalEntry, Aliment, MesureStats, PhotoProgression, Badge, Objectif, PhotoLibre, CoachDietPlan } from '@/types'

// Hook pour les repas
export function useRepas() {
  const { user } = useAuth()
  const [repas, setRepas] = useState<Repas[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setRepas([])
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'repas'),
      where('user_id', '==', user.uid),
      orderBy('date', 'desc')
    )

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const repasData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Repas[]
        setRepas(repasData)
        setLoading(false)
      },
      (error) => {
        console.error('❌ FIRESTORE - Erreur snapshot:', error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user])

  const addRepas = async (repasData: Omit<Repas, 'id'>) => {
    if (!user) return { success: false, error: 'Non connecté' }

    try {
      const docData = {
        ...repasData,
        created_at: serverTimestamp()
      }
      
      const docRef = await addDoc(collection(db, 'repas'), docData)
      
      return { success: true, id: docRef.id }
    } catch (error: unknown) {
      console.error('❌ Erreur lors de l\'enregistrement:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' }
    }
  }

  const updateRepas = async (id: string, repasData: Partial<Omit<Repas, 'id' | 'created_at'>>) => {
    if (!user) return { success: false, error: 'Non connecté' }
    
    try {
      const updateData = {
        ...repasData,
        updated_at: serverTimestamp()
      }
      
      await updateDoc(doc(db, 'repas', id), updateData)
      return { success: true }
    } catch (error: unknown) {
      console.error('❌ Erreur lors de la mise à jour:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' }
    }
  }

  const deleteRepas = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'repas', id))
      return { success: true }
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' }
    }
  }

  return { repas, loading, addRepas, updateRepas, deleteRepas }
}

// Hook pour les entraînements
export function useEntrainements() {
  const { user } = useAuth()
  const [entrainements, setEntrainements] = useState<Entrainement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setEntrainements([])
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'entrainements'),
      where('user_id', '==', user.uid),
      orderBy('date', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const entrainementsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Entrainement[]
      setEntrainements(entrainementsData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  const addEntrainement = async (entrainementData: Omit<Entrainement, 'id'>) => {
    if (!user) {
      console.error('❌ ERREUR: Utilisateur non connecté')
      throw new Error('Non connecté')
    }

    try {
      // Vérifier les doublons Garmin si garmin_id est présent
      if (entrainementData.garmin_id) {
        const existingQuery = query(
          collection(db, 'entrainements'),
          where('user_id', '==', user.uid),
          where('garmin_id', '==', entrainementData.garmin_id)
        )
        
        const existingDocs = await getDocs(existingQuery)
        if (!existingDocs.empty) {
          return { 
            success: false, 
            error: 'Entraînement déjà importé',
            isDuplicate: true 
          }
        }
      }

      const docRef = await addDoc(collection(db, 'entrainements'), {
        ...entrainementData,
        user_id: user.uid,
        created_at: serverTimestamp()
      })
      
      return { success: true, id: docRef.id }
    } catch (error: unknown) {
      console.error('❌ ERREUR AJOUT ENTRAÎNEMENT:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' }
    }
  }

  const updateEntrainement = async (id: string, entrainementData: Partial<Omit<Entrainement, 'id' | 'user_id'>>) => {
    if (!user) return { success: false, error: 'Non connecté' }

    try {
      const docRef = doc(db, 'entrainements', id)
      await updateDoc(docRef, {
        ...entrainementData,
        updated_at: serverTimestamp()
      })
      return { success: true }
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' }
    }
  }

  const deleteEntrainement = async (id: string) => {
    if (!user) return { success: false, error: 'Non connecté' }

    try {
      await deleteDoc(doc(db, 'entrainements', id))
      return { success: true }
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' }
    }
  }

  return { entrainements, loading, addEntrainement, updateEntrainement, deleteEntrainement }
}




// Hook pour les favoris aliments
export function useFavoris() {
  const { user } = useAuth()
  const [favoris, setFavoris] = useState<Aliment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setFavoris([])
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'favoris_aliments'),
      where('user_id', '==', user.uid),
      orderBy('created_at', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const favorisData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Aliment[]
      setFavoris(favorisData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  const addToFavoris = async (aliment: Omit<Aliment, 'id'>) => {
    if (!user) return { success: false, error: 'Non connecté' }

    // Vérifier si déjà en favoris (par nom ou openfoodfacts_id)
    const exists = favoris.some(f => 
      f.nom.toLowerCase() === aliment.nom.toLowerCase() ||
      (aliment.openfoodfacts_id && f.openfoodfacts_id === aliment.openfoodfacts_id)
    )

    if (exists) {
      return { success: false, error: 'Aliment déjà en favoris' }
    }

    try {
      const docRef = await addDoc(collection(db, 'favoris_aliments'), {
        ...aliment,
        user_id: user.uid,
        created_at: serverTimestamp(),
        // Normaliser pour recherche
        nom_lower: aliment.nom.toLowerCase()
      })
      return { success: true, id: docRef.id }
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' }
    }
  }

  const removeFromFavoris = async (id: string) => {
    if (!user) return { success: false, error: 'Non connecté' }

    try {
      await deleteDoc(doc(db, 'favoris_aliments', id))
      return { success: true }
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' }
    }
  }

  const isFavori = (aliment: Aliment | Omit<Aliment, 'id'>) => {
    return favoris.some(f => 
      f.nom.toLowerCase() === aliment.nom.toLowerCase() ||
      (aliment.openfoodfacts_id && f.openfoodfacts_id === aliment.openfoodfacts_id)
    )
  }

  return { favoris, loading, addToFavoris, removeFromFavoris, isFavori }
}

// Hook pour les mesures corporelles
export function useMesures() {
  const { user } = useAuth()
  const [mesures, setMesures] = useState<Mesure[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setMesures([])
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'mesures'),
      where('user_id', '==', user.uid),
      orderBy('date', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const mesuresData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Mesure[]
      setMesures(mesuresData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  const addMesure = async (mesureData: Omit<Mesure, 'id'>) => {
    if (!user) return { success: false, error: 'Non connecté' }

    try {
      // Calculer l'IMC si poids et taille fournis
      let imc = mesureData.imc
      if (mesureData.poids && mesureData.taille) {
        imc = mesureData.poids / Math.pow(mesureData.taille / 100, 2)
      }

      // Préparer les données en filtrant les valeurs undefined
      const dataToSave: Record<string, unknown> = {
        user_id: user.uid,
        date: mesureData.date,
        created_at: serverTimestamp()
      }

      // Ajouter seulement les champs qui ont des valeurs
      if (mesureData.poids) dataToSave.poids = mesureData.poids
      if (mesureData.taille) dataToSave.taille = mesureData.taille
      if (mesureData.masse_grasse) dataToSave.masse_grasse = mesureData.masse_grasse
      if (mesureData.masse_musculaire) dataToSave.masse_musculaire = mesureData.masse_musculaire
      if (mesureData.tour_taille) dataToSave.tour_taille = mesureData.tour_taille
      if (mesureData.tour_hanches) dataToSave.tour_hanches = mesureData.tour_hanches
      if (mesureData.tour_bras) dataToSave.tour_bras = mesureData.tour_bras
      if (mesureData.tour_cuisses) dataToSave.tour_cuisses = mesureData.tour_cuisses
      if (mesureData.tour_cou) dataToSave.tour_cou = mesureData.tour_cou
      if (mesureData.tour_poitrine) dataToSave.tour_poitrine = mesureData.tour_poitrine
      if (mesureData.commentaire) dataToSave.commentaire = mesureData.commentaire
      if (imc) dataToSave.imc = parseFloat(imc.toFixed(1))

      const docRef = await addDoc(collection(db, 'mesures'), dataToSave)
      return { success: true, id: docRef.id }
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' }
    }
  }

  const updateMesure = async (id: string, mesureData: Partial<Mesure>) => {
    if (!user) return { success: false, error: 'Non connecté' }

    try {
      // Recalculer l'IMC si nécessaire
      const mesure = mesures.find(m => m.id === id)
      if (mesure && (mesureData.poids || mesureData.taille)) {
        const poids = mesureData.poids ?? mesure.poids
        const taille = mesureData.taille ?? mesure.taille
        if (poids && taille) {
          mesureData.imc = parseFloat((poids / Math.pow(taille / 100, 2)).toFixed(1))
        }
      }

      // Filtrer les valeurs undefined pour Firestore
      const dataToUpdate: Record<string, unknown> = {}
      Object.keys(mesureData).forEach(key => {
        const value = mesureData[key as keyof Partial<Mesure>]
        if (value !== undefined) {
          dataToUpdate[key] = value
        }
      })

      await updateDoc(doc(db, 'mesures', id), dataToUpdate as Partial<DocumentData>)
      return { success: true }
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' }
    }
  }

  const deleteMesure = async (id: string) => {
    if (!user) return { success: false, error: 'Non connecté' }

    try {
      await deleteDoc(doc(db, 'mesures', id))
      return { success: true }
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' }
    }
  }

  // Calculer les statistiques
  const getStats = (mesure: Mesure): MesureStats | null => {
    if (!mesure.poids || !mesure.taille) return null

    const imc = mesure.imc || mesure.poids / Math.pow(mesure.taille / 100, 2)
    
    // Poids idéal selon IMC (18.5 - 24.9)
    const tailleM = mesure.taille / 100
    const poids_ideal_min = 18.5 * Math.pow(tailleM, 2)
    const poids_ideal_max = 24.9 * Math.pow(tailleM, 2)

    // Evolution depuis dernière mesure
    const mesuresAvecPoids = mesures.filter(m => m.poids && m.date < mesure.date).sort((a, b) => b.date.localeCompare(a.date))
    const derniereMesure = mesuresAvecPoids[0]
    
    let evolution_poids = 0
    let evolution_masse_grasse = 0
    
    if (derniereMesure?.poids) {
      evolution_poids = ((mesure.poids - derniereMesure.poids) / derniereMesure.poids) * 100
    }
    if (derniereMesure?.masse_grasse && mesure.masse_grasse) {
      evolution_masse_grasse = mesure.masse_grasse - derniereMesure.masse_grasse
    }

    // Tendances (simplifié pour l'instant)
    const tendance_7j: 'hausse' | 'baisse' | 'stable' = Math.abs(evolution_poids) < 1 ? 'stable' : evolution_poids > 0 ? 'hausse' : 'baisse'
    const tendance_30j = tendance_7j // À améliorer avec plus de données

    return {
      imc: parseFloat(imc.toFixed(1)),
      evolution_poids: parseFloat(evolution_poids.toFixed(1)),
      evolution_masse_grasse: parseFloat(evolution_masse_grasse.toFixed(1)),
      poids_ideal_min: parseFloat(poids_ideal_min.toFixed(1)),
      poids_ideal_max: parseFloat(poids_ideal_max.toFixed(1)),
      tendance_7j,
      tendance_30j
    }
  }

  return { mesures, loading, addMesure, updateMesure, deleteMesure, getStats }
}

// Hook pour les photos de progression
export function usePhotos() {
  const { user } = useAuth()
  const [photos, setPhotos] = useState<PhotoProgression[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!user) {
      setPhotos([])
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'photos_progression'),
      where('user_id', '==', user.uid),
      orderBy('date', 'desc')
    )

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const photosData = snapshot.docs.map(doc => ({
          ...(doc.data() as PhotoProgression),
          id: doc.id
        })) as PhotoProgression[]
        setPhotos(photosData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  const uploadPhoto = async (file: File, photoData: {
    date: string
    type: 'face' | 'profil' | 'dos' | 'libre'
    mesure_id?: string
    commentaire?: string
  }) => {
    if (!user) return { success: false, error: 'Non connecté' }

    setUploading(true)
    try {
      // Générer un nom de fichier unique
      const fileName = `${user.uid}_${Date.now()}_${file.name}`
      const storageRef = ref(storage, `photos_progression/${fileName}`)

      // Upload le fichier
      const snapshot = await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(snapshot.ref)

      // Sauvegarder les métadonnées en Firestore
      const docRef = await addDoc(collection(db, 'photos_progression'), {
        user_id: user.uid,
        url: downloadURL,
        fileName: fileName,
        date: photoData.date,
        type: photoData.type,
        mesure_id: photoData.mesure_id || null,
        commentaire: photoData.commentaire || '',
        created_at: serverTimestamp()
      })

      setUploading(false)
      return { success: true, id: docRef.id, url: downloadURL }
    } catch (error: unknown) {
      setUploading(false)
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' }
    }
  }

  const deletePhoto = async (photoId: string, fileName: string) => {
    if (!user) return { success: false, error: 'Non connecté' }

    try {
      // Supprimer le fichier du storage
      const storageRef = ref(storage, `photos_progression/${fileName}`)
      await deleteObject(storageRef)

      // Supprimer le document Firestore
      await deleteDoc(doc(db, 'photos_progression', photoId))

      return { success: true }
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' }
    }
  }

  const updatePhoto = async (photoId: string, updates: {
    commentaire?: string
    type?: 'face' | 'profil' | 'dos' | 'libre'
    mesure_id?: string
  }) => {
    if (!user) return { success: false, error: 'Non connecté' }

    try {
      // Filtrer les valeurs undefined pour Firestore
      const filteredUpdates = Object.fromEntries(
        Object.entries(updates).filter(([, value]) => value !== undefined)
      )
      
      // Si mesure_id est vide, le mettre à null explicitement
      if ('mesure_id' in updates && !updates.mesure_id) {
        // Firestore: null acceptable mais côté types attendre string|undefined; on force null dans Doc
        (filteredUpdates as Record<string, unknown>).mesure_id = null
      }

      await updateDoc(doc(db, 'photos_progression', photoId), filteredUpdates)
      return { success: true }
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' }
    }
  }

  return { 
    photos, 
    loading, 
    uploading, 
    uploadPhoto, 
    deletePhoto, 
    updatePhoto 
  }
}

// Hook pour le journal
export function useJournal() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setEntries([])
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'journal'),
      where('user_id', '==', user.uid),
      orderBy('date', 'desc')
    )

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const entriesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as JournalEntry[]
        setEntries(entriesData)
        setLoading(false)
      },
      (error) => {
        console.error('❌ FIRESTORE - Erreur snapshot journal:', error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user])

  const addEntry = async (entryData: Omit<JournalEntry, 'id'>) => {
    if (!user) return { success: false, error: 'Non connecté' }

    try {
      // Filtrer les valeurs undefined
      const filteredData = Object.fromEntries(
        Object.entries({
          ...entryData,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp()
        }).filter(([, value]) => value !== undefined)
      )
      
      const docRef = await addDoc(collection(db, 'journal'), filteredData)
      return { success: true, id: docRef.id }
    } catch (error: unknown) {
      console.error('❌ Erreur ajout entrée journal:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' }
    }
  }

  const updateEntry = async (id: string, entryData: Partial<Omit<JournalEntry, 'id' | 'user_id' | 'created_at'>>) => {
    if (!user) return { success: false, error: 'Non connecté' }

    try {
      // Filtrer les valeurs undefined ET les user_id vides
      const filteredData = Object.fromEntries(
        Object.entries({
          ...entryData,
          updated_at: serverTimestamp()
        }).filter(([key, value]) => {
          // Ne pas inclure user_id s'il est vide ou undefined
          if (key === 'user_id' && (!value || value === '')) return false
          return value !== undefined
        })
      )

      await updateDoc(doc(db, 'journal', id), filteredData)
      return { success: true }
    } catch (error: unknown) {
      console.error('❌ Erreur mise à jour entrée journal:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' }
    }
  }

  const deleteEntry = async (id: string) => {
    if (!user) return { success: false, error: 'Non connecté' }

    try {
      await deleteDoc(doc(db, 'journal', id))
      return { success: true }
    } catch (error: unknown) {
      console.error('❌ Erreur suppression entrée journal:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' }
    }
  }

  return {
    entries,
    loading,
    addEntry,
    updateEntry,
    deleteEntry
  }
}

// Hook pour les photos libres du journal
export function usePhotosLibres() {
  const { user } = useAuth()
  const [photos, setPhotos] = useState<PhotoLibre[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!user) {
      setPhotos([])
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'photos_libres'),
      where('user_id', '==', user.uid)
      // orderBy('date', 'desc') // Temporaire : retiré en attendant index
    )

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const photosData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as PhotoLibre[]
        
        // Tri côté client en attendant l'index Firestore
        const sortedPhotos = photosData.sort((a, b) => b.date.localeCompare(a.date))
        setPhotos(sortedPhotos)
        setLoading(false)
      },
      (error) => {
        console.error('❌ FIRESTORE - Erreur snapshot photos libres:', error)
        console.error('❌ FIRESTORE - Code erreur:', error.code)
        console.error('❌ FIRESTORE - Message:', error.message)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user])

  const uploadPhoto = async (file: File, photoData: {
    date: string
    titre?: string
    description?: string
    tags?: string[]
  }) => {
    if (!user) return { success: false, error: 'Non connecté' }

    setUploading(true)
    try {
      // Générer un nom de fichier unique
      const fileName = `${user.uid}_${Date.now()}_${file.name}`
      const storageRef = ref(storage, `photos_libres/${fileName}`)

      // Upload le fichier
      const snapshot = await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(snapshot.ref)

      // Sauvegarder les métadonnées en Firestore
      const photoMetadata = {
        user_id: user.uid,
        url: downloadURL,
        fileName: fileName,
        date: photoData.date,
        titre: photoData.titre || '',
        description: photoData.description || '',
        tags: photoData.tags || [],
        favoris: false
      }
      
      const docRef = await addDoc(collection(db, 'photos_libres'), {
        ...photoMetadata,
        created_at: serverTimestamp()
      })

      setUploading(false)
      return { success: true, id: docRef.id, url: downloadURL }
    } catch (error: unknown) {
      console.error('❌ UPLOAD - Erreur upload photo:', error)
      console.error('❌ UPLOAD - Code erreur:', (error as unknown as { code?: string })?.code)
      console.error('❌ UPLOAD - Message:', (error as unknown as { message?: string })?.message)
      setUploading(false)
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' }
    }
  }

  const updatePhoto = async (photoId: string, updates: {
    titre?: string
    description?: string
    tags?: string[]
    favoris?: boolean
  }) => {
    if (!user) return { success: false, error: 'Non connecté' }

    try {
      // Filtrer les valeurs undefined
      const filteredUpdates = Object.fromEntries(
        Object.entries(updates).filter(([, value]) => value !== undefined)
      )

      await updateDoc(doc(db, 'photos_libres', photoId), {
        ...filteredUpdates,
        updated_at: serverTimestamp()
      })
      return { success: true }
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' }
    }
  }

  const deletePhoto = async (photoId: string, fileName: string) => {
    if (!user) return { success: false, error: 'Non connecté' }

    try {
      // Supprimer le fichier du storage
      const storageRef = ref(storage, `photos_libres/${fileName}`)
      await deleteObject(storageRef)

      // Supprimer le document Firestore
      await deleteDoc(doc(db, 'photos_libres', photoId))

      return { success: true }
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' }
    }
  }

  const toggleFavoris = async (photoId: string, currentFavoris: boolean) => {
    return updatePhoto(photoId, { favoris: !currentFavoris })
  }

  return {
    photos,
    loading,
    uploading,
    uploadPhoto,
    updatePhoto,
    deletePhoto,
    toggleFavoris
  }
}

// Hook pour les badges
export function useBadges() {
  const { user } = useAuth()
  const [badges, setBadges] = useState<Badge[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setBadges([])
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'badges'),
      where('user_id', '==', user.uid),
      orderBy('date_obtenu', 'desc')
    )

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const badgesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Badge[]
        
        setBadges(badgesData)
        setLoading(false)
      },
      (error) => {
        console.error('❌ FIRESTORE - Erreur snapshot badges:', error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user])

  const addBadge = async (badgeData: {
    type: 'streak' | 'objectif' | 'performance' | 'special'
    nom: string
    description: string
    icone: string
    condition: string
  }) => {
    if (!user) return { success: false, error: 'Non connecté' }

    try {
      const docRef = await addDoc(collection(db, 'badges'), {
        user_id: user.uid,
        ...badgeData,
        date_obtenu: new Date().toISOString().split('T')[0],
        created_at: serverTimestamp()
      })

      return { success: true, id: docRef.id }
    } catch (error: unknown) {
      console.error('❌ BADGES - Erreur ajout badge:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' }
    }
  }

  return { badges, loading, addBadge }
}

// Hook pour les objectifs simples
export function useObjectifs() {
  const { user } = useAuth()
  const [objectifs, setObjectifs] = useState<Objectif[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setObjectifs([])
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'objectifs'),
      where('user_id', '==', user.uid),
      orderBy('created_at', 'desc')
    )

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const objectifsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Objectif[]
        
        setObjectifs(objectifsData)
        setLoading(false)
      },
      (error) => {
        console.error('❌ FIRESTORE - Erreur snapshot objectifs:', error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user])

  const addObjectif = async (objectifData: {
    titre: string
    description: string
    cible: number
    type: 'journal' | 'humeur' | 'entrainement'
  }) => {
    if (!user) return { success: false, error: 'Non connecté' }

    try {
      const docRef = await addDoc(collection(db, 'objectifs'), {
        user_id: user.uid,
        ...objectifData,
        progression: 0,
        statut: 'actif',
        created_at: serverTimestamp()
      })

      return { success: true, id: docRef.id }
    } catch (error: unknown) {
      console.error('❌ OBJECTIFS - Erreur ajout objectif:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' }
    }
  }

  const updateProgression = async (objectifId: string, progression: number) => {
    if (!user) return { success: false, error: 'Non connecté' }

    try {
      const objectifRef = doc(db, 'objectifs', objectifId)
      const statut = progression >= 100 ? 'accompli' : 'actif'
      await updateDoc(objectifRef, {
        progression,
        statut,
        completed_at: statut === 'accompli' ? serverTimestamp() : null
      })

      return { success: true }
    } catch (error: unknown) {
      console.error('❌ OBJECTIFS - Erreur update progression:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' }
    }
  }

  return { objectifs, loading, addObjectif, updateProgression }
}

// Hook pour récupérer le profil utilisateur
import type { User as UserProfile } from '@/types'
export function useUserProfile() {
  const { user } = useAuth()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setUserProfile(null)
      setLoading(false)
      return
    }

    const docRef = doc(db, 'users', user.uid)
    
    const unsubscribe = onSnapshot(docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setUserProfile({ id: snapshot.id, ...(snapshot.data() as Partial<UserProfile>) } as UserProfile)
        } else {
          setUserProfile(null)
        }
        setLoading(false)
      },
      (error) => {
        console.error('❌ FIRESTORE - Erreur profil utilisateur:', error)
        setUserProfile(null)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user])

  const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const docRef = doc(db, 'users', userId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...(docSnap.data() as Partial<UserProfile>) } as UserProfile
      }
      return null
    } catch (error) {
      console.error('❌ FIRESTORE - Erreur récupération profil:', error)
      return null
    }
  }

  return { userProfile, loading, getUserProfile }
}

// Hook pour gérer les relations coach-athlète
export function useCoachAthletes() {
  const { user } = useAuth()
  type AthleteLite = Pick<UserProfile, 'id' | 'nom' | 'email' | 'objectif' | 'dernier_acces'> & { coach_id?: string }
  const [athletes, setAthletes] = useState<AthleteLite[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setAthletes([])
      setLoading(false)
      return
    }

    // Récupérer tous les utilisateurs
    const q = collection(db, 'users')

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const athletesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Partial<UserProfile>)
        })).filter(athlete => athlete.id !== user.uid) as AthleteLite[] // Exclure le coach lui-même
        
        setAthletes(athletesData)
        setLoading(false)
      },
      (error) => {
        console.error('❌ FIRESTORE - Erreur récupération athlètes:', error)
        setAthletes([])
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user])

  // Envoyer une invitation à un athlète
  const sendInvitation = async (email: string) => {
    if (!user) return { success: false, error: 'Non connecté' }

    try {
      // Créer un token d'invitation unique
      const invitationToken = generateId()
      
      // Sauvegarder l'invitation
      await addDoc(collection(db, 'invitations'), {
        coach_id: user.uid,
        coach_email: user.email,
        athlete_email: email,
        token: invitationToken,
        status: 'pending',
        created_at: serverTimestamp(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 jours
      })

      // Envoi d'email d'invitation (optionnel, à implémenter côté service email)
      
      return { success: true, token: invitationToken }
    } catch (error: unknown) {
      console.error('❌ COACH - Erreur envoi invitation:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' }
    }
  }

  // Récupérer les données d'un athlète spécifique
  const getAthleteData = async (athleteId: string) => {
    if (!user) return null

    try {
      // Vérifier que l'athlète est bien lié au coach
      const athleteDoc = await getDoc(doc(db, 'users', athleteId))
      
      if (athleteDoc.exists() && athleteDoc.data().coach_id === user.uid) {
        // Récupérer les données récentes de l'athlète
        const now = new Date()
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

        // Récupérer les repas récents
        const repasQuery = query(
          collection(db, 'repas'),
          where('user_id', '==', athleteId),
          where('date', '>=', thirtyDaysAgo.toISOString().split('T')[0]),
          orderBy('date', 'desc')
        )
        const repasSnapshot = await getDocs(repasQuery)
        const repas = repasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

        // Récupérer les entraînements récents
        const entrainementsQuery = query(
          collection(db, 'entrainements'),
          where('user_id', '==', athleteId),
          where('date', '>=', thirtyDaysAgo.toISOString().split('T')[0]),
          orderBy('date', 'desc')
        )
        const entrainementsSnapshot = await getDocs(entrainementsQuery)
        const entrainements = entrainementsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

        // Récupérer les mesures récentes
        const mesuresQuery = query(
          collection(db, 'mesures'),
          where('user_id', '==', athleteId),
          orderBy('date', 'desc'),
          limit(30)
        )
        const mesuresSnapshot = await getDocs(mesuresQuery)
        const mesures = mesuresSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

        return {
          athlete: { id: athleteDoc.id, ...athleteDoc.data() },
          repas,
          entrainements,
          mesures
        }
      }
      
      return null
    } catch (error) {
      console.error('❌ COACH - Erreur récupération données athlète:', error)
      return null
    }
  }

  return { athletes, loading, sendInvitation, getAthleteData }
}

// Hook pour gérer les plans diète coach
export function useCoachDietPlans(athleteId: string) {
  const [dietPlans, setDietPlans] = useState<CoachDietPlan[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (!user || !athleteId) return

    const fetchDietPlans = async () => {
      try {
        // Simplifier la requête sans orderBy pour éviter les problèmes d'index
        const q = query(
          collection(db, 'coach_diet_plans'),
          where('athlete_id', '==', athleteId)
        )
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const plans = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as CoachDietPlan[]
          
          // Trier côté client par date de création
          plans.sort((a, b) => new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime())
          
          setDietPlans(plans)
          setLoading(false)
        })

        return unsubscribe
      } catch (error) {
        console.error('Erreur récupération plans diète:', error)
        setLoading(false)
        return () => {}
      }
    }

    const unsubscribe = fetchDietPlans()
    return () => {
      if (unsubscribe) unsubscribe
    }
  }, [user, athleteId])

  const addDietPlan = async (planData: Omit<CoachDietPlan, 'id'>) => {
    try {
      await addDoc(collection(db, 'coach_diet_plans'), {
        ...planData,
        created_at: serverTimestamp()
      })
    } catch (error) {
      console.error('Erreur ajout plan diète:', error)
      throw error
    }
  }

  const updateDietPlan = async (planId: string, updates: Partial<CoachDietPlan>) => {
    try {
      await updateDoc(doc(db, 'coach_diet_plans', planId), {
        ...updates,
        updated_at: serverTimestamp()
      })
    } catch (error) {
      console.error('Erreur modification plan diète:', error)
      throw error
    }
  }

  const deleteDietPlan = async (planId: string) => {
    try {
      await deleteDoc(doc(db, 'coach_diet_plans', planId))
    } catch (error) {
      console.error('Erreur suppression plan diète:', error)
      throw error
    }
  }

  return {
    dietPlans,
    loading,
    addDietPlan,
    updateDietPlan,
    deleteDietPlan
  }
}

// Hook pour récupérer le plan diète d'un athlète (côté athlète)
export function useAthleteDietPlan() {
  const [currentPlan, setCurrentPlan] = useState<CoachDietPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    const fetchCurrentPlan = async () => {
      try {
        // Simplifier la requête sans orderBy
        const q = query(
          collection(db, 'coach_diet_plans'),
          where('athlete_id', '==', user.uid)
        )
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
          if (!snapshot.empty) {
            // Trier côté client et prendre le plus récent
            const plans = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            })) as CoachDietPlan[]
            
            plans.sort((a, b) => new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime())
            setCurrentPlan(plans[0] || null)
          } else {
            setCurrentPlan(null)
          }
          setLoading(false)
        })

        return unsubscribe
      } catch (error) {
        console.error('Erreur récupération plan diète athlète:', error)
        setLoading(false)
        return () => {}
      }
    }

    const unsubscribe = fetchCurrentPlan()
    return () => {
      if (unsubscribe) unsubscribe
    }
  }, [user])

  return { currentPlan, loading }
}

// Hook pour récupérer les commentaires coach par module
import type { CoachComment } from '@/types'

export function useCoachCommentsByModule(module: string, date?: string, itemId?: string) {
  const [comments, setComments] = useState<CoachComment[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    let unsubscribe: undefined | (() => void)
    ;(async () => {
      try {
        // Construire dynamiquement les contraintes
        const constraints: QueryConstraint[] = [
          where('athlete_id', '==', user.uid),
          where('module', '==', module),
        ]

        if (module === 'diete' && date) {
          constraints.push(where('date', '==', date))
        }

        if ((module === 'entrainements' || module === 'journal') && itemId) {
          const idField = module === 'entrainements' ? 'training_id' : 'entry_id'
          constraints.push(where(idField, '==', itemId))
        }

        const q = query(collection(db, 'coach_comments'), ...constraints)
        unsubscribe = onSnapshot(q, (snapshot) => {
          const commentsData = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as object) })) as CoachComment[]

          commentsData.sort((a, b) => {
            const createdA: any = a.created_at as any
            const dateA = (typeof createdA === 'object' && createdA && typeof createdA.toDate === 'function')
              ? createdA.toDate()
              : new Date(a.created_at as string | number | Date)
            const createdB: any = b.created_at as any
            const dateB = (typeof createdB === 'object' && createdB && typeof createdB.toDate === 'function')
              ? createdB.toDate()
              : new Date(b.created_at as string | number | Date)
            return dateB.getTime() - dateA.getTime()
          })

          setComments(commentsData)
          setLoading(false)
        })
      } catch (error) {
        console.error('Erreur récupération commentaires coach:', error)
        setLoading(false)
      }
    })()

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [user, module, date, itemId])

  return { comments, loading }
} 

// Utilitaire: marquer un commentaire coach comme lu
export async function updateCoachCommentRead(commentId: string, read: boolean) {
  try {
    await updateDoc(doc(db, 'coach_comments', commentId), { read_by_athlete: read })
    return { success: true }
  } catch (error: unknown) {
    console.error('Erreur update read_by_athlete:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' }
  }
}