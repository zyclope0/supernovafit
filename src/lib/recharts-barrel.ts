/**
 * Recharts Barrel Export
 *
 * Centralise les imports Recharts pour meilleur tree shaking
 * et code splitting. Next.js 15 peut mieux optimiser un import unique.
 *
 * @created 23.10.2025
 * @optimization Bundle size reduction
 */

// Core components (souvent utilisés ensemble)
export {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Axes & Grids
export {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Types
export type { TooltipProps } from 'recharts';
