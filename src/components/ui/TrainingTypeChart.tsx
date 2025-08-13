'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Entrainement } from '@/types'

interface TrainingTypeChartProps {
  entrainements: Entrainement[]
  title: string
}

const TYPE_COLORS = {
  'cardio': '#10b981',      // green
  'musculation': '#06b6d4', // cyan  
  'course': '#ec4899',      // pink
  'hiit': '#f59e0b',        // amber
  'cyclisme': '#8b5cf6',    // violet
  'natation': '#06b6d4',    // cyan
  'yoga': '#a855f7',        // purple
  'autre': '#6b7280'        // gray
}

const TYPE_EMOJIS = {
  'cardio': '🏃',
  'musculation': '💪',
  'course': '🏃‍♂️',
  'hiit': '🔥',
  'cyclisme': '🚴',
  'natation': '🏊',
  'yoga': '🧘',
  'autre': '⚡'
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="glass-effect p-3 rounded-lg border border-white/10 text-sm text-white">
        <p className="font-bold mb-1">
          {TYPE_EMOJIS[data.type as keyof typeof TYPE_EMOJIS] || '⚡'} {data.name}
        </p>
        <p>{`Séances: ${data.count} (${data.percentage}%)`}</p>
        <p>{`Durée totale: ${data.totalDuration} min`}</p>
        <p className="text-muted-foreground text-xs">{`${data.totalCalories} kcal brûlées`}</p>
      </div>
    )
  }
  return null
}

export default function TrainingTypeChart({ entrainements, title }: TrainingTypeChartProps) {
  // Grouper par type
  const typeStats = entrainements.reduce((acc, training) => {
    const type = training.type
    if (!acc[type]) {
      acc[type] = {
        count: 0,
        totalDuration: 0,
        totalCalories: 0
      }
    }
    acc[type].count += 1
    acc[type].totalDuration += training.duree
    acc[type].totalCalories += training.calories || 0
    return acc
  }, {} as Record<string, { count: number; totalDuration: number; totalCalories: number }>)

  const totalSessions = entrainements.length
  const data = Object.entries(typeStats).map(([type, stats]) => ({
    type,
    name: type.charAt(0).toUpperCase() + type.slice(1),
    count: stats.count,
    totalDuration: stats.totalDuration,
    totalCalories: stats.totalCalories,
    percentage: totalSessions > 0 ? ((stats.count / totalSessions) * 100).toFixed(1) : 0,
  })).sort((a, b) => b.count - a.count)

  if (data.length === 0) {
    return (
      <div className="glass-effect p-6 rounded-xl border border-white/10">
        <h2 className="text-lg font-semibold text-white mb-4">{title}</h2>
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-muted-foreground">Aucun entraînement disponible</p>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-effect p-6 rounded-xl border border-white/10">
      <h2 className="text-lg font-semibold text-white mb-4">{title}</h2>
      
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            dataKey="count"
            labelLine={false}
            label={({ name, percentage }) => `${name} ${percentage}%`}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={TYPE_COLORS[entry.type as keyof typeof TYPE_COLORS] || '#6b7280'} 
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Légende personnalisée */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        {data.map((entry) => (
          <div key={entry.type} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: TYPE_COLORS[entry.type as keyof typeof TYPE_COLORS] || '#6b7280' }}
            />
            <span className="text-white">
              {TYPE_EMOJIS[entry.type as keyof typeof TYPE_EMOJIS] || '⚡'} {entry.name}
            </span>
            <span className="text-muted-foreground ml-auto">
              {entry.count}x
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}