/**
 * Utilitaires d'export CSV pour SuperNovaFit
 * Utilise Papa Parse pour la génération de fichiers CSV
 * Suit les patterns TypeScript stricts du projet
 */

import Papa from 'papaparse'
import { saveAs } from 'file-saver'
import { format as formatDate } from 'date-fns'
import { fr } from 'date-fns/locale'
import { APP_VERSION } from '@/lib/constants'

import type { 
  ExportConfig, 
  ExportMetadata,
  ExportPeriod,
  CSVExportData, 
  ExportFilters,
  RepasExportData,
  EntrainementExportData,
  MesureExportData
} from '@/types/export'
import type { Repas, Entrainement, Mesure, User } from '@/types'

/**
 * Génère les métadonnées d'export
 */
export function generateExportMetadata(
  config: ExportConfig,
  totalRecords: number,
  userId: string
): ExportMetadata {
  const periodDescription = getPeriodDescription(config.period, config.startDate, config.endDate)
  
  return {
    exportedAt: new Date().toISOString(),
    exportedBy: userId,
    totalRecords,
    period: periodDescription,
    filters: config.filters || {},
    version: APP_VERSION
  }
}

/**
 * Génère la description de la période d'export
 */
export function getPeriodDescription(
  period: ExportPeriod,
  startDate?: string,
  endDate?: string
): string {
  switch (period) {
    case 'day':
      return 'Aujourd\'hui'
    case 'week':
      return 'Cette semaine'
    case 'month':
      return 'Ce mois'
    case 'quarter':
      return 'Ce trimestre'
    case 'year':
      return 'Cette année'
    case 'custom':
      if (startDate && endDate) {
        return `Du ${formatDate(new Date(startDate), 'dd/MM/yyyy', { locale: fr })} au ${formatDate(new Date(endDate), 'dd/MM/yyyy', { locale: fr })}`
      }
      return 'Période personnalisée'
    default:
      return 'Période non spécifiée'
  }
}

/**
 * Formate les données de repas pour export CSV
 */
export function formatRepasForCSV(
  repas: Repas[],
  config: ExportConfig,
  metadata: ExportMetadata
): CSVExportData {
  const headers = [
    'Date',
    'Type de repas',
    'Aliments',
    'Calories (kcal)',
    'Protéines (g)',
    'Glucides (g)',
    'Lipides (g)',
    'Commentaire'
  ]

  const rows = repas.map(repas => [
    formatDate(new Date(repas.date), 'dd/MM/yyyy', { locale: fr }),
    getMealTypeLabel(repas.repas),
    repas.aliments.map(a => `${a.nom} (${a.quantite}${a.unite})`).join(', '),
    repas.macros.kcal.toString(),
    repas.macros.prot.toString(),
    repas.macros.glucides.toString(),
    repas.macros.lipides.toString(),
    '' // Commentaire (à implémenter si nécessaire)
  ])

  return { headers, rows, metadata }
}

/**
 * Formate les données d'entraînements pour export CSV
 */
export function formatEntrainementsForCSV(
  entrainements: Entrainement[],
  config: ExportConfig,
  metadata: ExportMetadata
): CSVExportData {
  const headers = [
    'Date',
    'Type d\'entraînement',
    'Durée (min)',
    'Calories (kcal)',
    'Distance (km)',
    'FC moyenne (bpm)',
    'FC max (bpm)',
    'Vitesse moy (km/h)',
    'Commentaire'
  ]

  const rows = entrainements.map(ent => [
    formatDate(new Date(ent.date), 'dd/MM/yyyy', { locale: fr }),
    ent.type,
    ent.duree.toString(),
    ent.calories?.toString() || '',
    ent.distance?.toString() || '',
    ent.fc_moyenne?.toString() || '',
    ent.fc_max?.toString() || '',
    ent.vitesse_moy?.toString() || '',
    ent.commentaire || ''
  ])

  return { headers, rows, metadata }
}

/**
 * Formate les données de mesures pour export CSV
 */
export function formatMesuresForCSV(
  mesures: Mesure[],
  config: ExportConfig,
  metadata: ExportMetadata
): CSVExportData {
  const headers = [
    'Date',
    'Poids (kg)',
    'IMC',
    'Masse grasse (%)',
    'Masse musculaire (kg)',
    'Tour de taille (cm)',
    'Tour de bras (cm)',
    'Tour de poitrine (cm)',
    'Commentaire'
  ]

  const rows = mesures.map(mesure => [
    formatDate(new Date(mesure.date), 'dd/MM/yyyy', { locale: fr }),
    mesure.poids?.toString() || '',
    mesure.imc?.toFixed(1) || '',
    mesure.masse_grasse?.toString() || '',
    mesure.masse_musculaire?.toString() || '',
    mesure.tour_taille?.toString() || '',
    mesure.tour_bras?.toString() || '',
    mesure.tour_poitrine?.toString() || '',
    mesure.commentaire || ''
  ])

  return { headers, rows, metadata }
}

/**
 * Génère et télécharge un fichier CSV
 */
