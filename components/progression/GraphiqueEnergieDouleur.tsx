'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import type { PointEnergieDouleur } from '@/lib/db/progression'

interface GraphiqueEnergieDouleurProps {
  donnees: PointEnergieDouleur[]
}

export function GraphiqueEnergieDouleur({ donnees }: GraphiqueEnergieDouleurProps) {
  if (donnees.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-neutral-400">
        Pas encore de données — reviens après avoir rempli quelques journaux.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={donnees} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          interval="preserveStartEnd"
        />
        <YAxis
          yAxisId="energie"
          domain={[0, 5]}
          tick={{ fontSize: 11, fill: '#f59e0b' }}
          tickCount={6}
        />
        <YAxis
          yAxisId="douleur"
          orientation="right"
          domain={[0, 10]}
          tick={{ fontSize: 11, fill: '#14b8a6' }}
          tickCount={6}
        />
        <Tooltip
          contentStyle={{
            background: 'rgba(23,23,23,0.95)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#f5f5f5',
          }}
        />
        <Legend
          wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
          formatter={(value) => <span style={{ color: '#9ca3af' }}>{value}</span>}
        />
        <Line
          yAxisId="energie"
          type="monotone"
          dataKey="energie"
          stroke="#f59e0b"
          strokeWidth={2}
          dot={{ r: 3 }}
          name="Énergie (1-5)"
          connectNulls
        />
        <Line
          yAxisId="douleur"
          type="monotone"
          dataKey="douleur"
          stroke="#14b8a6"
          strokeWidth={2}
          dot={{ r: 3 }}
          name="Douleur (0-10)"
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
