'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter, useParams } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import { ArrowLeft, TrendingUp, TrendingDown, Calendar, Activity, Scale, Camera } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts'

// Données mockées pour l'exemple
const MOCK_ATHLETE_DATA = {
  stats: {
    calories_jour: 2150,
    proteines_jour: 165,
    entrainements_semaine: 4,
    poids_actuel: 78.5,
    variation_poids: -2.3,
    variation_perf: 15
  },
  evolution_poids: [
    { date: '01/01', poids: 80.8 },
    { date: '08/01', poids: 80.2 },
    { date: '15/01', poids: 79.5 },
    { date: '22/01', poids: 78.5 }
  ],
  activites_recentes: [
    { date: '2025-01-17', type: 'Musculation', duree: 75, calories: 450 },
    { date: '2025-01-16', type: 'Course', duree: 45, calories: 520 },
    { date: '2025-01-14', type: 'HIIT', duree: 30, calories: 380 }
  ],
  nutrition_semaine: [
    { jour: 'Lun', calories: 2100, proteines: 160 },
    { jour: 'Mar', calories: 2250, proteines: 175 },
    { jour: 'Mer', calories: 2050, proteines: 155 },
    { jour: 'Jeu', calories: 2300, proteines: 180 },
    { jour: 'Ven', calories: 2150, proteines: 165 },
    { jour: 'Sam', calories: 2400, proteines: 170 },
    { jour: 'Dim', calories: 2100, proteines: 160 }
  ]
}

export default function AthleteDetailPage() {
  const { userProfile } = useAuth()
  const router = useRouter()
  const params = useParams()
  const athleteId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [athleteData, setAthleteData] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'nutrition' | 'training' | 'measures'>('overview')

  useEffect(() => {
    // Vérifier que l'utilisateur est bien un coach
    if (userProfile && userProfile.role !== 'coach') {
      toast.error("Accès réservé aux coachs")
      router.push('/')
      return
    }

    // Simuler le chargement des données
    if (userProfile) {
      setTimeout(() => {
        setAthleteData({
          id: athleteId,
          nom: 'Jean Dupont',
          email: 'jean@example.com',
          objectif: 'Perte de poids',
          ...MOCK_ATHLETE_DATA
        })
        setLoading(false)
      }, 500)
    }
  }, [userProfile, router, athleteId])

  if (loading || !athleteData) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-purple"></div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header avec retour */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/coach"
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">{athleteData.nom}</h1>
              <p className="text-gray-400">{athleteData.email} • Objectif : {athleteData.objectif}</p>
            </div>
          </div>
          <button className="btn-primary">
            Envoyer un message
          </button>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-effect rounded-xl p-4 border border-white/10">
            <p className="text-sm text-gray-400">Calories/jour</p>
            <p className="text-2xl font-bold text-white">{athleteData.stats.calories_jour}</p>
            <p className="text-xs text-neon-green mt-1">Objectif : 2200</p>
          </div>
          
          <div className="glass-effect rounded-xl p-4 border border-white/10">
            <p className="text-sm text-gray-400">Protéines/jour</p>
            <p className="text-2xl font-bold text-white">{athleteData.stats.proteines_jour}g</p>
            <p className="text-xs text-neon-cyan mt-1">1.8g/kg</p>
          </div>
          
          <div className="glass-effect rounded-xl p-4 border border-white/10">
            <p className="text-sm text-gray-400">Poids actuel</p>
            <p className="text-2xl font-bold text-white">{athleteData.stats.poids_actuel} kg</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingDown className="w-3 h-3 text-neon-green" />
              <p className="text-xs text-neon-green">{athleteData.stats.variation_poids}%</p>
            </div>
          </div>
          
          <div className="glass-effect rounded-xl p-4 border border-white/10">
            <p className="text-sm text-gray-400">Performances</p>
            <p className="text-2xl font-bold text-white">+{athleteData.stats.variation_perf}%</p>
            <p className="text-xs text-neon-pink mt-1">vs mois dernier</p>
          </div>
        </div>

        {/* Tabs de navigation */}
        <div className="flex gap-2 p-1 bg-white/5 rounded-lg">
          {[
            { id: 'overview', label: 'Vue d\'ensemble' },
            { id: 'nutrition', label: 'Nutrition' },
            { id: 'training', label: 'Entraînements' },
            { id: 'measures', label: 'Mesures' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2 px-4 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-neon-purple/20 text-neon-purple border border-neon-purple'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contenu selon l'onglet actif */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Évolution du poids */}
            <div className="glass-effect rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Scale className="w-5 h-5 text-neon-purple" />
                Évolution du poids
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={athleteData.evolution_poids}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                    labelStyle={{ color: '#9CA3AF' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="poids" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ fill: '#10b981' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Activités récentes */}
            <div className="glass-effect rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-neon-cyan" />
                Activités récentes
              </h3>
              <div className="space-y-3">
                {athleteData.activites_recentes.map((activite: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{activite.type}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(activite.date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-white">{activite.duree} min</p>
                      <p className="text-xs text-neon-green">{activite.calories} kcal</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'nutrition' && (
          <div className="glass-effect rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">
              Suivi nutritionnel hebdomadaire
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={athleteData.nutrition_semaine}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="jour" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#9CA3AF' }}
                />
                <Legend />
                <Bar dataKey="calories" fill="#a855f7" name="Calories" />
                <Bar dataKey="proteines" fill="#06b6d4" name="Protéines (g)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Actions rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="glass-effect rounded-xl p-4 border border-white/10 hover:border-neon-purple/50 
                           transition-all text-left group">
            <Calendar className="w-8 h-8 text-neon-purple mb-2 group-hover:scale-110 transition-transform" />
            <h4 className="text-white font-medium">Créer un programme</h4>
            <p className="text-xs text-gray-400">Personnalisé pour cet athlète</p>
          </button>

          <button className="glass-effect rounded-xl p-4 border border-white/10 hover:border-neon-cyan/50 
                           transition-all text-left group">
            <TrendingUp className="w-8 h-8 text-neon-cyan mb-2 group-hover:scale-110 transition-transform" />
            <h4 className="text-white font-medium">Générer un rapport</h4>
            <p className="text-xs text-gray-400">Analyse détaillée</p>
          </button>

          <button className="glass-effect rounded-xl p-4 border border-white/10 hover:border-neon-green/50 
                           transition-all text-left group">
            <Camera className="w-8 h-8 text-neon-green mb-2 group-hover:scale-110 transition-transform" />
            <h4 className="text-white font-medium">Voir les photos</h4>
            <p className="text-xs text-gray-400">Progression visuelle</p>
          </button>
        </div>
      </div>
    </MainLayout>
  )
}
