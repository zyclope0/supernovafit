'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { format, subWeeks, startOfWeek, endOfWeek } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Entrainement } from '@/types'

interface TrainingVolumeChartProps {
  entrainements: Entrainement[]
  weeks: number
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload // Accéder aux données complètes
    return (
      <div className="glass-effect p-3 rounded-lg border border-white/10 text-sm text-white">
        <p className="font-bold mb-1">{label}</p>
        <p className="text-neon-green">{`Séances: ${data.seances}`}</p>
        <p className="text-neon-cyan">{`Durée: ${data.duree} min`}</p>
        <p className="text-neon-pink">{`Calories: ${data.calories} kcal`}</p>
      </div>
    )
  }
  return null
}

export default function TrainingVolumeChart({ entrainements, weeks }: TrainingVolumeChartProps) {
  const data = []
  const today = new Date()

  // Générer les données pour les X dernières semaines
  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = startOfWeek(subWeeks(today, i), { weekStartsOn: 1 }) // Lundi
    const weekEnd = endOfWeek(subWeeks(today, i), { weekStartsOn: 1 }) // Dimanche
    
    const weekStartStr = format(weekStart, 'yyyy-MM-dd')
    const weekEndStr = format(weekEnd, 'yyyy-MM-dd')
    
    // Filtrer les entraînements de cette semaine
    const weekTrainings = entrainements.filter(e => 
      e.date >= weekStartStr && e.date <= weekEndStr
    )
    
    const totalDuration = weekTrainings.reduce((sum, e) => sum + e.duree, 0)
    const totalCalories = weekTrainings.reduce((sum, e) => sum + (e.calories || 0), 0)
    
    data.push({
      week: format(weekStart, "'S'w", { locale: fr }),
      fullDate: format(weekStart, 'dd/MM', { locale: fr }),
      seances: weekTrainings.length,
      duree: totalDuration,
      calories: totalCalories
    })
  }

  return (
    <div className="glass-effect p-6 rounded-xl border border-white/10">
      <h2 className="text-lg font-semibold text-white mb-4">
        Volume d'entraînement ({weeks} semaines)
      </h2>
      
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" />
          <XAxis
            dataKey="week"
            stroke="#ffffff80"
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#ffffff80"
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          
          <Bar
            dataKey="seances"
            fill="url(#colorSeances)"
            radius={[2, 2, 0, 0]}
            name="Séances"
          />
          <Bar
            dataKey="duree"
            fill="url(#colorDuree)"
            radius={[2, 2, 0, 0]}
            name="Durée (min)"
          />
          
          <defs>
            <linearGradient id="colorSeances" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.3}/>
            </linearGradient>
            <linearGradient id="colorDuree" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.3}/>
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}