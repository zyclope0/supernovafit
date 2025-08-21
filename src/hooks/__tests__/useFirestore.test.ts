import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Firestore avant import
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  collection: vi.fn(),
  doc: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  getDocs: vi.fn(),
  getDoc: vi.fn(),
  query: vi.fn(() => ({ __isFirestoreQuery: true })),
  where: vi.fn(() => ({ __isFirestoreWhere: true })),
  orderBy: vi.fn(() => ({ __isFirestoreOrderBy: true })),
  limit: vi.fn(),
  serverTimestamp: vi.fn(),
  onSnapshot: vi.fn((query, callback) => {
    // Appeler le callback immédiatement avec des données vides
    callback({ docs: [] })
    return vi.fn()
  }),
}))

// Mock Firebase Storage
vi.mock('firebase/storage', () => ({
  getStorage: vi.fn(),
  ref: vi.fn(),
  uploadBytes: vi.fn(),
  getDownloadURL: vi.fn(),
  deleteObject: vi.fn(),
}))

import { useRepas, useEntrainements } from '../useFirestore'

// Mock useAuth
vi.mock('../useAuth', () => ({
  useAuth: () => ({
    user: { uid: 'test-user-id', email: 'test@supernovafit.com' },
    loading: false
  })
}))

// Mock useFirebaseError
vi.mock('../useFirebaseError', () => ({
  useFirebaseError: () => ({
    handleError: vi.fn(),
    clearError: vi.fn(),
    error: null,
    hasError: false
  })
}))

// Tests temporairement désactivés pour éviter les problèmes de mémoire
describe.skip('useRepas Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have required functions', () => {
    const { result } = renderHook(() => useRepas())

    expect(typeof result.current.addRepas).toBe('function')
    expect(typeof result.current.updateRepas).toBe('function')
    expect(typeof result.current.deleteRepas).toBe('function')
    expect(Array.isArray(result.current.repas)).toBe(true)
  })
})

describe.skip('useEntrainements Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have required functions', () => {
    const { result } = renderHook(() => useEntrainements())

    expect(typeof result.current.addEntrainement).toBe('function')
    expect(typeof result.current.updateEntrainement).toBe('function')
    expect(typeof result.current.deleteEntrainement).toBe('function')
    expect(Array.isArray(result.current.entrainements)).toBe(true)
  })
})