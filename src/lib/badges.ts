// Système de badges simple pour SuperNovaFit

export interface BadgeDefinition {
  id: string
  type: 'streak' | 'objectif' | 'performance' | 'special'
  nom: string
  description: string
  icone: string
  condition: string
  checkCondition: (userData: any) => boolean
}

// Badges prédéfinis simples
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
    nom: '😊 Excellent Moral',
    description: 'Humeur 9+ pendant 3 jours',
    icone: '😊',
    condition: 'Humeur 9+ sur 3 jours',
    checkCondition: (userData) => userData.humeursRecentes >= 3
  },
  {
    id: 'motivation_top',
    type: 'performance',
    nom: '💪 Motivé(e)',
    description: 'Motivation 8+ pendant 5 jours',
    icone: '💪',
    condition: 'Motivation 8+ sur 5 jours',
    checkCondition: (userData) => userData.motivationRecente >= 5
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
  }
]

// Fonction pour calculer les données utilisateur nécessaires
export function calculateUserData(journalEntries: any[], photos: any[]) {
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
  
  // Humeurs récentes (9+)
  const recentEntries = journalEntries
    .filter(entry => {
      const entryDate = new Date(entry.date)
      const threeDaysAgo = new Date()
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
      return entryDate >= threeDaysAgo && entry.humeur >= 9
    })
  
  // Motivation récente (8+)
  const motivationEntries = journalEntries
    .filter(entry => {
      const entryDate = new Date(entry.date)
      const fiveDaysAgo = new Date()
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5)
      return entryDate >= fiveDaysAgo && entry.motivation >= 8
    })

  return {
    streakJournal,
    humeursRecentes: recentEntries.length,
    motivationRecente: motivationEntries.length,
    totalJournalEntries: journalEntries.length,
    totalPhotos: photos.length
  }
}

// Fonction pour vérifier quels nouveaux badges sont débloqués
export function checkNewBadges(userData: any, existingBadgeNames: string[]): BadgeDefinition[] {
  return BADGE_DEFINITIONS.filter(badge => 
    !existingBadgeNames.includes(badge.nom) && 
    badge.checkCondition(userData)
  )
}