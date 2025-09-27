'use client'

import { useState, useEffect, useCallback } from 'react'
import { captureException } from '@sentry/nextjs'
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
  startAfter,
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
import { useFirebaseError } from './useFirebaseError'
import { generateId } from '@/lib/utils'
import { calculateLevel } from '@/lib/challenges'
import { Repas, Entrainement, Mesure, JournalEntry, Aliment, MesureStats, PhotoProgression, Badge, Objectif, PhotoLibre, CoachDietPlan, Challenge, Achievement, UserProgress } from '@/types'

// Hook pour les repas
export function useRepas() {
  const { user } = useAuth()
  const [repas, setRepas] = useState<Repas[]>([])
  const [loading, setLoading] = useState(true)
  
  // Gestion d'erreurs Firebase centralisée
  const repasErrorHandler = useFirebaseError({
    context: 'Repas',
    maxRetries: 2
  })

  useEffect(() => {
    if (!user) {
      setRepas([])
      setLoading(false)
      return
    }

    setLoading(true)
    const q = query(
      collection(db, 'repas'),
      where('user_id', '==', user.uid),
      orderBy('date', 'desc')
    )

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const repasData = snapshot.docs.map((doc: { id: string; data: () => Record<string, unknown> }) => ({
          id: doc.id,
          ...doc.data()
        })) as Repas[]
        setRepas(repasData)
        setLoading(false)
      },
      (error) => {
        repasErrorHandler.handleError(error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user, repasErrorHandler])

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
      repasErrorHandler.handleError(error)
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
      repasErrorHandler.handleError(error)
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' }
    }
  }

  const deleteRepas = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'repas', id))
      return { success: true }
    } catch (error: unknown) {
      repasErrorHandler.handleError(error)
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
  
  // Gestion d'erreurs Firebase centralisée
  const entrainementsErrorHandler = useFirebaseError({
    context: 'Entrainements',
    maxRetries: 2
  })

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

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const entrainementsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Entrainement[]
        setEntrainements(entrainementsData)
        setLoading(false)
      },
      (error) => {
        entrainementsErrorHandler.handleError(error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user, entrainementsErrorHandler])

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

      // Nettoyer les données pour éviter les valeurs undefined
      const cleanData = Object.fromEntries(
        Object.entries(entrainementData).filter(([, value]) => value !== undefined)
      )

      const docRef = await addDoc(collection(db, 'entrainements'), {
        ...cleanData,
        user_id: user.uid,
        created_at: serverTimestamp()
      })
      
      return { success: true, id: docRef.id }
    } catch (error: unknown) {
      entrainementsErrorHandler.handleError(error)
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
      entrainementsErrorHandler.handleError(error)
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' }
    }
  }

  const deleteEntrainement = async (id: string) => {
    if (!user) return { success: false, error: 'Non connecté' }

    try {
      await deleteDoc(doc(db, 'entrainements', id))
      return { success: true }
    } catch (error: unknown) {
      entrainementsErrorHandler.handleError(error)
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
  
  // Gestion d'erreurs Firebase centralisée
  const favorisErrorHandler = useFirebaseError({
    context: 'Favoris',
    maxRetries: 2
  })

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

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const favorisData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Aliment[]
        setFavoris(favorisData)
        setLoading(false)
      },
      (error) => {
        favorisErrorHandler.handleError(error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user, favorisErrorHandler])

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
      favorisErrorHandler.handleError(error)
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' }
    }
  }

  const removeFromFavoris = async (id: string) => {
    if (!user) return { success: false, error: 'Non connecté' }

    try {
      await deleteDoc(doc(db, 'favoris_aliments', id))
      return { success: true }
    } catch (error: unknown) {
      favorisErrorHandler.handleError(error)
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
  
  // Gestion d'erreurs Firebase centralisée
  const mesuresErrorHandler = useFirebaseError({
    context: 'Mesures',
    maxRetries: 2
  })

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

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const mesuresData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Mesure[]
        setMesures(mesuresData)
        setLoading(false)
      },
      (error) => {
        mesuresErrorHandler.handleError(error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user, mesuresErrorHandler])

  const addMesure = async (mesureData: Omit<Mesure, 'id' | 'user_id'>) => {
    if (!user) return { success: false, error: 'Non connecté' }
    if (!mesureData.date) return { success: false, error: 'Date requise' }

    try {
      // Calculer l'IMC si poids et taille fournis
      let imc = mesureData.imc
      if (mesureData.poids && mesureData.taille) {
        imc = mesureData.poids / Math.pow(mesureData.taille / 100, 2)
      }

      // Utiliser la même approche que addRepas et addEntry - filtrer les undefined
      const filteredData = Object.fromEntries(
        Object.entries({
          user_id: user.uid,
          date: mesureData.date,
          poids: mesureData.poids,
          taille: mesureData.taille,
          masse_grasse: mesureData.masse_grasse,
          masse_musculaire: mesureData.masse_musculaire,
          tour_taille: mesureData.tour_taille,
          tour_hanches: mesureData.tour_hanches,
          tour_bras: mesureData.tour_bras,
          tour_cuisses: mesureData.tour_cuisses,
          tour_cou: mesureData.tour_cou,
          tour_poitrine: mesureData.tour_poitrine,
          commentaire: mesureData.commentaire,
          imc: imc ? parseFloat(imc.toFixed(1)) : undefined,
          created_at: serverTimestamp()
        }).filter(([, value]) => value !== undefined)
      )

      console.log('🔍 Debug addMesure - Données filtrées:', filteredData)
      const docRef = await addDoc(collection(db, 'mesures'), filteredData)
      return { success: true, id: docRef.id }
    } catch (error: unknown) {
      mesuresErrorHandler.handleError(error)
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
        // Handle error silently
        captureException(error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user])

  const addEntry = async (entryData: Omit<JournalEntry, 'id' | 'user_id'>) => {
    if (!user) return { success: false, error: 'Non connecté' }
    if (!user.uid) return { success: false, error: 'UID utilisateur manquant' }

    try {
      // Filtrer les valeurs undefined
      const filteredData = Object.fromEntries(
        Object.entries({
          user_id: user.uid,
          ...entryData,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp()
        }).filter(([, value]) => value !== undefined)
      )
      
      const docRef = await addDoc(collection(db, 'journal'), filteredData)
      return { success: true, id: docRef.id }
    } catch (error: unknown) {
      captureException(error)
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
      captureException(error)
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' }
    }
  }

  const deleteBadge = async (badgeId: string) => {
    if (!user) return { success: false, error: 'Non connecté' }

    try {
      await deleteDoc(doc(db, 'badges', badgeId))
      return { success: true }
    } catch (error: unknown) {
      captureException(error)
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' }
    }
  }

  const clearAllBadges = async () => {
    if (!user) return { success: false, error: 'Non connecté' }

    try {
      const q = query(
        collection(db, 'badges'),
        where('user_id', '==', user.uid)
      )
      
      const snapshot = await getDocs(q)
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref))
      await Promise.all(deletePromises)
      
      return { success: true, deleted: snapshot.size }
    } catch (error: unknown) {
      captureException(error)
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' }
    }
  }

  return { badges, loading, addBadge, deleteBadge, clearAllBadges }
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
        // Handle error silently
        captureException(error)
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
      captureException(error)
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

  const deleteObjectif = async (objectifId: string) => {
    if (!user) return { success: false, error: 'Non connecté' }

    try {
      await deleteDoc(doc(db, 'objectifs', objectifId))
      return { success: true }
    } catch (error: unknown) {
      captureException(error)
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' }
    }
  }

  return { objectifs, loading, addObjectif, updateProgression, deleteObjectif }
}

