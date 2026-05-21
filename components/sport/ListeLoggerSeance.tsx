'use client'

import { ChevronRight } from 'lucide-react'
import {
  carteSuggereePourTypeJour,
  ordreCartesLogger,
  ouvrirAutrePourTypeJour,
  sousTitreCarteLogger,
  type SportLoggerId,
} from '@/lib/sport-page'
import { getActiviteduJour } from '@/lib/planning-sport'
import type { PlanningSport, SeanceProfil } from '@/types'
import { cn } from '@/lib/utils'

interface ListeLoggerSeanceProps {
  planning: PlanningSport
  seanceProfils: SeanceProfil[]
  formOuvert: SportLoggerId | 'autre' | null
  onOuvrir: (id: SportLoggerId | 'autre') => void
}

export function ListeLoggerSeance({
  planning,
  seanceProfils,
  formOuvert,
  onOuvrir,
}: ListeLoggerSeanceProps) {
  const typeJour = getActiviteduJour(planning, new Date())
  const suggeree = carteSuggereePourTypeJour(typeJour)
  const autreSuggere = ouvrirAutrePourTypeJour(typeJour)
  const cartes = ordreCartesLogger(typeJour)

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
        Logger une séance
      </h2>

      <ul className="flex flex-col gap-2">
        {cartes.map((carte) => {
          const estSuggeree = carte.id === suggeree
          const ouvert = formOuvert === carte.id

          return (
            <li key={carte.id}>
              <button
                type="button"
                onClick={() => onOuvrir(carte.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors',
                  ouvert
                    ? 'border-amber-300 bg-amber-50/80 dark:border-amber-700 dark:bg-amber-950/30'
                    : 'border-neutral-200 bg-white hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/80 dark:hover:bg-neutral-900'
                )}
              >
                <span className="text-xl leading-none" aria-hidden>
                  {carte.emoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-neutral-900 dark:text-neutral-50">
                      {carte.nom}
                    </span>
                    {estSuggeree ? (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-900 dark:bg-amber-900/50 dark:text-amber-100">
                        Suggéré aujourd&apos;hui
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {sousTitreCarteLogger(carte, typeJour, seanceProfils)}
                  </span>
                </span>
                <ChevronRight
                  className="size-4 shrink-0 text-neutral-400 dark:text-neutral-500"
                  aria-hidden
                />
              </button>
            </li>
          )
        })}
      </ul>

      <button
        type="button"
        onClick={() => onOuvrir('autre')}
        className={cn(
          'self-start text-sm text-muted-foreground transition-colors hover:text-neutral-900 dark:hover:text-neutral-200',
          formOuvert === 'autre' && 'font-medium text-neutral-900 dark:text-neutral-100'
        )}
      >
        {autreSuggere ? '+ Autre sport · suggéré aujourd\'hui' : '+ Autre sport'}
      </button>
    </section>
  )
}
