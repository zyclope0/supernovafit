/**
 * Hook pour gérer l'export de données SuperNovaFit
 * Orchestre tous les types d'export (CSV, JSON, Excel, PDF)
 */

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRepas, useEntrainements, useMesures } from '@/hooks/useFirestore';
import { useFirebaseError } from '@/hooks/useFirebaseError';
// Imports légers seulement - les exports lourds seront lazy-loadés
import {
  generateFileName,
  getPeriodDescription,
} from '@/lib/export/csv-export';
import { APP_VERSION } from '@/lib/constants';

import type {
  ExportConfig,
  ExportFormat,
  ExportDataType,
  ExportState,
  ExportResult,
} from '@/types/export';

/**
 * Hook principal pour l'export de données
 */
export function useExportData() {
  const { user } = useAuth();
  const { handleError, error, clearError } = useFirebaseError();

  const { repas, loading: repasLoading } = useRepas();
  const { entrainements, loading: entrainementsLoading } = useEntrainements();
  const { mesures, loading: mesuresLoading } = useMesures();

  const [exportState, setExportState] = useState<ExportState>({
    isExporting: false,
    progress: 0,
    currentStep: '',
    error: null,
    result: null,
  });

  const [lastExportDate, setLastExportDate] = useState<string>('');

  // Récupérer la date du dernier export depuis localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('supernovafit_last_export_date');
      if (stored) {
        setLastExportDate(stored);
      }
    }
  }, []);

  /**
   * Filtrer les données selon la configuration
   */
  const getFilteredData = useCallback(
    (config: ExportConfig) => {
      let filteredRepas = repas;
      let filteredEntrainements = entrainements;
      let filteredMesures = mesures;

      // Filtrer par type de données
      if (config.dataType !== 'all') {
        if (config.dataType !== 'repas') filteredRepas = [];
        if (config.dataType !== 'entrainements') filteredEntrainements = [];
        if (config.dataType !== 'mesures') filteredMesures = [];
      }

      // Filtrer par période
      if (config.startDate && config.endDate) {
        const startDate = new Date(config.startDate);
        const endDate = new Date(config.endDate);

        filteredRepas = filteredRepas.filter((r) => {
          const repasDate = new Date(r.date);
          return repasDate >= startDate && repasDate <= endDate;
        });

        filteredEntrainements = filteredEntrainements.filter((e) => {
          const entrainementDate = new Date(e.date);
          return entrainementDate >= startDate && entrainementDate <= endDate;
        });

        filteredMesures = filteredMesures.filter((m) => {
          const mesureDate = new Date(m.date);
          return mesureDate >= startDate && mesureDate <= endDate;
        });
      }

      // Appliquer les filtres spécifiques
      if (config.filters) {
        if (
          config.filters.mealTypes &&
          Array.isArray(config.filters.mealTypes) &&
          config.filters.mealTypes.length > 0
        ) {
          filteredRepas = filteredRepas.filter((r) =>
            (config.filters!.mealTypes as string[]).includes(r.repas),
          );
        }

        if (
          config.filters.trainingTypes &&
          Array.isArray(config.filters.trainingTypes) &&
          config.filters.trainingTypes.length > 0
        ) {
          filteredEntrainements = filteredEntrainements.filter((e) =>
            (config.filters!.trainingTypes as string[]).includes(e.type),
          );
        }

        if (config.filters.minCalories) {
          filteredRepas = filteredRepas.filter(
            (r) => r.macros.kcal >= (config.filters!.minCalories as number),
          );
        }

        if (config.filters.maxCalories) {
          filteredRepas = filteredRepas.filter(
            (r) => r.macros.kcal <= (config.filters!.maxCalories as number),
          );
        }

        if (config.filters.minDuration) {
          filteredEntrainements = filteredEntrainements.filter(
            (e) => e.duree >= (config.filters!.minDuration as number),
          );
        }

        if (config.filters.maxDuration) {
          filteredEntrainements = filteredEntrainements.filter(
            (e) => e.duree <= (config.filters!.maxDuration as number),
          );
        }
      }

      return {
        repas: filteredRepas,
        entrainements: filteredEntrainements,
        mesures: filteredMesures,
      };
    },
    [repas, entrainements, mesures],
  );

  /**
   * Fonction principale d'export
   */
  const exportData = useCallback(
    async (config: ExportConfig) => {
      if (!user) {
        handleError(new Error('Utilisateur non connecté'));
        return;
      }

      if (repasLoading || entrainementsLoading || mesuresLoading) return;

      setExportState((prev) => ({
        ...prev,
        isExporting: true,
        progress: 0,
        currentStep: 'Préparation des données...',
        error: null,
        result: null,
      }));

      try {
        // Récupérer les données filtrées
        const filteredData = getFilteredData(config);

        setExportState((prev) => ({
          ...prev,
          progress: 25,
          currentStep: 'Génération des métadonnées...',
        }));

        // Générer les métadonnées
        const metadata: ExportResult['metadata'] = {
          exportedAt: new Date().toISOString(),
          exportedBy: user.uid,
          totalRecords:
            filteredData.repas.length +
            filteredData.entrainements.length +
            filteredData.mesures.length,
          period: getPeriodDescription(
            config.period,
            config.startDate,
            config.endDate,
          ),
          filters: config.filters || {},
          version: APP_VERSION,
        };

        setExportState((prev) => ({
          ...prev,
          progress: 50,
          currentStep: 'Génération du fichier...',
        }));

        // Générer le nom de fichier
        const fileName = generateFileName(config, metadata);

        // Exporter selon le format
        let result: ExportResult;

        switch (config.format) {
          case 'csv':
            const { generateAndDownloadCSV } = await import(
              '@/lib/export/csv-export'
            );
            await generateAndDownloadCSV(
              filteredData,
              config,
              metadata,
              fileName,
            );
            result = {
              success: true,
              fileName: `${fileName}.csv`,
              metadata,
            };
            break;

          case 'json':
            const { generateAndDownloadJSON } = await import(
              '@/lib/export/json-export'
            );
            await generateAndDownloadJSON(
              filteredData,
              config,
              metadata,
              fileName,
            );
            result = {
              success: true,
              fileName: `${fileName}.json`,
              metadata,
            };
            break;

          case 'excel':
            const { generateAndDownloadExcel } = await import(
              '@/lib/export/excel-export'
            );
            await generateAndDownloadExcel(
              filteredData.repas,
              filteredData.entrainements,
              filteredData.mesures,
              config,
              metadata,
              fileName,
            );
            result = {
              success: true,
              fileName: `${fileName}.xlsx`,
              metadata,
            };
            break;

          case 'pdf':
            const { generateCompletePDF } = await import(
              '@/lib/export/pdf-export'
            );
            await generateCompletePDF(
              filteredData.repas,
              filteredData.entrainements,
              filteredData.mesures,
              config,
              metadata,
              fileName,
            );
            result = {
              success: true,
              fileName: `${fileName}.pdf`,
              metadata,
            };
            break;

          default:
            throw new Error(`Format d'export non supporté: ${config.format}`);
        }

        // Sauvegarder la date du dernier export
        const exportDate = new Date().toISOString().split('T')[0];
        setLastExportDate(exportDate);
        if (typeof window !== 'undefined') {
          localStorage.setItem('supernovafit_last_export_date', exportDate);
        }

        setExportState((prev) => ({
          ...prev,
          progress: 100,
          currentStep: 'Export terminé',
          isExporting: false,
          result,
        }));
      } catch (error) {
        console.error("Erreur lors de l'export:", error);
        handleError(error as Error);

        setExportState((prev) => ({
          ...prev,
          isExporting: false,
          error: (error as Error).message,
          result: {
            success: false,
            error: (error as Error).message,
            metadata: {
              exportedAt: new Date().toISOString(),
              exportedBy: user?.uid || '',
              totalRecords: 0,
              period: '',
              filters: {},
              version: APP_VERSION,
            },
          },
        }));
      }
    },
    [
      user,
      handleError,
      repasLoading,
      entrainementsLoading,
      mesuresLoading,
      getFilteredData,
    ],
  );

  /**
   * Export rapide pour aujourd'hui
   */
  const exportTodayData = useCallback(
    (format: ExportFormat, dataType: ExportDataType = 'all') => {
      const today = new Date().toISOString().split('T')[0];

      const config: ExportConfig = {
        format,
        dataType,
        period: 'day',
        startDate: today,
        endDate: today,
        includeHeaders: true,
        includeMetadata: true,
        includeCharts: format === 'pdf' || format === 'excel',
      };

      return exportData(config);
    },
    [exportData],
  );

  /**
   * Export rapide pour la semaine
   */
  const exportWeekData = useCallback(
    (format: ExportFormat, dataType: ExportDataType = 'all') => {
      const config: ExportConfig = {
        format,
        dataType,
        period: 'week',
        includeHeaders: true,
        includeMetadata: true,
        includeCharts: format === 'pdf' || format === 'excel',
      };

      return exportData(config);
    },
    [exportData],
  );

  /**
   * Export rapide pour le mois
   */
  const exportMonthData = useCallback(
    (format: ExportFormat, dataType: ExportDataType = 'all') => {
      const config: ExportConfig = {
        format,
        dataType,
        period: 'month',
        includeHeaders: true,
        includeMetadata: true,
        includeCharts: format === 'pdf' || format === 'excel',
      };

      return exportData(config);
    },
    [exportData],
  );

  /**
   * Réinitialiser l'état d'export
   */
  const resetExportState = useCallback(() => {
    setExportState({
      isExporting: false,
      progress: 0,
      currentStep: '',
      error: null,
      result: null,
    });
    clearError();
  }, [clearError]);

  /**
   * Mettre à jour l'état d'export
   */
  const updateExportState = useCallback((updates: Partial<ExportState>) => {
    setExportState((prev) => ({ ...prev, ...updates }));
  }, []);

  return {
    // État
    exportState,
    error,
    loading:
      repasLoading ||
      entrainementsLoading ||
      mesuresLoading ||
      exportState.isExporting,
    lastExportDate,

    // Actions
    exportData,
    exportTodayData,
    exportWeekData,
    exportMonthData,
    resetExportState,
    updateExportState,

    // Données
    repas,
    entrainements,
    mesures,
    getFilteredData,
  };
}
