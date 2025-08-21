/**
 * Page d'export de données SuperNovaFit
 * Interface moderne pour l'export de données avec graphiques et design professionnel
 */

'use client'

import { useState } from 'react'
import { useExportData } from '@/hooks/useExportData'
import { ExportButton } from '@/components/ui/ExportButton'
import { FormErrorDisplay } from '@/components/ui/FirebaseErrorDisplay'
import MainLayout from '@/components/layout/MainLayout'
import { 
  FileText, 
  FileSpreadsheet, 
  FileJson, 
  BarChart3, 
  Calendar,
  Download,
  CheckCircle,
  AlertCircle,
  Loader2,
  Sparkles,
  TrendingUp,
  Zap,
  Target
} from 'lucide-react'

import type { ExportFormat, ExportDataType, ExportPeriod } from '@/types/export'

export default function ExportPage() {
  const {
    exportData,
    exportTodayData,
    exportWeekData,
    exportMonthData,
    exportState,
    error,
    loading,
    resetExportState
  } = useExportData()

  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('pdf')
  const [selectedDataType, setSelectedDataType] = useState<ExportDataType>('all')
  const [selectedPeriod, setSelectedPeriod] = useState<ExportPeriod>('week')
  const [includeCharts, setIncludeCharts] = useState(true)
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')

  const formats = [
    { 
      value: 'pdf', 
      label: 'PDF', 
      icon: FileText, 
      description: 'Rapport complet avec graphiques',
      color: 'from-red-500 to-pink-500',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20'
    },
    { 
      value: 'excel', 
      label: 'Excel', 
      icon: FileSpreadsheet, 
      description: 'Données structurées avec formules',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20'
    },
    { 
      value: 'csv', 
      label: 'CSV', 
      icon: FileText, 
      description: 'Données brutes pour analyse',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    },
    { 
      value: 'json', 
      label: 'JSON', 
      icon: FileJson, 
      description: 'Format technique structuré',
      color: 'from-purple-500 to-violet-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20'
    }
  ]

  const dataTypes = [
    { 
      value: 'all', 
      label: 'Toutes les données', 
      description: 'Repas, entraînements et mesures',
      icon: Target,
      color: 'from-indigo-500 to-purple-500'
    },
    { 
      value: 'repas', 
      label: 'Repas uniquement', 
      description: 'Données nutritionnelles',
      icon: BarChart3,
      color: 'from-orange-500 to-red-500'
    },
    { 
      value: 'entrainements', 
      label: 'Entraînements uniquement', 
      description: 'Données d\'activité physique',
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500'
    },
    { 
      value: 'mesures', 
      label: 'Mesures uniquement', 
      description: 'Données de progression',
      icon: Zap,
      color: 'from-blue-500 to-cyan-500'
    }
  ]

  const periods = [
    { value: 'day', label: 'Aujourd\'hui', icon: Calendar },
    { value: 'week', label: 'Cette semaine', icon: Calendar },
    { value: 'month', label: 'Ce mois', icon: Calendar },
    { value: 'custom', label: 'Période personnalisée', icon: Calendar }
  ]

  const handleQuickExport = async (format: ExportFormat, period: ExportPeriod) => {
    const config = {
      format,
      dataType: selectedDataType,
      period,
      startDate: period === 'custom' ? customStartDate : undefined,
      endDate: period === 'custom' ? customEndDate : undefined,
      includeHeaders: true,
      includeMetadata: true,
      includeCharts: includeCharts && (format === 'pdf' || format === 'excel')
    }

    await exportData(config)
  }

  const handleCustomExport = async () => {
    const config = {
      format: selectedFormat,
      dataType: selectedDataType,
      period: selectedPeriod,
      startDate: selectedPeriod === 'custom' ? customStartDate : undefined,
      endDate: selectedPeriod === 'custom' ? customEndDate : undefined,
      includeHeaders: true,
      includeMetadata: true,
      includeCharts: includeCharts && (selectedFormat === 'pdf' || selectedFormat === 'excel')
    }

    await exportData(config)
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header avec effet glassmorphism */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-3 mb-4 p-3 rounded-full bg-gradient-to-r from-neon-purple/20 to-neon-cyan/20 border border-neon-purple/30">
            <Sparkles className="h-6 w-6 text-neon-purple animate-pulse" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-neon-purple to-neon-cyan bg-clip-text text-transparent">
              Export de Données
            </h1>
          </div>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Exportez vos données de fitness dans différents formats pour analyse et partage professionnel
          </p>
        </div>

        {/* Affichage des erreurs */}
        {error && (
          <div className="mb-6">
            <FormErrorDisplay error={error} />
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
                <p className="font-medium text-white">{exportState.currentStep}</p>
                <p className="text-sm text-gray-300">Progression: {exportState.progress}%</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Export rapide */}
          <div className="glass-effect border border-white/10 rounded-xl p-6 hover:border-neon-purple/30 transition-all duration-300">
            <div className="mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-r from-neon-purple/20 to-neon-cyan/20">
                  <Download className="h-5 w-5 text-neon-purple" />
                </div>
                Export Rapide
              </h2>
              <p className="text-gray-300">
                Exportez rapidement vos données avec des configurations prédéfinies
              </p>
            </div>
            
            <div className="space-y-6">
              {/* Formats */}
              <div>
                <h3 className="font-medium mb-4 text-white">Format d&apos;export</h3>
                <div className="grid grid-cols-2 gap-3">
                  {formats.map((format) => {
                    const Icon = format.icon
                    const isSelected = selectedFormat === format.value
                    return (
                      <button
                        key={format.value}
                        onClick={() => setSelectedFormat(format.value as ExportFormat)}
                        className={`
                          p-4 rounded-xl border-2 transition-all duration-300 group relative overflow-hidden
                          ${isSelected
                            ? `bg-gradient-to-r ${format.color} border-transparent shadow-lg shadow-current/20`
                            : `${format.bgColor} ${format.borderColor} hover:border-current/40 hover:scale-105`
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`h-5 w-5 ${isSelected ? 'text-white' : 'text-gray-300 group-hover:text-white'}`} />
                          <div className="text-left">
                            <div className={`font-medium ${isSelected ? 'text-white' : 'text-gray-200 group-hover:text-white'}`}>
                              {format.label}
                            </div>
                            <div className={`text-xs ${isSelected ? 'text-white/80' : 'text-gray-400 group-hover:text-gray-300'}`}>
                              {format.description}
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Boutons d'export rapide */}
              <div className="space-y-3">
                <ExportButton
                  onClick={() => handleQuickExport(selectedFormat, 'day')}
                  disabled={loading}
                  variant="default"
                  size="sm"
                  className="w-full bg-gradient-to-r from-neon-purple/20 to-neon-cyan/20 border border-neon-purple/30 hover:from-neon-purple/30 hover:to-neon-cyan/30"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Export Aujourd&apos;hui
                </ExportButton>
                
                <ExportButton
                  onClick={() => handleQuickExport(selectedFormat, 'week')}
                  disabled={loading}
                  variant="default"
                  size="sm"
                  className="w-full bg-gradient-to-r from-neon-purple/20 to-neon-cyan/20 border border-neon-purple/30 hover:from-neon-purple/30 hover:to-neon-cyan/30"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Export Cette Semaine
                </ExportButton>
                
                <ExportButton
                  onClick={() => handleQuickExport(selectedFormat, 'month')}
                  disabled={loading}
                  variant="default"
                  size="sm"
                  className="w-full bg-gradient-to-r from-neon-purple/20 to-neon-cyan/20 border border-neon-purple/30 hover:from-neon-purple/30 hover:to-neon-cyan/30"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Export Ce Mois
                </ExportButton>
              </div>
            </div>
          </div>

          {/* Export personnalisé */}
          <div className="glass-effect border border-white/10 rounded-xl p-6 hover:border-neon-cyan/30 transition-all duration-300">
            <div className="mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20">
                  <BarChart3 className="h-5 w-5 text-neon-cyan" />
                </div>
                Export Personnalisé
              </h2>
              <p className="text-gray-300">
                Configurez précisément votre export avec des options avancées
              </p>
            </div>
            
            <div className="space-y-6">
              {/* Type de données */}
              <div>
                <h3 className="font-medium mb-4 text-white">Type de données</h3>
                <div className="space-y-3">
                  {dataTypes.map((type) => {
                    const Icon = type.icon
                    const isSelected = selectedDataType === type.value
                    return (
                      <button
                        key={type.value}
                        onClick={() => setSelectedDataType(type.value as ExportDataType)}
                        className={`
                          w-full p-4 rounded-xl border-2 text-left transition-all duration-300 group relative overflow-hidden
                          ${isSelected
                            ? `bg-gradient-to-r ${type.color} border-transparent shadow-lg shadow-current/20`
                            : 'bg-white/5 border-white/10 hover:border-white/20 hover:scale-[1.02]'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`h-5 w-5 ${isSelected ? 'text-white' : 'text-gray-300 group-hover:text-white'}`} />
                          <div>
                            <div className={`font-medium ${isSelected ? 'text-white' : 'text-gray-200 group-hover:text-white'}`}>
                              {type.label}
                            </div>
                            <div className={`text-sm ${isSelected ? 'text-white/80' : 'text-gray-400 group-hover:text-gray-300'}`}>
                              {type.description}
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              <hr className="border-white/10" />

              {/* Période */}
              <div>
                <h3 className="font-medium mb-4 text-white">Période</h3>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {periods.map((period) => {
                    const Icon = period.icon
                    const isSelected = selectedPeriod === period.value
                    return (
                      <button
                        key={period.value}
                        onClick={() => setSelectedPeriod(period.value as ExportPeriod)}
                        className={`
                          p-3 rounded-lg border-2 transition-all duration-300 flex items-center gap-2
                          ${isSelected
                            ? 'bg-gradient-to-r from-neon-purple/20 to-neon-cyan/20 border-neon-purple/30 text-white'
                            : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/20 hover:text-white'
                          }
                        `}
                      >
                        <Icon className="h-4 w-4" />
                        {period.label}
                      </button>
                    )
                  })}
                </div>

                {/* Dates personnalisées */}
                {selectedPeriod === 'custom' && (
                  <div className="grid grid-cols-2 gap-3 p-4 glass-effect rounded-lg border border-white/10">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-white">Date de début</label>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-neon-cyan/50 focus:outline-none focus:ring-1 focus:ring-neon-cyan/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-white">Date de fin</label>
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

              <hr className="border-white/10" />

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
                      <div className="font-medium text-white">Inclure les graphiques</div>
                      <div className="text-sm text-gray-300">
                        Ajoute des visualisations dans les exports PDF et Excel
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Bouton d'export personnalisé */}
              <ExportButton
                onClick={handleCustomExport}
                disabled={loading || (selectedPeriod === 'custom' && (!customStartDate || !customEndDate))}
                variant="default"
                size="lg"
                className="w-full bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20 border border-neon-cyan/30 hover:from-neon-cyan/30 hover:to-neon-purple/30"
              >
                <Download className="h-4 w-4 mr-2" />
                Exporter avec Configuration
              </ExportButton>
            </div>
          </div>
        </div>

        {/* Informations sur les formats */}
        <div className="mt-12 glass-effect border border-white/10 rounded-xl p-8">
          <h2 className="text-2xl font-semibold mb-6 text-center text-white">Informations sur les formats</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {formats.map((format) => {
              const Icon = format.icon
              return (
                <div key={format.value} className="text-center p-6 glass-effect rounded-xl border border-white/10 hover:border-current/30 transition-all duration-300 group">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${format.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="font-semibold text-white mb-2">{format.label}</h4>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {format.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
