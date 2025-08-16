import { Invite } from '@/types'

/**
 * Génère un code d'invitation à 6 caractères
 * Format: A-Z/2-9 (sans O/0/I/1 pour éviter la confusion)
 */
export function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Sans O/0/I/1
  let code = ''
  
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return code
}

/**
 * Valide le format d'un code d'invitation
 */
export function validateInviteCode(code: string): boolean {
  if (!code || code.length !== 6) return false
  
  // Vérifier que le code ne contient que des caractères autorisés
  const validChars = /^[A-Z2-9]+$/
  if (!validChars.test(code)) return false
  
  // Vérifier qu'il ne contient pas les caractères interdits
  if (code.includes('O') || code.includes('0') || code.includes('I') || code.includes('1')) {
    return false
  }
  
  return true
}

/**
 * Calcule la date d'expiration (TTL 72h)
 */
export function calculateExpirationDate(): Date {
  const now = new Date()
  return new Date(now.getTime() + 72 * 60 * 60 * 1000) // +72 heures
}

/**
 * Vérifie si une invitation est expirée
 */
export function isInviteExpired(invite: Invite): boolean {
  return new Date() > new Date(invite.expiresAt)
}

/**
 * Vérifie si une invitation peut être utilisée
 */
export function canUseInvite(invite: Invite): boolean {
  return invite.status === 'active' && !isInviteExpired(invite)
}

/**
 * Formate la date d'expiration pour l'affichage
 */
export function formatExpirationDate(date: Date): string {
  return new Date(date).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Calcule le temps restant avant expiration
 */
export function getTimeUntilExpiration(invite: Invite): string {
  const now = new Date()
  const expiration = new Date(invite.expiresAt)
  const diff = expiration.getTime() - now.getTime()
  
  if (diff <= 0) return 'Expiré'
  
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (hours > 24) {
    const days = Math.floor(hours / 24)
    return `${days}j ${hours % 24}h`
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else {
    return `${minutes}m`
  }
}
