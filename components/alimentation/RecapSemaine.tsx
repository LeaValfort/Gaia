'use client'

import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { LIBELLES_REPAS_COURTS, repasPrevus, totalKcal } from '@/lib/alimentation/repas-prevus'
import type { MealPlanComplet } from '@/types'

interface RecapSemaineProps {
  dates: string[]
  plans: MealPlanComplet[]
}

/** Fiche compacte de la semaine : tous les repas prévus jour par jour, avec le total kcal. */
export function RecapSemaine({ dates, plans }: RecapSemaineProps) {
  const vide = plans.length === 0
  if (vide) {
    return <p className="rounded-xl bg-neutral-50 px-4 py-6 text-center text-sm text-muted-foreground dark:bg-neutral-900">Rien de prévu cette semaine : génère-la ou ajoute des repas dans la vue détaillée.</p>
  }
  return (
    <div className="divide-y divide-neutral-200 overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900">
      {dates.map((date) => {
        const repas = repasPrevus(plans.filter((p) => p.date === date))
        return (
          <div key={date} className="px-4 py-3">
            <div className="mb-1 flex items-baseline justify-between gap-2">
              <p className="text-sm font-semibold capitalize text-neutral-900 dark:text-neutral-50">
                {format(parseISO(`${date}T12:00:00`), 'EEEE d', { locale: fr })}
              </p>
              {repas.length ? <span className="text-xs text-muted-foreground">{totalKcal(repas)} kcal</span> : null}
            </div>
            {repas.length ? (
              <ul className="space-y-0.5">
                {repas.map((r) => (
                  <li key={r.type_repas} className="flex gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                    <span className="w-24 shrink-0 text-xs text-muted-foreground">{LIBELLES_REPAS_COURTS[r.type_repas]}</span>
                    <span className="min-w-0 flex-1 truncate">
                      {r.nom}
                      {r.portions > 1 ? ` ×${r.portions}` : ''}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground">—</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
