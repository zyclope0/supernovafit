'use client'

import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  // BarChart, Bar, PieChart, Pie, Cell - removed (not used)
} from 'recharts'
import { Mesure } from '@/types'
import { formatDate } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus, Scale, Ruler, Heart, Target } from 'lucide-react'

interface MesuresChartsProps {
  mesures: Mesure[]
}

// Composant de tooltip personnalisé
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-effect p-3 rounded-lg border border-white/20 shadow-lg">
        <p className="text-white font-medium">{formatDate(label)}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.dataKey === 'poids' && `Poids: ${entry.value} kg`}
            {entry.dataKey === 'imc' && `IMC: ${entry.value}`}
            {entry.dataKey === 'masse_grasse' && `Masse grasse: ${entry.value}%`}
            {entry.dataKey === 'masse_musculaire' && `Masse musculaire: ${entry.value}%`}
            {entry.dataKey === 'tour_taille' && `Tour de taille: ${entry.value} cm`}
            {entry.dataKey === 'tour_hanches' && `Tour de hanches: ${entry.value} cm`}
            {entry.dataKey === 'tour_bras' && `Tour de bras: ${entry.value} cm`}
            {entry.dataKey === 'tour_cuisses' && `Tour de cuisses: ${entry.value} cm`}
          </p>
        ))}
      </div>
    )
  }
  return null
}

