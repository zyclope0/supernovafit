import React from 'react'
import { AlertTriangle, RefreshCw, X, Info, AlertCircle, XCircle } from 'lucide-react'
import { type FirebaseErrorInfo } from '@/lib/firebase-errors'

interface FirebaseErrorDisplayProps {
  error: FirebaseErrorInfo | null
  onRetry?: () => void
  onDismiss?: () => void
  showRetryButton?: boolean
  showDismissButton?: boolean
  className?: string
  compact?: boolean
}

export default function FirebaseErrorDisplay({
  error,
  onRetry,
  onDismiss,
  showRetryButton = true,
  showDismissButton = true,
  className = '',
  compact = false
}: FirebaseErrorDisplayProps) {
  if (!error) return null

  const getSeverityConfig = (severity: FirebaseErrorInfo['severity']) => {
    switch (severity) {
      case 'critical':
        return {
          icon: XCircle,
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/20',
          textColor: 'text-red-400',
          iconColor: 'text-red-500'
        }
      case 'high':
        return {
          icon: AlertCircle,
          bgColor: 'bg-orange-500/10',
          borderColor: 'border-orange-500/20',
          textColor: 'text-orange-400',
          iconColor: 'text-orange-500'
        }
      case 'medium':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/20',
          textColor: 'text-blue-400',
          iconColor: 'text-blue-500'
        }
      case 'low':
        return {
          icon: Info,
          bgColor: 'bg-gray-500/10',
          borderColor: 'border-gray-500/20',
          textColor: 'text-gray-400',
          iconColor: 'text-gray-500'
        }
      default:
        return {
          icon: AlertTriangle,
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/20',
          textColor: 'text-blue-400',
          iconColor: 'text-blue-500'
        }
    }
  }

  const config = getSeverityConfig(error.severity)
  const IconComponent = config.icon

  if (compact) {
    return (
      <div className={`flex items-center gap-2 p-2 rounded-lg ${config.bgColor} ${config.borderColor} border ${className}`}>
        <IconComponent className={`h-4 w-4 ${config.iconColor}`} />
        <span className={`text-sm ${config.textColor}`}>
          {error.userMessage}
        </span>
        {showRetryButton && onRetry && (
          <button
            onClick={onRetry}
            className="ml-auto p-1 hover:bg-white/10 rounded transition-colors"
            title="Réessayer"
          >
            <RefreshCw className="h-3 w-3 text-white" />
          </button>
        )}
        {showDismissButton && onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1 hover:bg-white/10 rounded transition-colors"
            title="Fermer"
          >
            <X className="h-3 w-3 text-white" />
          </button>
        )}
      </div>
    )
  }

  return (
    <div className={`glass-effect p-4 rounded-xl border ${config.borderColor} ${config.bgColor} ${className}`}>
      <div className="flex items-start gap-3">
        <IconComponent className={`h-5 w-5 mt-0.5 ${config.iconColor}`} />
        
        <div className="flex-1 min-w-0">
          <h3 className={`font-medium ${config.textColor} mb-1`}>
            {error.category === 'auth' && 'Erreur d\'authentification'}
            {error.category === 'firestore' && 'Erreur de base de données'}
            {error.category === 'storage' && 'Erreur de stockage'}
            {error.category === 'network' && 'Erreur de connexion'}
            {error.category === 'permission' && 'Erreur de permission'}
            {error.category === 'unknown' && 'Erreur inattendue'}
          </h3>
          
          <p className={`text-sm ${config.textColor} mb-3`}>
            {error.userMessage}
          </p>

          {/* Informations techniques (développement uniquement) */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mb-3">
              <summary className={`text-xs ${config.textColor} cursor-pointer hover:underline`}>
                Détails techniques
              </summary>
              <div className="mt-2 p-2 bg-black/20 rounded text-xs font-mono text-gray-300">
                <div>Code: {error.technicalCode}</div>
                <div>Catégorie: {error.category}</div>
                <div>Sévérité: {error.severity}</div>
                <div>Retryable: {error.retryable ? 'Oui' : 'Non'}</div>
              </div>
            </details>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            {showRetryButton && onRetry && error.retryable && (
              <button
                onClick={onRetry}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Réessayer
              </button>
            )}
            
            {showDismissButton && onDismiss && (
              <button
                onClick={onDismiss}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <X className="h-4 w-4" />
                Fermer
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Composant spécialisé pour les erreurs de chargement
export function LoadingErrorDisplay({
  error,
  onRetry,
  onDismiss,
  title = 'Erreur de chargement',
  className = ''
}: {
  error: FirebaseErrorInfo | null
  onRetry?: () => void
  onDismiss?: () => void
  title?: string
  className?: string
}) {
  if (!error) return null

  return (
    <div className={`text-center py-8 ${className}`}>
      <div className="mb-4">
        <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-muted-foreground mb-4">{error.userMessage}</p>
      </div>
      
      <div className="flex items-center justify-center gap-3">
        {onRetry && error.retryable && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-4 py-2 bg-neon-green/20 text-neon-green rounded-lg font-medium hover:bg-neon-green/30 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Réessayer
          </button>
        )}
        
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="px-4 py-2 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors"
          >
            Fermer
          </button>
        )}
      </div>
    </div>
  )
}

// Composant pour les erreurs de formulaire
export function FormErrorDisplay({
  error,
  onRetry,
  className = ''
}: {
  error: FirebaseErrorInfo | null
  onRetry?: () => void
  className?: string
}) {
  if (!error) return null

  return (
    <div className={`p-3 rounded-lg bg-red-500/10 border border-red-500/20 ${className}`}>
      <div className="flex items-start gap-2">
        <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm text-red-400 mb-2">{error.userMessage}</p>
          {onRetry && error.retryable && (
            <button
              onClick={onRetry}
              className="text-xs text-red-300 hover:text-red-200 underline"
            >
              Réessayer
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
