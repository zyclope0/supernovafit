'use client';

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from 'recharts';
import { Entrainement } from '@/types';
import {
  prepareTrainingVolumeData,
  calculateAverageDuration,
} from '@/lib/chartDataTransformers';

interface TrainingVolumeChartProps {
  entrainements: Entrainement[];
  weeks: number;
}

import type { TooltipProps } from 'recharts';
const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<string | number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload; // Accéder aux données complètes
    return (
      <div className="glass-effect p-3 rounded-lg border border-white/10 text-sm text-white">
        <p className="font-bold mb-1">{label}</p>
        <p className="text-neon-green">{`Séances: ${data.seances}`}</p>
        <p className="text-neon-cyan">{`Durée: ${data.duree} min`}</p>
        <p className="text-neon-pink">{`Calories: ${data.calories} kcal`}</p>
      </div>
    );
  }
  return null;
};

export default function TrainingVolumeChart({
  entrainements,
  weeks,
}: TrainingVolumeChartProps) {
  // ✅ Logique déléguée aux fonctions pures (testable à 80%+)
  const data = prepareTrainingVolumeData(entrainements, weeks);
  const avgDuration = calculateAverageDuration(data);

  return (
    <div className="glass-effect p-6 rounded-xl border border-white/10">
      <h2 className="text-lg font-semibold text-white mb-4">
        Volume d&apos;entraînement ({weeks} semaines)
      </h2>

      <ResponsiveContainer width="100%" height={250}>
        <ComposedChart
          data={data}
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" />
          <XAxis
            dataKey="week"
            stroke="#ffffff80"
            tickLine={false}
            axisLine={false}
          />
          {/* Y gauche: minutes */}
          <YAxis
            yAxisId="left"
            stroke="#ffffff80"
            tickLine={false}
            axisLine={false}
            width={52}
            tickFormatter={(v) => `${Math.round(Number(v))}`}
            label={{
              value: 'min',
              angle: -90,
              position: 'insideLeft',
              style: { fill: 'rgba(255,255,255,0.6)' },
            }}
          />
          {/* Y droite: séances */}
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#ffffff80"
            tickLine={false}
            axisLine={false}
            width={36}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.7)' }} />

          {/* Durée: ligne (gauche) */}
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="duree"
            name="Durée (min)"
            stroke="#06b6d4"
            strokeWidth={3}
            dot={{ r: 3, fill: '#06b6d4' }}
          />
          <ReferenceLine
            yAxisId="left"
            y={avgDuration}
            stroke="#ffffff40"
            strokeDasharray="8 4"
            ifOverflow="extendDomain"
          />

          {/* Séances: barres (droite) */}
          <Bar
            yAxisId="right"
            dataKey="seances"
            name="Séances"
            fill="url(#colorSeances)"
            radius={[2, 2, 0, 0]}
          />

          <defs>
            <linearGradient id="colorSeances" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.3} />
            </linearGradient>
          </defs>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