// Composant de statistique avec tendance
function StatCard({ title, value, unit, trend, icon: Icon, color = 'neon-cyan' }: {
  title: string
  value: number | string
  unit?: string
  trend?: number
  icon: any
  color?: string
}) {
  const getTrendIcon = () => {
    if (!trend || trend === 0) return <Minus className="h-4 w-4 text-gray-400" />
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-400" />
    return <TrendingDown className="h-4 w-4 text-red-400" />
  }

  const getTrendColor = () => {
    if (!trend || trend === 0) return 'text-gray-400'
    if (trend > 0) return 'text-green-400'
    return 'text-red-400'
  }

  return (
    <div className="glass-effect p-4 rounded-lg border border-white/10 hover:border-white/20 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg bg-${color}/20`}>
          <Icon className={`h-5 w-5 text-${color}`} />
        </div>
        <div className="flex items-center gap-1">
          {getTrendIcon()}
          {trend !== undefined && (
            <span className={`text-sm ${getTrendColor()}`}>
              {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
            </span>
          )}
        </div>
      </div>
      <div>
        <h3 className="text-sm text-muted-foreground">{title}</h3>
        <p className="text-xl font-bold text-white">
          {value} {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
        </p>
      </div>
    </div>
  )
}

export default function MesuresCharts({ mesures }: MesuresChartsProps) {
  const chartData = useMemo(() => {
    return mesures
      .slice()
      .reverse() // Du plus ancien au plus récent pour les graphiques
      .map(mesure => ({
        date: mesure.date,
        poids: mesure.poids || null,
        imc: mesure.imc || null,
        masse_grasse: mesure.masse_grasse || null,
        masse_musculaire: mesure.masse_musculaire || null,
        tour_taille: mesure.tour_taille || null,
        tour_hanches: mesure.tour_hanches || null,
        tour_bras: mesure.tour_bras || null,
        tour_cuisses: mesure.tour_cuisses || null,
        tour_cou: mesure.tour_cou || null,
        tour_poitrine: mesure.tour_poitrine || null
      }))
  }, [mesures])

  // Calcul des tendances (dernières 2 mesures)
  const tendances = useMemo(() => {
    if (mesures.length < 2) return {}
    
    const derniere = mesures[0]
    const precedente = mesures[1]
    
    const calculerTendance = (nouvelleValeur?: number, ancienneValeur?: number) => {
      if (!nouvelleValeur || !ancienneValeur) return undefined
      return ((nouvelleValeur - ancienneValeur) / ancienneValeur) * 100
    }

    return {
      poids: calculerTendance(derniere.poids, precedente.poids),
      imc: calculerTendance(derniere.imc, precedente.imc),
      masse_grasse: calculerTendance(derniere.masse_grasse, precedente.masse_grasse),
      masse_musculaire: calculerTendance(derniere.masse_musculaire, precedente.masse_musculaire),
      tour_taille: calculerTendance(derniere.tour_taille, precedente.tour_taille)
    }
  }, [mesures])

  // Données pour le graphique en secteurs IMC
  const imcData = useMemo(() => {
    if (!mesures[0]?.imc) return []
    
    const imc = mesures[0].imc
    let categorie = ''
    let couleur = ''
    
    if (imc < 18.5) { categorie = 'Sous-poids'; couleur = '#06b6d4' }
    else if (imc < 25) { categorie = 'Normal'; couleur = '#10b981' }
    else if (imc < 30) { categorie = 'Surpoids'; couleur = '#f59e0b' }
    else { categorie = 'Obésité'; couleur = '#ef4444' }

    return [
      { name: categorie, value: imc, fill: couleur }
    ]
  }, [mesures])

  if (mesures.length === 0) {
    return (
      <div className="text-center py-12">
        <Scale className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Aucune mesure disponible pour les graphiques</p>
      </div>
    )
  }

  const dernieresMesures = mesures[0]

  return (
    <div className="space-y-6">
      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Poids actuel"
          value={dernieresMesures.poids || 'N/A'}
          unit="kg"
          trend={tendances.poids}
          icon={Scale}
          color="neon-cyan"
        />
        <StatCard
          title="IMC"
          value={dernieresMesures.imc?.toFixed(1) || 'N/A'}
          trend={tendances.imc}
          icon={Target}
          color="neon-green"
        />
        <StatCard
          title="Masse grasse"
          value={dernieresMesures.masse_grasse || 'N/A'}
          unit="%"
          trend={tendances.masse_grasse}
          icon={Heart}
          color="neon-purple"
        />
        <StatCard
          title="Tour de taille"
          value={dernieresMesures.tour_taille || 'N/A'}
          unit="cm"
          trend={tendances.tour_taille}
          icon={Ruler}
          color="neon-pink"
        />
      </div>

      {/* Graphique Poids et IMC */}
      <div className="glass-effect p-6 rounded-lg border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Scale className="h-5 w-5 text-neon-cyan" />
          Évolution Poids & IMC
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis 
              dataKey="date" 
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
            />
            <YAxis 
              yAxisId="poids"
              stroke="#06b6d4"
              tick={{ fill: '#06b6d4', fontSize: 12 }}
              width={50}
              tickFormatter={(v: number) => String(Math.round(v as number))}
              label={{ value: 'kg', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#06b6d4' } }}
            />
            <YAxis 
              yAxisId="imc"
              orientation="right"
              stroke="#10b981"
              tick={{ fill: '#10b981', fontSize: 12 }}
              width={36}
              tickFormatter={(v: number) => String(Math.round((v as number) * 10) / 10)}
              label={{ value: 'IMC', angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fill: '#10b981' } }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              yAxisId="poids"
              type="monotone"
              dataKey="poids"
              stroke="#06b6d4"
              strokeWidth={3}
              dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4 }}
              connectNulls={false}
            />
            <Line
              yAxisId="imc"
              type="monotone"
              dataKey="imc"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Graphique Composition corporelle */}
      <div className="glass-effect p-6 rounded-lg border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Heart className="h-5 w-5 text-neon-purple" />
          Composition Corporelle
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis 
              dataKey="date" 
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
            />
            <YAxis 
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              label={{ value: 'Pourcentage (%)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#9ca3af' } }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="masse_grasse"
              stackId="1"
              stroke="#a855f7"
              fill="#a855f7"
              fillOpacity={0.6}
              connectNulls={false}
            />
            <Area
              type="monotone"
              dataKey="masse_musculaire"
              stackId="1"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.6}
              connectNulls={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Graphique Mensurations */}
      <div className="glass-effect p-6 rounded-lg border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Ruler className="h-5 w-5 text-neon-pink" />
          Évolution des Mensurations
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis 
              dataKey="date" 
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
            />
            <YAxis 
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              label={{ value: 'Centimètres (cm)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#9ca3af' } }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="tour_taille"
              stroke="#ec4899"
              strokeWidth={2}
              dot={{ fill: '#ec4899', strokeWidth: 2, r: 3 }}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="tour_hanches"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ fill: '#f59e0b', strokeWidth: 2, r: 3 }}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="tour_bras"
              stroke="#06b6d4"
              strokeWidth={2}
              dot={{ fill: '#06b6d4', strokeWidth: 2, r: 3 }}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="tour_cuisses"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
        {/* Légende */}
        <div className="flex flex-wrap gap-4 mt-4 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-neon-pink rounded-full"></div>
            <span className="text-sm text-muted-foreground">Tour de taille</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-sm text-muted-foreground">Tour de hanches</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-neon-cyan rounded-full"></div>
            <span className="text-sm text-muted-foreground">Tour de bras</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-neon-green rounded-full"></div>
            <span className="text-sm text-muted-foreground">Tour de cuisses</span>
          </div>
        </div>
      </div>
    </div>
  )
}