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
} from 'recharts'
import { Mesure } from '@/types'
import { formatDate } from '@/lib/utils'
import { Scale } from 'lucide-react'

interface WeightIMCChartProps {
  mesures: Mesure[]
}

// Composant de tooltip personnalisé
import type { TooltipProps } from 'recharts'
const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-effect p-3 rounded-lg border border-white/20 shadow-lg">
        <p className="text-white font-medium">{formatDate(label)}</p>
        {payload.map((entry, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.dataKey === 'poids' && `Poids: ${entry.value} kg`}
            {entry.dataKey === 'imc' && `IMC: ${entry.value}`}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function WeightIMCChart({ mesures }: WeightIMCChartProps) {
  const chartData = useMemo(() => {
    return mesures
      .slice()
      .reverse() // Du plus ancien au plus récent
      .map(mesure => ({
        date: mesure.date,
        poids: mesure.poids || null,
        imc: mesure.imc || null,
      }))
  }, [mesures])

  if (mesures.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <Scale className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground mb-2">Aucune mesure disponible</p>
        <p className="text-sm text-muted-foreground">
          Ajoutez des mesures pour voir l&apos;évolution
        </p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
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
          domain={[25, 'dataMax']}
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
  )
}
