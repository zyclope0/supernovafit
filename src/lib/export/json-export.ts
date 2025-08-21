/**
 * Utilitaires d'export JSON pour SuperNovaFit
 * Génère des fichiers JSON structurés pour l'analyse de données
 * Suit les patterns TypeScript stricts du projet
 */

import { saveAs } from 'file-saver'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { APP_VERSION } from '@/lib/constants'

import type { 
  ExportConfig, 
  ExportMetadata, 
  ExportFilters,
  RepasExportData,
  EntrainementExportData,
  MesureExportData
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
    let jsonData: any

    switch (config.dataType) {
      case 'repas':
        jsonData = formatRepasForJSON(data.repas, config, metadata)
        break
      case 'entrainements':
        jsonData = formatEntrainementsForJSON(data.entrainements, config, metadata)
        break
      case 'mesures':
        jsonData = formatMesuresForJSON(data.mesures, config, metadata)
        break
      case 'all':
        jsonData = formatAllDataForJSON(data.repas, data.entrainements, data.mesures, config, metadata)
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
export function formatRepasForJSON(
  repas: Repas[],
  config: ExportConfig,
  metadata: ExportMetadata
): RepasExportData {
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
export function formatEntrainementsForJSON(
  entrainements: Entrainement[],
  config: ExportConfig,
  metadata: ExportMetadata
): EntrainementExportData {
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
export function formatMesuresForJSON(
  mesures: Mesure[],
  config: ExportConfig,
  metadata: ExportMetadata
): MesureExportData {
  const sortedMesures = mesures.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const firstMesure = sortedMesures[0]
  const lastMesure = sortedMesures[sortedMesures.length - 1]
  
  return {
    mesures: mesures.map(mesure => ({
      date: format(new Date(mesure.date), 'yyyy-MM-dd', { locale: fr }),
      poids: mesure.poids || 0,
      imc: mesure.imc || 0,
      masse_grasse: mesure.masse_grasse,
      masse_musculaire: mesure.masse_musculaire,
      tour_taille: mesure.tour_taille,
      tour_bras: mesure.tour_bras,
      tour_poitrine: mesure.tour_poitrine
    })),
    summary: {
      totalMesures: mesures.length,
      poidsInitial: firstMesure?.poids || 0,
      poidsActuel: lastMesure?.poids || 0,
      evolution: lastMesure && firstMesure ? lastMesure.poids! - firstMesure.poids! : 0,
      objectifAtteint: false // À implémenter selon la logique métier
    }
  }
}

/**
 * Formate toutes les données pour export JSON
 */
export function formatAllDataForJSON(
  repas: Repas[],
  entrainements: Entrainement[],
  mesures: Mesure[],
  config: ExportConfig,
  metadata: ExportMetadata
) {
  return {
    metadata,
    repas: formatRepasForJSON(repas, config, metadata),
    entrainements: formatEntrainementsForJSON(entrainements, config, metadata),
    mesures: formatMesuresForJSON(mesures, config, metadata),
    summary: {
      totalRecords: repas.length + entrainements.length + mesures.length,
      period: metadata.period,
      exportedAt: metadata.exportedAt,
      version: metadata.version
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
