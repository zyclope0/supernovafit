'use client'

import { useState, useEffect } from 'react'
import { collection, doc, setDoc, getDoc, updateDoc, query, where, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Invite, InviteStatus } from '@/types'
import { generateInviteCode, calculateExpirationDate, validateInviteCode } from '@/lib/inviteUtils'
import toast from 'react-hot-toast'
import * as Sentry from '@sentry/nextjs'

/**
 * Hook pour gérer les invitations côté coach
 */
export function useCoachInvites(coachId: string) {
  const [invites, setInvites] = useState<Invite[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  // Écouter les invitations du coach
  useEffect(() => {
    if (!coachId) {
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'invites'),
      where('coachId', '==', coachId),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const invitesData = snapshot.docs.map(doc => ({
        ...doc.data(),
        code: doc.id, // Le code est l'ID du document
        createdAt: doc.data().createdAt?.toDate(),
        expiresAt: doc.data().expiresAt?.toDate(),
        usedAt: doc.data().usedAt?.toDate(),
        revokedAt: doc.data().revokedAt?.toDate()
      })) as Invite[]
      
      setInvites(invitesData)
      setLoading(false)
    }, (error) => {
      // Handle error silently
      setLoading(false)
      Sentry.captureException(error)
    })

    return () => unsubscribe()
  }, [coachId])

  // Générer une nouvelle invitation
  const generateInvite = async (): Promise<string | null> => {
    if (!coachId) return null

    setGenerating(true)
    try {
      // Vérifier le rate limit (5 générations / 10 min)
      const recentInvites = invites.filter(invite => {
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000)
        return invite.createdAt > tenMinutesAgo
      })

      if (recentInvites.length >= 5) {
        toast.error('Limite atteinte : 5 invitations maximum par 10 minutes')
        return null
      }

      const code = generateInviteCode()
      const expiresAt = calculateExpirationDate()

      const inviteData = {
        code,
        coachId,
        createdAt: serverTimestamp(),
        expiresAt,
        status: 'active' as InviteStatus
      }

      // Utiliser le code comme ID du document pour faciliter la récupération
      await setDoc(doc(db, 'invites', code), inviteData)

      // Analytics
      Sentry.addBreadcrumb({
        category: 'invite',
        message: 'Invitation générée',
        data: { coachId, code }
      })

      toast.success('Code d\'invitation généré !')
      return code
    } catch (error) {
      console.error('Erreur lors de la génération de l\'invitation:', error)
      toast.error('Erreur lors de la génération du code')
      Sentry.captureException(error)
      return null
    } finally {
      setGenerating(false)
    }
  }

  // Révoquer une invitation
  const revokeInvite = async (code: string): Promise<boolean> => {
    try {
      const inviteRef = doc(db, 'invites', code)
      await updateDoc(inviteRef, {
        status: 'revoked' as InviteStatus,
        revokedAt: serverTimestamp()
      })

      toast.success('Invitation révoquée')
      return true
    } catch (error) {
      console.error('Erreur lors de la révocation:', error)
      toast.error('Erreur lors de la révocation')
      Sentry.captureException(error)
      return false
    }
  }

  return {
    invites,
    loading,
    generating,
    generateInvite,
    revokeInvite
  }
}

/**
 * Hook pour utiliser une invitation côté athlète
 */
export function useInviteClaim() {
  const [claiming, setClaiming] = useState(false)

  const claimInvite = async (code: string, athleteId: string): Promise<boolean> => {
    if (!validateInviteCode(code)) {
      toast.error('Format de code invalide')
      return false
    }

    setClaiming(true)
    try {
      const inviteRef = doc(db, 'invites', code)
      const inviteDoc = await getDoc(inviteRef)

      if (!inviteDoc.exists()) {
        toast.error('Code d\'invitation invalide')
        return false
      }

      const invite = inviteDoc.data() as Invite

      // Vérifier le statut
      if (invite.status !== 'active') {
        if (invite.status === 'used') {
          toast.error('Ce code a déjà été utilisé')
        } else if (invite.status === 'revoked') {
          toast.error('Ce code a été révoqué')
        }
        return false
      }

      // Vérifier l'expiration
      if (new Date() > new Date(invite.expiresAt)) {
        toast.error('Ce code a expiré')
        return false
      }

      // Vérifier qu'il n'est pas déjà utilisé par cet athlète
      if (invite.usedByAthleteId === athleteId) {
        toast.error('Vous avez déjà utilisé ce code')
        return false
      }

      // Marquer l'invitation comme utilisée
      await updateDoc(inviteRef, {
        status: 'used' as InviteStatus,
        usedByAthleteId: athleteId,
        usedAt: serverTimestamp()
      })

      // Mettre à jour le profil de l'athlète
      const athleteRef = doc(db, 'users', athleteId)
      await updateDoc(athleteRef, {
        ownerCoachId: invite.coachId,
        updated_at: serverTimestamp()
      })

      // Analytics
      Sentry.addBreadcrumb({
        category: 'invite',
        message: 'Invitation utilisée',
        data: { code, athleteId, coachId: invite.coachId }
      })

      toast.success('Invitation acceptée ! Vous êtes maintenant lié à votre coach.')
      return true
    } catch (error) {
      console.error('Erreur lors de l\'utilisation de l\'invitation:', error)
      toast.error('Erreur lors de l\'utilisation du code')
      Sentry.captureException(error)
      return false
    } finally {
      setClaiming(false)
    }
  }

  return {
    claiming,
    claimInvite
  }
}
