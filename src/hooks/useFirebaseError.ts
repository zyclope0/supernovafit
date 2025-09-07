import { useState, useCallback, useMemo } from 'react'
import toast from 'react-hot-toast'
import { 
  analyzeFirebaseError, 
  getUserFriendlyMessage, 
  isRetryableError, 
  getErrorSeverity,
  logFirebaseError,
  type FirebaseErrorInfo 
} from '@/lib/firebase-errors'

interface ErrorState {
  hasError: boolean
  error: FirebaseErrorInfo | null
  retryCount: number
  isRetrying: boolean
}

interface UseFirebaseErrorOptions {
  maxRetries?: number
  showToast?: boolean
  context?: string
  onError?: (error: FirebaseErrorInfo) => void
  onRetry?: () => void
}

export function useFirebaseError(options: UseFirebaseErrorOptions = {}) {
  const {
    maxRetries = 3,
    showToast = true,
    context = 'Unknown',
    onError,
    onRetry
  } = options

  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null,
    retryCount: 0,
    isRetrying: false
  })

  const handleError = useCallback((error: unknown) => {
    const errorInfo = analyzeFirebaseError(error)
    
    // Log l'erreur pour le debugging
    logFirebaseError(error, context)
    
    // Mettre à jour l'état d'erreur
    setErrorState(prev => ({
      hasError: true,
      error: errorInfo,
      retryCount: prev.retryCount,
      isRetrying: false
    }))

    // Afficher le toast si activé
    if (showToast) {
      const message = getUserFriendlyMessage(error)
      const severity = getErrorSeverity(error)
      
      // Choisir le style du toast selon la sévérité
      const toastStyle = {
        background: severity === 'critical' ? 'rgba(239, 68, 68, 0.1)' :
                    severity === 'high' ? 'rgba(245, 158, 11, 0.1)' :
                    severity === 'medium' ? 'rgba(59, 130, 246, 0.1)' :
                    'rgba(107, 114, 128, 0.1)',
        border: severity === 'critical' ? '1px solid rgba(239, 68, 68, 0.3)' :
                severity === 'high' ? '1px solid rgba(245, 158, 11, 0.3)' :
                severity === 'medium' ? '1px solid rgba(59, 130, 246, 0.3)' :
                '1px solid rgba(107, 114, 128, 0.3)',
        color: severity === 'critical' ? '#ef4444' :
               severity === 'high' ? '#f59e0b' :
               severity === 'medium' ? '#3b82f6' :
               '#6b7280'
      }

      toast.error(message, {
        duration: severity === 'critical' ? 8000 : 5000,
        style: toastStyle
      })
    }

    // Appeler le callback onError si fourni
    if (onError) {
      onError(errorInfo)
    }
  }, [context, showToast, onError])

  const retry = useCallback(async (retryFunction: () => Promise<void>) => {
    if (errorState.retryCount >= maxRetries) {
      toast.error('Nombre maximum de tentatives atteint')
      return
    }

    if (!isRetryableError(errorState.error)) {
      toast.error('Cette erreur ne peut pas être retentée')
      return
    }

    setErrorState(prev => ({
      ...prev,
      isRetrying: true
    }))

    try {
      await retryFunction()
      
      // Succès - réinitialiser l'état d'erreur
      setErrorState({
        hasError: false,
        error: null,
        retryCount: 0,
        isRetrying: false
      })

      toast.success('Opération réussie !')
      
      // Appeler le callback onRetry si fourni
      if (onRetry) {
        onRetry()
      }
    } catch (error) {
      // Échec - incrémenter le compteur de retry
      setErrorState(prev => ({
        ...prev,
        retryCount: prev.retryCount + 1,
        isRetrying: false
      }))

      // Log et afficher l'erreur
      logFirebaseError(error, context)
      const message = getUserFriendlyMessage(error)
      toast.error(`Tentative échouée: ${message}`)
    }
  }, [errorState.retryCount, errorState.error, maxRetries, context, onRetry])

  const clearError = useCallback(() => {
    setErrorState({
      hasError: false,
      error: null,
      retryCount: 0,
      isRetrying: false
    })
  }, [])

  // Stabiliser l'objet retourné avec useMemo
  const errorHandler = useMemo(() => ({
    handleError,
    retry,
    clearError,
    error: errorState.error,
    hasError: errorState.hasError,
    retryCount: errorState.retryCount,
    isRetrying: errorState.isRetrying
  }), [handleError, retry, clearError, errorState.error, errorState.hasError, errorState.retryCount, errorState.isRetrying])

  return errorHandler
}

