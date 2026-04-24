'use client'

import { useMemo, useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { Button } from '@/components/ui/button'
import { EncartVariationMensurations } from '@/components/progression/EncartVariationMensurations'
import type { Mensuration } from '@/types'
import { formaterDonneesMensurations } from '@/lib/progression'

const OBJECTIF_POIDS = 55

type CleMesure = 'taille' | 'hanches' | 'bras' | 'cuisses'

const LABELS: Record<CleMesure, string> = {
  taille: 'Taille',
  hanches: 'Hanches',
  bras: 'Bras (moy.)',
  cuisses: 'Cuisses (moy.)',
}

const COULEURS: Record<CleMesure, string> = {
  taille: '#3b82f6',
  hanches: '#a855f7',
  bras: '#f59e0b',
  cuisses: '#14b8a6',
}

interface GraphiqueMensurationsProps {
  mensurations: Mensuration[]
  /** Colonne latérale desktop : graphiques un peu plus compacts */
  compact?: boolean
}

export function GraphiqueMensurations({ mensurations, compact }: GraphiqueMensurationsProps) {
  const hChart = compact ? 240 : 300
  const [actifs, setActifs] = useState<Set<CleMesure>>(new Set(['taille']))
  const fmt = useMemo(() => formaterDonneesMensurations(mensurations), [mensurations])

  const merged = useMemo(
    () =>
      fmt.poids.map((_, i) => ({
        x: fmt.poids[i].date,
        poids: fmt.poids[i].valeur,
        taille: fmt.taille[i]?.valeur ?? null,
        hanches: fmt.hanches[i]?.valeur ?? null,
        bras: fmt.bras[i]?.valeur ?? null,
        cuisses: fmt.cuisses[i]?.valeur ?? null,
      })),
    [fmt]
  )

  function toggle(k: CleMesure) {
    setActifs((prev) => {
      const n = new Set(prev)
      if (n.has(k)) n.delete(k)
      else n.add(k)
      return n
    })
  }

  if (mensurations.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 p-6 text-center text-sm text-neutral-500">
        Aucune mensuration. Ajoute une première mesure pour suivre ton évolution.
      </div>
    )
  }

  return (
    <div className={compact ? 'flex flex-col gap-3' : 'flex flex-col gap-6'}>
      <EncartVariationMensurations poids={fmt.poids} taille={fmt.taille} hanches={fmt.hanches} />

      <div>
        <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 mb-2">Poids (kg)</h3>
        <div className="w-full min-w-0">
          <ResponsiveContainer width="100%" height={hChart}>
            <LineChart
              data={fmt.poids}
              margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#94a3b8' }} width={36} />
                <ReferenceLine y={OBJECTIF_POIDS} stroke="#64748b" strokeDasharray="4 4" label={{ value: `${OBJECTIF_POIDS} kg`, fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ background: '#171717', border: '1px solid #404040', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#a3a3a3' }}
                  formatter={(v) => {
                    const n = typeof v === 'number' ? v : Number(v)
                    const t = Number.isFinite(n) ? `${n} kg` : '—'
                    return [t, 'Poids']
                  }}
                />
                <Line type="monotone" dataKey="valeur" name="Poids" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={compact ? 'pt-0' : ''}>
        <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 mb-2">Mensurations (cm)</h3>
        <div className="flex flex-wrap gap-2 mb-2">
          {(Object.keys(LABELS) as CleMesure[]).map((k) => (
            <Button
              key={k}
              type="button"
              variant={actifs.has(k) ? 'default' : 'outline'}
              size="sm"
              className="h-8 text-xs"
              onClick={() => toggle(k)}
            >
              {LABELS[k]}
            </Button>
          ))}
        </div>
        <div className="w-full min-w-0">
          <ResponsiveContainer width="100%" height={hChart}>
            <LineChart
              data={merged}
              margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" />
                <XAxis dataKey="x" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} width={36} />
                <Tooltip contentStyle={{ background: '#171717', border: '1px solid #404040', borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {actifs.has('taille') ? <Line type="monotone" dataKey="taille" name="Taille" stroke={COULEURS.taille} strokeWidth={2} dot={{ r: 2 }} connectNulls /> : null}
                {actifs.has('hanches') ? <Line type="monotone" dataKey="hanches" name="Hanches" stroke={COULEURS.hanches} strokeWidth={2} dot={{ r: 2 }} connectNulls /> : null}
                {actifs.has('bras') ? <Line type="monotone" dataKey="bras" name="Bras" stroke={COULEURS.bras} strokeWidth={2} dot={{ r: 2 }} connectNulls /> : null}
                {actifs.has('cuisses') ? <Line type="monotone" dataKey="cuisses" name="Cuisses" stroke={COULEURS.cuisses} strokeWidth={2} dot={{ r: 2 }} connectNulls /> : null}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
