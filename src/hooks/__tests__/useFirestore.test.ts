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
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  serverTimestamp: vi.fn(),
  onSnapshot: vi.fn(),
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
import { addDoc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore'

// Cast mocks - removed unused variables

// Mock useAuth
vi.mock('../useAuth', () => ({
  useAuth: () => ({
    user: { uid: 'test-user-id', email: 'test@supernovafit.com' },
    loading: false
  })
}))

describe('useRepas Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with empty repas', () => {
    const { result } = renderHook(() => useRepas())

    expect(result.current.repas).toEqual([])
    expect(result.current.loading).toBe(false)
  })

  it('should have addRepas function', () => {
    const { result } = renderHook(() => useRepas())

    expect(typeof result.current.addRepas).toBe('function')
  })

  it('should have updateRepas function', () => {
    const { result } = renderHook(() => useRepas())

    expect(typeof result.current.updateRepas).toBe('function')
  })

  it('should have deleteRepas function', () => {
    const { result } = renderHook(() => useRepas())

    expect(typeof result.current.deleteRepas).toBe('function')
  })
})

describe('useEntrainements Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with empty entrainements', () => {
    const { result } = renderHook(() => useEntrainements())

    expect(result.current.entrainements).toEqual([])
    expect(result.current.loading).toBe(false)
  })

  it('should have addEntrainement function', () => {
    const { result } = renderHook(() => useEntrainements())

    expect(typeof result.current.addEntrainement).toBe('function')
  })

  it('should have updateEntrainement function', () => {
    const { result } = renderHook(() => useEntrainements())

    expect(typeof result.current.updateEntrainement).toBe('function')
  })

  it('should have deleteEntrainement function', () => {
    const { result } = renderHook(() => useEntrainements())

    expect(typeof result.current.deleteEntrainement).toBe('function')
  })
})