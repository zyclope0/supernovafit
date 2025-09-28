'use client';

import { useState } from 'react';
import { garminParser } from '@/lib/garminParser';
import { Entrainement } from '@/types';
import {
  Upload,
  FileText,
  Activity,
  CheckCircle,
  AlertCircle,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface GarminImportProps {
  onImport: (
    entrainement: Omit<Entrainement, 'id' | 'created_at'>,
  ) => Promise<{ success: boolean; error?: string; isDuplicate?: boolean }>;
  onClose: () => void;
  userId: string;
}

interface ImportResult {
  success: boolean;
  fileName: string;
  error?: string;
  entrainement?: Omit<Entrainement, 'id' | 'created_at'>;
  selectedType?: string;
}

const TRAINING_TYPES = [
  {
    value: 'cardio',
    label: '🏃 Cardio',
    description: 'Course, vélo elliptique, rameur...',
  },
  {
    value: 'musculation',
    label: '💪 Musculation',
    description: 'Poids, haltères, machines...',
  },
  {
    value: 'course',
    label: '🏃‍♂️ Course à pied',
    description: 'Running, jogging, trail...',
  },
  {
    value: 'cyclisme',
    label: '🚴 Cyclisme',
    description: 'Vélo route, VTT, spinning...',
  },
  {
    value: 'natation',
    label: '🏊 Natation',
    description: 'Piscine, eau libre...',
  },
  {
    value: 'hiit',
    label: '🔥 HIIT',
    description: 'High Intensity Interval Training',
  },
  {
    value: 'yoga',
    label: '🧘 Yoga',
    description: 'Yoga, pilates, stretching...',
  },
];

export default function GarminImport({
  onImport,
  onClose,
  userId,
}: GarminImportProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<ImportResult[]>([]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
  };

  const processFiles = async (files: File[]) => {
    setIsProcessing(true);
    setResults([]);

    // Filtrer les fichiers supportés
    const supportedFiles = files.filter((file) => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      return ext === 'tcx' || ext === 'gpx';
    });

    if (supportedFiles.length === 0) {
      setResults([
        {
          success: false,
          fileName: 'Aucun fichier',
          error: 'Aucun fichier .TCX ou .GPX trouvé',
        },
      ]);
      setIsProcessing(false);
      return;
    }

    const importResults: ImportResult[] = [];

    for (const file of supportedFiles) {
      try {
        const content = await readFileContent(file);
        const activity = await garminParser.parseFile(content, file.name);
        const entrainement = garminParser.toEntrainement(activity, userId);

        importResults.push({
          success: true,
          fileName: file.name,
          entrainement,
          selectedType: entrainement.type, // Type par défaut détecté
        });
      } catch (error) {
        importResults.push({
          success: false,
          fileName: file.name,
          error: error instanceof Error ? error.message : 'Erreur inconnue',
        });
      }
    }

    setResults(importResults);
    setIsProcessing(false);
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Erreur lecture fichier'));
      reader.readAsText(file);
    });
  };

  const updateResultType = (index: number, newType: string) => {
    setResults((prev) =>
      prev.map((result, i) => {
        if (i === index && result.entrainement) {
          return {
            ...result,
            selectedType: newType,
            entrainement: {
              ...result.entrainement,
              type: newType,
            },
          };
        }
        return result;
      }),
    );
  };

  const handleImportAll = async () => {
    const successfulResults = results.filter(
      (r) => r.success && r.entrainement,
    );
    let importedCount = 0;
    let duplicateCount = 0;

    for (const result of successfulResults) {
      if (result.entrainement) {
        try {
          const importResult = await onImport(result.entrainement);

          // Vérifier si c'est un doublon
          if (importResult.success) {
            importedCount++;
          } else if (importResult.isDuplicate) {
            duplicateCount++;
          }
        } catch (error) {
          console.error(`❌ ERREUR IMPORT ${result.fileName}:`, error);
        }
      }
    }

    // Afficher le résumé
    if (importedCount > 0) {
      toast.success(
        `✅ ${importedCount} entraînement(s) importé(s) avec succès !`,
      );
    }
    if (duplicateCount > 0) {
      toast.error(`⚠️ ${duplicateCount} doublon(s) détecté(s) et ignoré(s)`);
    }

    onClose();
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0
      ? `${hours}h${mins.toString().padStart(2, '0')}`
      : `${mins}min`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-effect p-6 rounded-xl border border-white/10 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Activity className="h-6 w-6 text-neon-green" />
            <h2 className="text-xl font-semibold text-white">Import Garmin</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Zone de drop */}
        {results.length === 0 && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? 'border-neon-green bg-neon-green/5'
                : 'border-white/20 hover:border-white/40'
            }`}
          >
            <Upload className="h-12 w-12 text-white/60 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              Glissez vos fichiers Garmin ici
            </h3>
            <p className="text-muted-foreground mb-4">
              Formats supportés: .TCX, .GPX
            </p>

            <div className="text-sm text-muted-foreground mb-4">
              <p>
                📊 <strong>.TCX</strong> : Données complètes (FC, calories,
                trackpoints)
              </p>
              <p>
                🗺️ <strong>.GPX</strong> : Tracé GPS basique
              </p>
            </div>

            <label className="inline-flex items-center gap-2 px-4 py-2 bg-neon-cyan/20 text-neon-cyan rounded-lg font-medium hover:bg-neon-cyan/30 transition-colors cursor-pointer">
              <FileText className="h-4 w-4" />
              Choisir des fichiers
              <input
                type="file"
                multiple
                accept=".tcx,.gpx"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>
        )}

        {/* Processing */}
        {isProcessing && (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-white">Analyse des fichiers en cours...</p>
          </div>
        )}

        {/* Résultats */}
        {results.length > 0 && !isProcessing && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">
              Résultats de l&apos;import ({results.length} fichiers)
            </h3>

            {results.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  result.success
                    ? 'border-green-500/20 bg-green-500/5'
                    : 'border-red-500/20 bg-red-500/5'
                }`}
              >
                <div className="flex items-start gap-3">
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  )}

                  <div className="flex-1">
                    <p className="font-medium text-white">{result.fileName}</p>

                    {result.success && result.entrainement && (
                      <div className="mt-3 space-y-3">
                        {/* Sélecteur de type */}
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">
                            Type d&apos;entraînement :
                          </label>
                          <select
                            value={
                              result.selectedType || result.entrainement.type
                            }
                            onChange={(e) =>
                              updateResultType(index, e.target.value)
                            }
                            className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:border-neon-cyan focus:outline-none"
                          >
                            {TRAINING_TYPES.map((type) => (
                              <option
                                key={type.value}
                                value={type.value}
                                className="bg-space-800 text-white"
                              >
                                {type.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Aperçu des données */}
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>
                            <span className="text-neon-green">⏱️</span>{' '}
                            {formatDuration(result.entrainement.duree)}
                          </p>
                          {result.entrainement.calories && (
                            <p>
                              <span className="text-neon-cyan">🔥</span>{' '}
                              {result.entrainement.calories} kcal
                            </p>
                          )}
                          {result.entrainement.fc_moyenne && (
                            <p>
                              <span className="text-red-400">💓</span> FC moy:{' '}
                              {result.entrainement.fc_moyenne} bpm
                            </p>
                          )}
                          {result.entrainement.distance && (
                            <p>
                              <span className="text-neon-pink">📏</span>{' '}
                              {result.entrainement.distance} km
                            </p>
                          )}
                          <p className="text-xs text-white/60">
                            {result.entrainement.date}
                          </p>
                        </div>
                      </div>
                    )}

                    {!result.success && (
                      <p className="text-red-400 text-sm mt-1">
                        {result.error}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-white/10">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-white/20 text-white rounded-lg hover:bg-white/5 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleImportAll}
                disabled={!results.some((r) => r.success)}
                className="flex-1 px-4 py-2 bg-neon-green/20 text-neon-green rounded-lg hover:bg-neon-green/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Importer ({results.filter((r) => r.success).length} activités)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
