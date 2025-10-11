/**
 * Page d'export de données SuperNovaFit
 * Interface moderne pour l'export de données avec graphiques et design professionnel
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useExportData } from '@/hooks/useExportData';

import FirebaseErrorDisplay from '@/components/ui/FirebaseErrorDisplay';
import MainLayout from '@/components/layout/MainLayout';

// Lazy load des composants lourds pour optimiser le bundle
const ExportButton = dynamic(
  () =>
    import('@/components/ui/ExportButton').then((mod) => ({
      default: mod.ExportButton,
    })),
  {
    loading: () => (
      <div className="h-12 w-32 bg-neon-cyan/20 animate-pulse rounded-lg flex items-center justify-center text-sm text-neon-cyan">
        Chargement...
      </div>
    ),
    ssr: false,
  },
);

import {
  FileText,
  FileSpreadsheet,
  FileJson,
  BarChart3,
  Calendar,
  Download,
  CheckCircle,
  Loader2,
} from 'lucide-react';

import type {
  ExportFormat,
  ExportDataType,
  ExportPeriod,
} from '@/types/export';
import ExportProgressHeader from '@/components/export/ExportProgressHeader';
import ExportCardClickable from '@/components/ui/ExportCardClickable';

export default function ExportPage() {
  const { exportData, exportState, error, loading, lastExportDate } =
    useExportData();

  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('pdf');
  const [selectedDataType, setSelectedDataType] =
    useState<ExportDataType>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<ExportPeriod>('week');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showHint, setShowHint] = useState(true);

  const formats = [
    {
      value: 'pdf',
      label: 'PDF',
      icon: FileText,
      description: 'Rapport complet avec graphiques',
      color: 'purple' as const,
      bgColor: 'bg-neon-purple/10',
      borderColor: 'border-neon-purple/30',
      iconColor: 'text-neon-purple',
    },
    {
      value: 'excel',
      label: 'Excel',
      icon: FileSpreadsheet,
      description: 'Données structurées avec formules',
      color: 'green' as const,
      bgColor: 'bg-neon-green/10',
      borderColor: 'border-neon-green/30',
      iconColor: 'text-neon-green',
    },
    {
      value: 'csv',
      label: 'CSV',
      icon: FileText,
      description: 'Données brutes pour analyse',
      color: 'cyan' as const,
      bgColor: 'bg-neon-cyan/10',
      borderColor: 'border-neon-cyan/30',
      iconColor: 'text-neon-cyan',
    },
    {
      value: 'json',
      label: 'JSON',
      icon: FileJson,
      description: 'Format technique structuré',
      color: 'pink' as const,
      bgColor: 'bg-neon-pink/10',
      borderColor: 'border-neon-pink/30',
      iconColor: 'text-neon-pink',
    },
  ];

  const dataTypes = [
    {
      value: 'all',
      label: 'Toutes les données',
      description: 'Repas, entraînements et mesures',
      icon: BarChart3,
      color: 'purple' as const,
      bgColor: 'bg-neon-purple/10',
      borderColor: 'border-neon-purple/30',
      iconColor: 'text-neon-purple',
    },
    {
      value: 'repas',
      label: 'Repas uniquement',
      description: 'Données nutritionnelles',
      icon: BarChart3,
      color: 'pink' as const,
      bgColor: 'bg-neon-pink/10',
      borderColor: 'border-neon-pink/30',
      iconColor: 'text-neon-pink',
    },
    {
      value: 'entrainements',
      label: 'Entraînements uniquement',
      description: "Données d'activité physique",
      icon: Calendar,
      color: 'green' as const,
      bgColor: 'bg-neon-green/10',
      borderColor: 'border-neon-green/30',
      iconColor: 'text-neon-green',
    },
    {
      value: 'mesures',
      label: 'Mesures uniquement',
      description: 'Données de progression',
      icon: Download,
      color: 'cyan' as const,
      bgColor: 'bg-neon-cyan/10',
      borderColor: 'border-neon-cyan/30',
      iconColor: 'text-neon-cyan',
    },
  ];

  const periods = [
    { value: 'day', label: "Aujourd'hui", icon: Calendar },
    { value: 'week', label: 'Cette semaine', icon: Calendar },
    { value: 'month', label: 'Ce mois', icon: Calendar },
    { value: 'custom', label: 'Période personnalisée', icon: Calendar },
  ];

  const handleQuickExport = useCallback(
    async (format: ExportFormat, period: ExportPeriod) => {
      const config = {
        format,
        dataType: selectedDataType,
        period,
        startDate: period === 'custom' ? customStartDate : undefined,
        endDate: period === 'custom' ? customEndDate : undefined,
        includeHeaders: true,
        includeMetadata: true,
        includeCharts:
          includeCharts && (format === 'pdf' || format === 'excel'),
      };

      await exportData(config);
    },
    [
      selectedDataType,
      customStartDate,
      customEndDate,
      includeCharts,
      exportData,
    ],
  );

  const handleCustomExport = async () => {
    const config = {
      format: selectedFormat,
      dataType: selectedDataType,
      period: selectedPeriod,
      startDate: selectedPeriod === 'custom' ? customStartDate : undefined,
      endDate: selectedPeriod === 'custom' ? customEndDate : undefined,
      includeHeaders: true,
      includeMetadata: true,
      includeCharts:
        includeCharts &&
        (selectedFormat === 'pdf' || selectedFormat === 'excel'),
    };

    await exportData(config);
  };

  // Stats d'export simulées (à remplacer par de vraies données)
  const exportStats = {
    totalExports: 12,
    lastExport: lastExportDate || 'Aucun export',
    favoriteFormat: 'PDF',
    dataExported: '2.3 MB',
  };

  // Données pour le ProgressHeader - Métriques simplifiées
  const progressItems = [
    {
      icon: <Download className="h-4 w-4" />,
      label: 'Exports',
      data: {
        current: exportStats.totalExports,
        target: 0, // Pas d'objectif
        unit: '',
      },
      color: 'purple' as const,
    },
    {
      icon: <BarChart3 className="h-4 w-4" />,
      label: 'Données exportées',
      data: {
        current: 2.3,
        target: 0, // Pas d'objectif
        unit: 'MB',
      },
      color: 'green' as const,
    },
  ];

  const generateSmartAdvice = () => {
    if (exportStats.totalExports < 5) {
      return 'Commencez à exporter vos données pour suivre votre progression';
    }
    if (exportStats.totalExports < 15) {
      return 'Excellent ! Vous exportez régulièrement vos données';
    }
    return 'Exporteur expert ! Vos données sont parfaitement organisées';
  };

  // Raccourci clavier Ctrl+E pour export rapide
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'e') {
        event.preventDefault();
        handleQuickExport(selectedFormat, 'week');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedFormat, handleQuickExport]);

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        {/* ProgressHeader standardisé */}
        <ExportProgressHeader
          title="EXPORT"
          emoji="📊"
          items={progressItems}
          advice={generateSmartAdvice()}
          lastExportDate={exportStats.lastExport}
        />

        {showHint && (
          <div className="glass-effect p-3 rounded-lg border border-white/10 mb-6">
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <span>💡 Utilisez le bouton flottant pour un export rapide</span>
              <button
                onClick={() => setShowHint(false)}
                className="text-muted-foreground hover:text-white transition-colors ml-2"
                title="Masquer ce hint"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Affichage des erreurs */}
        {error && (
          <div className="mb-6">
            <FirebaseErrorDisplay error={error} />
          </div>
        )}

        {/* État d'export avec animation */}
        {exportState.isExporting && (
          <div className="mb-6 p-6 glass-effect border border-neon-cyan/30 rounded-xl animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <Loader2 className="h-6 w-6 animate-spin text-neon-cyan" />
                <div className="absolute inset-0 rounded-full border-2 border-neon-cyan/20 animate-ping"></div>
              </div>
              <div>
                <p className="font-medium text-white">
                  {exportState.currentStep}
                </p>
                <p className="text-sm text-gray-300">
                  Progression: {exportState.progress}%
                </p>
              </div>
            </div>
            <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-neon-cyan to-neon-purple h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${exportState.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Succès d'export */}
        {exportState.result?.success && (
          <div className="mb-6 p-6 glass-effect border border-green-500/30 rounded-xl animate-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
              <div className="relative">
                <CheckCircle className="h-6 w-6 text-green-400" />
                <div className="absolute inset-0 rounded-full border-2 border-green-400/20 animate-ping"></div>
              </div>
              <div>
                <p className="font-medium text-white">Export réussi !</p>
                <p className="text-sm text-gray-300">
                  Fichier généré: {exportState.result.fileName}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Section Export Unifiée */}
        <div className="glass-effect border border-white/10 rounded-xl p-6 hover:border-neon-purple/30 transition-all duration-300">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-gradient-to-r from-neon-purple/20 to-neon-cyan/20">
                <Download className="h-5 w-5 text-neon-purple" />
              </div>
              <h2 className="text-xl font-semibold text-white">
                Export de Données
              </h2>
            </div>
            <p className="text-gray-300">
              Configurez et exportez vos données avec les options disponibles
            </p>
          </div>

          <div className="space-y-6">
            {/* Format d'export */}
            <div>
              <h3 className="font-medium mb-4 text-white">
                Format d&apos;export
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {formats.map((format) => {
                  const Icon = format.icon;
                  const isSelected = selectedFormat === format.value;
                  return (
                    <ExportCardClickable
                      key={format.value}
                      data={{
                        icon: <Icon className="h-5 w-5" />,
                        label: format.label,
                        description: format.description,
                        color: format.color,
                        bgColor: format.bgColor,
                        borderColor: format.borderColor,
                        iconColor: format.iconColor,
                      }}
                      onView={() =>
                        setSelectedFormat(format.value as ExportFormat)
                      }
                      isSelected={isSelected}
                      viewLabel={isSelected ? 'Sélectionné' : 'Sélectionner'}
                      className={
                        isSelected ? `ring-2 ${format.borderColor}` : ''
                      }
                    />
                  );
                })}
              </div>
            </div>

            {/* Type de données */}
            <div>
              <h3 className="font-medium mb-4 text-white">Type de données</h3>
              <div className="grid grid-cols-1 gap-3">
                {dataTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = selectedDataType === type.value;
                  return (
                    <ExportCardClickable
                      key={type.value}
                      data={{
                        icon: <Icon className="h-5 w-5" />,
                        label: type.label,
                        description: type.description,
                        color: type.color,
                        bgColor: type.bgColor,
                        borderColor: type.borderColor,
                        iconColor: type.iconColor,
                      }}
                      onView={() =>
                        setSelectedDataType(type.value as ExportDataType)
                      }
                      isSelected={isSelected}
                      viewLabel={isSelected ? 'Sélectionné' : 'Sélectionner'}
                      className={isSelected ? `ring-2 ${type.borderColor}` : ''}
                    />
                  );
                })}
              </div>
            </div>

            {/* Période */}
            <div>
              <h3 className="font-medium mb-4 text-white">Période</h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {periods.map((period) => {
                  const Icon = period.icon;
                  const isSelected = selectedPeriod === period.value;
                  return (
                    <button
                      key={period.value}
                      onClick={() =>
                        setSelectedPeriod(period.value as ExportPeriod)
                      }
                      className={`
                        p-3 rounded-lg border-2 transition-all duration-300 flex items-center gap-2
                        ${
                          isSelected
                            ? 'bg-gradient-to-r from-neon-purple/20 to-neon-cyan/20 border-neon-purple/30 text-white'
                            : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/20 hover:text-white'
                        }
                      `}
                    >
                      <Icon className="h-4 w-4" />
                      {period.label}
                    </button>
                  );
                })}
              </div>

              {/* Dates personnalisées */}
              {selectedPeriod === 'custom' && (
                <div className="grid grid-cols-2 gap-3 p-4 glass-effect rounded-lg border border-white/10">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white">
                      Date de début
                    </label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-neon-cyan/50 focus:outline-none focus:ring-1 focus:ring-neon-cyan/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white">
                      Date de fin
                    </label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-neon-cyan/50 focus:outline-none focus:ring-1 focus:ring-neon-cyan/50"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Options avancées */}
            <div>
              <h3 className="font-medium mb-4 text-white">Options avancées</h3>
              <div className="space-y-3">
                <label className="flex items-start gap-3 p-3 glass-effect rounded-lg border border-white/10 hover:border-neon-cyan/30 transition-all duration-300">
                  <input
                    type="checkbox"
                    checked={includeCharts}
                    onChange={(e) => setIncludeCharts(e.target.checked)}
                    className="mt-1 rounded border-white/20 bg-white/5 text-neon-cyan focus:ring-neon-cyan/50"
                  />
                  <div>
                    <div className="font-medium text-white">
                      Inclure les graphiques
                    </div>
                    <div className="text-sm text-gray-300">
                      Ajoute des visualisations dans les exports PDF et Excel
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Bouton d'export */}
            <ExportButton
              onClick={handleCustomExport}
              disabled={
                loading ||
                (selectedPeriod === 'custom' &&
                  (!customStartDate || !customEndDate))
              }
              variant="default"
              size="lg"
              className="w-full bg-gradient-to-r from-neon-purple/20 to-neon-cyan/20 border border-neon-purple/30 hover:from-neon-purple/30 hover:to-neon-cyan/30"
            >
              <Download className="h-4 w-4 mr-2" />
              Exporter les Données
            </ExportButton>
          </div>
        </div>

        {/* FAB - Floating Action Button */}
        <button
          onClick={() => handleQuickExport(selectedFormat, 'week')}
          disabled={loading}
          className="fixed bottom-24 right-6 md:bottom-8 md:right-8 z-50 w-14 h-14 md:w-16 md:h-16 bg-gradient-to-r from-neon-purple to-neon-cyan text-white rounded-full shadow-2xl hover:shadow-neon-purple/30 transition-all duration-300 transform hover:scale-110 flex items-center justify-center group"
          title="Export rapide (raccourci: Ctrl+E)"
        >
          <Download className="h-6 w-6 md:h-7 md:w-7 group-hover:scale-110 transition-transform duration-300" />
          <div className="absolute inset-0 rounded-full bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-300"></div>
        </button>
      </div>
    </MainLayout>
  );
}
