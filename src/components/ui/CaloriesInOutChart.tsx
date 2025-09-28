'use client';

import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import type { TooltipProps } from 'recharts';

interface CaloriesInOutChartProps {
  repas: Array<{ date: string; macros?: { kcal?: number } }>;
  entrainements: Array<{ date: string; calories?: number }>;
  days?: number;
  tdee?: number; // Total Daily Energy Expenditure (maintenance)
  title?: string; // Titre personnalisé
}

export default function CaloriesInOutChart({
  repas,
  entrainements,
  days = 7,
  tdee,
  title,
}: CaloriesInOutChartProps) {
  const data = useMemo(() => {
    const today = new Date();
    const dates: string[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }

    const inByDate = new Map<string, number>();
    const outByDate = new Map<string, number>();

    repas.forEach((r) => {
      const kcal = r.macros?.kcal || 0;
      inByDate.set(r.date, (inByDate.get(r.date) || 0) + kcal);
    });
    entrainements.forEach((e) => {
      const cals = e.calories || 0;
      outByDate.set(e.date, (outByDate.get(e.date) || 0) + cals);
    });

    return dates.map((d) => ({
      date: new Date(d).toLocaleDateString('fr-FR', { weekday: 'short' }),
      in: inByDate.get(d) || 0,
      outTDEE: tdee || 0,
      outSport: outByDate.get(d) || 0,
    }));
  }, [repas, entrainements, days, tdee]);

  function CustomTooltip({
    active,
    payload,
    label,
  }: TooltipProps<number, string>) {
    if (!active || !payload || payload.length === 0) return null;
    const inVal =
      (payload.find((p) => p.dataKey === 'in')?.value as number) || 0;
    const tdeeVal =
      (payload.find((p) => p.dataKey === 'outTDEE')?.value as number) || 0;
    const sportVal =
      (payload.find((p) => p.dataKey === 'outSport')?.value as number) || 0;
    const outTotal = tdeeVal + sportVal;
    const net = inVal - outTotal;
    const netColor = net >= 0 ? '#10b981' : '#ef4444';
    return (
      <div
        style={{
          background: 'rgba(15,23,42,0.97)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 10,
          padding: 10,
        }}
      >
        <div style={{ color: 'white', fontWeight: 600, marginBottom: 6 }}>
          {label}
        </div>
        <div style={{ color: '#a3a3a3', fontSize: 12 }}>
          Consommées: <span style={{ color: '#10b981' }}>{inVal} kcal</span>
        </div>
        <div style={{ color: '#a3a3a3', fontSize: 12 }}>
          TDEE (base): <span style={{ color: '#60a5fa' }}>{tdeeVal} kcal</span>
        </div>
        <div style={{ color: '#a3a3a3', fontSize: 12 }}>
          Sport: <span style={{ color: '#ec4899' }}>{sportVal} kcal</span>
        </div>
        <div style={{ color: '#a3a3a3', fontSize: 12 }}>
          Dépensées totales:{' '}
          <span style={{ color: 'white' }}>{outTotal} kcal</span>
        </div>
        <div style={{ color: netColor, fontSize: 12, marginTop: 4 }}>
          Bilan (In - Out): {net} kcal
        </div>
      </div>
    );
  }

  return (
    <div className="glass-effect p-6 rounded-xl border border-white/10">
      <h3 className="text-lg font-semibold text-white mb-4">
        {title || `Calories In/Out (${days} jour${days > 1 ? 's' : ''})`}
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: 8, right: 8 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.1)"
            />
            <XAxis
              dataKey="date"
              tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
            />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.7)' }} />
            <Bar
              dataKey="in"
              name="Consommées"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="outTDEE"
              name="Dépenses base (TDEE)"
              stackId="out"
              fill="#60a5fa"
            />
            <Bar
              dataKey="outSport"
              name="Dépenses sport"
              stackId="out"
              fill="#ec4899"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {typeof tdee === 'number' && tdee > 0 && (
        <p className="mt-2 text-xs text-muted-foreground">
          Le TDEE (bleu) est inclus dans les dépenses quotidiennes.
        </p>
      )}
    </div>
  );
}
