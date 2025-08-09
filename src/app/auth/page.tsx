'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import MainLayout from '@/components/layout/MainLayout'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { signIn, sendMagicLink, user, signOut } = useAuth()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    const result = await signIn(email, password)
    if (result.success) {
      setMessage('Connexion réussie ! 🎉')
    } else {
      setMessage(`Erreur: ${result.error}`)
    }
    setIsLoading(false)
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    const result = await sendMagicLink(email)
    if (result.success) {
      setMessage('Lien magique envoyé ! Vérifiez votre email 📧')
    } else {
      setMessage(`Erreur: ${result.error}`)
    }
    setIsLoading(false)
  }

  const handleSignOut = async () => {
    const result = await signOut()
    if (result.success) {
      setMessage('Déconnexion réussie ! 👋')
    }
  }

  if (user) {
    return (
      <MainLayout>
        <div className="max-w-md mx-auto">
          <div className="glass-effect p-8 rounded-xl border border-white/10">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">✅</div>
              <h1 className="text-2xl font-bold neon-text mb-2">Connecté !</h1>
              <p className="text-muted-foreground">
                Bienvenue {user.email}
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-neon-green/10 rounded-lg border border-neon-green/20">
                <p className="text-sm text-neon-green">
                  🔥 Firebase fonctionne parfaitement !
                </p>
              </div>

              <button
                onClick={handleSignOut}
                className="w-full px-4 py-3 bg-neon-purple/20 text-neon-purple rounded-lg font-medium hover:bg-neon-purple/30 transition-colors"
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-md mx-auto">
        <div className="glass-effect p-8 rounded-xl border border-white/10">
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">🔐</div>
            <h1 className="text-2xl font-bold neon-text mb-2">Authentification</h1>
            <p className="text-muted-foreground">
              Testez la connexion Firebase
            </p>
          </div>

          {message && (
            <div className={`p-4 rounded-lg mb-4 text-sm ${
              message.includes('Erreur') 
                ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                : 'bg-neon-green/10 border border-neon-green/20 text-neon-green'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-muted-foreground focus:border-neon-purple focus:outline-none"
                placeholder="votre@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Mot de passe (pour test)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-muted-foreground focus:border-neon-purple focus:outline-none"
                placeholder="mot de passe"
                required
              />
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-4 py-3 bg-neon-purple/20 text-neon-purple rounded-lg font-medium hover:bg-neon-purple/30 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Connexion...' : 'Se connecter'}
              </button>

              <button
                type="button"
                onClick={handleMagicLink}
                disabled={isLoading || !email}
                className="w-full px-4 py-3 bg-neon-cyan/20 text-neon-cyan rounded-lg font-medium hover:bg-neon-cyan/30 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Envoi...' : 'Envoyer lien magique'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            <p>Test Firebase - Créez un compte dans Firebase Console</p>
          </div>
        </div>
      </div>
    </MainLayout>
  )
} 