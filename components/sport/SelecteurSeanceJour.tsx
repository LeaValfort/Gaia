'use client'

import { useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LABELS_PLANNING } from '@/lib/planning-sport'
import type { TypePlanningJour } from '@/types'
import { cn } from '@/lib/utils'

const OPTIONS: TypePlanningJour[] = ['muscu_full', 'muscu_upper', 'yoga', 'natation', 'autre', 'repos']

export interface SelecteurSeanceJourProps {
  /** Activité effective du jour (planning hebdo, ou substitution si active) */
  typeEffectif: TypePlanningJour
  overrideActif: boolean
  onChanger: (type: TypePlanningJour) => void
  onRevenir: () => void
  chargement?: boolean
}

/**
 * Widget "Changer la séance d'aujourd'hui" : remplace ponctuellement l'activité
 * prévue pour la date du jour, sans jamais modifier le planning hebdo lui-même.
 */
export function SelecteurSeanceJour({
  typeEffectif,
  overrideActif,
  onChanger,
  onRevenir,
  chargement,
}: SelecteurSeanceJourProps) {
  const [ouvert, setOuvert] = useState(false)
  const meta = LABELS_PLANNING[typeEffectif]

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900/80">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-neutral-700 dark:text-neutral-200">
          Aujourd&apos;hui :{' '}
          <span className="font-semibold">
            {meta.emoji} {meta.label}
          </span>
          {overrideActif ? (
            <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-900 dark:bg-amber-900/50 dark:text-amber-100">
              Remplacée
            </span>
          ) : null}
        </p>
        <div className="flex items-center gap-2">
          {overrideActif ? (
            <Button type="button" size="sm" variant="ghost" disabled={chargement} onClick={onRevenir}>
              <RotateCcw className="mr-1 size-3.5" /> Planning
            </Button>
          ) : null}
          <Button type="button" size="sm" variant="outline" disabled={chargement} onClick={() => setOuvert((o) => !o)}>
            Changer
          </Button>
        </div>
      </div>
      {ouvert ? (
        <div className="flex flex-wrap gap-1.5">
          {OPTIONS.map((t) => {
            const m = LABELS_PLANNING[t]
            return (
              <button
                key={t}
                type="button"
                disabled={chargement}
                onClick={() => {
                  onChanger(t)
                  setOuvert(false)
                }}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                  t === typeEffectif
                    ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                    : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300'
                )}
              >
                {m.emoji} {m.label}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
