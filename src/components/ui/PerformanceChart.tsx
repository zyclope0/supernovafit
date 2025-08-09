'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Entrainement } from '@/types'

interface PerformanceChartProps {
  entrainements: Entrainement[]
  metric: 'vitesse' | 'calories_per_min' | 'distance'
  title: string
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="glass-effect p-3 rounded-lg border border-white/10 text-sm text-white">
        <p className="font-bold mb-1">{format(parseISO(label), 'EEEE d MMMM', { locale: fr })}</p>
        <p className="text-neon-cyan">{`${data.type} - ${data.duree}min`}</p>
        {data.vitesse && <p className="text-neon-green">{`Vitesse: ${data.vitesse} km/h`}</p>}
        {data.distance && <p className="text-neon-pink">{`Distance: ${data.distance} km`}</p>}
        {data.calories_per_min && <p className="text-neon-purple">{`Intensité: ${data.calories_per_min} kcal/min`}</p>}
        {data.fc_moyenne && <p className="text-red-400">{`FC moy: ${data.fc_moyenne} bpm`}</p>}
      </div>
    )
  }
  return null
}

export default function PerformanceChart({ entrainements, metric, title }: PerformanceChartProps) {
  // Filtrer et préparer les données selon la métrique
  const performanceData = entrainements
    .filter(e => {
      switch (metric) {
        case 'vitesse':
          return e.vitesse_moy && e.vitesse_moy > 0
        case 'calories_per_min':
          return e.calories && e.calories > 0 && e.duree > 0
        case 'distance':
          return e.distance && e.distance > 0
        default:
          return false
      }
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(e => {
      const baseData = {
        date: e.date,
        type: e.type,
        duree: e.duree,
        fc_moyenne: e.fc_moyenne,
        vitesse: e.vitesse_moy,
        distance: e.distance,
        calories_per_min: e.calories && e.duree > 0 ? Math.round((e.calories / e.duree) * 10) / 10 : null
      }
      
      return {
        ...baseData,
        value: metric === 'vitesse' ? e.vitesse_moy : 
               metric === 'calories_per_min' ? baseData.calories_per_min :
               metric === 'distance' ? e.distance : 0
      }
    })
    .filter(d => d.value != null && (typeof d.value === 'number') && d.value > 0)

  if (performanceData.length === 0) {
    const emptyMessages = {
      vitesse: 'Ajoutez la vitesse ou distance dans les données avancées !',
      calories_per_min: 'Ajoutez des calories pour voir l\'intensité !',
      distance: 'Ajoutez la distance parcourue !'
    }

    return (
      <div className="glass-effect p-6 rounded-xl border border-white/10">
        <h2 className="text-lg font-semibold text-white mb-4">{title}</h2>
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📈</div>
          <p className="text-muted-foreground">
            Aucune donnée disponible.
            <br />
            {emptyMessages[metric]}
          </p>
        </div>
      </div>
    )
  }

  const getUnit = () => {
    switch (metric) {
      case 'vitesse': return 'km/h'
      case 'calories_per_min': return 'kcal/min'
      case 'distance': return 'km'
      default: return ''
    }
  }

  const getColor = () => {
    switch (metric) {
      case 'vitesse': return '#10b981'
      case 'calories_per_min': return '#a855f7'
      case 'distance': return '#ec4899'
      default: return '#06b6d4'
    }
  }

  const average = performanceData.length > 0
    ? performanceData.reduce((sum, d) => sum + (d.value as number), 0) / performanceData.length
    : 0

  return (
    <div className="glass-effect p-6 rounded-xl border border-white/10">
      <h2 className="text-lg font-semibold text-white mb-4">
        {title}
        <span className="text-sm text-muted-foreground ml-2">
          (Moyenne: {Math.round(average * 10) / 10} {getUnit()})
        </span>
      </h2>
      
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={performanceData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" />
          <XAxis
            dataKey="date"
            tickFormatter={(tick) => format(parseISO(tick), 'dd/MM', { locale: fr })}
            stroke="#ffffff80"
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#ffffff80"
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value} ${getUnit()}`}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* Ligne de moyenne */}
          <Line
            type="linear"
            dataKey={() => average}
            stroke="#ffffff40"
            strokeWidth={1}
            strokeDasharray="10 5"
            dot={false}
            legendType="none"
          />
          
          {/* Ligne de performance */}
          <Line
            type="monotone"
            dataKey="value"
            stroke={getColor()}
            strokeWidth={3}
            dot={{ stroke: getColor(), strokeWidth: 2, r: 4, fill: getColor() }}
            activeDot={{ stroke: getColor(), strokeWidth: 3, r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}