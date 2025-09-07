// Types pour les fonctionnalités d'export de données
// Suit les patterns TypeScript stricts du projet SuperNovaFit

// Types d'export disponibles
export type ExportFormat = 'csv' | 'pdf' | 'excel' | 'json'

// Types de données exportables
export type ExportDataType = 'repas' | 'entrainements' | 'mesures' | 'journal' | 'photos' | 'all'

// Période d'export
export type ExportPeriod = 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom'

// Configuration d'export
export interface ExportConfig {
  format: ExportFormat
  dataType: ExportDataType
  period: ExportPeriod
  startDate?: string // Format YYYY-MM-DD
  endDate?: string // Format YYYY-MM-DD
  includeHeaders?: boolean
  includeMetadata?: boolean
  includeCharts?: boolean
  groupBy?: 'day' | 'week' | 'month' | 'type'
  filters?: ExportFilters
}

// Filtres d'export
export interface ExportFilters {
  mealTypes?: string[] // Pour les repas
  trainingTypes?: string[] // Pour les entraînements
  measureTypes?: string[] // Pour les mesures
  minCalories?: number
  maxCalories?: number
  minDuration?: number // en minutes
  maxDuration?: number
}

// Métadonnées d'export
export interface ExportMetadata {
  exportedAt: string // ISO date string
  exportedBy: string // User ID
  totalRecords: number
  period: string // Description de la période
  filters: ExportFilters
  version: string // Version de l'application
}

// Données formatées pour export CSV
export interface CSVExportData {
  headers: string[]
  rows: string[][]
  metadata: ExportMetadata
}

// Interface PDFConfig supprimée - non utilisée

// Données pour graphiques
export interface ChartData {
  type: 'line' | 'bar' | 'pie' | 'area'
  title: string
  data: Array<{
    name: string
    value: number
    date?: string
    category?: string
  }>
  xAxis?: string
  yAxis?: string
  colors?: string[]
}

// Résultat d'export
export interface ExportResult {
  success: boolean
  fileName?: string
  fileSize?: number
  downloadUrl?: string
  error?: string
  metadata: ExportMetadata
}

// État du processus d'export
export interface ExportState {
  isExporting: boolean
  progress: number // 0-100
  currentStep: string
  error: string | null
  result: ExportResult | null
}

// Types pour les rapports mensuels
export interface MonthlyReport {
  month: string // Format YYYY-MM
  summary: {
    totalCalories: number
    averageCalories: number
    totalWorkouts: number
    totalDuration: number
    weightChange?: number
    goalProgress: number // 0-100
  }
  charts: ChartData[]
  recommendations: string[]
  achievements: string[]
}

// Types pour les exports spécifiques par module
export interface RepasExportData {
  repas: Array<{
    date: string
    type: string
    aliments: string
    calories: number
    proteines: number
    glucides: number
    lipides: number
  }>
  summary: {
    totalRepas: number
    totalCalories: number
    averageCalories: number
    mostFrequentMeal: string
  }
}

export interface EntrainementExportData {
  entrainements: Array<{
    date: string
    type: string
    duree: number
    calories: number
    distance?: number
    fc_moyenne?: number
    commentaire?: string
  }>
  summary: {
    totalWorkouts: number
    totalDuration: number
    totalCalories: number
    averageDuration: number
    mostFrequentType: string
  }
}

export interface MesureExportData {
  mesures: Array<{
    date: string
    poids: number
    imc: number
    masse_grasse?: number
    masse_musculaire?: number
    tour_taille?: number
    tour_bras?: number
    tour_poitrine?: number
  }>
  summary: {
    totalMesures: number
    poidsInitial: number
    poidsActuel: number
    evolution: number
    objectifAtteint: boolean
  }
}

// Types pour les templates d'export
export interface ExportTemplate {
  id: string
  name: string
  description: string
  config: ExportConfig
  isDefault?: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
}

// Types pour les préférences d'export utilisateur
export interface UserExportPreferences {
  defaultFormat: ExportFormat
  defaultPeriod: ExportPeriod
  autoIncludeHeaders: boolean
  autoIncludeMetadata: boolean
  defaultGroupBy?: 'day' | 'week' | 'month' | 'type'
  preferredFileNameFormat: string // Template pour nom de fichier
  saveTemplates: boolean
}
