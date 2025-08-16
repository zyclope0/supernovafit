'use client'

import { useState } from 'react'
import { Users, CheckCircle, XCircle, ArrowRight } from 'lucide-react'
import { useInviteClaim } from '@/hooks/useInvites'
import { validateInviteCode } from '@/lib/inviteUtils'
import { useAuth } from '@/hooks/useAuth'

interface InviteCodeInputProps {
  onSuccess?: () => void
  className?: string
}

export default function InviteCodeInput({ onSuccess, className = '' }: InviteCodeInputProps) {
  const { user } = useAuth()
  const { claiming, claimInvite } = useInviteClaim()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      setError('Vous devez être connecté pour utiliser un code d\'invitation')
      return
    }

    if (!validateInviteCode(code)) {
      setError('Format de code invalide. Utilisez 6 caractères A-Z/2-9 (sans O/0/I/1)')
      return
    }

    setError('')
    const success = await claimInvite(code, user.uid)
    
    if (success) {
      setSuccess(true)
      setCode('')
      onSuccess?.()
      // Reset success state after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    }
  }

  const handleCodeChange = (value: string) => {
    // Convertir en majuscules et limiter à 6 caractères
    const upperValue = value.toUpperCase().slice(0, 6)
    setCode(upperValue)
    setError('')
  }

  if (success) {
    return (
      <div className={`glass-effect p-4 rounded-lg border border-green-500/20 ${className}`}>
        <div className="flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-400" />
          <div>
            <p className="text-green-400 font-medium">Invitation acceptée !</p>
            <p className="text-sm text-muted-foreground">
              Vous êtes maintenant lié à votre coach.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`glass-effect p-4 rounded-lg border border-white/10 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <Users className="h-5 w-5 text-neon-cyan" />
        <div>
          <h3 className="text-white font-medium">Rejoindre un coach</h3>
          <p className="text-sm text-muted-foreground">
            Entrez le code d&apos;invitation fourni par votre coach
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="invite-code" className="block text-sm font-medium text-white mb-2">
            Code d&apos;invitation
          </label>
          <div className="relative">
            <input
              id="invite-code"
              type="text"
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              placeholder="ABCDEF"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-muted-foreground focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/20 font-mono text-lg tracking-wider"
              maxLength={6}
              disabled={claiming}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {code.length === 6 && validateInviteCode(code) ? (
                <CheckCircle className="h-5 w-5 text-green-400" />
              ) : code.length > 0 && !validateInviteCode(code) ? (
                <XCircle className="h-5 w-5 text-red-400" />
              ) : null}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Format : 6 caractères A-Z/2-9 (sans O/0/I/1)
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <XCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={!code || code.length !== 6 || !validateInviteCode(code) || claiming}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-neon-cyan/20 text-neon-cyan rounded-lg font-medium hover:bg-neon-cyan/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {claiming ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-neon-cyan border-t-transparent"></div>
              Vérification...
            </>
          ) : (
            <>
              <ArrowRight className="h-4 w-4" />
              Rejoindre le coach
            </>
          )}
        </button>
      </form>

      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-xs text-blue-400">
          <strong>Info :</strong> Le code expire dans 72h et ne peut être utilisé qu&apos;une seule fois.
        </p>
      </div>
    </div>
  )
}
