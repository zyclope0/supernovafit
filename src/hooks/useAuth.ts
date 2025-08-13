'use client'

import { useState, useEffect } from 'react'
import { 
  User,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { User as UserType } from '@/types'
import * as Sentry from '@sentry/nextjs'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserType | null>(null)
  // loading: état d'auth uniquement (ne bloque plus sur le profil)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      // Marquer l'auth prête immédiatement pour éviter 1-2s de latence sur les pages
      setLoading(false)

      if (firebaseUser) {
        // Configurer contexte Sentry utilisateur
        Sentry.setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email || undefined,
        })
        
        setProfileLoading(true)
        ;(async () => {
          try {
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
            if (userDoc.exists()) {
              const profile = userDoc.data() as UserType
              setUserProfile(profile)
              
              // Enrichir contexte Sentry avec profil
              Sentry.setTag('user_role', profile.role || 'unknown')
              Sentry.setTag('user_type', profile.role === 'coach' ? 'coach' : 'athlete')
            } else {
              const defaultProfile: UserType = {
                id: firebaseUser.uid,
                role: 'sportif',
                nom: firebaseUser.displayName || 'Utilisateur',
                email: firebaseUser.email || '',
                date_invitation: new Date(),
                dernier_acces: new Date()
              }
              await setDoc(doc(db, 'users', firebaseUser.uid), {
                ...defaultProfile,
                date_invitation: serverTimestamp(),
                dernier_acces: serverTimestamp()
              })
              setUserProfile(defaultProfile)
              
              // Tags Sentry pour nouvel utilisateur
              Sentry.setTag('user_role', 'sportif')
              Sentry.setTag('user_type', 'athlete')
            }
          } catch (error) {
            console.error('Erreur lors de la récupération du profil:', error)
            Sentry.captureException(error)
          } finally {
            setProfileLoading(false)
          }
        })()
      } else {
        setUserProfile(null)
        setProfileLoading(false)
        
        // Clear contexte Sentry
        Sentry.setUser(null)
      }
    })

    return () => unsubscribe()
  }, [])

  // Connexion par lien magique
  const sendMagicLink = async (email: string) => {
    const actionCodeSettings = {
      url: `${window.location.origin}/auth/verify`,
      handleCodeInApp: true,
    }

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings)
      // Sauvegarder l&apos;email pour la vérification
      window.localStorage.setItem('emailForSignIn', email)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // Vérifier et compléter la connexion par lien magique
  const verifyMagicLink = async () => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let email = window.localStorage.getItem('emailForSignIn')
      if (!email) {
        email = window.prompt('Veuillez confirmer votre email pour la connexion')
      }

      if (email) {
        try {
          await signInWithEmailLink(auth, email, window.location.href)
          window.localStorage.removeItem('emailForSignIn')
          return { success: true }
        } catch (error: any) {
          return { success: false, error: error.message }
        }
      }
    }
    return { success: false, error: 'Lien invalide' }
  }

  // Connexion classique (pour les tests)
  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // Déconnexion
  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  return {
    user,
    userProfile,
    loading,
    profileLoading,
    sendMagicLink,
    verifyMagicLink,
    signIn,
    signOut
  }
} 