// Système de badges optimisé pour SuperNovaFit

export interface BadgeDefinition {
  id: string
  type: 'streak' | 'objectif' | 'performance' | 'special'
  nom: string
  description: string
  icone: string
  condition: string
  checkCondition: (userData: CalculatedUserData) => boolean
}

// Badges cohérents avec les fonctionnalités réelles
export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // Badges Streak
  {
    id: 'streak_3_jours',
    type: 'streak',
    nom: '🔥 Streak 3 jours',
    description: '3 jours consécutifs de journal',
    icone: '🔥',
    condition: '3 entrées journal consécutives',
    checkCondition: (userData) => userData.streakJournal >= 3
  },
  {
    id: 'streak_7_jours',
    type: 'streak', 
    nom: '⚡ Streak Semaine',
    description: '7 jours consécutifs de journal',
    icone: '⚡',
    condition: '7 entrées journal consécutives',
    checkCondition: (userData) => userData.streakJournal >= 7
  },
  
  // Badges Performance
  {
    id: 'humeur_excellente',
    type: 'performance',
    nom: '😊 Moral au Top',
    description: 'Humeur 8+ pendant 3 jours',
    icone: '😊',
    condition: 'Humeur 8+ sur 3 jours consécutifs',
    checkCondition: (userData) => userData.humeursRecentes >= 3
  },
  {
    id: 'energie_constante',
    type: 'performance',
    nom: '⚡ Énergie Stable',
    description: 'Énergie 7+ pendant 5 jours',
    icone: '⚡',
    condition: 'Énergie 7+ sur 5 jours',
    checkCondition: (userData) => userData.energieRecente >= 5
  },

  // Badges Spéciaux
  {
    id: 'premier_journal',
    type: 'special',
    nom: '📝 Première Entrée',
    description: 'Première entrée dans le journal',
    icone: '📝',
    condition: 'Créer première entrée journal',
    checkCondition: (userData) => userData.totalJournalEntries >= 1
  },
  {
    id: 'photographe',
    type: 'special',
    nom: '📸 Photographe',
    description: '10 photos uploadées',
    icone: '📸',
    condition: 'Uploader 10 photos',
    checkCondition: (userData) => userData.totalPhotos >= 10
  },

  // Badges Diète & Nutrition
  {
    id: 'chef_cuisinier',
    type: 'objectif',
    nom: '👨‍🍳 Chef Cuisinier',
    description: '50 repas enregistrés',
    icone: '👨‍🍳',
    condition: 'Enregistrer 50 repas',
    checkCondition: (userData) => userData.totalRepas >= 50
  },
  {
    id: 'equilibre_nutritionnel',
    type: 'performance',
    nom: '🥗 Équilibre Parfait',
    description: 'Diversité alimentaire excellente',
    icone: '🥗',
    condition: '20+ aliments différents',
    checkCondition: (userData) => userData.diversiteAliments >= 20
  },
  {
    id: 'gourmet',
    type: 'special',
    nom: '🍽️ Gourmet',
    description: '100 repas enregistrés',
    icone: '🍽️',
    condition: 'Enregistrer 100 repas',
    checkCondition: (userData) => userData.totalRepas >= 100
  },

  // Badges Entraînement & Sport
  {
    id: 'athlete_debutant',
    type: 'objectif',
    nom: '🏃‍♂️ Athlète Débutant',
    description: '10 entraînements complétés',
    icone: '🏃‍♂️',
    condition: 'Compléter 10 entraînements',
    checkCondition: (userData) => userData.totalEntrainements >= 10
  },
  {
    id: 'machine_de_guerre',
    type: 'performance',
    nom: '💪 Machine de Guerre',
    description: '5000 calories brûlées',
    icone: '💪',
    condition: 'Brûler 5000 calories',
    checkCondition: (userData) => userData.caloriesBrulees >= 5000
  },
  {
    id: 'regularite_sport',
    type: 'streak',
    nom: '🔄 Régularité Sportive',
    description: '5 jours d\'entraînement consécutifs',
    icone: '🔄',
    condition: '5 entraînements consécutifs',
    checkCondition: (userData) => userData.streakEntrainement >= 5
  },
  {
    id: 'champion',
    type: 'special',
    nom: '🏆 Champion',
    description: '50 entraînements complétés',
    icone: '🏆',
    condition: 'Compléter 50 entraînements',
    checkCondition: (userData) => userData.totalEntrainements >= 50
  },

  // Badges Mesures & Suivi
  {
    id: 'scientifique',
    type: 'objectif',
    nom: '🔬 Scientifique',
    description: '25 mesures enregistrées',
    icone: '🔬',
    condition: 'Enregistrer 25 mesures',
    checkCondition: (userData) => userData.totalMesures >= 25
  },
  {
    id: 'dormeur_expert',
    type: 'performance',
    nom: '😴 Dormeur Expert',
    description: 'Sommeil moyen 7h+ sur 7 jours',
    icone: '😴',
    condition: 'Sommeil 7h+ régulier',
    checkCondition: (userData) => userData.sommeilMoyen >= 7
  },

  // Badges Motivation & Objectifs
  {
    id: 'accomplisseur',
    type: 'objectif',
    nom: '✅ Accomplisseur',
    description: '5 objectifs complétés',
    icone: '✅',
    condition: 'Compléter 5 objectifs',
    checkCondition: (userData) => userData.objectifsCompletes >= 5
  },
  {
    id: 'maitre_zen',
    type: 'special',
    nom: '🧘‍♂️ Maître Zen',
    description: 'Stress <3 pendant 7 jours',
    icone: '🧘‍♂️',
    condition: 'Stress faible régulier',
    checkCondition: (userData) => userData.humeursRecentes >= 7 // On réutilise la logique humeur
  }
]

