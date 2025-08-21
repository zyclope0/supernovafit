/**
 * Utilitaires d'export PDF pour SuperNovaFit
 * Utilise jsPDF pour la génération de rapports PDF
 * Suit les patterns TypeScript stricts du projet
 */

import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { APP_VERSION } from '@/lib/constants'

import type { 
  PDFConfig, 
  ExportConfig, 
  ExportMetadata
} from '@/types/export'
import type { Repas, Entrainement, Mesure } from '@/types'
import {
  generateWeightChartData,
  generateCaloriesChartData,
  generateMacrosChartData,
  generateWorkoutFrequencyChartData,
  calculateChartStatistics,
  type ChartData
} from './chart-utils'

// Extensions pour jsPDF
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: Record<string, unknown>) => jsPDF
  }
}

/**
 * Configuration par défaut pour les PDF
 */
export const DEFAULT_PDF_CONFIG: PDFConfig = {
  title: 'Rapport SuperNovaFit',
  includeCharts: true,
  includeSummary: true,
  pageSize: 'A4',
  orientation: 'portrait',
  header: 'SuperNovaFit - Rapport personnel',
  footer: `Généré le ${format(new Date(), 'dd/MM/yyyy à HH:mm', { locale: fr })} - Version ${APP_VERSION}`,
  colors: {
    primary: '#2980b9',
    secondary: '#e74c3c',
    success: '#27ae60',
    warning: '#f39c12',
    info: '#3498db',
    light: '#ecf0f1',
    dark: '#2c3e50'
  }
}

/**
 * Génère et télécharge un PDF
 */
export async function generateAndDownloadPDF(
  doc: jsPDF,
  fileName: string
): Promise<void> {
  try {
    doc.save(`${fileName}.pdf`)
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error)
    throw new Error('Impossible de générer le fichier PDF')
  }
}

/**
 * Obtient le label français de l'objectif
 */
export function getObjectifLabel(objectif: string): string {
  const labels: Record<string, string> = {
    'maintien': 'Maintien du poids',
    'prise_masse': 'Prise de masse',
    'seche': 'Sèche',
    'performance': 'Performance'
  }
  
  return labels[objectif] || objectif
}

/**
 * Génère un PDF complet avec toutes les données
 */
export async function generateCompletePDF(
  repas: Repas[],
  entrainements: Entrainement[],
  mesures: Mesure[],
  config: ExportConfig,
  metadata: ExportMetadata,
  fileName: string
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  // Page de titre avec design professionnel
  addTitlePage(doc, config, metadata)
  doc.addPage()

  // Table des matières
  addTableOfContents(doc, config)
  doc.addPage()

  // Résumé exécutif avec graphiques
  addSummaryPage(doc, repas, entrainements, mesures)
  doc.addPage()

  // Graphiques et visualisations
  if (config.includeCharts) {
    addChartsPage(doc, repas, entrainements, mesures)
    doc.addPage()
  }

  // Données détaillées
  if (config.dataType === 'repas' || config.dataType === 'all') {
    addRepasSection(doc, repas)
    doc.addPage()
  }

  if (config.dataType === 'entrainements' || config.dataType === 'all') {
    addEntrainementsSection(doc, entrainements)
    doc.addPage()
  }

  if (config.dataType === 'mesures' || config.dataType === 'all') {
    addMesuresSection(doc, mesures)
    doc.addPage()
  }

  // Recommandations
  addRecommendationsPage(doc, repas, entrainements, mesures)

  // Télécharger le PDF
  await generateAndDownloadPDF(doc, fileName)
}

/**
 * Ajoute une page de titre
 */
function addTitlePage(doc: jsPDF, config: ExportConfig, metadata: ExportMetadata): void {
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('SUPERNOVA FIT', 105, 40, { align: 'center' })
  
  doc.setFontSize(16)
  doc.setFont('helvetica', 'normal')
  doc.text('Rapport Personnel', 105, 55, { align: 'center' })
  
  doc.setFontSize(12)
  doc.text(`Période : ${metadata.period}`, 105, 80, { align: 'center' })
  doc.text(`Généré le : ${format(new Date(metadata.exportedAt), 'dd/MM/yyyy à HH:mm', { locale: fr })}`, 105, 90, { align: 'center' })
  doc.text(`Version : ${metadata.version}`, 105, 100, { align: 'center' })
  
  // Informations sur les données
  const totalRecords = metadata.totalRecords
  doc.text(`Total des enregistrements : ${totalRecords}`, 105, 120, { align: 'center' })
}

