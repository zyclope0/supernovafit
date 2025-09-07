'use client'

import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts'

interface DynamicLineChartProps {
  data: Array<{ date: string; poids: number }>
}

export default function DynamicLineChart({ data }: DynamicLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
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
  )
}
