'use client'

import { useState } from 'react'
import { X, Copy, RefreshCw, Users, Clock, CheckCircle, XCircle } from 'lucide-react'
import { useCoachInvites } from '@/hooks/useInvites'
import { getTimeUntilExpiration, formatExpirationDate } from '@/lib/inviteUtils'
import { useFocusTrap } from '@/hooks/useFocusTrap'
// import type { Invite } from '@/types' - Type non utilisé dans ce fichier

interface InviteModalProps {
  isOpen: boolean
  onClose: () => void
  coachId: string
}

export default function InviteModal({ isOpen, onClose, coachId }: InviteModalProps) {
  const { invites, loading, generating, generateInvite, revokeInvite } = useCoachInvites(coachId)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const focusTrapRef = useFocusTrap(isOpen, onClose, true, 'button[aria-label="Fermer"]')

  const handleGenerateInvite = async () => {
    const code = await generateInvite()
    if (code) {
      setCopiedCode(code)
    }
  }

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (error) {
      console.error('Erreur lors de la copie:', error)
    }
  }

  const handleRevokeInvite = async (code: string) => {
    if (confirm('Êtes-vous sûr de vouloir révoquer cette invitation ?')) {
      await revokeInvite(code)
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="invite-modal-title"
      aria-describedby="invite-modal-description"
    >
      <div ref={focusTrapRef} className="glass-effect w-full max-w-2xl mx-4 p-6 rounded-xl border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-neon-cyan" />
            <h2 id="invite-modal-title" className="text-xl font-semibold text-white">Inviter un·e athlète</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer la modal d'invitation"
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Description */}
        <p id="invite-modal-description" className="text-sm text-muted-foreground mb-6">
          Générez des codes d&apos;invitation pour permettre à vos athlètes de rejoindre votre coaching. Chaque code est valable 7 jours.
        </p>

        {/* Génération de code */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={handleGenerateInvite}
              disabled={generating}
              className="flex items-center gap-2 px-4 py-2 bg-neon-cyan/20 text-neon-cyan rounded-lg font-medium hover:bg-neon-cyan/30 transition-colors disabled:opacity-50"
            >
              {generating ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {generating ? 'Génération...' : 'Générer un code'}
            </button>
            <span className="text-sm text-muted-foreground">
              Limite : 5 codes / 10 minutes
            </span>
          </div>

          {/* Code généré */}
          {copiedCode && (
            <div className="glass-effect p-4 rounded-lg border border-neon-cyan/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Code généré :</p>
                  <p className="text-2xl font-mono font-bold text-neon-cyan tracking-wider">
                    {copiedCode}
                  </p>
                </div>
                <button
                  onClick={() => handleCopyCode(copiedCode)}
                  className="p-2 bg-neon-cyan/20 text-neon-cyan rounded-lg hover:bg-neon-cyan/30 transition-colors"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Ce code expire dans 72h et ne peut être utilisé qu&apos;une seule fois
              </p>
            </div>
          )}
        </div>

        {/* Liste des invitations */}
        <div>
          <h3 className="text-lg font-medium text-white mb-4">Codes d&apos;invitation actifs</h3>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-neon-cyan border-t-transparent"></div>
            </div>
          ) : invites.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Aucun code d&apos;invitation généré</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {invites.map((invite) => (
                <div
                  key={invite.code}
                  className="glass-effect p-4 rounded-lg border border-white/10"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono font-bold text-lg text-white">
                          {invite.code}
                        </span>
                        <div className="flex items-center gap-1">
                          {invite.status === 'active' ? (
                            <CheckCircle className="h-4 w-4 text-green-400" />
                          ) : invite.status === 'used' ? (
                            <Users className="h-4 w-4 text-blue-400" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-400" />
                          )}
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            invite.status === 'active' ? 'bg-green-500/20 text-green-400' :
                            invite.status === 'used' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {invite.status === 'active' ? 'Actif' :
                             invite.status === 'used' ? 'Utilisé' : 'Révoqué'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            {invite.status === 'active' 
                              ? getTimeUntilExpiration(invite)
                              : formatExpirationDate(invite.expiresAt)
                            }
                          </span>
                        </div>
                        {invite.usedByAthleteId && (
                          <span>Utilisé par un athlète</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {invite.status === 'active' && (
                        <>
                          <button
                            onClick={() => handleCopyCode(invite.code)}
                            className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                            title="Copier le code"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleRevokeInvite(invite.code)}
                            className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                            title="Révoquer l'invitation"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <p className="text-xs text-muted-foreground text-center">
            Les codes expirent automatiquement après 72h. Vous pouvez les révoquer à tout moment.
          </p>
        </div>
      </div>
    </div>
  )
}
