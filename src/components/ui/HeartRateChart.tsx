'use client';

import {
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Entrainement } from '@/types';
import type { TooltipProps } from 'recharts';
import { prepareHeartRateChartData } from '@/lib/chartDataTransformers';

interface HeartRateChartProps {
  entrainements: Entrainement[];
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<string | number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-effect p-3 rounded-lg border border-white/10 text-sm text-white">
        <p className="font-bold mb-1">
          {format(parseISO(label), 'EEEE d MMMM', { locale: fr })}
        </p>
        {payload.map((entry, index: number) => (
          <p key={index} style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value} bpm`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function HeartRateChart({ entrainements }: HeartRateChartProps) {
  // ✅ Logique déléguée à la fonction pure (testable à 80%+)
  const hrData = prepareHeartRateChartData(entrainements);

  if (hrData.length === 0) {
    return (
      <div className="glass-effect p-6 rounded-xl border border-white/10">
        <h2 className="text-lg font-semibold text-white mb-4">
          Évolution Fréquence Cardiaque
        </h2>
        <div className="text-center py-8">
          <div className="text-4xl mb-4">💓</div>
          <p className="text-muted-foreground">
            Aucune donnée FC disponible.
            <br />
            Ajoutez la fréquence cardiaque dans les données avancées !
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-effect p-6 rounded-xl border border-white/10">
      <h2 className="text-lg font-semibold text-white mb-4">
        Évolution Fréquence Cardiaque
        <span className="text-sm text-muted-foreground ml-2">
          ({hrData.length} séances avec FC)
        </span>
      </h2>

      <ResponsiveContainer width="100%" height={250}>
        <AreaChart
          data={hrData}
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" />
          <XAxis
            dataKey="date"
            tickFormatter={(tick) =>
              format(parseISO(tick), 'dd/MM', { locale: fr })
            }
            stroke="#ffffff80"
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#ffffff80"
            tickLine={false}
            axisLine={false}
            domain={['dataMin - 10', 'dataMax + 10']}
            width={44}
            tickFormatter={(value) => `${Math.round(value as number)}`}
            label={{
              value: 'bpm',
              angle: -90,
              position: 'insideLeft',
              style: { fill: 'rgba(255,255,255,0.6)' },
            }}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Zone entre FC min et max */}
          <Area
            type="monotone"
            dataKey="fc_max"
            stroke="#ef4444"
            fill="url(#colorHRZone)"
            fillOpacity={0.1}
          />
          <Area
            type="monotone"
            dataKey="fc_min"
            stroke="#ef4444"
            fill="#ffffff00"
            fillOpacity={0}
          />

          {/* Lignes FC */}
          <Line
            type="monotone"
            dataKey="fc_moyenne"
            stroke="url(#colorHRAvg)"
            strokeWidth={3}
            dot={{ stroke: '#ef4444', strokeWidth: 2, r: 4, fill: '#ef4444' }}
            activeDot={{ stroke: '#ef4444', strokeWidth: 3, r: 6 }}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="fc_max"
            stroke="#ff6b6b"
            strokeWidth={1}
            strokeDasharray="5 5"
            dot={false}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="fc_min"
            stroke="#ffa8a8"
            strokeWidth={1}
            strokeDasharray="5 5"
            dot={false}
            connectNulls={false}
          />

          <defs>
            <linearGradient id="colorHRAvg" x1="0" y1="0" x2="1" y2="0">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#f87171" stopOpacity={0.8} />
            </linearGradient>
            <linearGradient id="colorHRZone" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05} />
            </linearGradient>
          </defs>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