// Hook pour récupérer le profil utilisateur
import type { User as UserProfile } from '@/types'

// Hook pour récupérer tous les athlètes (pour la page "Tous les Athlètes")
export function useAllAthletes() {
  const { user } = useAuth()
  type AthleteLite = Pick<UserProfile, 'id' | 'nom' | 'email' | 'objectif' | 'dernier_acces' | 'ownerCoachId' | 'date_invitation'>
  const [athletes, setAthletes] = useState<AthleteLite[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setAthletes([])
      setLoading(false)
      return
    }

    // Récupérer tous les utilisateurs (sportifs uniquement)
    const q = collection(db, 'users')

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const athletesData = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...(doc.data() as Partial<UserProfile>)
          }))
          .filter(athlete => 
            athlete.id !== user.uid && // Exclure le coach lui-même
            athlete.role === 'sportif' // Seulement les sportifs
          ) as AthleteLite[]
        
        setAthletes(athletesData)
        setLoading(false)
      },
      (error) => {
        console.error('❌ FIRESTORE - Erreur récupération tous les athlètes:', error)
        setAthletes([])
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user])

  return { athletes, loading }
}

// Hook pour gérer les relations coach-athlète (ATHLÈTES LIÉS AU COACH)
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

    // Récupérer uniquement les athlètes liés au coach actuel
    const q = query(
      collection(db, 'users'),
      where('ownerCoachId', '==', user.uid),
      where('role', '==', 'sportif')
    )

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const athletesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Partial<UserProfile>)
        })) as AthleteLite[]
        
        setAthletes(athletesData)
        setLoading(false)
      },
      (error) => {
        console.error('❌ FIRESTORE - Erreur récupération athlètes coach:', error)
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
      
      if (athleteDoc.exists() && athleteDoc.data().ownerCoachId === user.uid) {
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

// Types pour le dashboard coach athlète
interface AthleteStats {
  calories_jour: number
  proteines_jour: number
  entrainements_semaine: number
  poids_actuel: number
  variation_poids: number
  variation_perf: number
}

interface EvolutionPoids {
  date: string
  poids: number
}

interface ActiviteRecente {
  date: string
  type: string
  duree: number
  calories: number
}

interface NutritionSemaine {
  jour: string
  calories: number
  proteines: number
}

interface AthleteDashboardData {
  id: string
  nom: string
  email: string
  objectif: string
  stats: AthleteStats
  evolution_poids: EvolutionPoids[]
  activites_recentes: ActiviteRecente[]
  nutrition_semaine: NutritionSemaine[]
}

// Types pour les données Firestore avec id
type FirestoreRepas = { id: string } & Partial<Repas>
type FirestoreEntrainement = { id: string } & Partial<Entrainement>
type FirestoreMesure = { id: string } & Partial<Mesure>
type FirestoreAthlete = { id: string } & Partial<UserProfile>

// Types pour les données avec propriétés garanties après filtrage
type MesureAvecPoids = FirestoreMesure & { poids: number; date: string }
type EntrainementAvecCalories = FirestoreEntrainement & { calories_brulees?: number }

// Hook spécialisé pour le dashboard coach athlète
export function useAthleteRealData(athleteId: string) {
  const [athleteData, setAthleteData] = useState<AthleteDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (!athleteId || !user) {
      setLoading(false)
      return
    }

    const fetchAthleteRealData = async () => {
      try {
        setLoading(true)
        
        // Récupérer les données brutes de l'athlète directement
        const rawData = await getAthleteDataDirect(athleteId, user.uid)
        
        if (!rawData) {
          setAthleteData(null)
          setLoading(false)
          return
        }

        const { athlete, repas, entrainements, mesures } = rawData
        
        // Calculer les statistiques réelles
        const today = new Date().toISOString().split('T')[0]
        const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        
        // Calories et protéines du jour
        const todayMeals = repas.filter((r: FirestoreRepas) => r.date === today)
        const calories_jour = todayMeals.reduce((sum: number, meal: FirestoreRepas) => sum + (meal.macros?.kcal || 0), 0)
        const proteines_jour = todayMeals.reduce((sum: number, meal: FirestoreRepas) => sum + (meal.macros?.prot || 0), 0)
        
        // Entraînements de la semaine
        const entrainements_semaine = entrainements.filter((e: FirestoreEntrainement) => e.date && e.date >= weekStart).length
        
        // Poids actuel et variation
        const mesuresAvecPoids = mesures.filter((m: FirestoreMesure) => m.poids && m.date).sort((a: FirestoreMesure, b: FirestoreMesure) => new Date(b.date!).getTime() - new Date(a.date!).getTime()) as MesureAvecPoids[]
        const poids_actuel = mesuresAvecPoids[0]?.poids || 0
        
        // Calculer la variation de poids (dernière vs avant-dernière)
        let variation_poids = 0
        if (mesuresAvecPoids.length >= 2) {
          const dernier = mesuresAvecPoids[0].poids || 0
          const avantDernier = mesuresAvecPoids[1].poids || 0
          variation_poids = ((dernier - avantDernier) / avantDernier) * 100
        }
        
        // Calculer la variation de performance (simplifié)
        const entrainementsMois = entrainements.filter((e: FirestoreEntrainement) => {
          const dateEntrainement = new Date(e.date || '')
          const moisDernier = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          return dateEntrainement >= moisDernier
        })
        const variation_perf = entrainementsMois.length > 0 ? Math.min(entrainementsMois.length * 5, 50) : 0
        
        // Évolution du poids (7 derniers points)
        const evolution_poids = mesuresAvecPoids.slice(0, 7).map((m: FirestoreMesure) => ({
          date: new Date(m.date || '').toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
          poids: m.poids || 0
        })).reverse()
        
        // Activités récentes (5 dernières)
        const activites_recentes = entrainements.slice(0, 5).map((e: FirestoreEntrainement) => ({
          date: e.date || '',
          type: e.type || 'Entraînement',
          duree: e.duree || 0,
          calories: (e as EntrainementAvecCalories).calories_brulees || 0
        }))
        
        // Nutrition de la semaine (7 derniers jours)
        const nutrition_semaine: NutritionSemaine[] = []
        for (let i = 6; i >= 0; i--) {
          const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          const repasDuJour = repas.filter((r: FirestoreRepas) => r.date === date)
          const calories = repasDuJour.reduce((sum: number, meal: FirestoreRepas) => sum + (meal.macros?.kcal || 0), 0)
          const proteines = repasDuJour.reduce((sum: number, meal: FirestoreRepas) => sum + (meal.macros?.prot || 0), 0)
          
          nutrition_semaine.push({
            jour: new Date(date).toLocaleDateString('fr-FR', { weekday: 'short' }),
            calories: Math.round(calories),
            proteines: Math.round(proteines)
          })
        }
        
        // Construire l'objet de données final
        const realAthleteData: AthleteDashboardData = {
          id: athleteId,
          nom: (athlete as FirestoreAthlete).nom || 'Athlète',
          email: (athlete as FirestoreAthlete).email || '',
          objectif: (athlete as FirestoreAthlete).objectif || 'Maintien',
          stats: {
            calories_jour: Math.round(calories_jour),
            proteines_jour: Math.round(proteines_jour),
            entrainements_semaine,
            poids_actuel: Math.round(poids_actuel * 10) / 10,
            variation_poids: Math.round(variation_poids * 10) / 10,
            variation_perf: Math.round(variation_perf)
          },
          evolution_poids,
          activites_recentes,
          nutrition_semaine
        }
        
        setAthleteData(realAthleteData)
        setLoading(false)
        
      } catch (error) {
        console.error('❌ COACH - Erreur récupération données athlète:', error)
        setAthleteData(null)
        setLoading(false)
      }
    }

    fetchAthleteRealData()
  }, [athleteId, user])

  return { athleteData, loading }
}

