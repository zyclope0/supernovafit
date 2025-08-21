/**
 * Utilitaires d'export Excel pour SuperNovaFit
 * Utilise xlsx pour la génération de fichiers Excel avec graphiques
 * Suit les patterns TypeScript stricts du projet
 */

import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

import type { 
  ExportConfig, 
  ExportMetadata,
  RepasExportData,
  EntrainementExportData,
  MesureExportData
} from '@/types/export'
import type { Repas, Entrainement, Mesure } from '@/types'
import {
  generateWeightChartData,
  generateCaloriesChartData,
  generateMacrosChartData,
  generateWorkoutFrequencyChartData,
  generateIMCChartData,
  generateWorkoutTypeChartData,
  calculateChartStatistics,
  type ChartData
} from './chart-utils'

/**
 * Couleurs de marque SuperNovaFit
 */
const BRAND_COLORS = {
  primary: '#2980b9',
  secondary: '#e74c3c',
  success: '#27ae60',
  warning: '#f39c12',
  info: '#3498db',
  light: '#ecf0f1',
  dark: '#2c3e50'
}

/**
 * Styles Excel personnalisés
 */
const EXCEL_STYLES = {
  header: {
    font: { bold: true, color: { rgb: 'FFFFFF' } },
    fill: { fgColor: { rgb: '2980B9' } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' }
    }
  },
  subHeader: {
    font: { bold: true, color: { rgb: '2C3E50' } },
    fill: { fgColor: { rgb: 'ECF0F1' } },
    alignment: { horizontal: 'center' },
    border: {
      bottom: { style: 'thin' }
    }
  },
  data: {
    border: {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' }
    }
  },
  highlight: {
    fill: { fgColor: { rgb: 'E8F4FD' } }
  },
  success: {
    fill: { fgColor: { rgb: 'D5F4E6' } }
  },
  warning: {
    fill: { fgColor: { rgb: 'FEF9E7' } }
  }
}

/**
 * Génère et télécharge un fichier Excel avec formatage avancé
 */
export async function generateAndDownloadExcel(
  repas: Repas[],
  entrainements: Entrainement[],
  mesures: Mesure[],
  config: ExportConfig,
  metadata: ExportMetadata,
  fileName: string
): Promise<void> {
  try {
    const workbook = XLSX.utils.book_new()
    
    // Feuille de résumé
    addSummarySheet(workbook, repas, entrainements, mesures, metadata)
    
    // Feuilles de données selon la configuration
    if (config.dataType === 'repas' || config.dataType === 'all') {
      addRepasSheet(workbook, repas, metadata)
    }
    
    if (config.dataType === 'entrainements' || config.dataType === 'all') {
      addEntrainementsSheet(workbook, entrainements, metadata)
    }
    
    if (config.dataType === 'mesures' || config.dataType === 'all') {
      addMesuresSheet(workbook, mesures, metadata)
    }
    
    // Feuille de graphiques
    if (config.includeCharts) {
      addChartsSheet(workbook, repas, entrainements, mesures, metadata)
    }
    
    // Feuille de statistiques
    addStatisticsSheet(workbook, repas, entrainements, mesures, metadata)
    
    // Générer et télécharger le fichier
    const excelBuffer = XLSX.write(workbook, { 
      bookType: 'xlsx', 
      type: 'array',
      bookSST: false
    })
    
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
    
    saveAs(blob, `${fileName}.xlsx`)
  } catch (error) {
    console.error('Erreur lors de la génération Excel:', error)
    throw new Error('Impossible de générer le fichier Excel')
  }
}

/**
 * Ajoute une feuille de résumé
 */
function addSummarySheet(
  workbook: XLSX.WorkBook,
  repas: Repas[],
  entrainements: Entrainement[],
  mesures: Mesure[],
  metadata: ExportMetadata
): void {
  const stats = calculateChartStatistics(repas, entrainements, mesures)
  
  const summaryData = [
    ['RAPPORT SUPERNOVA FIT', '', '', ''],
    ['', '', '', ''],
    ['Métadonnées', '', '', ''],
    ['Période', metadata.period, '', ''],
    ['Généré le', format(new Date(metadata.exportedAt), 'dd/MM/yyyy à HH:mm', { locale: fr }), '', ''],
    ['Version', metadata.version, '', ''],
    ['', '', '', ''],
    ['Statistiques Générales', '', '', ''],
    ['Total repas', repas.length, '', ''],
    ['Calories totales', `${stats.totalCalories.toFixed(0)} kcal`, '', ''],
    ['Calories moyennes/jour', `${stats.avgCaloriesPerDay.toFixed(0)} kcal`, '', ''],
    ['Total entraînements', entrainements.length, '', ''],
    ['Temps total d\'entraînement', `${stats.totalWorkoutTime} min`, '', ''],
    ['Durée moyenne/séance', `${stats.avgWorkoutDuration.toFixed(0)} min`, '', ''],
    ['Total mesures', mesures.length, '', ''],
    ['', '', '', ''],
    ['Évolution', '', '', ''],
    ['Évolution poids', `${stats.weightEvolution > 0 ? '+' : ''}${stats.weightEvolution.toFixed(1)} kg`, '', ''],
    ['Évolution IMC', `${stats.imcEvolution > 0 ? '+' : ''}${stats.imcEvolution.toFixed(2)}`, '', '']
  ]
  
  const worksheet = XLSX.utils.aoa_to_sheet(summaryData)
  
  // Appliquer les styles
  applyStylesToSheet(worksheet, summaryData.length, 4)
  
  // Fusionner les cellules pour le titre
  worksheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 3 } },
    { s: { r: 7, c: 0 }, e: { r: 7, c: 3 } },
    { s: { r: 16, c: 0 }, e: { r: 16, c: 3 } }
  ]
  
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Résumé')
}

