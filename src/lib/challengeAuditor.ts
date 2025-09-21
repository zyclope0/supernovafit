// Auditeur de challenges - Vérification et correction des données
import { CHALLENGE_DEFINITIONS } from './challenges'
import type { Challenge } from '@/types'

/**
 * Audit et correction des challenges
 */
export class ChallengeAuditor {
  
  /**
   * Vérifie si un challenge a des dates valides
   */
  static validateChallengeDates(challenge: Challenge): { isValid: boolean; errors: string[] } {
    const errors: string[] = []
    
    // Vérifier startDate
    if (challenge.startDate && challenge.startDate !== '') {
      const startDate = new Date(challenge.startDate)
      if (isNaN(startDate.getTime())) {
        errors.push(`startDate invalide: ${challenge.startDate}`)
      }
    }
    
    // Vérifier endDate
    if (challenge.endDate && challenge.endDate !== '') {
      const endDate = new Date(challenge.endDate)
      if (isNaN(endDate.getTime())) {
        errors.push(`endDate invalide: ${challenge.endDate}`)
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
  
  /**
   * Corrige automatiquement les dates d'un challenge
   */
  static fixChallengeDates(challenge: Challenge): Partial<Challenge> {
    const now = new Date()
    const updates: Partial<Challenge> = {}
    
    // Si pas de startDate ou invalide, utiliser maintenant
    if (!challenge.startDate || challenge.startDate === '' || isNaN(new Date(challenge.startDate).getTime())) {
      updates.startDate = now.toISOString()
    }
    
    // Calculer endDate selon la catégorie si invalide
    if (!challenge.endDate || challenge.endDate === '' || isNaN(new Date(challenge.endDate).getTime())) {
      const startDate = new Date(updates.startDate || challenge.startDate || now)
      const endDate = new Date(startDate)
      
      switch (challenge.category) {
        case 'daily':
          endDate.setDate(startDate.getDate() + 1)
          break
        case 'weekly':
          endDate.setDate(startDate.getDate() + 7)
          break
        case 'monthly':
          endDate.setMonth(startDate.getMonth() + 1)
          break
        case 'special':
          endDate.setMonth(startDate.getMonth() + 3) // 3 mois pour les spéciaux
          break
        default:
          endDate.setDate(startDate.getDate() + 7)
      }
      
      updates.endDate = endDate.toISOString()
    }
    
    return updates
  }
  
  /**
   * Vérifie si un challenge correspond à une définition existante
   */
  static validateChallengeDefinition(challenge: Challenge): { isValid: boolean; suggestion?: typeof CHALLENGE_DEFINITIONS[0] } {
    const definition = CHALLENGE_DEFINITIONS.find(def => 
      def.title === challenge.title ||
      (def.description === challenge.description && def.type === challenge.type)
    )
    
    return {
      isValid: !!definition,
      suggestion: definition
    }
  }
  
  /**
   * Audit complet d'un challenge
   */
  static auditChallenge(challenge: Challenge) {
    const dateValidation = this.validateChallengeDates(challenge)
    const definitionValidation = this.validateChallengeDefinition(challenge)
    const fixes = this.fixChallengeDates(challenge)
    
    return {
      challenge,
      dateValidation,
      definitionValidation,
      suggestedFixes: fixes,
      needsUpdate: !dateValidation.isValid || Object.keys(fixes).length > 0
    }
  }
  
  /**
   * Audit d'une liste de challenges
   */
  static auditChallenges(challenges: Challenge[]) {
    const results = challenges.map(challenge => this.auditChallenge(challenge))
    
    const summary = {
      total: challenges.length,
      valid: results.filter(r => !r.needsUpdate).length,
      needingFixes: results.filter(r => r.needsUpdate).length,
      invalidDates: results.filter(r => !r.dateValidation.isValid).length,
      unknownDefinitions: results.filter(r => !r.definitionValidation.isValid).length
    }
    
    return {
      results,
      summary
    }
  }
  
  /**
   * Génère un rapport d'audit lisible
   */
  static generateAuditReport(challenges: Challenge[]): string {
    const audit = this.auditChallenges(challenges)
    
    let report = `🔍 AUDIT CHALLENGES - ${new Date().toLocaleString('fr-FR')}\n\n`
    report += `📊 RÉSUMÉ:\n`
    report += `- Total: ${audit.summary.total} challenges\n`
    report += `- Valides: ${audit.summary.valid}\n`
    report += `- À corriger: ${audit.summary.needingFixes}\n`
    report += `- Dates invalides: ${audit.summary.invalidDates}\n`
    report += `- Définitions inconnues: ${audit.summary.unknownDefinitions}\n\n`
    
    if (audit.summary.needingFixes > 0) {
      report += `🚨 CHALLENGES À CORRIGER:\n`
      audit.results.filter(r => r.needsUpdate).forEach((result, index) => {
        report += `${index + 1}. "${result.challenge.title}"\n`
        if (result.dateValidation.errors.length > 0) {
          report += `   Erreurs dates: ${result.dateValidation.errors.join(', ')}\n`
        }
        if (Object.keys(result.suggestedFixes).length > 0) {
          report += `   Corrections suggérées: ${JSON.stringify(result.suggestedFixes, null, 2)}\n`
        }
        report += `\n`
      })
    }
    
    return report
  }
}
