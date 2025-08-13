import { 
  LineChart, Line, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts'

interface CoachDieteChartsProps {
  data: any[]
  title: string
}

export default function CoachDieteCharts({ data, title }: CoachDieteChartsProps) {
  if (!data || data.length === 0) {
    return (
      <div className="glass-effect rounded-xl p-6 border border-white/10 text-center">
        <p className="text-gray-400">Pas assez de données pour afficher les graphiques</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      
      {/* Graphique calories par jour */}
      <div className="glass-effect rounded-xl p-6 border border-white/10">
        <h4 className="text-lg font-medium text-white mb-4">Calories par jour</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                border: '1px solid #374151',
                borderRadius: '8px'
              }} 
            />
            <Legend />
            <Bar dataKey="calories" fill="#10b981" name="Calories" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Graphique évolution macros */}
      <div className="glass-effect rounded-xl p-6 border border-white/10">
        <h4 className="text-lg font-medium text-white mb-4">Évolution des macros</h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                border: '1px solid #374151',
                borderRadius: '8px'
              }} 
            />
            <Legend />
            <Line type="monotone" dataKey="prot" stroke="#a855f7" strokeWidth={2} name="Protéines (g)" />
            <Line type="monotone" dataKey="glucides" stroke="#06b6d4" strokeWidth={2} name="Glucides (g)" />
            <Line type="monotone" dataKey="lipides" stroke="#ec4899" strokeWidth={2} name="Lipides (g)" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