/**
 * Ajoute une feuille pour les repas
 */
function addRepasSheet(workbook: XLSX.WorkBook, repas: Repas[], metadata: ExportMetadata): void {
  const headers = ['Date', 'Type de repas', 'Aliments', 'Calories (kcal)', 'Protéines (g)', 'Glucides (g)', 'Lipides (g)']
  
  const data = repas.map(r => [
    format(new Date(r.date), 'dd/MM/yyyy', { locale: fr }),
    r.repas,
    r.aliments.map(a => `${a.nom} (${a.quantite}${a.unite})`).join(', '),
    r.macros.kcal,
    r.macros.prot,
    r.macros.glucides,
    r.macros.lipides
  ])
  
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data])
  
  // Appliquer les styles
  applyStylesToSheet(worksheet, data.length + 1, headers.length)
  
  // Ajouter des formules de calcul
  addFormulasToSheet(worksheet, data.length + 1, headers.length, 'repas')
  
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Repas')
}

/**
 * Ajoute une feuille pour les entraînements
 */
function addEntrainementsSheet(workbook: XLSX.WorkBook, entrainements: Entrainement[], metadata: ExportMetadata): void {
  const headers = ['Date', 'Type', 'Durée (min)', 'Calories (kcal)', 'Distance (km)', 'FC moyenne (bpm)', 'Commentaire']
  
  const data = entrainements.map(e => [
    format(new Date(e.date), 'dd/MM/yyyy', { locale: fr }),
    e.type,
    e.duree,
    e.calories || 0,
    e.distance || 0,
    e.fc_moyenne || 0,
    e.commentaire || ''
  ])
  
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data])
  
  // Appliquer les styles
  applyStylesToSheet(worksheet, data.length + 1, headers.length)
  
  // Ajouter des formules de calcul
  addFormulasToSheet(worksheet, data.length + 1, headers.length, 'entrainements')
  
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Entraînements')
}

/**
 * Ajoute une feuille pour les mesures
 */
function addMesuresSheet(workbook: XLSX.WorkBook, mesures: Mesure[], metadata: ExportMetadata): void {
  const headers = ['Date', 'Poids (kg)', 'IMC', 'Masse grasse (%)', 'Masse musculaire (kg)', 'Tour taille (cm)', 'Tour bras (cm)']
  
  const data = mesures.map(m => [
    format(new Date(m.date), 'dd/MM/yyyy', { locale: fr }),
    m.poids || 0,
    m.imc || 0,
    m.masse_grasse || 0,
    m.masse_musculaire || 0,
    m.tour_taille || 0,
    m.tour_bras || 0
  ])
  
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data])
  
  // Appliquer les styles
  applyStylesToSheet(worksheet, data.length + 1, headers.length)
  
  // Ajouter des formules de calcul
  addFormulasToSheet(worksheet, data.length + 1, headers.length, 'mesures')
  
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Mesures')
}

/**
 * Ajoute une feuille de graphiques (données pour graphiques Excel)
 */
function addChartsSheet(workbook: XLSX.WorkBook, repas: Repas[], entrainements: Entrainement[], mesures: Mesure[], metadata: ExportMetadata): void {
  const chartData = []
  
  // Données pour graphique d'évolution du poids
  if (mesures.length >= 2) {
    const weightData = generateWeightChartData(mesures)
    chartData.push(['Évolution du poids', '', '', ''])
    chartData.push(['Date', 'Poids (kg)', '', ''])
    weightData.labels.forEach((label, index) => {
      chartData.push([label, weightData.datasets[0].data[index], '', ''])
    })
    chartData.push(['', '', '', ''])
  }
  
  // Données pour graphique des calories
  if (repas.length > 0) {
    const caloriesData = generateCaloriesChartData(repas)
    chartData.push(['Calories par jour', '', '', ''])
    chartData.push(['Date', 'Calories (kcal)', '', ''])
    caloriesData.labels.forEach((label, index) => {
      chartData.push([label, caloriesData.datasets[0].data[index], '', ''])
    })
    chartData.push(['', '', '', ''])
  }
  
  // Données pour graphique des macros
  if (repas.length > 0) {
    const macrosData = generateMacrosChartData(repas)
    chartData.push(['Répartition des macronutriments', '', '', ''])
    chartData.push(['Macronutriment', 'Quantité (g)', '', ''])
    macrosData.labels.forEach((label, index) => {
      chartData.push([label, macrosData.datasets[0].data[index], '', ''])
    })
    chartData.push(['', '', '', ''])
  }
  
  const worksheet = XLSX.utils.aoa_to_sheet(chartData)
  
  // Appliquer les styles
  applyStylesToSheet(worksheet, chartData.length, 4)
  
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Données Graphiques')
}

