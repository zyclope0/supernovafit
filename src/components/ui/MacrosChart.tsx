'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import type { TooltipProps, LegendProps } from 'recharts';
import { Macros } from '@/types';

interface MacrosChartProps {
  macros: Macros;
  title?: string;
}

export default function MacrosChart({
  macros,
  title = 'Répartition des macros',
}: MacrosChartProps) {
  // Calculer les calories par macronutriment
  const proteinCalories = macros.prot * 4;
  const carbCalories = macros.glucides * 4;
  const fatCalories = macros.lipides * 9;
  const totalCalories = proteinCalories + carbCalories + fatCalories;

  // Données pour le graphique
  const data = [
    {
      name: 'Protéines',
      value: proteinCalories,
      grams: macros.prot,
      color: '#06b6d4',
      percentage:
        totalCalories > 0
          ? Math.round((proteinCalories / totalCalories) * 100)
          : 0,
    },
    {
      name: 'Glucides',
      value: carbCalories,
      grams: macros.glucides,
      color: '#ec4899',
      percentage:
        totalCalories > 0
          ? Math.round((carbCalories / totalCalories) * 100)
          : 0,
    },
    {
      name: 'Lipides',
      value: fatCalories,
      grams: macros.lipides,
      color: '#a855f7',
      percentage:
        totalCalories > 0 ? Math.round((fatCalories / totalCalories) * 100) : 0,
    },
  ].filter((item) => item.value > 0);

  // Tooltip personnalisé
  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass-effect p-3 rounded-lg border border-white/20 bg-space-800/95">
          <p className="text-white font-medium">{data.name}</p>
          <p className="text-sm" style={{ color: data.color }}>
            {data.grams.toFixed(1)}g ({data.percentage}%)
          </p>
          <p className="text-xs text-muted-foreground">{data.value} kcal</p>
        </div>
      );
    }
    return null;
  };

  // Légende personnalisée
  const CustomLegend = ({ payload }: LegendProps) => {
    return (
      <div className="flex justify-center gap-6 mt-4">
        {payload?.map((entry, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor: (entry as unknown as { color?: string }).color,
              }}
            />
            <span className="text-sm text-white">{entry.value as string}</span>
            <span className="text-xs text-muted-foreground">
              (
              {(entry.payload as unknown as { percentage?: number }).percentage}
              %)
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="glass-effect p-6 rounded-xl border border-white/10">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="text-sm text-muted-foreground">
          {Math.round(totalCalories)} kcal total
        </p>
      </div>

      {totalCalories > 0 ? (
        <>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend content={<CustomLegend />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Détails des macros */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/10">
            <div className="text-center">
              <div className="text-lg font-bold text-neon-cyan">
                {macros.prot.toFixed(1)}g
              </div>
              <div className="text-xs text-muted-foreground">Protéines</div>
              <div className="text-xs text-neon-cyan">
                {data.find((d) => d.name === 'Protéines')?.percentage || 0}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-neon-pink">
                {macros.glucides.toFixed(1)}g
              </div>
              <div className="text-xs text-muted-foreground">Glucides</div>
              <div className="text-xs text-neon-pink">
                {data.find((d) => d.name === 'Glucides')?.percentage || 0}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-neon-purple">
                {macros.lipides.toFixed(1)}g
              </div>
              <div className="text-xs text-muted-foreground">Lipides</div>
              <div className="text-xs text-neon-purple">
                {data.find((d) => d.name === 'Lipides')?.percentage || 0}%
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-48">
          <p className="text-muted-foreground text-center">
            Aucune donnée nutritionnelle
            <br />
            <span className="text-sm">
              Ajoutez des aliments pour voir la répartition
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
