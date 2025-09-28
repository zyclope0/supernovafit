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
  AreaChart,
  Area,
  // BarChart, Bar, PieChart, Pie, Cell - removed (not used)
} from 'recharts';
import { Mesure } from '@/types';
import { formatDate } from '@/lib/utils';
import { Scale, Ruler, Heart } from 'lucide-react';

interface MesuresChartsProps {
  mesures: Mesure[];
}

// Composant de tooltip personnalisé
import type { TooltipProps } from 'recharts';
const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-effect p-3 rounded-lg border border-white/20 shadow-lg">
        <p className="text-white font-medium">{formatDate(label)}</p>
        {payload.map((entry, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.dataKey === 'poids' && `Poids: ${entry.value} kg`}
            {entry.dataKey === 'imc' && `IMC: ${entry.value}`}
            {entry.dataKey === 'masse_grasse' &&
              `Masse grasse: ${entry.value}%`}
            {entry.dataKey === 'masse_musculaire' &&
              `Masse musculaire: ${entry.value}%`}
            {entry.dataKey === 'tour_taille' &&
              `Tour de taille: ${entry.value} cm`}
            {entry.dataKey === 'tour_hanches' &&
              `Tour de hanches: ${entry.value} cm`}
            {entry.dataKey === 'tour_bras' && `Tour de bras: ${entry.value} cm`}
            {entry.dataKey === 'tour_cuisses' &&
              `Tour de cuisses: ${entry.value} cm`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function MesuresCharts({ mesures }: MesuresChartsProps) {
  const chartData = useMemo(() => {
    // Prendre toutes les mesures (pas de filtre temporel pour éviter les problèmes de dates)
    const data = mesures
      .slice()
      .reverse() // Du plus ancien au plus récent pour les graphiques
      .map((mesure) => ({
        date: mesure.date,
        poids: mesure.poids || null,
        imc: mesure.imc || null,
        masse_grasse: mesure.masse_grasse || null,
        masse_musculaire: mesure.masse_musculaire || null,
        tour_taille: mesure.tour_taille || null,
        tour_hanches: mesure.tour_hanches || null,
        tour_bras: mesure.tour_bras || null,
        tour_cuisses: mesure.tour_cuisses || null,
        tour_cou: mesure.tour_cou || null,
        tour_poitrine: mesure.tour_poitrine || null,
      }));

    // Calculer domains dynamiques motivationnels pour chaque métrique
    const weights = data.map((d) => d.poids).filter(Boolean) as number[];
    const imcs = data.map((d) => d.imc).filter(Boolean) as number[];
    const masseGrasse = data
      .map((d) => d.masse_grasse)
      .filter(Boolean) as number[];
    const masseMusculaire = data
      .map((d) => d.masse_musculaire)
      .filter(Boolean) as number[];
    const tourTaille = data
      .map((d) => d.tour_taille)
      .filter(Boolean) as number[];
    const tourHanches = data
      .map((d) => d.tour_hanches)
      .filter(Boolean) as number[];
    const tourBras = data.map((d) => d.tour_bras).filter(Boolean) as number[];
    const tourCuisses = data
      .map((d) => d.tour_cuisses)
      .filter(Boolean) as number[];

    // Fonction helper pour calculer domain motivationnel
    const getMotivationalDomain = (
      values: number[],
      isLossGood = true,
    ): [number, number] => {
      if (values.length === 0) return [0, 100];

      const min = Math.min(...values);
      const max = Math.max(...values);
      const range = max - min;

      if (isLossGood) {
        // Pour poids, tour de taille, etc. : Focus sur les pertes
        return [
          Math.max(0, min - Math.max(2, range * 0.3)), // Plus d'espace en bas
          max + Math.max(1, range * 0.1), // Moins d'espace en haut
        ];
      } else {
        // Pour masse musculaire : Focus sur les gains
        return [
          Math.max(0, min - Math.max(1, range * 0.1)), // Moins d'espace en bas
          max + Math.max(2, range * 0.3), // Plus d'espace en haut
        ];
      }
    };

    const domains = {
      weight: getMotivationalDomain(weights, true),
      imc: getMotivationalDomain(imcs, true),
      composition: [
        0,
        Math.max(50, Math.max(...masseGrasse, ...masseMusculaire) + 5),
      ],
      mensurations: getMotivationalDomain(
        [...tourTaille, ...tourHanches, ...tourBras, ...tourCuisses],
        true,
      ),
    };

    return { data, domains };
  }, [mesures]);

  // IMC data removed - was unused

  if (mesures.length === 0) {
    return (
      <div className="text-center py-12">
        <Scale className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">
          Aucune mesure disponible pour les graphiques
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Graphique Poids et IMC */}
      <div className="glass-effect p-6 rounded-lg border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Scale className="h-5 w-5 text-neon-cyan" />
          Évolution Poids & IMC
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis
              dataKey="date"
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: '2-digit',
                })
              }
            />
            <YAxis
              yAxisId="poids"
              stroke="#06b6d4"
              tick={{ fill: '#06b6d4', fontSize: 12 }}
              width={50}
              domain={chartData.domains.weight}
              tickFormatter={(v: number) => String(Math.round(v as number))}
              label={{
                value: 'kg',
                angle: -90,
                position: 'insideLeft',
                style: { textAnchor: 'middle', fill: '#06b6d4' },
              }}
            />
            <YAxis
              yAxisId="imc"
              orientation="right"
              stroke="#10b981"
              tick={{ fill: '#10b981', fontSize: 12 }}
              width={36}
              domain={chartData.domains.imc}
              tickFormatter={(v: number) =>
                String(Math.round((v as number) * 10) / 10)
              }
              label={{
                value: 'IMC',
                angle: 90,
                position: 'insideRight',
                style: { textAnchor: 'middle', fill: '#10b981' },
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              yAxisId="poids"
              type="monotone"
              dataKey="poids"
              stroke="#06b6d4"
              strokeWidth={3}
              dot={{
                fill: '#06b6d4',
                strokeWidth: 2,
                r: 5,
                stroke: '#ffffff',
              }}
              connectNulls={false}
            />
            <Line
              yAxisId="imc"
              type="monotone"
              dataKey="imc"
              stroke="#10b981"
              strokeWidth={3}
              dot={{
                fill: '#10b981',
                strokeWidth: 2,
                r: 5,
                stroke: '#ffffff',
              }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Graphique Composition corporelle */}
      <div className="glass-effect p-6 rounded-lg border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Heart className="h-5 w-5 text-neon-purple" />
          Composition Corporelle
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis
              dataKey="date"
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: '2-digit',
                })
              }
            />
            <YAxis
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              domain={chartData.domains.composition}
              label={{
                value: 'Pourcentage (%)',
                angle: -90,
                position: 'insideLeft',
                style: { textAnchor: 'middle', fill: '#9ca3af' },
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="masse_grasse"
              stackId="1"
              stroke="#a855f7"
              fill="#a855f7"
              fillOpacity={0.6}
              connectNulls={false}
            />
            <Area
              type="monotone"
              dataKey="masse_musculaire"
              stackId="1"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.6}
              connectNulls={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Graphique Mensurations */}
      <div className="glass-effect p-6 rounded-lg border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Ruler className="h-5 w-5 text-neon-pink" />
            Évolution des Mensurations
          </h3>
          {/* Stats motivationnelles mensurations */}
          {chartData.data.length > 1 &&
            (() => {
              const firstTaille = chartData.data.find(
                (d) => d.tour_taille,
              )?.tour_taille;
              const lastTaille = [...chartData.data]
                .reverse()
                .find((d) => d.tour_taille)?.tour_taille;
              const tailleChange =
                firstTaille && lastTaille ? lastTaille - firstTaille : null;

              return tailleChange !== null ? (
                <div className="text-right">
                  <div
                    className={`text-sm font-bold ${
                      tailleChange < 0
                        ? 'text-green-400'
                        : tailleChange > 0
                          ? 'text-red-400'
                          : 'text-gray-400'
                    }`}
                  >
                    Tour de taille: {tailleChange > 0 ? '+' : ''}
                    {tailleChange.toFixed(1)}cm
                  </div>
                  <div className="text-xs text-white/60">
                    {tailleChange < 0
                      ? '📉 Excellent !'
                      : tailleChange > 0
                        ? '📈 Attention'
                        : '➡️ Stable'}
                  </div>
                </div>
              ) : null;
            })()}
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis
              dataKey="date"
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: '2-digit',
                })
              }
            />
            <YAxis
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              domain={chartData.domains.mensurations}
              label={{
                value: 'Centimètres (cm)',
                angle: -90,
                position: 'insideLeft',
                style: { textAnchor: 'middle', fill: '#9ca3af' },
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="tour_taille"
              stroke="#ec4899"
              strokeWidth={3}
              dot={{ fill: '#ec4899', strokeWidth: 2, r: 4, stroke: '#ffffff' }}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="tour_hanches"
              stroke="#f59e0b"
              strokeWidth={3}
              dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4, stroke: '#ffffff' }}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="tour_bras"
              stroke="#06b6d4"
              strokeWidth={3}
              dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4, stroke: '#ffffff' }}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="tour_cuisses"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 4, stroke: '#ffffff' }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
        {/* Légende */}
        <div className="flex flex-wrap gap-4 mt-4 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-neon-pink rounded-full"></div>
            <span className="text-sm text-muted-foreground">
              Tour de taille
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-sm text-muted-foreground">
              Tour de hanches
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-neon-cyan rounded-full"></div>
            <span className="text-sm text-muted-foreground">Tour de bras</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-neon-green rounded-full"></div>
            <span className="text-sm text-muted-foreground">
              Tour de cuisses
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
