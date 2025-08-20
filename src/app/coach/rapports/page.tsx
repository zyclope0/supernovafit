'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import { FileText, BarChart3, TrendingUp, Users, Calendar, Download, Filter } from 'lucide-react'
import toast from 'react-hot-toast'

export default function RapportsPage() {
  const { userProfile } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userProfile && userProfile.role !== 'coach') {
      toast.error("Accès réservé aux coachs")
      router.push('/')
    }
    if (userProfile) {
      setLoading(false)
    }
  }, [userProfile, router])

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="glass-effect p-6 rounded-xl border border-white/10">
            <div className="animate-pulse">
              <div className="h-4 bg-white/20 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-white/20 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Rapports</h1>
            <p className="text-muted-foreground">
              Analysez les progressions et générez des rapports détaillés
            </p>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-8 h-8 text-neon-purple" />
          </div>
        </div>

        {/* Placeholder Content */}
        <div className="glass-effect p-8 rounded-xl border border-white/10 text-center">
          <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Fonctionnalité en développement</h3>
          <p className="text-muted-foreground mb-6">
            Les rapports d&apos;analyse et de progression seront bientôt disponibles.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="glass-effect p-4 rounded-lg border border-white/10">
              <TrendingUp className="w-8 h-8 text-neon-purple mx-auto mb-2" />
              <h4 className="font-semibold text-white mb-1">Analyses de progression</h4>
              <p className="text-sm text-muted-foreground">
                Suivez l&apos;évolution de vos athlètes
              </p>
            </div>
            
            <div className="glass-effect p-4 rounded-lg border border-white/10">
              <Users className="w-8 h-8 text-neon-cyan mx-auto mb-2" />
              <h4 className="font-semibold text-white mb-1">Rapports d&apos;équipe</h4>
              <p className="text-sm text-muted-foreground">
                Vue d&apos;ensemble de votre équipe
              </p>
            </div>
            
            <div className="glass-effect p-4 rounded-lg border border-white/10">
              <Download className="w-8 h-8 text-neon-green mx-auto mb-2" />
              <h4 className="font-semibold text-white mb-1">Export PDF/CSV</h4>
              <p className="text-sm text-muted-foreground">
                Téléchargez vos rapports
              </p>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => toast('Fonctionnalité à venir', { icon: '🚧' })}
            className="glass-effect rounded-xl p-6 border border-white/10 hover:border-neon-purple/50 
                     transition-all cursor-pointer group text-left"
          >
            <div className="flex items-center gap-4">
              <BarChart3 className="w-12 h-12 text-neon-purple group-hover:scale-110 transition-transform" />
              <div>
                <h3 className="text-lg font-semibold text-white">Rapport Mensuel</h3>
                <p className="text-sm text-gray-400">Générer un rapport de progression</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => toast('Fonctionnalité à venir', { icon: '🚧' })}
            className="glass-effect rounded-xl p-6 border border-white/10 hover:border-neon-cyan/50 
                     transition-all cursor-pointer group text-left"
          >
            <div className="flex items-center gap-4">
              <Filter className="w-12 h-12 text-neon-cyan group-hover:scale-110 transition-transform" />
              <div>
                <h3 className="text-lg font-semibold text-white">Filtres Avancés</h3>
                <p className="text-sm text-gray-400">Personnaliser vos analyses</p>
              </div>
            </div>
          </button>
        </div>

        {/* Types de rapports */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-effect p-4 rounded-lg border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-6 h-6 text-neon-purple" />
              <h4 className="font-semibold text-white">Progression Poids</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Évolution du poids et de la composition corporelle
            </p>
          </div>

          <div className="glass-effect p-4 rounded-lg border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-6 h-6 text-neon-cyan" />
              <h4 className="font-semibold text-white">Fréquence Entraînement</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Analyse de la régularité des entraînements
            </p>
          </div>

          <div className="glass-effect p-4 rounded-lg border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-6 h-6 text-neon-green" />
              <h4 className="font-semibold text-white">Performance</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Évolution des performances et objectifs
            </p>
          </div>

          <div className="glass-effect p-4 rounded-lg border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-6 h-6 text-neon-pink" />
              <h4 className="font-semibold text-white">Comparaison Équipe</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Comparaison entre athlètes
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
