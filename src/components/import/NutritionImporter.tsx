/**
 * Composant d'import nutrition pour SuperNovaFit
 * Interface utilisateur pour importer des données depuis MyFitnessPal, Yazio, Cronometer
 */

'use client';

import React, { useState, useCallback } from 'react';
import { Upload, CheckCircle, Eye, EyeOff } from 'lucide-react';
import {
  parseNutritionFile,
  validateImportedData,
  type ImportConfig,
  type ImportPreview,
  type ImportResult,
} from '@/lib/import/nutrition-import';
import StandardModal from '@/components/ui/StandardModal';
// import { Button } from '@/components/ui/Button'; // Composant n'existe pas
import toast from 'react-hot-toast';

interface NutritionImporterProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any[]) => Promise<void>;
  userId: string;
}

interface ImportStep {
  id: 'upload' | 'preview' | 'import';
  title: string;
  description: string;
}

const IMPORT_STEPS: ImportStep[] = [
  {
    id: 'upload',
    title: 'Upload du fichier',
    description: "Sélectionnez votre fichier d'export nutrition",
  },
  {
    id: 'preview',
    title: 'Aperçu des données',
    description: "Vérifiez les données avant l'import",
  },
  {
    id: 'import',
    title: 'Import terminé',
    description: 'Vos données ont été importées avec succès',
  },
];

const FORMAT_OPTIONS = [
  {
    id: 'myfitnesspal' as const,
    name: 'MyFitnessPal',
    description: 'Export CSV depuis MyFitnessPal',
    example: 'Date,Meal,Food,Calories,Protein,Carbs,Fat',
    icon: '📊',
  },
  {
    id: 'yazio' as const,
    name: 'Yazio',
    description: 'Export CSV depuis Yazio',
    example: 'date;meal_type;product;kcal;protein;carbs;fat',
    icon: '🇩🇪',
  },
  {
    id: 'cronometer' as const,
    name: 'Cronometer',
    description: 'Export JSON depuis Cronometer',
    example: '{ "date": "2025-01-14", "foods": [...] }',
    icon: '⚗️',
  },
];