/**
 * Ajoute une feuille de statistiques avancées
 */
function addStatisticsSheet(workbook: XLSX.WorkBook, repas: Repas[], entrainements: Entrainement[], mesures: Mesure[], metadata: ExportMetadata): void {
  const stats = calculateChartStatistics(repas, entrainements, mesures)
  
  const statisticsData = [
    ['Statistiques Avancées', '', '', ''],
    ['', '', '', ''],
    ['Nutrition', '', '', ''],
    ['Calories totales', stats.totalCalories, 'kcal', ''],
    ['Calories moyennes/jour', stats.avgCaloriesPerDay, 'kcal', ''],
    ['Nombre de repas', repas.length, '', ''],
    ['', '', '', ''],
    ['Entraînement', '', '', ''],
    ['Temps total', stats.totalWorkoutTime, 'min', ''],
    ['Durée moyenne/séance', stats.avgWorkoutDuration, 'min', ''],
    ['Nombre de séances', entrainements.length, '', ''],
    ['', '', '', ''],
    ['Progression', '', '', ''],
    ['Évolution poids', stats.weightEvolution, 'kg', ''],
    ['Évolution IMC', stats.imcEvolution, '', '']
  ]
  
  const worksheet = XLSX.utils.aoa_to_sheet(statisticsData)
  
  // Appliquer les styles
  applyStylesToSheet(worksheet, statisticsData.length, 4)
  
  // Fusionner les cellules pour les titres
  worksheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 3 } },
    { s: { r: 7, c: 0 }, e: { r: 7, c: 3 } },
    { s: { r: 12, c: 0 }, e: { r: 12, c: 3 } }
  ]
  
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Statistiques')
}

/**
 * Applique les styles à une feuille Excel
 */
function applyStylesToSheet(worksheet: XLSX.WorkSheet, rows: number, cols: number): void {
  // Styles pour les en-têtes
  for (let col = 0; col < cols; col++) {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: col })
    if (worksheet[cellRef]) {
      worksheet[cellRef].s = EXCEL_STYLES.header
    }
  }
  
  // Styles pour les données
  for (let row = 1; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: col })
      if (worksheet[cellRef]) {
        worksheet[cellRef].s = EXCEL_STYLES.data
      }
    }
  }
}

/**
 * Ajoute des formules de calcul à une feuille
 */
function addFormulasToSheet(worksheet: XLSX.WorkSheet, rows: number, cols: number, type: string): void {
  const lastRow = rows + 1
  
  // Formules selon le type de données
  switch (type) {
    case 'repas':
      // Total calories
      const totalCaloriesRef = XLSX.utils.encode_cell({ r: lastRow, c: 3 })
      worksheet[totalCaloriesRef] = { 
        f: `SUM(D2:D${rows})`,
        v: 0,
        s: EXCEL_STYLES.highlight
      }
      
      // Moyenne calories
      const avgCaloriesRef = XLSX.utils.encode_cell({ r: lastRow + 1, c: 3 })
      worksheet[avgCaloriesRef] = { 
        f: `AVERAGE(D2:D${rows})`,
        v: 0,
        s: EXCEL_STYLES.highlight
      }
      break
      
    case 'entrainements':
      // Total durée
      const totalDurationRef = XLSX.utils.encode_cell({ r: lastRow, c: 2 })
      worksheet[totalDurationRef] = { 
        f: `SUM(C2:C${rows})`,
        v: 0,
        s: EXCEL_STYLES.highlight
      }
      
      // Moyenne durée
      const avgDurationRef = XLSX.utils.encode_cell({ r: lastRow + 1, c: 2 })
      worksheet[avgDurationRef] = { 
        f: `AVERAGE(C2:C${rows})`,
        v: 0,
        s: EXCEL_STYLES.highlight
      }
      break
      
    case 'mesures':
      // Dernier poids
      const lastWeightRef = XLSX.utils.encode_cell({ r: lastRow, c: 1 })
      worksheet[lastWeightRef] = { 
        f: `B${rows}`,
        v: 0,
        s: EXCEL_STYLES.highlight
      }
      break
  }
}

/**
 * Génère et télécharge un fichier Excel multi-feuilles
 */
export async function generateAndDownloadMultiSheetExcel(
  repas: Repas[],
  entrainements: Entrainement[],
  mesures: Mesure[],
  config: ExportConfig,
  metadata: ExportMetadata,
  fileName: string
): Promise<void> {
  await generateAndDownloadExcel(repas, entrainements, mesures, config, metadata, fileName)
}
