/**
 * Utilitaires d'export JSON pour SuperNovaFit
 * Gère la génération et le téléchargement de fichiers JSON structurés
 */

import { saveAs } from 'file-saver'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { 
  ExportConfig, 
  ExportMetadata
} from '@/types/export'
import type { Repas, Entrainement, Mesure } from '@/types'

/**
 * Génère et télécharge un fichier JSON
 */
export async function generateAndDownloadJSON(
  data: { repas: Repas[], entrainements: Entrainement[], mesures: Mesure[] },
  config: ExportConfig,
  metadata: ExportMetadata,
  fileName: string
): Promise<void> {
  try {
    let jsonData: Record<string, unknown>

    switch (config.dataType) {
      case 'repas':
        jsonData = formatRepasForJSON(data.repas)
        break
      case 'entrainements':
        jsonData = formatEntrainementsForJSON(data.entrainements)
        break
      case 'mesures':
        jsonData = formatMesuresForJSON(data.mesures)
        break
      case 'all':
        jsonData = {
          repas: formatRepasForJSON(data.repas),
          entrainements: formatEntrainementsForJSON(data.entrainements),
          mesures: formatMesuresForJSON(data.mesures),
          metadata
        }
        break
      default:
        throw new Error(`Type de données non supporté: ${config.dataType}`)
    }

    // Créer et télécharger le fichier
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { 
      type: 'application/json;charset=utf-8;' 
    })
    saveAs(blob, `${fileName}.json`)

  } catch (error) {
    console.error('Erreur lors de la génération JSON:', error)
    throw new Error('Impossible de générer le fichier JSON')
  }
}

/**
 * Formate les données de repas pour export JSON
 */
export function formatRepasForJSON(repas: Repas[]): Record<string, unknown> {
  return {
    repas: repas.map(repas => ({
      date: format(new Date(repas.date), 'yyyy-MM-dd', { locale: fr }),
      type: repas.repas,
      aliments: repas.aliments.map(a => `${a.nom} (${a.quantite}${a.unite})`).join(', '),
      calories: repas.macros.kcal,
      proteines: repas.macros.prot,
      glucides: repas.macros.glucides,
      lipides: repas.macros.lipides
    })),
    summary: {
      totalRepas: repas.length,
      totalCalories: repas.reduce((sum, r) => sum + r.macros.kcal, 0),
      averageCalories: repas.length > 0 ? repas.reduce((sum, r) => sum + r.macros.kcal, 0) / repas.length : 0,
      mostFrequentMeal: getMostFrequentMeal(repas)
    }
  }
}

/**
 * Formate les données d'entraînements pour export JSON
 */
export function formatEntrainementsForJSON(entrainements: Entrainement[]): Record<string, unknown> {
  return {
    entrainements: entrainements.map(ent => ({
      date: format(new Date(ent.date), 'yyyy-MM-dd', { locale: fr }),
      type: ent.type,
      duree: ent.duree,
      calories: ent.calories || 0,
      distance: ent.distance,
      fc_moyenne: ent.fc_moyenne,
      commentaire: ent.commentaire
    })),
    summary: {
      totalWorkouts: entrainements.length,
      totalDuration: entrainements.reduce((sum, e) => sum + e.duree, 0),
      totalCalories: entrainements.reduce((sum, e) => sum + (e.calories || 0), 0),
      averageDuration: entrainements.length > 0 ? entrainements.reduce((sum, e) => sum + e.duree, 0) / entrainements.length : 0,
      mostFrequentType: getMostFrequentTrainingType(entrainements)
    }
  }
}

/**
 * Formate les données de mesures pour export JSON
 */
export function formatMesuresForJSON(mesures: Mesure[]): Record<string, unknown> {
  const sortedMesures = mesures.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const firstMesure = sortedMesures[0]
  const lastMesure = sortedMesures[sortedMesures.length - 1]
  
  return {
    mesures: mesures.map(mesure => ({
      date: format(new Date(mesure.date), 'yyyy-MM-dd', { locale: fr }),
      poids: mesure.poids,
      taille: mesure.taille,
      imc: mesure.imc,
      masse_grasse: mesure.masse_grasse,
      masse_musculaire: mesure.masse_musculaire,
      tour_taille: mesure.tour_taille,
      tour_bras: mesure.tour_bras,
      tour_poitrine: mesure.tour_poitrine,
      commentaire: mesure.commentaire || ''
    })),
    statistiques: {
      total_mesures: mesures.length,
      periode: firstMesure && lastMesure ? {
        debut: format(new Date(firstMesure.date), 'yyyy-MM-dd', { locale: fr }),
        fin: format(new Date(lastMesure.date), 'yyyy-MM-dd', { locale: fr })
      } : null,
      evolution_poids: firstMesure && lastMesure ? {
        debut: firstMesure.poids || 0,
        fin: lastMesure.poids || 0,
        difference: (lastMesure.poids || 0) - (firstMesure.poids || 0)
      } : null
    }
  }
}

/**
 * Obtient le type de repas le plus fréquent
 */
function getMostFrequentMeal(repas: Repas[]): string {
  const mealCounts: Record<string, number> = {}
  repas.forEach(r => {
    mealCounts[r.repas] = (mealCounts[r.repas] || 0) + 1
  })
  
  return Object.entries(mealCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Aucun'
}

/**
 * Obtient le type d'entraînement le plus fréquent
 */
function getMostFrequentTrainingType(entrainements: Entrainement[]): string {
  const typeCounts: Record<string, number> = {}
  entrainements.forEach(e => {
    typeCounts[e.type] = (typeCounts[e.type] || 0) + 1
  })
  
  return Object.entries(typeCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Aucun'
}
