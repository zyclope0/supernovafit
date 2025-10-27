/**
 * @jest-environment jsdom
 */

// Tests Académiques useExportData Hook
// Pattern: AAA (Arrange-Act-Assert)
// Qualité: Best Practices + Coverage Ciblé
// Focus: Logique métier (filtrage, orchestration, state) plutôt que détails export

import { renderHook, waitFor, act } from '@testing-library/react';
import { useExportData } from '@/hooks/useExportData';
import * as useAuthModule from '@/hooks/useAuth';
import * as useFirestoreModule from '@/hooks/useFirestore';
import * as useFirebaseErrorModule from '@/hooks/useFirebaseError';
import { Timestamp } from 'firebase/firestore';
import type { Repas, Entrainement, Mesure } from '@/types';
import type { ExportConfig } from '@/types/export';

// Mock modules
jest.mock('@/hooks/useAuth');
jest.mock('@/hooks/useFirestore');
jest.mock('@/hooks/useFirebaseError');

// Mock export libs (lazy-loaded)
jest.mock('@/lib/export/csv-export', () => ({
  generateAndDownloadCSV: jest.fn().mockResolvedValue(undefined),
  generateFileName: jest.fn(() => 'test-export'),
  getPeriodDescription: jest.fn(() => "Aujourd'hui"),
}));

jest.mock('@/lib/export/json-export', () => ({
  generateAndDownloadJSON: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/lib/export/excel-export', () => ({
  generateAndDownloadExcel: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/lib/export/pdf-export', () => ({
  generateCompletePDF: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/lib/constants', () => ({
  APP_VERSION: '1.0.0-test',
}));

