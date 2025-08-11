import { renderHook, waitFor } from '@testing-library/react'
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
}))

import { useFirestore } from '../useFirestore'
import { addDoc, updateDoc, deleteDoc, getDocs, getDoc, collection, doc, query, where, orderBy } from 'firebase/firestore'

// Cast mocks
const mockAddDoc = vi.mocked(addDoc)
const mockUpdateDoc = vi.mocked(updateDoc)
const mockDeleteDoc = vi.mocked(deleteDoc)
const mockGetDocs = vi.mocked(getDocs)
const mockGetDoc = vi.mocked(getDoc)
const mockCollection = vi.mocked(collection)
const mockDoc = vi.mocked(doc)
const mockQuery = vi.mocked(query)
const mockWhere = vi.mocked(where)
const mockOrderBy = vi.mocked(orderBy)

// Mock useAuth
vi.mock('../useAuth', () => ({
  useAuth: () => ({
    user: { uid: 'test-user-id', email: 'test@supernovafit.com' },
    loading: false
  })
}))

describe('useFirestore Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('addDocument', () => {
    it('should add document successfully', async () => {
      const mockDocRef = { id: 'new-doc-id' }
      mockAddDoc.mockResolvedValue(mockDocRef)

      const { result } = renderHook(() => useFirestore())

      const docId = await result.current.addDocument('repas', {
        date: '2025-01-20',
        repas: 'petit_dej',
        aliments: []
      })

      expect(docId).toBe('new-doc-id')
      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          date: '2025-01-20',
          repas: 'petit_dej',
          aliments: [],
          user_id: 'test-user-id'
        })
      )
    })

    it('should handle add document error', async () => {
      mockAddDoc.mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useFirestore())

      const docId = await result.current.addDocument('repas', {})

      expect(docId).toBe(null)
    })

    it('should add user_id automatically', async () => {
      const mockDocRef = { id: 'test-id' }
      mockAddDoc.mockResolvedValue(mockDocRef)

      const { result } = renderHook(() => useFirestore())

      await result.current.addDocument('entrainements', {
        type: 'course',
        duree: 30
      })

      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          type: 'course',
          duree: 30,
          user_id: 'test-user-id'
        })
      )
    })
  })

  describe('updateDocument', () => {
    it('should update document successfully', async () => {
      mockUpdateDoc.mockResolvedValue(undefined)

      const { result } = renderHook(() => useFirestore())

      const success = await result.current.updateDocument('repas', 'doc-id', {
        aliments: [{ nom: 'Banane', quantite: 120 }]
      })

      expect(success).toBe(true)
      expect(mockUpdateDoc).toHaveBeenCalled()
    })

    it('should handle update error', async () => {
      mockUpdateDoc.mockRejectedValue(new Error('Update failed'))

      const { result } = renderHook(() => useFirestore())

      const success = await result.current.updateDocument('repas', 'doc-id', {})

      expect(success).toBe(false)
    })
  })

  describe('deleteDocument', () => {
    it('should delete document successfully', async () => {
      mockDeleteDoc.mockResolvedValue(undefined)

      const { result } = renderHook(() => useFirestore())

      const success = await result.current.deleteDocument('repas', 'doc-id')

      expect(success).toBe(true)
      expect(mockDeleteDoc).toHaveBeenCalled()
    })

    it('should handle delete error', async () => {
      mockDeleteDoc.mockRejectedValue(new Error('Delete failed'))

      const { result } = renderHook(() => useFirestore())

      const success = await result.current.deleteDocument('repas', 'doc-id')

      expect(success).toBe(false)
    })
  })

  describe('loading states', () => {
    it('should handle loading states correctly', async () => {
      mockAddDoc.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ id: 'test-id' }), 100))
      )

      const { result } = renderHook(() => useFirestore())

      expect(result.current.loading).toBe(false)

      const addPromise = result.current.addDocument('repas', {})
      
      expect(result.current.loading).toBe(true)

      await addPromise

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })
  })

  describe('getDocuments', () => {
    it('should fetch documents with user filter', async () => {
      const mockDocs = [
        { id: 'doc1', data: () => ({ nom: 'test1', user_id: 'test-user-id' }) },
        { id: 'doc2', data: () => ({ nom: 'test2', user_id: 'test-user-id' }) }
      ]
      mockGetDocs.mockResolvedValue({ docs: mockDocs })

      const { result } = renderHook(() => useFirestore())

      const documents = await result.current.getDocuments('repas')

      expect(documents).toHaveLength(2)
      expect(documents[0]).toEqual({
        id: 'doc1',
        nom: 'test1',
        user_id: 'test-user-id'
      })
    })

    it('should handle empty collection', async () => {
      mockGetDocs.mockResolvedValue({ docs: [] })

      const { result } = renderHook(() => useFirestore())

      const documents = await result.current.getDocuments('repas')

      expect(documents).toEqual([])
    })

    it('should handle fetch error', async () => {
      mockGetDocs.mockRejectedValue(new Error('Fetch failed'))

      const { result } = renderHook(() => useFirestore())

      const documents = await result.current.getDocuments('repas')

      expect(documents).toEqual([])
    })
  })
})
