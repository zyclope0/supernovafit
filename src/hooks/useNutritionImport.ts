/**
 * Hook pour gérer l'import nutrition dans SuperNovaFit
 * Gère l'upload, parsing et sauvegarde des données nutrition importées
 */

'use client';

import { useState, useCallback } from 'react';
import {
  collection,
  writeBatch,
  serverTimestamp,
  doc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';
import type { Repas } from '@/types';
import type { ImportResult } from '@/lib/import/nutrition-import';

interface UseNutritionImportReturn {
  isImporting: boolean;
  importProgress: number;
  importResult: ImportResult | null;
  importNutrition: (data: Repas[]) => Promise<ImportResult>;
  resetImport: () => void;
}

export function useNutritionImport(): UseNutritionImportReturn {
  const { user } = useAuth();
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const importNutrition = useCallback(
    async (data: Repas[]): Promise<ImportResult> => {
      if (!user) {
        throw new Error('Utilisateur non authentifié');
      }

      setIsImporting(true);
      setImportProgress(0);
      setImportResult(null);

      try {
        if (process.env.NODE_ENV === 'development') {
          console.log(
            '🍎 NUTRITION IMPORT - Début import:',
            data.length,
            'repas',
          );
        }

        // Validation des données
        const validData = data.filter((repas) => {
          return (
            repas.user_id === user.uid &&
            repas.date &&
            repas.repas &&
            repas.macros &&
            repas.macros.kcal > 0
          );
        });

        if (validData.length === 0) {
          throw new Error('Aucune donnée valide à importer');
        }

        if (process.env.NODE_ENV === 'development') {
          console.log(
            '🍎 NUTRITION IMPORT - Données valides:',
            validData.length,
          );
        }

        // Batch import pour optimiser les performances
        const batch = writeBatch(db);
        const repasCollection = collection(db, 'repas');
        const importedIds: string[] = [];
        const errors: any[] = [];

        // Traitement par lots de 100 pour éviter les timeouts
        const batchSize = 100;
        const totalBatches = Math.ceil(validData.length / batchSize);

        for (let i = 0; i < validData.length; i += batchSize) {
          const batchData = validData.slice(i, i + batchSize);
          const currentBatch = Math.floor(i / batchSize) + 1;

          if (process.env.NODE_ENV === 'development') {
            console.log(
              `🍎 NUTRITION IMPORT - Traitement lot ${currentBatch}/${totalBatches}`,
            );
          }

          // Préparer les documents pour ce lot
          batchData.forEach((repas, index) => {
            try {
              const docRef = doc(repasCollection);
              const repasData = {
                ...repas,
                id: docRef.id, // Utiliser l'ID généré par Firestore
                user_id: user.uid,
                created_at: serverTimestamp(),
                imported_at: serverTimestamp(),
                import_source: 'nutrition_import',
              };

              batch.set(docRef, repasData);
              importedIds.push(docRef.id);
            } catch (error) {
              console.error(
                '🍎 NUTRITION IMPORT - Erreur préparation document:',
                error,
              );
              errors.push({
                row: i + index + 1,
                field: 'general',
                message:
                  error instanceof Error ? error.message : 'Erreur inconnue',
                value: JSON.stringify(repas),
              });
            }
          });

          // Committer ce lot
          try {
            await batch.commit();
            if (process.env.NODE_ENV === 'development') {
              console.log(
                `🍎 NUTRITION IMPORT - Lot ${currentBatch} importé avec succès`,
              );
            }
          } catch (error) {
            console.error(
              `🍎 NUTRITION IMPORT - Erreur commit lot ${currentBatch}:`,
              error,
            );
            errors.push({
              row: currentBatch,
              field: 'batch',
              message: `Erreur lors de l'import du lot ${currentBatch}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
              value: '',
            });
          }

          // Mettre à jour le progrès
          const progress = Math.round((currentBatch / totalBatches) * 100);
          setImportProgress(progress);
        }

        // Résultat final
        const result: ImportResult = {
          success: errors.length === 0,
          imported: importedIds.length,
          errors,
          warnings: [],
          data: validData,
        };

        setImportResult(result);

        if (result.success) {
          if (process.env.NODE_ENV === 'development') {
            console.log(
              '🍎 NUTRITION IMPORT - Import terminé avec succès:',
              result.imported,
              'repas',
            );
          }
          toast.success(`${result.imported} repas importés avec succès !`);
        } else {
          console.warn(
            '🍎 NUTRITION IMPORT - Import terminé avec erreurs:',
            result.errors.length,
          );
          toast.error(`Import terminé avec ${result.errors.length} erreurs`);
        }

        return result;
      } catch (error) {
        console.error('🍎 NUTRITION IMPORT - Erreur critique:', error);

        const errorResult: ImportResult = {
          success: false,
          imported: 0,
          errors: [
            {
              row: 0,
              field: 'general',
              message:
                error instanceof Error ? error.message : 'Erreur inconnue',
              value: '',
            },
          ],
          warnings: [],
          data: [],
        };

        setImportResult(errorResult);
        toast.error(
          `Erreur lors de l'import: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        );

        return errorResult;
      } finally {
        setIsImporting(false);
        setImportProgress(100);
      }
    },
    [user],
  );

  const resetImport = useCallback(() => {
    setIsImporting(false);
    setImportProgress(0);
    setImportResult(null);
  }, []);

  return {
    isImporting,
    importProgress,
    importResult,
    importNutrition,
    resetImport,
  };
}
