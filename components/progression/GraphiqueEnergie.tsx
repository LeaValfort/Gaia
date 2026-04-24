'use client'

import { useState } from 'react'
import {
  ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Label } from '@/components/ui/label'
import type { DailyLog, Phase } from '@/types'
import { formaterDonneesEnergie } from '@/lib/progression'

const COULEUR_PHASE: Record<Phase, string> = {
  menstruation: '#ef4444',
  folliculaire: '#f59e0b',
  ovulation: '#f472b6',
  luteale: '#a855f7',
}

interface GraphiqueEnergieProps {
  logs: DailyLog[]
}

export function GraphiqueEnergie({ logs }: GraphiqueEnergieProps) {
  const [afficherDouleur, setAfficherDouleur] = useState(true)
  const points = formaterDonneesEnergie(logs)
  const data = points.map((p) => ({ ...p, x: p.date }))

  if (points.length === 0) {
    return (
      <div className="min-h-[200px] flex items-center justify-center text-sm text-neutral-500 dark:text-neutral-400">
        Pas encore de données — remplis ton journal sur quelques jours.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <input
          id="toggle-douleur"
          type="checkbox"
          checked={afficherDouleur}
          onChange={(e) => setAfficherDouleur(e.target.checked)}
          className="rounded border-neutral-300"
        />
        <Label htmlFor="toggle-douleur" className="text-xs font-normal cursor-pointer text-neutral-600 dark:text-neutral-300">
          Afficher la douleur (axe droit)
        </Label>
      </div>
      <div className="w-full min-w-0">
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
          >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" />
              <XAxis dataKey="x" tick={{ fontSize: 10, fill: '#94a3b8' }} interval="preserveStartEnd" />
              <YAxis yAxisId="e" domain={[0, 5]} tick={{ fontSize: 10, fill: '#f59e0b' }} width={28} />
              {afficherDouleur ? (
                <YAxis yAxisId="d" orientation="right" domain={[0, 10]} tick={{ fontSize: 10, fill: '#14b8a6' }} width={28} />
              ) : null}
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.[0]) return null
                  const row = payload[0].payload as typeof data[0]
                  const iso = row.label as string
                  const dateLong = format(parseISO(iso), 'EEEE d MMM yyyy', { locale: fr })
                  return (
                    <div className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs text-neutral-100">
                      <p className="capitalize text-neutral-300">{dateLong}</p>
                      <p>Énergie : {row.valeur ?? '—'}/5</p>
                      <p>Douleur : {row.douleur ?? '—'}/10</p>
                      <p>Humeur : {row.humeur?.trim() ? row.humeur : '—'}</p>
                    </div>
                  )
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line
                yAxisId="e"
                type="monotone"
                dataKey="valeur"
                name="Énergie"
                stroke="#f59e0b"
                strokeWidth={2}
                connectNulls
                dot={(props) => {
                  const { cx, cy, payload } = props
                  if (payload == null || cx == null || cy == null) return null
                  const ph = payload.phase as Phase | null | undefined
                  if (!ph || payload.valeur == null) return <circle cx={cx} cy={cy} r={0} />
                  return <circle cx={cx} cy={cy} r={4} fill={COULEUR_PHASE[ph]} stroke="#171717" strokeWidth={0.5} />
                }}
              />
              {afficherDouleur ? (
                <Line yAxisId="d" type="monotone" dataKey="douleur" name="Douleur" stroke="#2dd4bf" strokeWidth={2} dot={false} connectNulls />
              ) : null}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