// Fonction pour calculer les données utilisateur nécessaires
import type { JournalEntry, PhotoProgression } from '@/types'
// Interface pour les données calculées utilisateur
export interface CalculatedUserData {
  streakJournal: number
  humeursRecentes: number
  energieRecente: number
  totalJournalEntries: number
  totalPhotos: number
  // Nouvelles métriques fonctionnelles
  totalRepas: number
  totalEntrainements: number
  totalMesures: number
  streakEntrainement: number
  caloriesBrulees: number
  objectifsCompletes: number
  diversiteAliments: number
  sommeilMoyen: number
}

// Types temporaires pour les nouveaux paramètres
type RepasData = { date?: string; [key: string]: unknown }
type EntrainementData = { date?: string; calories?: number; [key: string]: unknown }
type MesureData = { date?: string; [key: string]: unknown }
type ObjectifData = { statut?: string; [key: string]: unknown } | { statut?: string }

export function calculateUserData(
  journalEntries: JournalEntry[], 
  photos: PhotoProgression[],
  // Nouvelles données optionnelles (pour compatibilité)
  repas: RepasData[] = [],
  entrainements: EntrainementData[] = [],
  mesures: MesureData[] = [],
  objectifs: ObjectifData[] = []
): CalculatedUserData {
  // Calcul streak journal (simple)
  const sortedEntries = journalEntries
    .sort((a, b) => b.date.localeCompare(a.date))
  
  let streakJournal = 0
  const currentDate = new Date()
  
  for (const entry of sortedEntries) {
    const entryDate = new Date(entry.date + 'T00:00:00')
    const daysDiff = Math.floor((currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysDiff === streakJournal) {
      streakJournal++
    } else {
      break
    }
  }
  
  // Humeurs récentes (8+)
  const recentMoodEntries = journalEntries
    .filter(entry => {
      const entryDate = new Date(entry.date)
      const threeDaysAgo = new Date()
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
      return entryDate >= threeDaysAgo && (entry.humeur ?? 0) >= 8
    })
  
  // Énergie récente (7+)
  const recentEnergyEntries = journalEntries
    .filter(entry => {
      const entryDate = new Date(entry.date)
      const fiveDaysAgo = new Date()
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5)
      return entryDate >= fiveDaysAgo && (entry.energie ?? 0) >= 7
    })

  // Calculs pour les nouvelles métriques
  const totalRepas = repas.length
  const totalEntrainements = entrainements.length
  const totalMesures = mesures.length
  
  // Streak entraînement (similaire au journal)
  const sortedTrainings = entrainements
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
  
  let streakEntrainement = 0
  const trainingCurrentDate = new Date()
  
  for (const training of sortedTrainings) {
    if (!training.date) break
    const trainingDate = new Date(training.date + 'T00:00:00')
    const daysDiff = Math.floor((trainingCurrentDate.getTime() - trainingDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysDiff === streakEntrainement) {
      streakEntrainement++
    } else {
      break
    }
  }
  
  // Calories brûlées total
  const caloriesBrulees = entrainements.reduce((sum, e) => sum + (e.calories || 0), 0)
  
  // Objectifs complétés
  const objectifsCompletes = objectifs.filter((obj) => obj.statut === 'accompli').length
  
  // Diversité alimentaire (approximation basée sur le nombre de repas différents)
  const diversiteAliments = Math.min(repas.length, 50) // Cap à 50 pour être réaliste
  
  // Sommeil moyen (basé sur les entrées journal récentes)
  const recentSleepEntries = journalEntries
    .filter(entry => {
      const entryDate = new Date(entry.date)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      return entryDate >= sevenDaysAgo && entry.sommeil_duree
    })
  
  const sommeilMoyen = recentSleepEntries.length > 0
    ? recentSleepEntries.reduce((sum, e) => sum + (e.sommeil_duree || 0), 0) / recentSleepEntries.length
    : 0

  return {
    streakJournal,
    humeursRecentes: recentMoodEntries.length,
    energieRecente: recentEnergyEntries.length,
    totalJournalEntries: journalEntries.length,
    totalPhotos: photos.length,
    // Nouvelles métriques
    totalRepas,
    totalEntrainements,
    totalMesures,
    streakEntrainement,
    caloriesBrulees,
    objectifsCompletes,
    diversiteAliments,
    sommeilMoyen
  }
}

// Fonction pour vérifier quels nouveaux badges sont débloqués
export function checkNewBadges(userData: CalculatedUserData, existingBadgeNames: string[]): BadgeDefinition[] {
  return BADGE_DEFINITIONS.filter(badge => 
    !existingBadgeNames.includes(badge.nom) && 
    badge.checkCondition(userData)
  )
}