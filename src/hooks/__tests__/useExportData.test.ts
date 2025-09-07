/**
 * Tests pour useExportData
 * Tests complets du hook d'orchestration d'export
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useExportData } from '../useExportData'
import type { ExportConfig } from '@/types/export'

// Mocks des hooks dépendants
vi.mock('../useAuth', () => ({
  useAuth: vi.fn()
}))

vi.mock('../useFirestore', () => ({
  useRepas: vi.fn(),
  useEntrainements: vi.fn(),
  useMesures: vi.fn()
}))

vi.mock('../useFirebaseError', () => ({
  useFirebaseError: vi.fn()
}))

// Mocks des modules d'export avec les vrais noms
vi.mock('@/lib/export/csv-export', () => ({
  generateFileName: vi.fn(() => 'export.csv'),
  getPeriodDescription: vi.fn(() => 'Période test'),
  generateAndDownloadCSV: vi.fn()
}))

vi.mock('@/lib/export/json-export', () => ({
  generateAndDownloadJSON: vi.fn()
}))

vi.mock('@/lib/export/excel-export', () => ({
  generateAndDownloadExcel: vi.fn()
}))

vi.mock('@/lib/export/pdf-export', () => ({
  generateCompletePDF: vi.fn()
}))

// Import des mocks après la déclaration
import { useAuth } from '../useAuth'
import { useRepas, useEntrainements, useMesures } from '../useFirestore'
import { useFirebaseError } from '../useFirebaseError'
import { generateAndDownloadCSV } from '@/lib/export/csv-export'
import { generateAndDownloadJSON } from '@/lib/export/json-export'
import { generateAndDownloadExcel } from '@/lib/export/excel-export'
import { generateCompletePDF } from '@/lib/export/pdf-export'

const mockUseAuth = vi.mocked(useAuth)
const mockUseRepas = vi.mocked(useRepas)
const mockUseEntrainements = vi.mocked(useEntrainements)
const mockUseMesures = vi.mocked(useMesures)
const mockUseFirebaseError = vi.mocked(useFirebaseError)
const mockGenerateAndDownloadCSV = vi.mocked(generateAndDownloadCSV)
const mockGenerateAndDownloadJSON = vi.mocked(generateAndDownloadJSON)
const mockGenerateAndDownloadExcel = vi.mocked(generateAndDownloadExcel)
const mockGenerateCompletePDF = vi.mocked(generateCompletePDF)

// Données de test
const mockUser = {
  uid: 'test-user-id',
  email: 'test@example.com',
  nom: 'Test User'
}

const mockRepas = [
  {
    id: 'repas-1',
    nom: 'Petit déjeuner',
    date: new Date('2024-01-15'),
    macros: { kcal: 400, proteines: 20, glucides: 50, lipides: 15 },
    user_id: 'test-user-id'
  },
  {
    id: 'repas-2',
    nom: 'Déjeuner',
    date: new Date('2024-01-14'),
    macros: { kcal: 600, proteines: 30, glucides: 70, lipides: 20 },
    user_id: 'test-user-id'
  }
]

const mockEntrainements = [
  {
    id: 'entrainement-1',
    type: 'course',
    duree: 45,
    date: new Date('2024-01-15'),
    calories: 300,
    user_id: 'test-user-id'
  },
  {
    id: 'entrainement-2',
    type: 'musculation',
    duree: 60,
    date: new Date('2024-01-13'),
    calories: 250,
    user_id: 'test-user-id'
  }
]

const mockMesures = [
  {
    id: 'mesure-1',
    poids: 70,
    taille: 175,
    date: new Date('2024-01-15'),
    imc: 22.9,
    user_id: 'test-user-id'
  }
]

describe('useExportData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup des mocks par défaut
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false
    } as ReturnType<typeof mockUseAuth>)

    mockUseRepas.mockReturnValue({
      repas: mockRepas,
      loading: false
    } as ReturnType<typeof mockUseAuth>)

    mockUseEntrainements.mockReturnValue({
      entrainements: mockEntrainements,
      loading: false
    } as ReturnType<typeof mockUseAuth>)

    mockUseMesures.mockReturnValue({
      mesures: mockMesures,
      loading: false
    } as ReturnType<typeof mockUseAuth>)

    mockUseFirebaseError.mockReturnValue({
      handleError: vi.fn(),
      error: null,
      clearError: vi.fn()
    } as ReturnType<typeof mockUseAuth>)

    // Setup des mocks d'export (ces fonctions ne retournent rien, elles téléchargent directement)
    mockGenerateAndDownloadCSV.mockResolvedValue(undefined)
    mockGenerateAndDownloadJSON.mockResolvedValue(undefined)
    mockGenerateAndDownloadExcel.mockResolvedValue(undefined)
    mockGenerateCompletePDF.mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initialisation', () => {
    it('devrait initialiser avec un état par défaut', () => {
      const { result } = renderHook(() => useExportData())

      expect(result.current.exportState).toEqual({
        isExporting: false,
        progress: 0,
        currentStep: '',
        error: null,
        result: null
      })
      expect(result.current.loading).toBe(false)
      expect(typeof result.current.exportData).toBe('function')
      expect(typeof result.current.resetExportState).toBe('function')
    })

    it('devrait détecter le loading des données', () => {
      mockUseRepas.mockReturnValue({
        repas: [],
        loading: true
      } as ReturnType<typeof mockUseAuth>)

      const { result } = renderHook(() => useExportData())

      expect(result.current.loading).toBe(true)
    })
  })

  describe('Gestion des erreurs', () => {
    it('devrait gérer l\'absence d\'utilisateur connecté', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false
      } as ReturnType<typeof mockUseAuth>)

      const mockHandleError = vi.fn()
      mockUseFirebaseError.mockReturnValue({
        handleError: mockHandleError,
        error: null,
        clearError: vi.fn()
      } as ReturnType<typeof mockUseAuth>)

      const { result } = renderHook(() => useExportData())

      const config: ExportConfig = {
        format: 'csv',
        dataType: 'all'
      }

      await act(async () => {
        await result.current.exportData(config)
      })

      expect(mockHandleError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Utilisateur non connecté'
        })
      )
    })

    it('ne devrait pas exporter pendant le chargement des données', async () => {
      mockUseRepas.mockReturnValue({
        repas: [],
        loading: true
      } as ReturnType<typeof mockUseAuth>)

      const { result } = renderHook(() => useExportData())

      const config: ExportConfig = {
        format: 'csv',
        dataType: 'all'
      }

      await act(async () => {
        await result.current.exportData(config)
      })

      expect(result.current.exportState.isExporting).toBe(false)
    })

    it('devrait gérer les erreurs d\'export', async () => {
      mockGenerateAndDownloadCSV.mockRejectedValue(new Error('Erreur d\'export CSV'))

      const { result } = renderHook(() => useExportData())

      const config: ExportConfig = {
        format: 'csv',
        dataType: 'all'
      }

      await act(async () => {
        await result.current.exportData(config)
      })

      expect(result.current.exportState.error).toBeTruthy()
      expect(result.current.exportState.isExporting).toBe(false)
    })
  })

  describe('Formats d\'export', () => {
    it('devrait supporter l\'export CSV', async () => {
      const { result } = renderHook(() => useExportData())

      const config: ExportConfig = {
        format: 'csv',
        dataType: 'all'
      }

      await act(async () => {
        await result.current.exportData(config)
      })

      expect(mockGenerateAndDownloadCSV).toHaveBeenCalled()
      expect(result.current.exportState.result).toBeTruthy()
    })

    it('devrait supporter l\'export JSON', async () => {
      const { result } = renderHook(() => useExportData())

      const config: ExportConfig = {
        format: 'json',
        dataType: 'repas'
      }

      await act(async () => {
        await result.current.exportData(config)
      })

      expect(mockGenerateAndDownloadJSON).toHaveBeenCalled()
      expect(result.current.exportState.result).toBeTruthy()
    })

    it('devrait supporter l\'export Excel', async () => {
      const { result } = renderHook(() => useExportData())

      const config: ExportConfig = {
        format: 'excel',
        dataType: 'all'
      }

      await act(async () => {
        await result.current.exportData(config)
      })

      expect(mockGenerateAndDownloadExcel).toHaveBeenCalled()
      expect(result.current.exportState.result).toBeTruthy()
    })

    it('devrait supporter l\'export PDF', async () => {
      const { result } = renderHook(() => useExportData())

      const config: ExportConfig = {
        format: 'pdf',
        dataType: 'all'
      }

      await act(async () => {
        await result.current.exportData(config)
      })

      expect(mockGenerateCompletePDF).toHaveBeenCalled()
      expect(result.current.exportState.result).toBeTruthy()
    })
  })

  describe('Filtrage des données', () => {
    it('devrait filtrer par période de dates', async () => {
      const config: ExportConfig = {
        format: 'csv',
        dataType: 'all',
        dateRange: {
          start: new Date('2024-01-14'),
          end: new Date('2024-01-15')
        }
      }

      const { result } = renderHook(() => useExportData())

      await act(async () => {
        await result.current.exportData(config)
      })

      expect(result.current.exportState.progress).toBeGreaterThan(0)
      expect(mockGenerateAndDownloadCSV).toHaveBeenCalled()
    })

    it('devrait filtrer par type de données', async () => {
      const config: ExportConfig = {
        format: 'json',
        dataType: 'repas'
      }

      const { result } = renderHook(() => useExportData())

      await act(async () => {
        await result.current.exportData(config)
      })

      expect(mockGenerateAndDownloadJSON).toHaveBeenCalled()
    })

    it('devrait filtrer les entraînements par durée', async () => {
      const config: ExportConfig = {
        format: 'csv',
        dataType: 'entrainements',
        filters: {
          minDuration: 50
        }
      }

      const { result } = renderHook(() => useExportData())

      await act(async () => {
        await result.current.exportData(config)
      })

      expect(mockGenerateAndDownloadCSV).toHaveBeenCalled()
    })
  })

  describe('États d\'export', () => {
    it('devrait mettre à jour la progression pendant l\'export', async () => {
      const { result } = renderHook(() => useExportData())

      const config: ExportConfig = {
        format: 'csv',
        dataType: 'all'
      }

      await act(async () => {
        await result.current.exportData(config)
      })

      expect(result.current.exportState.progress).toBeGreaterThan(0)
    })

    it('devrait permettre de réinitialiser l\'état', () => {
      const { result } = renderHook(() => useExportData())

      act(() => {
        result.current.resetExportState()
      })

      expect(result.current.exportState).toEqual({
        isExporting: false,
        progress: 0,
        currentStep: '',
        error: null,
        result: null
      })
    })
  })

  describe('Performance', () => {
    it('devrait gérer de gros volumes de données', async () => {
      const largeRepas = Array.from({ length: 100 }, (_, i) => ({
        id: `repas-${i}`,
        nom: `Repas ${i}`,
        date: new Date('2024-01-15'),
        macros: { kcal: 400, proteines: 20, glucides: 50, lipides: 15 },
        user_id: 'test-user-id'
      }))

      mockUseRepas.mockReturnValue({
        repas: largeRepas,
        loading: false
      } as ReturnType<typeof mockUseAuth>)

      const { result } = renderHook(() => useExportData())

      const config: ExportConfig = {
        format: 'csv',
        dataType: 'repas'
      }

      const startTime = performance.now()

      await act(async () => {
        await result.current.exportData(config)
      })

      const endTime = performance.now()
      const executionTime = endTime - startTime

      expect(executionTime).toBeLessThan(1000) // Moins de 1 seconde
      expect(mockGenerateAndDownloadCSV).toHaveBeenCalled()
    })
  })
})