/**
 * Ajoute une table des matières
 */
function addTableOfContents(doc: jsPDF, config: ExportConfig): void {
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Table des matières', 20, 30)
  
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  
  let yPos = 50
  const lineHeight = 8
  
  doc.text('1. Résumé exécutif', 20, yPos)
  yPos += lineHeight
  
  if (config.includeCharts) {
    doc.text('2. Graphiques et visualisations', 20, yPos)
    yPos += lineHeight
  }
  
  if (config.dataType === 'repas' || config.dataType === 'all') {
    doc.text('3. Données nutritionnelles', 20, yPos)
    yPos += lineHeight
  }
  
  if (config.dataType === 'entrainements' || config.dataType === 'all') {
    doc.text('4. Données d\'entraînement', 20, yPos)
    yPos += lineHeight
  }
  
  if (config.dataType === 'mesures' || config.dataType === 'all') {
    doc.text('5. Données de mesures', 20, yPos)
    yPos += lineHeight
  }
  
  doc.text('6. Recommandations', 20, yPos)
}

/**
 * Ajoute une page de résumé
 */
function addSummaryPage(doc: jsPDF, repas: Repas[], entrainements: Entrainement[], mesures: Mesure[]): void {
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Résumé exécutif', 20, 30)
  
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  
  let yPos = 50
  
  // Statistiques générales
  const totalCalories = repas.reduce((sum, r) => sum + r.macros.kcal, 0)
  const totalWorkoutTime = entrainements.reduce((sum, e) => sum + e.duree, 0)
  const totalWorkoutCalories = entrainements.reduce((sum, e) => sum + (e.calories || 0), 0)
  
  doc.text(`📊 Statistiques générales :`, 20, yPos)
  yPos += 15
  doc.text(`• Total repas : ${repas.length}`, 30, yPos)
  yPos += 8
  doc.text(`• Calories consommées : ${totalCalories.toFixed(0)} kcal`, 30, yPos)
  yPos += 8
  doc.text(`• Total entraînements : ${entrainements.length}`, 30, yPos)
  yPos += 8
  doc.text(`• Temps d'entraînement : ${totalWorkoutTime} min`, 30, yPos)
  yPos += 8
  doc.text(`• Calories brûlées : ${totalWorkoutCalories.toFixed(0)} kcal`, 30, yPos)
  yPos += 8
  doc.text(`• Total mesures : ${mesures.length}`, 30, yPos)
  
  yPos += 20
  
  // Objectifs atteints
  if (mesures.length >= 2) {
    const firstMesure = mesures[0]
    const lastMesure = mesures[mesures.length - 1]
    const evolution = lastMesure.poids! - firstMesure.poids!
    
    doc.text(`🎯 Évolution du poids :`, 20, yPos)
    yPos += 15
    doc.text(`• Poids initial : ${firstMesure.poids} kg`, 30, yPos)
    yPos += 8
    doc.text(`• Poids actuel : ${lastMesure.poids} kg`, 30, yPos)
    yPos += 8
    doc.text(`• Évolution : ${evolution > 0 ? '+' : ''}${evolution.toFixed(1)} kg`, 30, yPos)
  }
}

/**
 * Ajoute une page de graphiques et visualisations
 */
function addChartsPage(doc: jsPDF, repas: Repas[], entrainements: Entrainement[], mesures: Mesure[]): void {
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Graphiques et Visualisations', 20, 30)
  
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  
  let yPos = 50
  
  // Statistiques calculées
  const stats = calculateChartStatistics(repas, entrainements, mesures)
  
  // Graphique d'évolution du poids
  if (mesures.length >= 2) {
    const weightData = generateWeightChartData(mesures)
    addChartToPDF(doc, 'Évolution du poids', weightData, 20, yPos, 80, 40)
    yPos += 50
    
    // Statistiques du poids
    doc.text(`📊 Évolution du poids : ${stats.weightEvolution > 0 ? '+' : ''}${stats.weightEvolution.toFixed(1)} kg`, 20, yPos)
    yPos += 15
  }
  
  // Graphique des calories par jour
  if (repas.length > 0) {
    const caloriesData = generateCaloriesChartData(repas)
    addChartToPDF(doc, 'Calories par jour', caloriesData, 20, yPos, 80, 40)
    yPos += 50
    
    // Statistiques des calories
    doc.text(`🍽️ Calories moyennes par jour : ${stats.avgCaloriesPerDay.toFixed(0)} kcal`, 20, yPos)
    yPos += 15
  }
  
  // Graphique de répartition des macros
  if (repas.length > 0) {
    const macrosData = generateMacrosChartData(repas)
    addChartToPDF(doc, 'Répartition des macronutriments', macrosData, 20, yPos, 80, 40)
    yPos += 50
  }
  
  // Graphique de fréquence d'entraînement
  if (entrainements.length > 0) {
    const workoutData = generateWorkoutFrequencyChartData(entrainements)
    addChartToPDF(doc, 'Fréquence d\'entraînement', workoutData, 20, yPos, 80, 40)
    yPos += 50
    
    // Statistiques d'entraînement
    doc.text(`💪 Durée moyenne par séance : ${stats.avgWorkoutDuration.toFixed(0)} min`, 20, yPos)
    yPos += 15
  }
}