export async function generateAndDownloadCSV(
  data: { repas: Repas[], entrainements: Entrainement[], mesures: Mesure[] },
  config: ExportConfig,
  metadata: ExportMetadata,
  fileName: string
): Promise<void> {
  try {
    let csvData: CSVExportData

    switch (config.dataType) {
      case 'repas':
        csvData = formatRepasForCSV(data.repas, config, metadata)
        break
      case 'entrainements':
        csvData = formatEntrainementsForCSV(data.entrainements, config, metadata)
        break
      case 'mesures':
        csvData = formatMesuresForCSV(data.mesures, config, metadata)
        break
      case 'all':
        // Combiner toutes les données
        const repasData = formatRepasForCSV(data.repas, config, metadata)
        const entrainementsData = formatEntrainementsForCSV(data.entrainements, config, metadata)
        const mesuresData = formatMesuresForCSV(data.mesures, config, metadata)
        
        csvData = {
          headers: ['Type', ...repasData.headers],
          rows: [
            ...repasData.rows.map(row => ['Repas', ...row]),
            ...entrainementsData.rows.map(row => ['Entraînement', ...row]),
            ...mesuresData.rows.map(row => ['Mesure', ...row])
          ],
          metadata
        }
        break
      default:
        throw new Error(`Type de données non supporté: ${config.dataType}`)
    }

    // Convertir en CSV avec Papa Parse
    const csv = Papa.unparse({
      fields: csvData.headers,
      data: csvData.rows
    })

    // Ajouter les métadonnées en commentaires
    const metadataComments = [
      `# SuperNovaFit Export - ${metadata.version}`,
      `# Période: ${metadata.period}`,
      `# Généré le: ${formatDate(new Date(metadata.exportedAt), 'dd/MM/yyyy à HH:mm', { locale: fr })}`,
      `# Total enregistrements: ${metadata.totalRecords}`,
      ''
    ].join('\n')

    const finalCsv = metadataComments + csv

    // Créer et télécharger le fichier
    const blob = new Blob([finalCsv], { type: 'text/csv;charset=utf-8;' })
    saveAs(blob, `${fileName}.csv`)

  } catch (error) {
    console.error('Erreur lors de la génération CSV:', error)
    throw new Error('Impossible de générer le fichier CSV')
  }
}

/**
 * Génère un nom de fichier pour l'export
 */
export function generateFileName(
  config: ExportConfig,
  metadata: ExportMetadata
): string {
  const dataTypeLabel = getDataTypeLabel(config.dataType)
  const periodLabel = getPeriodLabel(config.period)
  const timestamp = formatDate(new Date(metadata.exportedAt), 'yyyy-MM-dd_HH-mm', { locale: fr })
  
  return `SuperNovaFit_${dataTypeLabel}_${periodLabel}_${timestamp}`
}

/**
 * Obtient le label français du type de repas
 */
function getMealTypeLabel(mealType: string): string {
  const labels: Record<string, string> = {
    'petit_dej': 'Petit déjeuner',
    'collation_matin': 'Collation matin',
    'dejeuner': 'Déjeuner',
    'collation_apres_midi': 'Collation après-midi',
    'diner': 'Dîner',
    'collation_soir': 'Collation soir'
  }
  
  return labels[mealType] || mealType
}

/**
 * Obtient le label français du type de données
 */
function getDataTypeLabel(dataType: string): string {
  const labels: Record<string, string> = {
    'repas': 'Repas',
    'entrainements': 'Entrainements',
    'mesures': 'Mesures',
    'journal': 'Journal',
    'photos': 'Photos',
    'all': 'ToutesDonnees'
  }
  
  return labels[dataType] || dataType
}

/**
 * Obtient le label français de la période
 */
function getPeriodLabel(period: string): string {
  const labels: Record<string, string> = {
    'day': 'Jour',
    'week': 'Semaine',
    'month': 'Mois',
    'quarter': 'Trimestre',
    'year': 'Annee',
    'custom': 'Personnalise'
  }
  
  return labels[period] || period
}

/**
 * Filtre les données selon la configuration
 */
export function filterDataByConfig<T>(
  data: T[],
  config: ExportConfig,
  dateField: keyof T = 'date' as keyof T
): T[] {
  let filteredData = [...data]

  // Filtre par période
  if (config.startDate && config.endDate) {
    filteredData = filteredData.filter(item => {
      const itemDate = (item as any)[dateField]
      if (!itemDate) return false
      
      const date = new Date(itemDate)
      const start = new Date(config.startDate!)
      const end = new Date(config.endDate!)
      
      return date >= start && date <= end
    })
  }

  // Filtre par type (pour les repas)
  if (config.filters?.mealTypes && config.dataType === 'repas') {
    filteredData = filteredData.filter(item => {
      const mealType = (item as any).repas
      return config.filters!.mealTypes!.includes(mealType)
    })
  }

  // Filtre par type (pour les entraînements)
  if (config.filters?.trainingTypes && config.dataType === 'entrainements') {
    filteredData = filteredData.filter(item => {
      const trainingType = (item as any).type
      return config.filters!.trainingTypes!.includes(trainingType)
    })
  }

  // Filtre par calories
  if (config.filters?.minCalories || config.filters?.maxCalories) {
    filteredData = filteredData.filter(item => {
      const calories = (item as any).calories || (item as any).macros?.kcal
      if (!calories) return true
      
      const min = config.filters?.minCalories || 0
      const max = config.filters?.maxCalories || Infinity
      
      return calories >= min && calories <= max
    })
  }

  // Filtre par durée (pour les entraînements)
  if (config.filters?.minDuration || config.filters?.maxDuration) {
    filteredData = filteredData.filter(item => {
      const duration = (item as any).duree
      if (!duration) return true
      
      const min = config.filters?.minDuration || 0
      const max = config.filters?.maxDuration || Infinity
      
      return duration >= min && duration <= max
    })
  }

  return filteredData
}