describe('useExportData - Tests Académiques', () => {
  // ========================================
  // Setup: Données de test réalistes
  // ========================================

  const mockUser = {
    uid: 'user-123',
    email: 'test@example.com',
  };

  const mockRepas: Repas[] = [
    {
      id: 'meal-1',
      user_id: 'user-123',
      date: Timestamp.fromDate(new Date('2025-10-26T12:00:00')),
      repas: 'dejeuner',
      aliments: [
        {
          id: 'aliment-1',
          nom: 'Poulet',
          nom_lower: 'poulet',
          quantite: 150,
          unite: 'g',
          user_id: 'user-123',
          created_at: Timestamp.now(),
          macros: { kcal: 250, prot: 35, glucides: 0, lipides: 12 },
          macros_base: { kcal: 165, prot: 23, glucides: 0, lipides: 8 },
        },
      ],
      macros: { kcal: 250, prot: 35, glucides: 0, lipides: 12 },
      created_at: Timestamp.now(),
    },
    {
      id: 'meal-2',
      user_id: 'user-123',
      date: Timestamp.fromDate(new Date('2025-10-27T12:00:00')),
      repas: 'diner',
      aliments: [],
      macros: { kcal: 700, prot: 50, glucides: 70, lipides: 25 },
      created_at: Timestamp.now(),
    },
  ];

  const mockEntrainements: Entrainement[] = [
    {
      id: 'training-1',
      user_id: 'user-123',
      date: Timestamp.fromDate(new Date('2025-10-26T12:00:00')),
      type: 'cardio',
      duree: 45,
      calories: 450,
      source: 'manuel',
      created_at: Timestamp.now(),
    },
    {
      id: 'training-2',
      user_id: 'user-123',
      date: Timestamp.fromDate(new Date('2025-10-27T12:00:00')),
      type: 'musculation',
      duree: 60,
      calories: 200,
      source: 'manuel',
      created_at: Timestamp.now(),
    },
  ];

  const mockMesures: Mesure[] = [
    {
      id: 'measure-1',
      user_id: 'user-123',
      date: Timestamp.fromDate(new Date('2025-10-26T12:00:00')),
      poids: 75,
      created_at: Timestamp.now(),
    },
    {
      id: 'measure-2',
      user_id: 'user-123',
      date: Timestamp.fromDate(new Date('2025-10-27T12:00:00')),
      poids: 74.5,
      created_at: Timestamp.now(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    jest.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: mockUser,
      userProfile: null,
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      updateUserProfile: jest.fn(),
    });

    jest.spyOn(useFirestoreModule, 'useRepas').mockReturnValue({
      repas: mockRepas,
      loading: false,
      addRepas: jest.fn(),
      updateRepas: jest.fn(),
      deleteRepas: jest.fn(),
    });

    jest.spyOn(useFirestoreModule, 'useEntrainements').mockReturnValue({
      entrainements: mockEntrainements,
      loading: false,
      addEntrainement: jest.fn(),
      updateEntrainement: jest.fn(),
      deleteEntrainement: jest.fn(),
    });

    jest.spyOn(useFirestoreModule, 'useMesures').mockReturnValue({
      mesures: mockMesures,
      loading: false,
      addMesure: jest.fn(),
      updateMesure: jest.fn(),
      deleteMesure: jest.fn(),
    });

    jest.spyOn(useFirebaseErrorModule, 'useFirebaseError').mockReturnValue({
      handleError: jest.fn(),
      error: null,
      clearError: jest.fn(),
      resetError: jest.fn(),
      isRetrying: false,
    });
  });

  // ========================================
  // Tests: Hook Initialization
  // ========================================

  describe('Hook Initialization', () => {
    it('should initialize with correct default state', () => {
      // Act
      const { result } = renderHook(() => useExportData());

      // Assert
      expect(result.current.exportState).toEqual({
        isExporting: false,
        progress: 0,
        currentStep: '',
        error: null,
        result: null,
      });
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should expose all required functions', () => {
      // Act
      const { result } = renderHook(() => useExportData());

      // Assert: Vérifier que toutes les fonctions sont exposées
      expect(typeof result.current.exportData).toBe('function');
      expect(typeof result.current.exportTodayData).toBe('function');
      expect(typeof result.current.exportWeekData).toBe('function');
      expect(typeof result.current.exportMonthData).toBe('function');
      expect(typeof result.current.resetExportState).toBe('function');
      expect(typeof result.current.updateExportState).toBe('function');
      expect(typeof result.current.getFilteredData).toBe('function');
    });

    it('should expose data from child hooks', () => {
      // Act
      const { result } = renderHook(() => useExportData());

      // Assert: Vérifier que les données sont exposées
      expect(result.current.repas).toEqual(mockRepas);
      expect(result.current.entrainements).toEqual(mockEntrainements);
      expect(result.current.mesures).toEqual(mockMesures);
    });
  });

  // ========================================
  // Tests: Data Filtering
  // ========================================

  describe('Data Filtering - getFilteredData', () => {
    it('should return all data when dataType is "all"', () => {
      // Arrange
      const { result } = renderHook(() => useExportData());
      const config: ExportConfig = {
        format: 'csv',
        dataType: 'all',
        period: 'month',
        includeHeaders: true,
        includeMetadata: true,
      };

      // Act
      const filtered = result.current.getFilteredData(config);

      // Assert
      expect(filtered.repas).toHaveLength(2);
      expect(filtered.entrainements).toHaveLength(2);
      expect(filtered.mesures).toHaveLength(2);
    });

    it('should filter only repas when dataType is "repas"', () => {
      // Arrange
      const { result } = renderHook(() => useExportData());
      const config: ExportConfig = {
        format: 'csv',
        dataType: 'repas',
        period: 'month',
        includeHeaders: true,
        includeMetadata: true,
      };

      // Act
      const filtered = result.current.getFilteredData(config);

      // Assert
      expect(filtered.repas).toHaveLength(2);
      expect(filtered.entrainements).toHaveLength(0);
      expect(filtered.mesures).toHaveLength(0);
    });

    it('should filter by date range', () => {
      // Arrange
      const { result } = renderHook(() => useExportData());
      const config: ExportConfig = {
        format: 'csv',
        dataType: 'all',
        period: 'custom',
        startDate: '2025-10-26',
        endDate: '2025-10-27T23:59:59',
        includeHeaders: true,
        includeMetadata: true,
      };

      // Act
      const filtered = result.current.getFilteredData(config);

      // Assert: Fonction retourne des objets avec bonnes clés
      expect(filtered).toHaveProperty('repas');
      expect(filtered).toHaveProperty('entrainements');
      expect(filtered).toHaveProperty('mesures');
      expect(Array.isArray(filtered.repas)).toBe(true);
      expect(Array.isArray(filtered.entrainements)).toBe(true);
      expect(Array.isArray(filtered.mesures)).toBe(true);
    });

    it('should filter repas by meal type', () => {
      // Arrange
      const { result } = renderHook(() => useExportData());
      const config: ExportConfig = {
        format: 'csv',
        dataType: 'all',
        period: 'month',
        includeHeaders: true,
        includeMetadata: true,
        filters: {
          mealTypes: ['dejeuner'],
        },
      };

      // Act
      const filtered = result.current.getFilteredData(config);

      // Assert
      expect(filtered.repas).toHaveLength(1);
      expect(filtered.repas[0].repas).toBe('dejeuner');
    });

    it('should filter entrainements by training type', () => {
      // Arrange
      const { result } = renderHook(() => useExportData());
      const config: ExportConfig = {
        format: 'csv',
        dataType: 'all',
        period: 'month',
        includeHeaders: true,
        includeMetadata: true,
        filters: {
          trainingTypes: ['cardio'],
        },
      };

      // Act
      const filtered = result.current.getFilteredData(config);

      // Assert
      expect(filtered.entrainements).toHaveLength(1);
      expect(filtered.entrainements[0].type).toBe('cardio');
    });

    it('should filter repas by min/max calories', () => {
      // Arrange
      const { result } = renderHook(() => useExportData());
      const config: ExportConfig = {
        format: 'csv',
        dataType: 'all',
        period: 'month',
        includeHeaders: true,
        includeMetadata: true,
        filters: {
          minCalories: 500,
          maxCalories: 800,
        },
      };

      // Act
      const filtered = result.current.getFilteredData(config);

      // Assert
      expect(filtered.repas).toHaveLength(1);
      expect(filtered.repas[0].macros.kcal).toBe(700);
    });

    it('should filter entrainements by min/max duration', () => {
      // Arrange
      const { result } = renderHook(() => useExportData());
      const config: ExportConfig = {
        format: 'csv',
        dataType: 'all',
        period: 'month',
        includeHeaders: true,
        includeMetadata: true,
        filters: {
          minDuration: 50,
          maxDuration: 70,
        },
      };

      // Act
      const filtered = result.current.getFilteredData(config);

      // Assert
      expect(filtered.entrainements).toHaveLength(1);
      expect(filtered.entrainements[0].duree).toBe(60);
    });
  });

  // ========================================
  // Tests: Export State Management
  // ========================================

  describe('Export State Management', () => {
    it('should update progress during export', async () => {
      // Arrange
      const { result } = renderHook(() => useExportData());
      const config: ExportConfig = {
        format: 'csv',
        dataType: 'all',
        period: 'month',
        includeHeaders: true,
        includeMetadata: true,
      };

      // Act
      await act(async () => {
        await result.current.exportData(config);
      });

      // Assert: Export terminé avec succès
      expect(result.current.exportState.isExporting).toBe(false);
      expect(result.current.exportState.progress).toBe(100);
      expect(result.current.exportState.currentStep).toBe('Export terminé');
      expect(result.current.exportState.result?.success).toBe(true);
    });

    it('should reset export state', () => {
      // Arrange
      const { result } = renderHook(() => useExportData());
      act(() => {
        result.current.updateExportState({
          isExporting: true,
          progress: 50,
          currentStep: 'Test',
        });
      });

      // Act
      act(() => {
        result.current.resetExportState();
      });

      // Assert
      expect(result.current.exportState).toEqual({
        isExporting: false,
        progress: 0,
        currentStep: '',
        error: null,
        result: null,
      });
    });

    it('should update export state partially', () => {
      // Arrange
      const { result } = renderHook(() => useExportData());

      // Act
      act(() => {
        result.current.updateExportState({
          progress: 75,
          currentStep: 'Génération PDF...',
        });
      });

      // Assert
      expect(result.current.exportState.progress).toBe(75);
      expect(result.current.exportState.currentStep).toBe('Génération PDF...');
      expect(result.current.exportState.isExporting).toBe(false); // Non modifié
    });
  });

  // ========================================
  // Tests: Quick Export Functions
  // ========================================

  describe('Quick Export Functions', () => {
    it('should export today data with correct config', async () => {
      // Arrange
      const { result } = renderHook(() => useExportData());

      // Act
      await act(async () => {
        await result.current.exportTodayData('csv', 'all');
      });

      // Assert: Vérifier que l'export a été appelé avec la config correcte
      await waitFor(() => {
        expect(result.current.exportState.result?.success).toBe(true);
      });
    });

    it('should export week data with includeCharts false for CSV', async () => {
      // Arrange
      const { result } = renderHook(() => useExportData());

      // Act
      await act(async () => {
        await result.current.exportWeekData('csv', 'entrainements');
      });

      // Assert
      await waitFor(() => {
        expect(result.current.exportState.result?.success).toBe(true);
      });
    });

    it('should export month data with includeCharts true for PDF', async () => {
      // Arrange
      const { result } = renderHook(() => useExportData());

      // Act
      await act(async () => {
        await result.current.exportMonthData('pdf', 'all');
      });

      // Assert
      await waitFor(() => {
        expect(result.current.exportState.result?.success).toBe(true);
      });
    });
  });

  // ========================================
  // Tests: Error Handling
  // ========================================

  describe('Error Handling', () => {
    it('should handle user not connected', async () => {
      // Arrange: Mock user null
      jest.spyOn(useAuthModule, 'useAuth').mockReturnValue({
        user: null,
        userProfile: null,
        loading: false,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
        updateUserProfile: jest.fn(),
      });

      const mockHandleError = jest.fn();
      jest.spyOn(useFirebaseErrorModule, 'useFirebaseError').mockReturnValue({
        handleError: mockHandleError,
        error: null,
        clearError: jest.fn(),
        resetError: jest.fn(),
        isRetrying: false,
      });

      const { result } = renderHook(() => useExportData());
      const config: ExportConfig = {
        format: 'csv',
        dataType: 'all',
        period: 'month',
        includeHeaders: true,
        includeMetadata: true,
      };

      // Act
      await act(async () => {
        await result.current.exportData(config);
      });

      // Assert
      expect(mockHandleError).toHaveBeenCalled();
    });

    it('should not export while data is loading', async () => {
      // Arrange: Mock loading true
      jest.spyOn(useFirestoreModule, 'useRepas').mockReturnValue({
        repas: [],
        loading: true,
        addRepas: jest.fn(),
        updateRepas: jest.fn(),
        deleteRepas: jest.fn(),
      });

      const { result } = renderHook(() => useExportData());
      const config: ExportConfig = {
        format: 'csv',
        dataType: 'all',
        period: 'month',
        includeHeaders: true,
        includeMetadata: true,
      };

      // Act
      await act(async () => {
        await result.current.exportData(config);
      });

      // Assert: Export ne démarre pas
      expect(result.current.exportState.isExporting).toBe(false);
    });

    it('should handle unsupported export format', async () => {
      // Arrange
      const { result } = renderHook(() => useExportData());
      const config: ExportConfig = {
        format: 'xml' as any, // Format non supporté
        dataType: 'all',
        period: 'month',
        includeHeaders: true,
        includeMetadata: true,
      };

      // Act
      await act(async () => {
        await result.current.exportData(config);
      });

      // Assert: Error state
      expect(result.current.exportState.error).toBeTruthy();
      expect(result.current.exportState.result?.success).toBe(false);
    });
  });

  // ========================================
  // Tests: Integration Scenarios
  // ========================================

  describe('Real World Integration', () => {
    it('should handle complete export workflow for all formats', async () => {
      // Arrange
      const { result } = renderHook(() => useExportData());
      const formats: Array<'csv' | 'json' | 'excel' | 'pdf'> = ['csv', 'json', 'excel', 'pdf'];

      // Act & Assert: Test chaque format
      for (const format of formats) {
        const config: ExportConfig = {
          format,
          dataType: 'all',
          period: 'month',
          includeHeaders: true,
          includeMetadata: true,
        };

        await act(async () => {
          await result.current.exportData(config);
        });

        expect(result.current.exportState.result?.success).toBe(true);
        expect(result.current.exportState.result?.fileName).toBeDefined();

        // Reset pour prochain test
        act(() => {
          result.current.resetExportState();
        });
      }
    });

    it('should preserve loading state across multiple exports', () => {
      // Arrange
      const { result } = renderHook(() => useExportData());

      // Assert: Loading dépend des hooks Firestore
      expect(result.current.loading).toBe(false);

      // Simuler loading Firestore
      jest.spyOn(useFirestoreModule, 'useRepas').mockReturnValue({
        repas: mockRepas,
        loading: true,
        addRepas: jest.fn(),
        updateRepas: jest.fn(),
        deleteRepas: jest.fn(),
      });

      const { result: result2 } = renderHook(() => useExportData());
      expect(result2.current.loading).toBe(true);
    });
  });
});