/**
 * Ajoute un graphique au PDF (simulation avec des données textuelles)
 */
function addChartToPDF(doc: jsPDF, title: string, chartData: ChartData, x: number, y: number, width: number, height: number): void {
  // Titre du graphique
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(title, x, y)
  
  // Zone du graphique (rectangle)
  doc.setDrawColor(200, 200, 200)
  doc.setFillColor(245, 245, 245)
  doc.rect(x, y + 5, width, height, 'F')
  
  // Légende des données
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  
  if (chartData.labels.length > 0) {
    const maxData = Math.max(...chartData.datasets[0].data)
    const minData = Math.min(...chartData.datasets[0].data)
    
    doc.text(`Max: ${maxData.toFixed(1)}`, x + width + 5, y + 10)
    doc.text(`Min: ${minData.toFixed(1)}`, x + width + 5, y + 20)
    doc.text(`Moy: ${(chartData.datasets[0].data.reduce((a, b) => a + b, 0) / chartData.datasets[0].data.length).toFixed(1)}`, x + width + 5, y + 30)
  }
  
  // Barres ou lignes simulées
  if (chartData.datasets[0].data.length > 0) {
    const barWidth = width / chartData.datasets[0].data.length
    const maxValue = Math.max(...chartData.datasets[0].data)
    
    chartData.datasets[0].data.forEach((value, index) => {
      const barHeight = (value / maxValue) * (height - 20)
      const barX = x + (index * barWidth) + 5
      const barY = y + height - barHeight + 5
      
      // Couleur de la barre
      const colors = chartData.datasets[0].backgroundColor as string[]
      const color = Array.isArray(colors) ? colors[index % colors.length] : colors
      
      if (color) {
        const rgb = hexToRgb(color)
        if (rgb) {
          doc.setFillColor(rgb.r, rgb.g, rgb.b)
        }
      }
      
      doc.rect(barX, barY, barWidth - 2, barHeight, 'F')
    })
  }
}

/**
 * Convertit une couleur hex en RGB
 */
function hexToRgb(hex: string): { r: number, g: number, b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

/**
 * Ajoute la section des repas
 */
function addRepasSection(doc: jsPDF, repas: Repas[]): void {
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Données nutritionnelles', 20, 30)
  
  if (repas.length === 0) {
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text('Aucune donnée de repas disponible pour cette période.', 20, 50)
    return
  }
  
  // Tableau des repas
  const tableData = repas.map(r => [
    format(new Date(r.date), 'dd/MM/yyyy', { locale: fr }),
    r.repas,
    r.aliments.map(a => `${a.nom} (${a.quantite}${a.unite})`).join(', '),
    `${r.macros.kcal} kcal`,
    `${r.macros.prot}g`,
    `${r.macros.glucides}g`,
    `${r.macros.lipides}g`
  ])
  
  doc.autoTable({
    startY: 40,
    head: [['Date', 'Type', 'Aliments', 'Calories', 'Protéines', 'Glucides', 'Lipides']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185] },
    styles: { fontSize: 8 }
  })
}

/**
 * Ajoute la section des entraînements
 */
function addEntrainementsSection(doc: jsPDF, entrainements: Entrainement[]): void {
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Données d\'entraînement', 20, 30)
  
  if (entrainements.length === 0) {
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text('Aucune donnée d\'entraînement disponible pour cette période.', 20, 50)
    return
  }
  
  // Tableau des entraînements
  const tableData = entrainements.map(e => [
    format(new Date(e.date), 'dd/MM/yyyy', { locale: fr }),
    e.type,
    `${e.duree} min`,
    e.calories ? `${e.calories} kcal` : '-',
    e.distance ? `${e.distance} km` : '-',
    e.fc_moyenne ? `${e.fc_moyenne} bpm` : '-',
    e.commentaire || '-'
  ])
  
  doc.autoTable({
    startY: 40,
    head: [['Date', 'Type', 'Durée', 'Calories', 'Distance', 'FC moy', 'Commentaire']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [39, 174, 96] },
    styles: { fontSize: 8 }
  })
}

