'use client'

import { useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LABELS_PLANNING } from '@/lib/planning-sport'
import type { CarteSubstitution } from '@/lib/sport/substitution-jour'
import type { TypePlanningJour } from '@/types'
import { cn } from '@/lib/utils'

const OPTIONS: TypePlanningJour[] = ['muscu_full', 'muscu_upper', 'yoga', 'natation', 'autre', 'repos']

export interface SelecteurSeanceJourProps {
  /** Séance ciblée (ou substitution "libre" du jour entier s'il n'y a aucune séance prévue). */
  carte: CarteSubstitution
  onChanger: (type: TypePlanningJour) => void
  onRevenir: () => void
  chargement?: boolean
}

/**
 * Widget "Changer la séance" pour UNE séance du jour : remplace ponctuellement
 * l'activité, sans jamais modifier le planning hebdo lui-même. La page Sport
 * en affiche une par séance prévue ce jour-là (voir `cartesSubstitutionJour`
 * dans `lib/sport/substitution-jour.ts`).
 */
export function SelecteurSeanceJour({ carte, onChanger, onRevenir, chargement }: SelecteurSeanceJourProps) {
  const [ouvert, setOuvert] = useState(false)

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900/80">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-neutral-700 dark:text-neutral-200">
          <span className="font-semibold">
            {carte.emoji} {carte.label}
          </span>
          {carte.overrideActif ? (
            <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-900 dark:bg-amber-900/50 dark:text-amber-100">
              Remplacée
            </span>
          ) : null}
        </p>
        <div className="flex items-center gap-2">
          {carte.overrideActif ? (
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
                  t === carte.typeEffectif
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
