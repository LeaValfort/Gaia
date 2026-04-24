'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceArea,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { DailyLog } from '@/types'
import { PHASES_CALENDRIER_CELL } from '@/lib/data/phases-design'
import { formaterDonneesDouleurs, plagesPhasesPourAxeCycle } from '@/lib/progression'

interface GraphiqueDouleursProps {
  logs: DailyLog[]
  cycleLength: number
}

export function GraphiqueDouleurs({ logs, cycleLength }: GraphiqueDouleursProps) {
  const { rows, cycles } = formaterDonneesDouleurs(logs, cycleLength)
  const plages = plagesPhasesPourAxeCycle(cycleLength)

  if (rows.length === 0 || cycles.length === 0) {
    return (
      <div className="min-h-[200px] flex items-center justify-center text-sm text-neutral-500 dark:text-neutral-400 px-4 text-center">
        Commence à logger tes douleurs dans le journal quotidien pour voir l&apos;évolution par cycle.
      </div>
    )
  }

  return (
    <div className="w-full min-w-0">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={rows} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" />
          {plages.map((p) => (
            <ReferenceArea
              key={p.phase}
              x1={p.debut - 0.5}
              x2={p.fin + 0.5}
              y1={0}
              y2={10}
              fill={PHASES_CALENDRIER_CELL[p.phase].bg}
              fillOpacity={0.4}
              strokeOpacity={0}
            />
          ))}
            <XAxis
              dataKey="jour"
              type="number"
              domain={[1, cycleLength]}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              label={{ value: 'Jour du cycle', position: 'bottom', offset: 0, fill: '#64748b', fontSize: 11 }}
            />
            <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: '#94a3b8' }} width={32} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null
                const jour = label as number
                const ligne = payload.find((p) => p.value != null && typeof p.value === 'number')
                if (!ligne) return null
                const idx = cycles.findIndex((c) => c.cle === ligne.dataKey)
                const num = idx >= 0 ? idx + 1 : '?'
                const pts = logs.filter((l) => l.cycle_day === jour && l.pain === ligne.value)
                const dateTxt = pts[0]?.date
                  ? format(parseISO(pts[0].date), 'd MMM yyyy', { locale: fr })
                  : ''
                return (
                  <div className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs text-neutral-100 shadow-lg">
                    <p className="font-medium">Cycle {num} — Jour {jour}</p>
                    {dateTxt ? <p className="text-neutral-400">{dateTxt}</p> : null}
                    <p>Douleur : {ligne.value}/10</p>
                  </div>
                )
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: 8 }}
              formatter={(v) => <span className="text-neutral-500 dark:text-neutral-400">{v}</span>}
            />
            {cycles.map((c) => (
              <Line
                key={c.cle}
                type="monotone"
                dataKey={c.cle}
                name={`Cycle ${c.numero}`}
                stroke={c.couleur}
                strokeWidth={2}
                dot={{ r: 3 }}
                connectNulls
              />
            ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
