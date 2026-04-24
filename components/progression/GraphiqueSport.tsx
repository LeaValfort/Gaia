'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts'
import type { PointSportHebdo } from '@/types'
import { COULEUR_TYPE } from '@/lib/progression'

interface GraphiqueSportProps {
  donnees: PointSportHebdo[]
}

function couleurBarre(d: PointSportHebdo): string {
  if (d.seances === 0) return 'rgba(148,163,184,0.25)'
  const t = d.typeDominant
  return t ? COULEUR_TYPE[t] : '#64748b'
}

export function GraphiqueSport({ donnees }: GraphiqueSportProps) {
  if (donnees.length === 0) {
    return (
      <div className="min-h-[180px] flex items-center justify-center text-sm text-neutral-500 dark:text-neutral-400">
        Pas encore de séances enregistrées.
      </div>
    )
  }

  const objectif = donnees[0]?.objectif ?? 4
  const auObjectif = donnees.filter((d) => d.seances >= objectif).length
  const score = `${auObjectif} semaine${auObjectif > 1 ? 's' : ''} sur ${donnees.length} à l’objectif`

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-neutral-600 dark:text-neutral-300">
        <span className="font-semibold text-neutral-900 dark:text-neutral-50">{score}</span>
        {' · '}
        <span className="text-neutral-500">objectif {objectif} séances / semaine</span>
      </p>
      <div className="w-full min-w-0">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={donnees} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} interval={0} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#94a3b8' }} width={28} />
              <ReferenceLine
                y={objectif}
                stroke="#94a3b8"
                strokeDasharray="4 4"
                label={{ value: `Objectif ${objectif}`, fill: '#64748b', fontSize: 10, position: 'right' }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.[0]) return null
                  const d = payload[0].payload as PointSportHebdo
                  return (
                    <div className="max-w-[240px] whitespace-pre-wrap rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs text-neutral-100">
                      <p className="font-medium">{d.label}</p>
                      <p className="text-neutral-400">{d.seances} séance{d.seances > 1 ? 's' : ''}</p>
                      <p className="mt-1 text-neutral-300">{d.detail}</p>
                    </div>
                  )
                }}
              />
              <Bar dataKey="seances" radius={[4, 4, 0, 0]}>
                {donnees.map((e) => (
                  <Cell key={e.cle} fill={couleurBarre(e)} />
                ))}
              </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-2 text-[10px] text-neutral-500">
        <span className="flex items-center gap-1"><span className="inline-block size-2 rounded-sm bg-blue-500" /> muscu</span>
        <span className="flex items-center gap-1"><span className="inline-block size-2 rounded-sm bg-cyan-500" /> natation</span>
        <span className="flex items-center gap-1"><span className="inline-block size-2 rounded-sm bg-purple-500" /> yoga</span>
        <span className="flex items-center gap-1"><span className="inline-block size-2 rounded-sm bg-orange-500" /> escalade</span>
      </div>
    </div>
  )
}
