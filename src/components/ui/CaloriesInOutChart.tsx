'use client'

import React, { useMemo } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'

interface CaloriesInOutChartProps {
  repas: Array<{ date: string; macros?: { kcal?: number } }>
  entrainements: Array<{ date: string; calories?: number }>
  days?: number
  tdee?: number // Total Daily Energy Expenditure (maintenance)
}

export default function CaloriesInOutChart({ repas, entrainements, days = 7, tdee }: CaloriesInOutChartProps) {
  const data = useMemo(() => {
    const today = new Date()
    const dates: string[] = []
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      dates.push(d.toISOString().split('T')[0])
    }

    const inByDate = new Map<string, number>()
    const outByDate = new Map<string, number>()

    repas.forEach((r) => {
      const kcal = r.macros?.kcal || 0
      inByDate.set(r.date, (inByDate.get(r.date) || 0) + kcal)
    })
    entrainements.forEach((e) => {
      const cals = e.calories || 0
      outByDate.set(e.date, (outByDate.get(e.date) || 0) + cals)
    })

    return dates.map((d) => ({
      date: new Date(d).toLocaleDateString('fr-FR', { weekday: 'short' }),
      in: inByDate.get(d) || 0,
      outTDEE: tdee || 0,
      outSport: outByDate.get(d) || 0,
    }))
  }, [repas, entrainements, days, tdee])

  return (
    <div className="glass-effect p-6 rounded-xl border border-white/10">
      <h3 className="text-lg font-semibold text-white mb-4">Calories In/Out (7 jours)</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: 8, right: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} />
            <Tooltip
              contentStyle={{ background: 'rgba(15,23,42,0.97)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10 }}
              formatter={(value) => [`${value} kcal`, '']}
            />
            <Bar dataKey="in" name="Consommées" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="outTDEE" name="Dépenses base (TDEE)" stackId="out" fill="#60a5fa" />
            <Bar dataKey="outSport" name="Dépenses sport" stackId="out" fill="#ec4899" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}


