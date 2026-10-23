'use client'

import { useState } from 'react'
import { ChefHat } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import type { Recipe } from '@/types'

/** Au-delà, le déroulé devient trop long pour une seule session. */
export const MAX_RECETTES_BATCH = 12

interface SelectionRecettesBatchProps {
  recettes: Recipe[]
  /** Recettes du planning de la semaine : cochées et affichées en premier. */
  planifiees: string[]
  generation: boolean
  onGenerer: (ids: string[]) => void
}

/** Choix des recettes à cuisiner en une session (12 max). Remonter via `key` pour réinitialiser. */
export function SelectionRecettesBatch({ recettes, planifiees, generation, onGenerer }: SelectionRecettesBatchProps) {
  const [choisies, setChoisies] = useState<string[]>(() => planifiees.slice(0, MAX_RECETTES_BATCH))
  const triees = [...recettes].sort((a, b) => Number(planifiees.includes(b.id)) - Number(planifiees.includes(a.id)))

  const basculer = (id: string) =>
    setChoisies((c) => (c.includes(id) ? c.filter((x) => x !== id) : c.length < MAX_RECETTES_BATCH ? [...c, id] : c))

  return (
    <section className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">Recettes à préparer</h3>
        <span className="flex gap-3 text-xs">
          {planifiees.length ? (
            <button type="button" className="text-amber-700 hover:underline dark:text-amber-300" onClick={() => setChoisies(planifiees.slice(0, MAX_RECETTES_BATCH))}>
              Toute la semaine
            </button>
          ) : null}
          <button type="button" className="text-amber-700 hover:underline dark:text-amber-300" onClick={() => setChoisies(triees.slice(0, MAX_RECETTES_BATCH).map((r) => r.id))}>
            Tout
          </button>
          {choisies.length ? (
            <button type="button" className="text-muted-foreground hover:underline" onClick={() => setChoisies([])}>
              Aucune
            </button>
          ) : null}
        </span>
      </div>
      {choisies.length >= MAX_RECETTES_BATCH ? (
        <p className="text-xs text-muted-foreground">{MAX_RECETTES_BATCH} recettes au maximum par session.</p>
      ) : null}
      {recettes.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucune recette enregistrée : demande des recettes liées ci-dessous.</p>
      ) : (
        <ul className="max-h-64 space-y-1 overflow-y-auto rounded-xl border border-neutral-200 p-2 dark:border-neutral-800">
          {triees.map((r) => (
            <li key={r.id}>
              <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800/60">
                <Checkbox checked={choisies.includes(r.id)} onCheckedChange={() => basculer(r.id)} />
                <span className="min-w-0 flex-1 truncate">{r.nom}</span>
                {planifiees.includes(r.id) ? (
                  <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] text-amber-900 dark:bg-amber-900/50 dark:text-amber-100">Au planning</span>
                ) : null}
              </label>
            </li>
          ))}
        </ul>
      )}
      <Button
        type="button"
        disabled={!choisies.length || generation}
        onClick={() => onGenerer(choisies)}
        className="alimentation-btn-primaire w-full"
      >
        <ChefHat className="mr-1.5 size-4" />
        {generation ? 'Gaia organise ta session…' : `Créer mon déroulé (${choisies.length} recette${choisies.length > 1 ? 's' : ''})`}
      </Button>
    </section>
  )
}
