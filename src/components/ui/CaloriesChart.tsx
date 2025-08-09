'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Repas } from '@/types'
import { format, subDays, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'

interface CaloriesChartProps {
  repas: Repas[]
  days?: number
}

export default function CaloriesChart({ repas, days = 7 }: CaloriesChartProps) {
  // Générer les données pour les X derniers jours
  const generateChartData = () => {
    const data = []
    const today = new Date()
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(today, i)
      const dateStr = format(date, 'yyyy-MM-dd')
      const dayName = format(date, 'EEE', { locale: fr })
      
      // Calculer les calories du jour
      const dayMeals = repas.filter(r => r.date === dateStr)
      const calories = dayMeals.reduce((total, meal) => total + (meal.macros?.kcal || 0), 0)
      
      data.push({
        date: dateStr,
        day: dayName,
        calories: Math.round(calories),
        fullDate: format(date, 'dd MMM', { locale: fr })
      })
    }
    
    return data
  }

  const data = generateChartData()
  const maxCalories = Math.max(...data.map(d => d.calories))
  const avgCalories = Math.round(data.reduce((sum, d) => sum + d.calories, 0) / data.length)

  // Tooltip personnalisé
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="glass-effect p-3 rounded-lg border border-white/20 bg-space-800/95">
          <p className="text-white font-medium">{data.fullDate}</p>
          <p className="text-neon-green">
            {payload[0].value} kcal
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="glass-effect p-6 rounded-xl border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Évolution des calories</h2>
          <p className="text-sm text-muted-foreground">
            Moyenne : {avgCalories} kcal/jour
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-neon-green">{data[data.length - 1]?.calories || 0}</div>
          <div className="text-xs text-muted-foreground">Aujourd'hui</div>
        </div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <defs>
              <linearGradient id="caloriesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="day" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              domain={[0, maxCalories * 1.1]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="calories" 
              stroke="#10b981"
              strokeWidth={3}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#0a0e1a' }}
              fill="url(#caloriesGradient)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {data.every(d => d.calories === 0) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-muted-foreground text-center">
            Aucune donnée nutritionnelle<br />
            <span className="text-sm">Ajoutez des repas pour voir l'évolution</span>
          </p>
        </div>
      )}
    </div>
  )
}