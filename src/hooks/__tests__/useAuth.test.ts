import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Firebase Auth avant import
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  onAuthStateChanged: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  sendSignInLinkToEmail: vi.fn(),
  isSignInWithEmailLink: vi.fn(),
  signInWithEmailLink: vi.fn(),
}))

import { useAuth } from '../useAuth'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'

// Cast mocks
const mockOnAuthStateChanged = vi.mocked(onAuthStateChanged)
const mockSignInWithEmailAndPassword = vi.mocked(signInWithEmailAndPassword)
const mockSignOut = vi.mocked(signOut)

describe('useAuth Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with loading true and no user', () => {
    mockOnAuthStateChanged.mockImplementation((_auth, callback) => {
      // Simule état initial (loading)
      return vi.fn()
    })

    const { result } = renderHook(() => useAuth())

    expect(result.current.loading).toBe(true)
    expect(result.current.user).toBe(null)
    expect(result.current.userProfile).toBe(null)
  })

  it('should set user when authenticated', async () => {
    const mockUser = {
      uid: 'test-user-id',
      email: 'test@supernovafit.com',
      displayName: 'Test User',
      emailVerified: true,
      isAnonymous: false,
      metadata: {},
      providerData: [],
      refreshToken: 'mock-refresh-token',
      tenantId: null,
      delete: vi.fn(),
      getIdToken: vi.fn(),
      getIdTokenResult: vi.fn(),
      reload: vi.fn(),
      toJSON: vi.fn(),
    }

    mockOnAuthStateChanged.mockImplementation((_auth, callback) => {
      // Cast callback to function and call it
      if (typeof callback === 'function') {
        callback(mockUser as any)
      }
      return vi.fn()
    })

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.user).toEqual(mockUser)
    })
  })

  it('should handle signIn success', async () => {
    const mockUserCredential = {
      user: {
        uid: 'test-id',
        email: 'test@test.com',
        emailVerified: true,
        isAnonymous: false,
        metadata: {},
        providerData: [],
        refreshToken: 'mock-refresh-token',
        tenantId: null,
        displayName: null,
        photoURL: null,
        phoneNumber: null,
        delete: vi.fn(),
        getIdToken: vi.fn(),
        getIdTokenResult: vi.fn(),
        reload: vi.fn(),
        toJSON: vi.fn(),
      },
      providerId: 'password',
      operationType: 'signIn' as const
    }

    mockSignInWithEmailAndPassword.mockResolvedValue(mockUserCredential as any)

    const { result } = renderHook(() => useAuth())

    const response = await result.current.signIn('test@test.com', 'password123')

    expect(response.success).toBe(true)
    expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
      undefined, // Auth object is mocked as undefined
      'test@test.com',
      'password123'
    )
  })

  it('should handle signIn error', async () => {
    mockSignInWithEmailAndPassword.mockRejectedValue(new Error('Invalid credentials'))

    const { result } = renderHook(() => useAuth())

    const response = await result.current.signIn('test@test.com', 'wrongpassword')

    expect(response.success).toBe(false)
    expect(response.error).toBeDefined()
  })

  it('should handle signOut', async () => {
    mockSignOut.mockResolvedValue(undefined)

    const { result } = renderHook(() => useAuth())

    await result.current.signOut()

    expect(mockSignOut).toHaveBeenCalled()
  })

  it('should handle magic link sending', async () => {
    const { result } = renderHook(() => useAuth())

    const response = await result.current.sendMagicLink('test@test.com')

    // Le hook devrait retourner un objet avec success
    expect(typeof response).toBe('object')
    expect('success' in response).toBe(true)
  })

  it('should verify magic link', async () => {
    const { result } = renderHook(() => useAuth())

    const response = await result.current.verifyMagicLink()

    // Le hook devrait retourner un objet avec success
    expect(typeof response).toBe('object')
    expect('success' in response).toBe(true)
  })
})