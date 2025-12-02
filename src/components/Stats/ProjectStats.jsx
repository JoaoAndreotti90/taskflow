import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import './ProjectStats.css'

const COLORS = {
  pending: '#94a3b8',  
  active: '#3b82f6',  
  paused: '#f59e0b',   
  finished: '#22c55e'  
}

export function ProjectStats({ projects }) {
  if (!projects || projects.length === 0) return null

  const pendingCount = projects.filter(p => p.status === 'pending').length
  const activeCount = projects.filter(p => p.status === 'active').length
  const pausedCount = projects.filter(p => p.status === 'paused').length
  const finishedCount = projects.filter(p => p.status === 'finished').length

  const data = [
    { name: 'Pendente', value: pendingCount, fill: COLORS.pending },
    { name: 'Em Andamento', value: activeCount, fill: COLORS.active },
    { name: 'Pausado', value: pausedCount, fill: COLORS.paused },
    { name: 'Concluído', value: finishedCount, fill: COLORS.finished },
  ]

  return (
    <div className="stats-container">
      <div className="stats-info">
        <h3>Visão Geral dos Projetos</h3>
        <p>Total de projetos: {projects.length}</p>
      </div>
      
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={35}
              outerRadius={55}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} stroke="none" />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}