'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import MainLayout from '@/components/layout/MainLayout'
import { LogIn, Mail, KeyRound, Info } from 'lucide-react'
import Link from 'next/link'

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
          <div id="comptes-de-test" className="glass-effect p-8 rounded-xl border border-white/10">
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
            <div className="mt-6 text-center text-xs">
              <Link href="/guide" className="inline-flex items-center gap-1 text-neon-cyan hover:underline">
                <Info className="h-4 w-4" /> Guide complet de l’application
              </Link>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Connexion */}
          <div className="glass-effect p-8 rounded-xl border border-white/10">
          <div className="text-center mb-6">
              <LogIn className="h-8 w-8 mx-auto mb-3 text-neon-purple" />
              <h1 className="text-2xl font-bold neon-text mb-2">Connexion</h1>
              <p className="text-muted-foreground">Accédez à votre espace</p>
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
                Mot de passe (test)
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
          </div>

          {/* Comptes de test + Guide */}
          <div className="glass-effect p-8 rounded-xl border border-white/10">
            <div className="mb-4">
              <Mail className="h-6 w-6 text-neon-cyan" />
              <h2 className="mt-2 text-lg font-semibold text-white">Comptes de test</h2>
              <p className="text-xs text-muted-foreground">Utilisez ces identifiants pour explorer l&apos;app</p>
            </div>

            <div className="space-y-3 text-sm">
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">Coach</div>
                    <div className="text-muted-foreground">coach@supernovafit.com</div>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <KeyRound className="h-4 w-4" /> <span>Coach123!</span>
                  </div>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">Sportif</div>
                    <div className="text-muted-foreground">test@supernovafit.com</div>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <KeyRound className="h-4 w-4" /> <span>Test123!</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-neon-purple" />
                <h3 className="text-white font-semibold">Guide rapide</h3>
              </div>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground list-disc list-inside">
                <li><span className="text-white">Diète</span>: ajoutez des repas, utilisez les <em>menu‑types</em>, voyez les recommandations coach et messages du jour.</li>
                <li><span className="text-white">Entraînements</span>: créez/éditez vos séances, import Garmin, graphiques (volume, FC, perf).</li>
                <li><span className="text-white">Mesures & Photos</span>: enregistrez vos mesures, comparez vos photos avant/après.</li>
                <li><span className="text-white">Journal</span>: notez humeur/énergie, ajoutez des photos libres, suivez les objectifs et badges.</li>
                <li><span className="text-white">Commentaires coach</span>: visibles dans chaque module à la date ou l’élément concerné; marquez comme lus.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
} 