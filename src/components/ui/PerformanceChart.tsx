'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Entrainement } from '@/types';
import type { TooltipProps } from 'recharts';
import { preparePerformanceChartData } from '@/lib/chartDataTransformers';

interface PerformanceChartProps {
  entrainements: Entrainement[];
  metric: 'vitesse' | 'calories_per_min' | 'distance';
  title: string;
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<string | number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="glass-effect p-3 rounded-lg border border-white/10 text-sm text-white">
        <p className="font-bold mb-1">
          {(() => {
            try {
              return format(parseISO(label), 'EEEE d MMMM', { locale: fr });
            } catch {
              console.warn('Invalid date in PerformanceChart tooltip:', label);
              return String(label);
            }
          })()}
        </p>
        <p className="text-neon-cyan">{`${data.type} - ${data.duree}min`}</p>
        {data.vitesse && (
          <p className="text-neon-green">{`Vitesse: ${data.vitesse} km/h`}</p>
        )}
        {data.distance && (
          <p className="text-neon-pink">{`Distance: ${data.distance} km`}</p>
        )}
        {data.calories_per_min && (
          <p className="text-neon-purple">{`Intensité: ${data.calories_per_min} kcal/min`}</p>
        )}
        {data.fc_moyenne && (
          <p className="text-red-400">{`FC moy: ${data.fc_moyenne} bpm`}</p>
        )}
      </div>
    );
  }
  return null;
};

export default function PerformanceChart({
  entrainements,
  metric,
  title,
}: PerformanceChartProps) {
  // ✅ Logique déléguée à la fonction pure (testable à 80%+)
  const performanceData = preparePerformanceChartData(entrainements, metric);

  if (performanceData.length === 0) {
    const emptyMessages = {
      vitesse: 'Ajoutez la vitesse ou distance dans les données avancées !',
      calories_per_min: "Ajoutez des calories pour voir l'intensité !",
      distance: 'Ajoutez la distance parcourue !',
    };

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
    );
  }

  const getUnit = () => {
    switch (metric) {
      case 'vitesse':
        return 'km/h';
      case 'calories_per_min':
        return 'kcal/min';
      case 'distance':
        return 'km';
      default:
        return '';
    }
  };

  const getColor = () => {
    switch (metric) {
      case 'vitesse':
        return '#10b981';
      case 'calories_per_min':
        return '#a855f7';
      case 'distance':
        return '#ec4899';
      default:
        return '#06b6d4';
    }
  };

  const average =
    performanceData.length > 0
      ? performanceData.reduce((sum, d) => sum + (d.value as number), 0) /
        performanceData.length
      : 0;

  return (
    <div className="glass-effect p-6 rounded-xl border border-white/10">
      <h2 className="text-lg font-semibold text-white mb-4">
        {title}
        <span className="text-sm text-muted-foreground ml-2">
          (Moyenne: {Math.round(average * 10) / 10} {getUnit()})
        </span>
      </h2>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart
          data={performanceData}
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" />
          <XAxis
            dataKey="date"
            tickFormatter={(tick) => {
              try {
                return format(parseISO(tick), 'dd/MM', { locale: fr });
              } catch {
                console.warn('Invalid date in PerformanceChart tick:', tick);
                return String(tick);
              }
            }}
            stroke="#ffffff80"
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#ffffff80"
            tickLine={false}
            axisLine={false}
            width={56}
            tickFormatter={(value) => `${Math.round(Number(value) * 10) / 10}`}
            label={{
              value: getUnit(),
              angle: -90,
              position: 'insideLeft',
              style: { fill: 'rgba(255,255,255,0.6)' },
            }}
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
  );
}
