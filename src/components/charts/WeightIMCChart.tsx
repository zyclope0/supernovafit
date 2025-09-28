'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Mesure } from '@/types';
import { formatDate } from '@/lib/utils';
import { Scale } from 'lucide-react';

interface WeightIMCChartProps {
  mesures: Mesure[];
  period?: 'today' | 'week' | 'month';
}

// Composant de tooltip personnalisé
import type { TooltipProps } from 'recharts';
const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const data = payload[0].payload;

    return (
      <div className="glass-effect p-3 rounded-lg border border-white/20 shadow-lg">
        <p className="text-white font-medium mb-2">{formatDate(label)}</p>
        {payload.map((entry, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.dataKey === 'poids' && `Poids: ${entry.value} kg`}
            {entry.dataKey === 'imc' && `IMC: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function WeightIMCChart({
  mesures,
  period = 'week',
}: WeightIMCChartProps) {
  const chartData = useMemo(() => {
    // Filtrer les mesures selon la période sélectionnée
    let filteredMesures = mesures;

    if (period === 'today') {
      // Aujourd'hui : Mesures d'aujourd'hui + quelques points récents pour contexte
      const today = new Date().toISOString().split('T')[0];
      const todayMesures = mesures.filter((m) => m.date === today);

      if (todayMesures.length > 0) {
        // Si mesures aujourd'hui, ajouter les 3 derniers jours pour contexte
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        filteredMesures = mesures.filter(
          (m) => new Date(m.date) >= threeDaysAgo,
        );
      } else {
        // Sinon, prendre les 3 dernières mesures pour contexte
        filteredMesures = mesures.slice(-3);
      }
    } else if (period === 'week') {
      // Semaine : TOUS les points des 7 derniers jours
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filteredMesures = mesures.filter((m) => new Date(m.date) >= weekAgo);

      // Si pas assez de points, étendre à 14 jours pour contexte
      if (filteredMesures.length < 3) {
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        filteredMesures = mesures.filter(
          (m) => new Date(m.date) >= twoWeeksAgo,
        );
      }
    } else if (period === 'month') {
      // Mois : MOIS ENTIER actuel (du 1er à aujourd'hui)
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      filteredMesures = mesures.filter((m) => new Date(m.date) >= startOfMonth);

      // Si pas assez de points dans le mois, étendre au mois précédent
      if (filteredMesures.length < 3) {
        const startOfLastMonth = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          1,
        );
        filteredMesures = mesures.filter(
          (m) => new Date(m.date) >= startOfLastMonth,
        );
      }
    }

    const data = filteredMesures
      .slice()
      .reverse() // Du plus ancien au plus récent
      .map((mesure) => ({
        date: mesure.date,
        poids: mesure.poids || null,
        imc: mesure.imc || null,
      }));

    // Calculer domain dynamique optimisé pour motivation perte de poids
    const weights = data.map((d) => d.poids).filter(Boolean) as number[];
    const imcs = data.map((d) => d.imc).filter(Boolean) as number[];

    let weightDomain: [number, number] = [25, 100]; // Fallback
    let imcDomain: [number, number] = [15, 35]; // Fallback

    if (weights.length > 0) {
      const minWeight = Math.min(...weights);
      const maxWeight = Math.max(...weights);
      const range = maxWeight - minWeight;

      // Domain motivationnel : Focus sur les pertes
      // - Plus d'espace en bas pour encourager la descente
      // - Marge asymétrique pour amplifier visuellement les pertes
      weightDomain = [
        Math.max(0, minWeight - Math.max(2, range * 0.3)), // 30% marge en bas ou 2kg min
        maxWeight + Math.max(1, range * 0.1), // 10% marge en haut ou 1kg min
      ];
    }

    if (imcs.length > 0) {
      const minIMC = Math.min(...imcs);
      const maxIMC = Math.max(...imcs);
      const range = maxIMC - minIMC;

      // Domain IMC adaptatif
      imcDomain = [
        Math.max(10, minIMC - Math.max(1, range * 0.2)), // 20% marge en bas
        maxIMC + Math.max(0.5, range * 0.1), // 10% marge en haut
      ];
    }

    return { data, weightDomain, imcDomain };
  }, [mesures, period]);

  // Calculer les statistiques motivationnelles basées sur les données filtrées
  const motivationStats = useMemo(() => {
    const filteredWeights = chartData.data
      .map((d) => d.poids)
      .filter(Boolean) as number[];
    if (filteredWeights.length < 2) return null;

    const firstWeight = filteredWeights[0];
    const lastWeight = filteredWeights[filteredWeights.length - 1];
    const totalChange = lastWeight - firstWeight;
    const percentChange = (totalChange / firstWeight) * 100;

    // Calculer la tendance selon la période affichée
    let recentTrend = 'stable';
    if (filteredWeights.length >= 2) {
      const change = lastWeight - firstWeight;
      recentTrend = change < -0.2 ? 'loss' : change > 0.2 ? 'gain' : 'stable';
    }

    // Calculer la durée de la période affichée
    const periodStart =
      chartData.data.length > 0 ? new Date(chartData.data[0].date) : new Date();
    const periodDays = Math.max(
      1,
      Math.ceil(
        (new Date().getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24),
      ),
    );

    return {
      totalChange,
      percentChange,
      recentTrend,
      periodDays,
    };
  }, [chartData.data]);

  if (mesures.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <Scale className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground mb-2">Aucune mesure disponible</p>
        <p className="text-sm text-muted-foreground">
          Ajoutez des mesures pour voir l&apos;évolution
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Statistiques motivationnelles */}
      {motivationStats && (
        <div className="mb-4 grid grid-cols-3 gap-2 text-xs">
          <div className="text-center">
            <div
              className={`text-lg font-bold ${
                motivationStats.totalChange < 0
                  ? 'text-green-400'
                  : motivationStats.totalChange > 0
                    ? 'text-red-400'
                    : 'text-gray-400'
              }`}
            >
              {motivationStats.totalChange > 0 ? '+' : ''}
              {motivationStats.totalChange.toFixed(1)}kg
            </div>
            <div className="text-white/60">
              {period === 'today'
                ? "Aujourd'hui"
                : period === 'week'
                  ? 'Semaine'
                  : 'Mois'}
            </div>
          </div>
          <div className="text-center">
            <div
              className={`text-lg font-bold ${
                motivationStats.percentChange < 0
                  ? 'text-green-400'
                  : motivationStats.percentChange > 0
                    ? 'text-red-400'
                    : 'text-gray-400'
              }`}
            >
              {motivationStats.percentChange > 0 ? '+' : ''}
              {motivationStats.percentChange.toFixed(1)}%
            </div>
            <div className="text-white/60">Variation</div>
          </div>
          <div className="text-center">
            <div
              className={`text-lg font-bold ${
                motivationStats.recentTrend === 'loss'
                  ? 'text-green-400'
                  : motivationStats.recentTrend === 'gain'
                    ? 'text-red-400'
                    : 'text-gray-400'
              }`}
            >
              {motivationStats.recentTrend === 'loss'
                ? '📉'
                : motivationStats.recentTrend === 'gain'
                  ? '📈'
                  : '➡️'}
            </div>
            <div className="text-white/60">
              {period === 'today'
                ? 'Tendance'
                : period === 'week'
                  ? 'Semaine'
                  : 'Mois'}
            </div>
          </div>
        </div>
      )}

      {/* Graphique avec hauteur adaptée */}
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData.data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255, 255, 255, 0.1)"
            />
            <XAxis
              dataKey="date"
              stroke="var(--text-secondary)"
              tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: '2-digit',
                })
              }
            />
            <YAxis
              yAxisId="poids"
              stroke="var(--neon-cyan)"
              tick={{ fill: 'var(--neon-cyan)', fontSize: 12 }}
              width={50}
              domain={chartData.weightDomain}
              tickFormatter={(v: number) => String(Math.round(v as number))}
              label={{
                value: 'kg',
                angle: -90,
                position: 'insideLeft',
                style: { textAnchor: 'middle', fill: 'var(--neon-cyan)' },
              }}
            />
            <YAxis
              yAxisId="imc"
              orientation="right"
              stroke="var(--neon-green)"
              tick={{ fill: 'var(--neon-green)', fontSize: 12 }}
              width={36}
              domain={chartData.imcDomain}
              tickFormatter={(v: number) =>
                String(Math.round((v as number) * 10) / 10)
              }
              label={{
                value: 'IMC',
                angle: 90,
                position: 'insideRight',
                style: { textAnchor: 'middle', fill: 'var(--neon-green)' },
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              yAxisId="poids"
              type="monotone"
              dataKey="poids"
              stroke="var(--neon-cyan)"
              strokeWidth={3}
              dot={{
                fill: 'var(--neon-cyan)',
                strokeWidth: 2,
                r: 5, // Légèrement plus gros pour visibilité
                stroke: 'var(--text-primary)', // Contour blanc pour contraste
              }}
              connectNulls={false}
              // Ligne continue pour meilleure lisibilité
            />
            <Line
              yAxisId="imc"
              type="monotone"
              dataKey="imc"
              stroke="var(--neon-green)"
              strokeWidth={3}
              dot={{ fill: 'var(--neon-green)', strokeWidth: 2, r: 4 }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