/**
 * Ajoute la section des mesures
 */
function addMesuresSection(doc: jsPDF, mesures: Mesure[]): void {
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Données de mesures', 20, 30)
  
  if (mesures.length === 0) {
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text('Aucune donnée de mesure disponible pour cette période.', 20, 50)
    return
  }
  
  // Tableau des mesures
  const tableData = mesures.map(m => [
    format(new Date(m.date), 'dd/MM/yyyy', { locale: fr }),
    m.poids ? `${m.poids} kg` : '-',
    m.imc ? `${m.imc.toFixed(1)}` : '-',
    m.masse_grasse ? `${m.masse_grasse}%` : '-',
    m.masse_musculaire ? `${m.masse_musculaire} kg` : '-',
    m.tour_taille ? `${m.tour_taille} cm` : '-',
    m.tour_bras ? `${m.tour_bras} cm` : '-'
  ])
  
  doc.autoTable({
    startY: 40,
    head: [['Date', 'Poids', 'IMC', 'Masse grasse', 'Masse musculaire', 'Tour taille', 'Tour bras']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [155, 89, 182] },
    styles: { fontSize: 8 }
  })
}

/**
 * Ajoute une page de recommandations
 */
function addRecommendationsPage(doc: jsPDF, repas: Repas[], entrainements: Entrainement[], mesures: Mesure[]): void {
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Recommandations', 20, 30)
  
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  
  let yPos = 50
  
  // Recommandations nutritionnelles
  if (repas.length > 0) {
    const avgCalories = repas.reduce((sum, r) => sum + r.macros.kcal, 0) / repas.length
    const avgProteins = repas.reduce((sum, r) => sum + r.macros.prot, 0) / repas.length
    
    doc.text(`🍽️ Recommandations nutritionnelles :`, 20, yPos)
    yPos += 15
    doc.text(`• Calories moyennes par jour : ${avgCalories.toFixed(0)} kcal`, 30, yPos)
    yPos += 8
    doc.text(`• Protéines moyennes par jour : ${avgProteins.toFixed(1)}g`, 30, yPos)
    yPos += 8
    
    if (avgCalories < 1500) {
      doc.text(`• ⚠️ Apport calorique faible, considérez augmenter`, 30, yPos)
    } else if (avgCalories > 3000) {
      doc.text(`• ⚠️ Apport calorique élevé, surveillez vos objectifs`, 30, yPos)
    } else {
      doc.text(`• ✅ Apport calorique équilibré`, 30, yPos)
    }
  }
  
  yPos += 20
  
  // Recommandations d'entraînement
  if (entrainements.length > 0) {
    const avgDuration = entrainements.reduce((sum, e) => sum + e.duree, 0) / entrainements.length
    const weeklyWorkouts = entrainements.length
    
    doc.text(`💪 Recommandations d'entraînement :`, 20, yPos)
    yPos += 15
    doc.text(`• Durée moyenne par séance : ${avgDuration.toFixed(0)} min`, 30, yPos)
    yPos += 8
    doc.text(`• Nombre de séances : ${weeklyWorkouts}`, 30, yPos)
    yPos += 8
    
    if (weeklyWorkouts < 3) {
      doc.text(`• 💡 Considérez augmenter la fréquence d'entraînement`, 30, yPos)
    } else if (weeklyWorkouts > 6) {
      doc.text(`• 💡 Attention au surentraînement, prévoyez des jours de repos`, 30, yPos)
    } else {
      doc.text(`• ✅ Fréquence d'entraînement optimale`, 30, yPos)
    }
  }
  
  yPos += 20
  
  // Recommandations générales
  doc.text(`📋 Recommandations générales :`, 20, yPos)
  yPos += 15
  doc.text(`• Continuez à suivre vos progrès régulièrement`, 30, yPos)
  yPos += 8
  doc.text(`• Maintenez une alimentation équilibrée`, 30, yPos)
  yPos += 8
  doc.text(`• Restez hydraté et dormez suffisamment`, 30, yPos)
  yPos += 8
  doc.text(`• Consultez un professionnel si nécessaire`, 30, yPos)
}
