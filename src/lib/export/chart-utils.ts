/**
 * Utilitaires de graphiques pour les exports SuperNovaFit
 * Génère des graphiques pour PDF et Excel
 */

import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Repas, Entrainement, Mesure } from '@/types'

export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
    borderWidth?: number
    fill?: boolean
  }[]
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'doughnut' | 'pie'
  title: string
  width: number
  height: number
  colors: string[]
}

/**
 * Génère les données pour un graphique d'évolution du poids
 */
export function generateWeightChartData(mesures: Mesure[]): ChartData {
  if (mesures.length === 0) {
    return {
      labels: [],
      datasets: [{
        label: 'Poids (kg)',
        data: [],
        borderColor: '#2980b9',
        backgroundColor: 'rgba(41, 128, 185, 0.1)',
        borderWidth: 2,
        fill: true
      }]
    }
  }

  const sortedMesures = mesures
    .filter(m => m.poids !== undefined)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return {
    labels: sortedMesures.map(m => format(new Date(m.date), 'dd/MM', { locale: fr })),
    datasets: [{
      label: 'Poids (kg)',
      data: sortedMesures.map(m => m.poids!),
      borderColor: '#2980b9',
      backgroundColor: 'rgba(41, 128, 185, 0.1)',
      borderWidth: 2,
      fill: true
    }]
  }
}

/**
 * Génère les données pour un graphique de calories par jour
 */
export function generateCaloriesChartData(repas: Repas[]): ChartData {
  if (repas.length === 0) {
    return {
      labels: [],
      datasets: [{
        label: 'Calories (kcal)',
        data: [],
        backgroundColor: '#e74c3c',
        borderColor: '#c0392b',
        borderWidth: 1
      }]
    }
  }

  // Grouper par jour
  const caloriesByDay = new Map<string, number>()
  
  repas.forEach(r => {
    const day = format(new Date(r.date), 'yyyy-MM-dd')
    const current = caloriesByDay.get(day) || 0
    caloriesByDay.set(day, current + r.macros.kcal)
  })

  const sortedDays = Array.from(caloriesByDay.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-7) // Derniers 7 jours

  return {
    labels: sortedDays.map(([day]) => format(new Date(day), 'dd/MM', { locale: fr })),
    datasets: [{
      label: 'Calories (kcal)',
      data: sortedDays.map(([, calories]) => calories),
      backgroundColor: '#e74c3c',
      borderColor: '#c0392b',
      borderWidth: 1
    }]
  }
}

/**
 * Génère les données pour un graphique de répartition des macros
 */
export function generateMacrosChartData(repas: Repas[]): ChartData {
  if (repas.length === 0) {
    return {
      labels: ['Protéines', 'Glucides', 'Lipides'],
      datasets: [{
        label: 'Macronutriments (g)',
        data: [0, 0, 0],
        backgroundColor: ['#3498db', '#e74c3c', '#f39c12'],
        borderWidth: 1
      }]
    }
  }

  const totalMacros = repas.reduce((acc, r) => ({
    proteines: acc.proteines + r.macros.prot,
    glucides: acc.glucides + r.macros.glucides,
    lipides: acc.lipides + r.macros.lipides
  }), { proteines: 0, glucides: 0, lipides: 0 })

  return {
    labels: ['Protéines', 'Glucides', 'Lipides'],
    datasets: [{
      label: 'Macronutriments (g)',
      data: [totalMacros.proteines, totalMacros.glucides, totalMacros.lipides],
      backgroundColor: ['#3498db', '#e74c3c', '#f39c12'],
      borderWidth: 1
    }]
  }
}

/**
 * Génère les données pour un graphique de fréquence d'entraînement
 */