// Fonction utilitaire pour récupérer les données d'un athlète
async function getAthleteDataDirect(athleteId: string, coachId: string) {
  try {
    // Vérifier que l'athlète est bien lié au coach
    const athleteDoc = await getDoc(doc(db, 'users', athleteId))
    
    if (athleteDoc.exists() && athleteDoc.data().ownerCoachId === coachId) {
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
      unsubscribe.then(unsub => unsub && unsub())
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
      unsubscribe.then(unsub => unsub && unsub())
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
            const createdA = a.created_at as unknown
            const dateA = (typeof createdA === 'object' && createdA !== null && typeof (createdA as { toDate?: () => Date }).toDate === 'function')
              ? (createdA as { toDate: () => Date }).toDate()
              : new Date(a.created_at as string | number | Date)
            const createdB = b.created_at as unknown
            const dateB = (typeof createdB === 'object' && createdB !== null && typeof (createdB as { toDate?: () => Date }).toDate === 'function')
              ? (createdB as { toDate: () => Date }).toDate()
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

// Fonction usePaginatedData supprimée - remplacée par des hooks optimisés avec synchronisation temps réel

// Hook paginé pour les repas
// Hook paginé pour les entraînements avec synchronisation temps réel
export function usePaginatedEntrainements(pageSize: number = 20) {
  const { user } = useAuth()
  const [data, setData] = useState<Entrainement[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [lastDoc, setLastDoc] = useState<DocumentData | null>(null)

  // Écouter les changements temps réel
  useEffect(() => {
    if (!user) {
      setData([])
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'entrainements'),
      where('user_id', '==', user.uid),
      orderBy('date', 'desc'),
      limit(pageSize)
    )

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const entrainementsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Entrainement[]
        setData(entrainementsData)
        setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null)
        setHasMore(snapshot.docs.length === pageSize)
        setLoading(false)
      },
      (error) => {
        console.error('Erreur snapshot entraînements paginés:', error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user, pageSize])

  const loadMore = useCallback(async () => {
    if (!user || loading || !hasMore || !lastDoc) return

    try {
      setLoading(true)
      
      const q = query(
        collection(db, 'entrainements'),
        where('user_id', '==', user.uid),
        orderBy('date', 'desc'),
        startAfter(lastDoc),
        limit(pageSize)
      )
      
      const snapshot = await getDocs(q)
      const newData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Entrainement[]

      setData(prev => [...prev, ...newData])
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null)
      setHasMore(snapshot.docs.length === pageSize)
    } catch (error) {
      console.error('Erreur loadMore entraînements:', error)
    } finally {
      setLoading(false)
    }
  }, [user, loading, hasMore, lastDoc, pageSize])

  const reset = useCallback(() => {
    setData([])
    setLastDoc(null)
    setHasMore(true)
    setLoading(true)
  }, [])

  return { data, loading, hasMore, loadMore, reset }
}

// Hook pour les challenges
export function useChallenges() {
  const { user } = useAuth()
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  
  const challengesErrorHandler = useFirebaseError({
    context: 'Challenges',
    maxRetries: 2
  })

  useEffect(() => {
    if (!user) {
      setChallenges([])
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'challenges'),
      where('user_id', '==', user.uid),
      orderBy('created_at', 'desc')
    )

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Challenge[]
        setChallenges(data)
        setLoading(false)
      },
      (error) => {
        console.error('Erreur snapshot challenges:', error)
        challengesErrorHandler.handleError(error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user, challengesErrorHandler])

  const addChallenge = useCallback(async (challengeData: Omit<Challenge, 'id' | 'created_at'>) => {
    if (!user) return { success: false, error: 'Utilisateur non connecté' }

    try {
      const docRef = await addDoc(collection(db, 'challenges'), {
        ...challengeData,
        created_at: serverTimestamp()
      })
      return { success: true, id: docRef.id }
    } catch (error) {
      console.error('Erreur ajout challenge:', error)
      return { success: false, error: challengesErrorHandler.handleError(error) }
    }
  }, [user, challengesErrorHandler])

  const updateChallenge = useCallback(async (id: string, updates: Partial<Challenge>) => {
    try {
      await updateDoc(doc(db, 'challenges', id), {
        ...updates,
        updated_at: serverTimestamp()
      })
      return { success: true }
    } catch (error) {
      console.error('Erreur mise à jour challenge:', error)
      return { success: false, error: challengesErrorHandler.handleError(error) }
    }
  }, [challengesErrorHandler])

  const deleteChallenge = useCallback(async (id: string) => {
    try {
      await deleteDoc(doc(db, 'challenges', id))
      return { success: true }
    } catch (error) {
      console.error('Erreur suppression challenge:', error)
      return { success: false, error: challengesErrorHandler.handleError(error) }
    }
  }, [challengesErrorHandler])

  return {
    challenges,
    loading,
    addChallenge,
    updateChallenge,
    deleteChallenge
  }
}

// Hook pour les achievements
export function useAchievements() {
  const { user } = useAuth()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  
  const achievementsErrorHandler = useFirebaseError({
    context: 'Achievements',
    maxRetries: 2
  })

  useEffect(() => {
    if (!user) {
      setAchievements([])
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'achievements'),
      where('user_id', '==', user.uid),
      orderBy('unlockedAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Achievement[]
        setAchievements(data)
        setLoading(false)
      },
      (error) => {
        console.error('Erreur snapshot achievements:', error)
        achievementsErrorHandler.handleError(error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user, achievementsErrorHandler])

  const addAchievement = useCallback(async (achievementData: Omit<Achievement, 'id' | 'created_at'>) => {
    if (!user) return { success: false, error: 'Utilisateur non connecté' }

    try {
      const docRef = await addDoc(collection(db, 'achievements'), {
        ...achievementData,
        unlockedAt: new Date().toISOString(),
        created_at: serverTimestamp()
      })
      return { success: true, id: docRef.id }
    } catch (error) {
      console.error('Erreur ajout achievement:', error)
      return { success: false, error: achievementsErrorHandler.handleError(error) }
    }
  }, [user, achievementsErrorHandler])

  return {
    achievements,
    loading,
    addAchievement
  }
}

// Hook pour le progrès utilisateur
export function useUserProgress() {
  const { user } = useAuth()
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [loading, setLoading] = useState(true)
  
  const progressErrorHandler = useFirebaseError({
    context: 'UserProgress',
    maxRetries: 2
  })

  useEffect(() => {
    if (!user) {
      setProgress(null)
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'user_progress'),
      where('user_id', '==', user.uid),
      limit(1)
    )

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        if (snapshot.docs.length > 0) {
          const data = {
            id: snapshot.docs[0].id,
            ...snapshot.docs[0].data()
          } as UserProgress
          setProgress(data)
        } else {
          setProgress(null)
        }
        setLoading(false)
      },
      (error) => {
        console.error('Erreur snapshot user progress:', error)
        progressErrorHandler.handleError(error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user, progressErrorHandler])

  const updateProgress = useCallback(async (updates: Partial<UserProgress>) => {
    if (!user) return { success: false, error: 'Utilisateur non connecté' }

    try {
      if (progress) {
        // Mettre à jour le progrès existant
        await updateDoc(doc(db, 'user_progress', progress.id), {
          ...updates,
          updated_at: serverTimestamp()
        })
      } else {
        // Créer un nouveau progrès
        const docRef = await addDoc(collection(db, 'user_progress'), {
          user_id: user.uid,
          totalXP: 0,
          level: 1,
          currentLevelXP: 0,
          nextLevelXP: 100,
          badgesCount: 0,
          challengesCompleted: 0,
          achievementsUnlocked: 0,
          streakDays: 0,
          lastActivity: new Date().toISOString(),
          created_at: serverTimestamp(),
          updated_at: serverTimestamp()
        })
        return { success: true, id: docRef.id }
      }
      return { success: true }
    } catch (error) {
      console.error('Erreur mise à jour progrès:', error)
      return { success: false, error: progressErrorHandler.handleError(error) }
    }
  }, [user, progress, progressErrorHandler])

  const addXP = useCallback(async (xpAmount: number) => {
    if (!user || !progress) return { success: false, error: 'Progrès non initialisé' }

    try {
      const newTotalXP = progress.totalXP + xpAmount
      const { level, currentLevelXP, nextLevelXP } = calculateLevel(newTotalXP)
      
      await updateDoc(doc(db, 'user_progress', progress.id), {
        totalXP: newTotalXP,
        level,
        currentLevelXP,
        nextLevelXP,
        lastActivity: new Date().toISOString(),
        updated_at: serverTimestamp()
      })
      return { success: true }
    } catch (error) {
      console.error('Erreur ajout XP:', error)
      return { success: false, error: progressErrorHandler.handleError(error) }
    }
  }, [user, progress, progressErrorHandler])

  return {
    progress,
    loading,
    updateProgress,
    addXP
  }
}

// Hook paginé pour les mesures avec synchronisation temps réel
export function usePaginatedMesures(pageSize: number = 20) {
  const { user } = useAuth()
  const [data, setData] = useState<Mesure[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [lastDoc, setLastDoc] = useState<DocumentData | null>(null)

  // Écouter les changements temps réel
  useEffect(() => {
    if (!user) {
      setData([])
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'mesures'),
      where('user_id', '==', user.uid),
      orderBy('date', 'desc'),
      limit(pageSize)
    )

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const mesuresData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Mesure[]
        setData(mesuresData)
        setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null)
        setHasMore(snapshot.docs.length === pageSize)
        setLoading(false)
      },
      (error) => {
        console.error('Erreur snapshot mesures paginées:', error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user, pageSize])

  const loadMore = useCallback(async () => {
    if (!user || loading || !hasMore || !lastDoc) return

    try {
      setLoading(true)
      
      const q = query(
        collection(db, 'mesures'),
        where('user_id', '==', user.uid),
        orderBy('date', 'desc'),
        startAfter(lastDoc),
        limit(pageSize)
      )
      
      const snapshot = await getDocs(q)
      const newData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Mesure[]

      setData(prev => [...prev, ...newData])
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null)
      setHasMore(snapshot.docs.length === pageSize)
    } catch (error) {
      console.error('Erreur loadMore mesures:', error)
    } finally {
      setLoading(false)
    }
  }, [user, loading, hasMore, lastDoc, pageSize])

  const reset = useCallback(() => {
    setData([])
    setLastDoc(null)
    setHasMore(true)
    setLoading(true)
  }, [])

  return { data, loading, hasMore, loadMore, reset }
}