export default function NutritionImporter({
  isOpen,
  onClose,
  onImport,
  userId,
}: NutritionImporterProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedFormat, setSelectedFormat] = useState<
    'myfitnesspal' | 'yazio' | 'cronometer'
  >('myfitnesspal');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(
    null,
  );
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [showWarnings, setShowWarnings] = useState(false);

  const handleFileSelect = useCallback(
    async (file: File) => {
      if (!file) return;

      setIsLoading(true);
      try {
        const config: ImportConfig = {
          format: selectedFormat,
          userId,
          dateFormat: selectedFormat === 'yazio' ? 'dd.MM.yyyy' : undefined,
        };

        const preview = await parseNutritionFile(file, config);
        setSelectedFile(file);
        setImportPreview(preview);
        setCurrentStep(1);

        toast.success(
          `Fichier analysé: ${preview.validRows}/${preview.totalRows} repas valides`,
        );
      } catch (error) {
        toast.error(
          `Erreur lors de l'analyse: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        );
      } finally {
        setIsLoading(false);
      }
    },
    [selectedFormat, userId],
  );

  const handleImport = useCallback(async () => {
    if (!importPreview || !selectedFile) return;

    setIsLoading(true);
    try {
      const config: ImportConfig = {
        format: selectedFormat,
        userId,
        dateFormat: selectedFormat === 'yazio' ? 'dd.MM.yyyy' : undefined,
      };

      // Re-parse le fichier pour obtenir toutes les données
      const fullPreview = await parseNutritionFile(selectedFile, config);
      const result = validateImportedData(fullPreview.sampleData);

      if (result.success && result.data.length > 0) {
        await onImport(result.data);
        setImportResult(result);
        setCurrentStep(2);
        toast.success(`${result.imported} repas importés avec succès !`);
      } else {
        throw new Error('Aucune donnée valide à importer');
      }
    } catch (error) {
      toast.error(
        `Erreur lors de l'import: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
      );
    } finally {
      setIsLoading(false);
    }
  }, [importPreview, selectedFile, selectedFormat, userId, onImport]);

  const handleReset = useCallback(() => {
    setCurrentStep(0);
    setSelectedFile(null);
    setImportPreview(null);
    setImportResult(null);
    setShowErrors(false);
    setShowWarnings(false);
  }, []);

  const handleClose = useCallback(() => {
    handleReset();
    onClose();
  }, [handleReset, onClose]);

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderUploadStep();
      case 1:
        return renderPreviewStep();
      case 2:
        return renderImportStep();
      default:
        return null;
    }
  };

  const renderUploadStep = () => (
    <div className="space-y-6">
      {/* Sélection du format */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">
          Format de votre export
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FORMAT_OPTIONS.map((format) => (
            <button
              key={format.id}
              onClick={() => setSelectedFormat(format.id)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedFormat === format.id
                  ? 'border-neon-purple bg-neon-purple/10'
                  : 'border-white/20 hover:border-white/40'
              }`}
            >
              <div className="text-2xl mb-2">{format.icon}</div>
              <h4 className="font-semibold text-white">{format.name}</h4>
              <p className="text-sm text-gray-400 mt-1">{format.description}</p>
              <code className="text-xs text-neon-cyan mt-2 block bg-black/20 p-2 rounded">
                {format.example}
              </code>
            </button>
          ))}
        </div>
      </div>

      {/* Upload du fichier */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">
          Sélectionnez votre fichier
        </h3>
        <FileUpload
          onFileSelect={handleFileSelect}
          acceptedFormats={selectedFormat === 'cronometer' ? '.json' : '.csv'}
          isLoading={isLoading}
        />
      </div>

      {/* Instructions */}
      <div className="bg-neon-cyan/10 border border-neon-cyan/30 rounded-lg p-4">
        <h4 className="font-semibold text-neon-cyan mb-2">
          💡 Comment obtenir votre export
        </h4>
        <div className="text-sm text-gray-300 space-y-2">
          {selectedFormat === 'myfitnesspal' && (
            <div>
              <p>
                <strong>MyFitnessPal:</strong>
              </p>
              <p>
                1. Allez dans &quot;Plus&quot; → &quot;Paramètres&quot; →
                &quot;Partager&quot;
              </p>
              <p>2. Sélectionnez &quot;Exporter mes données&quot;</p>
              <p>3. Choisissez le format CSV</p>
            </div>
          )}
          {selectedFormat === 'yazio' && (
            <div>
              <p>
                <strong>Yazio:</strong>
              </p>
              <p>1. Allez dans &quot;Profil&quot; → &quot;Paramètres&quot;</p>
              <p>2. Sélectionnez &quot;Exporter mes données&quot;</p>
              <p>3. Téléchargez le fichier CSV</p>
            </div>
          )}
          {selectedFormat === 'cronometer' && (
            <div>
              <p>
                <strong>Cronometer:</strong>
              </p>
              <p>1. Allez dans &quot;Paramètres&quot; → &quot;Données&quot;</p>
              <p>2. Sélectionnez &quot;Exporter&quot;</p>
              <p>3. Choisissez le format JSON</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderPreviewStep = () => {
    if (!importPreview) return null;

    return (
      <div className="space-y-6">
        {/* Résumé */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-effect p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-neon-cyan">
              {importPreview.totalRows}
            </div>
            <div className="text-sm text-gray-400">Lignes totales</div>
          </div>
          <div className="glass-effect p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-neon-green">
              {importPreview.validRows}
            </div>
            <div className="text-sm text-gray-400">Repas valides</div>
          </div>
          <div className="glass-effect p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-neon-yellow">
              {importPreview.errors.length}
            </div>
            <div className="text-sm text-gray-400">Erreurs</div>
          </div>
        </div>

        {/* Aperçu des données */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            Aperçu des données
          </h3>
          <div className="bg-black/20 rounded-lg p-4 max-h-64 overflow-y-auto">
            {importPreview.sampleData.map((repas) => (
              <div
                key={repas.id}
                className="border-b border-white/10 py-2 last:border-b-0"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-neon-cyan font-medium">
                      {repas.date}
                    </span>
                    <span className="text-white ml-2">{repas.repas}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-neon-green">
                      {repas.macros.kcal} kcal
                    </div>
                    <div className="text-xs text-gray-400">
                      {repas.macros.prot}g P • {repas.macros.glucides}g C •{' '}
                      {repas.macros.lipides}g L
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  {repas.aliments.map((aliment) => aliment.nom).join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Erreurs et avertissements */}
        {(importPreview.errors.length > 0 ||
          importPreview.warnings.length > 0) && (
          <div className="space-y-4">
            {importPreview.errors.length > 0 && (
              <div>
                <button
                  onClick={() => setShowErrors(!showErrors)}
                  className="flex items-center gap-2 text-neon-red hover:text-red-400 transition-colors"
                >
                  {showErrors ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                  <span className="font-medium">
                    {importPreview.errors.length} erreur
                    {importPreview.errors.length > 1 ? 's' : ''}
                  </span>
                </button>
                {showErrors && (
                  <div className="mt-2 bg-red-500/10 border border-red-500/30 rounded-lg p-4 max-h-48 overflow-y-auto">
                    {importPreview.errors.map((error, index) => (
                      <div key={index} className="text-sm text-red-300 mb-2">
                        <span className="font-medium">Ligne {error.row}:</span>{' '}
                        {error.message}
                        {error.value && (
                          <code className="block mt-1 text-xs bg-black/20 p-1 rounded">
                            {error.value}
                          </code>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {importPreview.warnings.length > 0 && (
              <div>
                <button
                  onClick={() => setShowWarnings(!showWarnings)}
                  className="flex items-center gap-2 text-neon-yellow hover:text-yellow-400 transition-colors"
                >
                  {showWarnings ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                  <span className="font-medium">
                    {importPreview.warnings.length} avertissement
                    {importPreview.warnings.length > 1 ? 's' : ''}
                  </span>
                </button>
                {showWarnings && (
                  <div className="mt-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                    {importPreview.warnings.map((warning, index) => (
                      <div key={index} className="text-sm text-yellow-300 mb-1">
                        {warning}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={handleImport}
            disabled={importPreview.validRows === 0 || isLoading}
            className="flex-1 px-4 py-2 bg-neon-purple text-white rounded-lg hover:bg-neon-purple/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading
              ? 'Import en cours...'
              : `Importer ${importPreview.validRows} repas`}
          </button>
          <button
            onClick={handleReset}
            disabled={isLoading}
            className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Recommencer
          </button>
        </div>
      </div>
    );
  };

  const renderImportStep = () => {
    if (!importResult) return null;

    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <CheckCircle className="w-16 h-16 text-neon-green" />
        </div>

        <div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Import terminé !
          </h3>
          <p className="text-gray-400">
            {importResult.imported} repas ont été importés avec succès dans
            votre journal nutrition.
          </p>
        </div>

        {importResult.warnings.length > 0 && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-left">
            <h4 className="font-semibold text-yellow-400 mb-2">
              Avertissements
            </h4>
            {importResult.warnings.map((warning, index) => (
              <div key={index} className="text-sm text-yellow-300 mb-1">
                {warning}
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleClose}
          className="w-full px-4 py-2 bg-neon-purple text-white rounded-lg hover:bg-neon-purple/80 transition-colors"
        >
          Fermer
        </button>
      </div>
    );
  };

  return (
    <StandardModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Import Nutrition"
      maxWidth="2xl"
      height="85vh"
    >
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          {IMPORT_STEPS.map((step, index) => (
            <span
              key={step.id}
              className={index <= currentStep ? 'text-neon-cyan' : ''}
            >
              {step.title}
            </span>
          ))}
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div
            className="bg-neon-cyan h-2 rounded-full transition-all duration-300"
            style={{
              width: `${((currentStep + 1) / IMPORT_STEPS.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Content */}
      {renderStepContent()}
    </StandardModal>
  );
}

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  acceptedFormats: string;
  isLoading: boolean;
}

function FileUpload({
  onFileSelect,
  acceptedFormats,
  isLoading,
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      const file = files[0];

      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect],
  );

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
        isDragOver
          ? 'border-neon-cyan bg-neon-cyan/10'
          : 'border-white/20 hover:border-white/40'
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
    >
      {isLoading ? (
        <div className="space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-neon-cyan border-t-transparent mx-auto" />
          <p className="text-neon-cyan">Analyse du fichier...</p>
        </div>
      ) : (
        <div className="space-y-4">
          <Upload className="w-12 h-12 text-neon-cyan mx-auto" />
          <div>
            <p className="text-white font-medium mb-2">
              Glissez-déposez votre fichier ici
            </p>
            <p className="text-gray-400 text-sm mb-4">
              ou cliquez pour sélectionner
            </p>
            <p className="text-xs text-gray-500">
              Formats acceptés: {acceptedFormats}
            </p>
          </div>
          <input
            type="file"
            accept={acceptedFormats}
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="inline-block px-4 py-2 bg-neon-purple text-white rounded-lg hover:bg-neon-purple/80 transition-colors cursor-pointer"
          >
            Sélectionner un fichier
          </label>
        </div>
      )}
    </div>
  );
}
