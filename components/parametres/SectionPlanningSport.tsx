'use client'

import { useMemo } from 'react'
import { LABELS_PLANNING, PLANNING_DEFAUT } from '@/lib/planning-sport'
import type { PlanningSport, TypePlanningJour, UserPreferences } from '@/types'

const TYPES_PLANNING: TypePlanningJour[] = [
  'muscu_full',
  'muscu_upper',
  'yoga',
  'natation',
  'autre',
  'repos',
]

const JOURS: { cle: keyof PlanningSport; label: string }[] = [
  { cle: 'lundi', label: 'Lundi' },
  { cle: 'mardi', label: 'Mardi' },
  { cle: 'mercredi', label: 'Mercredi' },
  { cle: 'jeudi', label: 'Jeudi' },
  { cle: 'vendredi', label: 'Vendredi' },
  { cle: 'samedi', label: 'Samedi' },
  { cle: 'dimanche', label: 'Dimanche' },
]

function planningEffectif(prefs: UserPreferences): PlanningSport {
  const d = PLANNING_DEFAUT
  const p = prefs.planning_sport
  if (!p) return d
  return {
    lundi: p.lundi ?? d.lundi,
    mardi: p.mardi ?? d.mardi,
    mercredi: p.mercredi ?? d.mercredi,
    jeudi: p.jeudi ?? d.jeudi,
    vendredi: p.vendredi ?? d.vendredi,
    samedi: p.samedi ?? d.samedi,
    dimanche: p.dimanche ?? d.dimanche,
  }
}

export interface SectionPlanningSportProps {
  prefs: UserPreferences
  onUpdate: (updates: Partial<UserPreferences>) => void
}

export function SectionPlanningSport({ prefs, onUpdate }: SectionPlanningSportProps) {
  const planning = useMemo(() => planningEffectif(prefs), [prefs])

  function modifieJour(cle: keyof PlanningSport, valeur: TypePlanningJour) {
    const next: PlanningSport = { ...planning, [cle]: valeur }
    void onUpdate({ planning_sport: next })
  }

  return (
    <section className="space-y-4 rounded-2xl border border-neutral-200 bg-white/90 p-4 dark:border-neutral-800 dark:bg-neutral-900/80">
      <div>
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
          📅 Mon planning sport
        </h2>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Configure ta semaine type — Gaia adaptera les suggestions selon ta phase du cycle
        </p>
      </div>
      <ul className="flex flex-col gap-2">
        {JOURS.map(({ cle, label }) => {
          const v = planning[cle]
          return (
            <li
              key={cle}
              className="flex flex-col gap-1.5 rounded-lg border border-neutral-100 bg-neutral-50/80 px-3 py-2 sm:flex-row sm:items-center sm:justify-between dark:border-neutral-800 dark:bg-neutral-950/40"
            >
              <span className="text-sm font-medium text-neutral-800 dark:text-neutral-100">{label}</span>
              <select
                value={v}
                aria-label={`Activité du ${label}`}
                onChange={(e) => modifieJour(cle, e.target.value as TypePlanningJour)}
                className="w-full min-w-0 rounded-lg border border-neutral-200 bg-white px-2 py-2 text-sm sm:max-w-xs sm:shrink-0 dark:border-neutral-700 dark:bg-neutral-900"
              >
                {TYPES_PLANNING.map((t) => {
                  const m = LABELS_PLANNING[t]
                  return (
                    <option key={t} value={t}>
                      {m.emoji} {m.label}
                    </option>
                  )
                })}
              </select>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
