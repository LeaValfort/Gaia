'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import type { PointSport } from '@/lib/db/progression'

interface GraphiqueSportProps {
  donnees: PointSport[]
}

// Colorie les barres selon le nombre de séances
function getCouleurBarre(seances: number): string {
  if (seances === 0) return 'rgba(128,128,128,0.2)'
  if (seances >= 4) return '#22c55e'
  if (seances >= 2) return '#f59e0b'
  return '#94a3b8'
}

export function GraphiqueSport({ donnees }: GraphiqueSportProps) {
  if (donnees.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-neutral-400">
        Pas encore de séances enregistrées.
      </div>
    )
  }

  const totalSeances = donnees.reduce((acc, p) => acc + p.seances, 0)
  const semainesActives = donnees.filter((p) => p.seances > 0).length

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-4 text-sm">
        <span className="text-neutral-500 dark:text-neutral-400">
          <span className="font-semibold text-neutral-900 dark:text-neutral-50">{totalSeances}</span> séances
        </span>
        <span className="text-neutral-500 dark:text-neutral-400">
          <span className="font-semibold text-neutral-900 dark:text-neutral-50">{semainesActives}/{donnees.length}</span> semaines actives
        </span>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={donnees} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" vertical={false} />
          <XAxis
            dataKey="semaine"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            interval={0}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            allowDecimals={false}
            tickCount={4}
          />
          <Tooltip
            contentStyle={{
              background: 'rgba(23,23,23,0.95)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#f5f5f5',
            }}
            formatter={(value) => [`${value} séance${Number(value) > 1 ? 's' : ''}`, '']}
          />
          <Bar dataKey="seances" radius={[4, 4, 0, 0]}>
            {donnees.map((entry, index) => (
              <Cell key={index} fill={getCouleurBarre(entry.seances)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Légende */}
      <div className="flex flex-wrap gap-3 text-xs text-neutral-500">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-green-500" />≥ 4 séances</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-amber-500" />2-3 séances</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-slate-400" />1 séance</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-neutral-200 dark:bg-neutral-700" />Repos</span>
      </div>
    </div>
  )
}
