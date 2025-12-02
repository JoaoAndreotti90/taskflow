import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import './Stats.css'

const COLORS = {
  todo: '#94a3b8',
  doing: '#3b82f6',
  paused: '#f59e0b',
  done: '#22c55e'
}

export function Stats({ tasks }) {
  if (!tasks || tasks.length === 0) return null

  const todoCount = tasks.filter(t => t.status === 'todo').length
  const doingCount = tasks.filter(t => t.status === 'doing').length
  const pausedCount = tasks.filter(t => t.status === 'paused').length
  const doneCount = tasks.filter(t => t.status === 'done').length

  const data = [
    { name: 'A Fazer', value: todoCount, fill: COLORS.todo },
    { name: 'Fazendo', value: doingCount, fill: COLORS.doing },
    { name: 'Pausado', value: pausedCount, fill: COLORS.paused },
    { name: 'Concluído', value: doneCount, fill: COLORS.done },
  ]

  if (todoCount + doingCount + pausedCount + doneCount === 0) return null

  return (
    <div className="stats-container">
      <div className="stats-info">
        <h3>Progresso do Projeto</h3>
        <p>Visão geral das suas tarefas</p>
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