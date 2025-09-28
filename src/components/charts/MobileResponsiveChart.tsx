'use client';

import { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from 'recharts';
import { cn } from '@/lib/utils';

interface ChartData {
  [key: string]: string | number;
}

interface MobileResponsiveChartProps {
  data: ChartData[];
  type: 'line' | 'bar' | 'area' | 'pie';
  dataKey: string;
  xAxisKey?: string;
  color?: string;
  gradient?: boolean;
  showGrid?: boolean;
  showLegend?: boolean;
  height?: number;
  className?: string;
}

// Couleurs optimisées pour mobile (contraste élevé)
const MOBILE_COLORS = {
  primary: '#3b82f6',
  secondary: '#10b981',
  accent: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  pink: '#ec4899',
  cyan: '#06b6d4',
};

// Tooltip personnalisé pour mobile
interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; color: string; name: string }>;
  label?: string;
}

const MobileTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-effect rounded-lg p-3 border border-white/20 shadow-xl">
        <p className="text-sm font-medium text-white mb-2">{label}</p>
        {payload.map((entry, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-white/80">
              {entry.name}:{' '}
              <span className="font-semibold text-white">{entry.value}</span>
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function MobileResponsiveChart({
  data,
  type,
  dataKey,
  xAxisKey = 'name',
  color = MOBILE_COLORS.primary,
  gradient = false,
  showGrid = true,
  showLegend = false,
  height = 300,
  className,
}: MobileResponsiveChartProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // Configuration responsive
  const mobileConfig = {
    margin: isMobile
      ? { top: 10, right: 10, left: 10, bottom: 10 }
      : { top: 20, right: 30, left: 20, bottom: 20 },
    fontSize: isMobile ? 10 : 12,
    strokeWidth: isMobile ? 3 : 2,
    dotSize: isMobile ? 6 : 4,
  };

  const renderChart = () => {
    const commonProps = {
      data,
      margin: mobileConfig.margin,
    };

    switch (type) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            {showGrid && (
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.1)"
                horizontal={!isMobile}
                vertical={false}
              />
            )}
            <XAxis
              dataKey={xAxisKey}
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: mobileConfig.fontSize,
                fill: 'rgba(255,255,255,0.6)',
              }}
              interval={isMobile ? 'preserveStartEnd' : 0}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: mobileConfig.fontSize,
                fill: 'rgba(255,255,255,0.6)',
              }}
              width={isMobile ? 40 : 60}
            />
            <Tooltip content={<MobileTooltip />} />
            {showLegend && !isMobile && <Legend />}

            {gradient ? (
              <>
                <defs>
                  <linearGradient
                    id="colorGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={color} stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey={dataKey}
                  stroke={color}
                  strokeWidth={mobileConfig.strokeWidth}
                  fill="url(#colorGradient)"
                  dot={{ r: mobileConfig.dotSize, fill: color }}
                  activeDot={{ r: mobileConfig.dotSize + 2, fill: color }}
                />
              </>
            ) : (
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={mobileConfig.strokeWidth}
                dot={{ r: mobileConfig.dotSize, fill: color }}
                activeDot={{ r: mobileConfig.dotSize + 2, fill: color }}
              />
            )}
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                <stop offset="95%" stopColor={color} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            {showGrid && (
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.1)"
              />
            )}
            <XAxis
              dataKey={xAxisKey}
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: mobileConfig.fontSize,
                fill: 'rgba(255,255,255,0.6)',
              }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: mobileConfig.fontSize,
                fill: 'rgba(255,255,255,0.6)',
              }}
              width={isMobile ? 40 : 60}
            />
            <Tooltip content={<MobileTooltip />} />
            {showLegend && !isMobile && <Legend />}
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={mobileConfig.strokeWidth}
              fill="url(#colorGradient)"
            />
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            {showGrid && (
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.1)"
              />
            )}
            <XAxis
              dataKey={xAxisKey}
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: mobileConfig.fontSize,
                fill: 'rgba(255,255,255,0.6)',
              }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: mobileConfig.fontSize,
                fill: 'rgba(255,255,255,0.6)',
              }}
              width={isMobile ? 40 : 60}
            />
            <Tooltip content={<MobileTooltip />} />
            {showLegend && !isMobile && <Legend />}
            <Bar
              dataKey={dataKey}
              fill={color}
              radius={[4, 4, 0, 0]}
              maxBarSize={isMobile ? 40 : 60}
            />
          </BarChart>
        );

      case 'pie':
        return (
          <PieChart {...commonProps}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={isMobile ? 40 : 60}
              outerRadius={isMobile ? 80 : 120}
              paddingAngle={2}
              dataKey={dataKey}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    Object.values(MOBILE_COLORS)[
                      index % Object.values(MOBILE_COLORS).length
                    ]
                  }
                />
              ))}
            </Pie>
            <Tooltip content={<MobileTooltip />} />
            {showLegend && !isMobile && <Legend />}
          </PieChart>
        );

      default:
        return <div>Type de graphique non supporté</div>;
    }
  };

  return (
    <div className={cn('relative', className)}>
      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>

      {/* Mobile Performance Hint */}
      {isMobile && (
        <div className="absolute top-2 right-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        </div>
      )}
    </div>
  );
}
