import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Firebase Auth avant import
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  onAuthStateChanged: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
}))

import { useAuth } from '../useAuth'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/auth'

// Cast mocks
const mockOnAuthStateChanged = vi.mocked(onAuthStateChanged)
const mockSignInWithEmailAndPassword = vi.mocked(signInWithEmailAndPassword)
const mockSignOut = vi.mocked(signOut)
const mockSendPasswordResetEmail = vi.mocked(sendPasswordResetEmail)

describe('useAuth Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with loading true and no user', () => {
    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      // Simule état initial (loading)
      return vi.fn()
    })

    const { result } = renderHook(() => useAuth())

    expect(result.current.loading).toBe(true)
    expect(result.current.user).toBe(null)
    expect(result.current.error).toBe(null)
  })

  it('should set user when authenticated', async () => {
    const mockUser = {
      uid: 'test-user-id',
      email: 'test@supernovafit.com',
      displayName: 'Test User'
    }

    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      callback(mockUser)
      return vi.fn()
    })

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.user).toEqual(mockUser)
    })
  })

  it('should handle signIn success', async () => {
    mockSignInWithEmailAndPassword.mockResolvedValue({
      user: { uid: 'test-id', email: 'test@test.com' }
    })

    const { result } = renderHook(() => useAuth())

    await result.current.signIn('test@test.com', 'password123')

    expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      'test@test.com',
      'password123'
    )
  })

  it('should handle signIn error', async () => {
    const errorMessage = 'Invalid credentials'
    mockSignInWithEmailAndPassword.mockRejectedValue(new Error(errorMessage))

    const { result } = renderHook(() => useAuth())

    await result.current.signIn('test@test.com', 'wrongpassword')

    await waitFor(() => {
      expect(result.current.error).toBe(errorMessage)
    })
  })

  it('should handle signOut', async () => {
    mockSignOut.mockResolvedValue(undefined)

    const { result } = renderHook(() => useAuth())

    await result.current.signOut()

    expect(mockSignOut).toHaveBeenCalled()
  })

  it('should handle password reset', async () => {
    mockSendPasswordResetEmail.mockResolvedValue(undefined)

    const { result } = renderHook(() => useAuth())

    await result.current.resetPassword('test@test.com')

    expect(mockSendPasswordResetEmail).toHaveBeenCalledWith(
      expect.anything(),
      'test@test.com'
    )
  })

  it('should clear error on successful operation', async () => {
    // Set initial error
    mockSignInWithEmailAndPassword.mockRejectedValueOnce(new Error('Initial error'))
    const { result } = renderHook(() => useAuth())
    
    await result.current.signIn('test@test.com', 'wrong')
    await waitFor(() => {
      expect(result.current.error).toBe('Initial error')
    })

    // Clear error on successful operation
    mockSignInWithEmailAndPassword.mockResolvedValueOnce({
      user: { uid: 'test-id', email: 'test@test.com' }
    })
    
    await result.current.signIn('test@test.com', 'correct')
    await waitFor(() => {
      expect(result.current.error).toBe(null)
    })
  })
})
