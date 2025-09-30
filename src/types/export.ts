// Types pour les fonctionnalités d'export de données
// Suit les patterns TypeScript stricts du projet SuperNovaFit

// Types d'export disponibles
export type ExportFormat = 'csv' | 'pdf' | 'excel' | 'json';

// Types de données exportables
export type ExportDataType =
  | 'repas'
  | 'entrainements'
  | 'mesures'
  | 'journal'
  | 'photos'
  | 'all';

// Période d'export
export type ExportPeriod =
  | 'day'
  | 'week'
  | 'month'
  | 'quarter'
  | 'year'
  | 'custom';

// Configuration d'export
export interface ExportConfig {
  format: ExportFormat;
  dataType: ExportDataType;
  period: ExportPeriod;
  startDate?: string; // Format YYYY-MM-DD
  endDate?: string; // Format YYYY-MM-DD
  includeHeaders?: boolean;
  includeMetadata?: boolean;
  includeCharts?: boolean;
  groupBy?: 'day' | 'week' | 'month' | 'type';
  filters?: Record<string, unknown>; // ExportFilters supprimé
}

// ExportFilters supprimé - non utilisé

// Métadonnées d'export
export interface ExportMetadata {
  exportedAt: string; // ISO date string
  exportedBy: string; // User ID
  totalRecords: number;
  period: string; // Description de la période
  filters: Record<string, unknown>; // ExportFilters supprimé
  version: string; // Version de l'application
}

// CSVExportData et ChartData supprimés - non utilisés (ChartData défini dans lib/export/chart-utils.ts)

// Résultat d'export
export interface ExportResult {
  success: boolean;
  fileName?: string;
  fileSize?: number;
  downloadUrl?: string;
  error?: string;
  metadata: ExportMetadata;
}

// État du processus d'export
export interface ExportState {
  isExporting: boolean;
  progress: number; // 0-100
  currentStep: string;
  error: string | null;
  result: ExportResult | null;
}

// Types pour les rapports mensuels
export interface MonthlyReport {
  month: string; // Format YYYY-MM
  summary: {
    totalCalories: number;
    averageCalories: number;
    totalWorkouts: number;
    totalDuration: number;
    weightChange?: number;
    goalProgress: number; // 0-100
  };
  charts: Record<string, unknown>[]; // ChartData supprimé
  recommendations: string[];
  achievements: string[];
}

// RepasExportData, EntrainementExportData, MesureExportData, ExportTemplate, UserExportPreferences supprimés - non utilisés
