'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface DynamicBarChartProps {
  data: Array<{ jour: string; calories: number; proteines: number }>;
}

export default function DynamicBarChart({ data }: DynamicBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="jour" stroke="#9CA3AF" />
        <YAxis stroke="#9CA3AF" />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1F2937',
            border: 'none',
            borderRadius: '8px',
          }}
          labelStyle={{ color: '#9CA3AF' }}
        />
        <Legend />
        <Bar dataKey="calories" fill="#a855f7" name="Calories" />
        <Bar dataKey="proteines" fill="#06b6d4" name="Protéines (g)" />
      </BarChart>
    </ResponsiveContainer>
  );
}