export function generateWorkoutFrequencyChartData(entrainements: Entrainement[]): ChartData {
  if (entrainements.length === 0) {
    return {
      labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
      datasets: [{
        label: 'Entraînements',
        data: [0, 0, 0, 0, 0, 0, 0],
        backgroundColor: '#27ae60',
        borderColor: '#229954',
        borderWidth: 1
      }]
    }
  }

  // Compter les entraînements par jour de la semaine
  const workoutCount = new Array(7).fill(0)
  
  entrainements.forEach(e => {
    const dayOfWeek = new Date(e.date).getDay()
    workoutCount[dayOfWeek]++
  })

  // Réorganiser pour commencer par lundi
  const reordered = [...workoutCount.slice(1), workoutCount[0]]

  return {
    labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    datasets: [{
      label: 'Entraînements',
      data: reordered,
      backgroundColor: '#27ae60',
      borderColor: '#229954',
      borderWidth: 1
    }]
  }
}

/**
 * Génère les données pour un graphique d'évolution de l'IMC
 */
export function generateIMCChartData(mesures: Mesure[]): ChartData {
  if (mesures.length === 0) {
    return {
      labels: [],
      datasets: [{
        label: 'IMC',
        data: [],
        borderColor: '#9b59b6',
        backgroundColor: 'rgba(155, 89, 182, 0.1)',
        borderWidth: 2,
        fill: true
      }]
    }
  }

  const sortedMesures = mesures
    .filter(m => m.imc !== undefined)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return {
    labels: sortedMesures.map(m => format(new Date(m.date), 'dd/MM', { locale: fr })),
    datasets: [{
      label: 'IMC',
      data: sortedMesures.map(m => m.imc!),
      borderColor: '#9b59b6',
      backgroundColor: 'rgba(155, 89, 182, 0.1)',
      borderWidth: 2,
      fill: true
    }]
  }
}

/**
 * Génère les données pour un graphique de durée d'entraînement par type
 */
export function generateWorkoutTypeChartData(entrainements: Entrainement[]): ChartData {
  if (entrainements.length === 0) {
    return {
      labels: [],
      datasets: [{
        label: 'Durée (min)',
        data: [],
        backgroundColor: ['#e67e22', '#f39c12', '#f1c40f', '#2ecc71', '#3498db'],
        borderWidth: 1
      }]
    }
  }

  // Grouper par type d'entraînement
  const durationByType = new Map<string, number>()
  
  entrainements.forEach(e => {
    const current = durationByType.get(e.type) || 0
    durationByType.set(e.type, current + e.duree)
  })

  const colors = ['#e67e22', '#f39c12', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6', '#e74c3c']

  return {
    labels: Array.from(durationByType.keys()),
    datasets: [{
      label: 'Durée (min)',
      data: Array.from(durationByType.values()),
      backgroundColor: colors.slice(0, durationByType.size),
      borderWidth: 1
    }]
  }
}

/**
 * Calcule les statistiques pour les graphiques
 */
export function calculateChartStatistics(
  repas: Repas[],
  entrainements: Entrainement[],
  mesures: Mesure[]
): {
  totalCalories: number
  avgCaloriesPerDay: number
  totalWorkoutTime: number
  avgWorkoutDuration: number
  weightEvolution: number
  imcEvolution: number
} {
  const totalCalories = repas.reduce((sum, r) => sum + r.macros.kcal, 0)
  const avgCaloriesPerDay = repas.length > 0 ? totalCalories / repas.length : 0
  
  const totalWorkoutTime = entrainements.reduce((sum, e) => sum + e.duree, 0)
  const avgWorkoutDuration = entrainements.length > 0 ? totalWorkoutTime / entrainements.length : 0

  let weightEvolution = 0
  let imcEvolution = 0

  if (mesures.length >= 2) {
    const sortedMesures = mesures.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    const first = sortedMesures[0]
    const last = sortedMesures[sortedMesures.length - 1]
    
    if (first.poids && last.poids) {
      weightEvolution = last.poids - first.poids
    }
    
    if (first.imc && last.imc) {
      imcEvolution = last.imc - first.imc
    }
  }

  return {
    totalCalories,
    avgCaloriesPerDay,
    totalWorkoutTime,
    avgWorkoutDuration,
    weightEvolution,
    imcEvolution
  }
}
