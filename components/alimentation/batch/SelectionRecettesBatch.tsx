'use client'

import { useState } from 'react'
import { ChefHat } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import type { Recipe } from '@/types'

const MAX = 6

interface SelectionRecettesBatchProps {
  recettes: Recipe[]
  /** Recettes du planning de la semaine : cochées et affichées en premier. */
  planifiees: string[]
  generation: boolean
  onGenerer: (ids: string[]) => void
}

/** Choix des recettes à cuisiner en une session (6 max). Remonter via `key` pour réinitialiser. */
export function SelectionRecettesBatch({ recettes, planifiees, generation, onGenerer }: SelectionRecettesBatchProps) {
  const [choisies, setChoisies] = useState<string[]>(() => planifiees.slice(0, MAX))
  const triees = [...recettes].sort((a, b) => Number(planifiees.includes(b.id)) - Number(planifiees.includes(a.id)))

  const basculer = (id: string) =>
    setChoisies((c) => (c.includes(id) ? c.filter((x) => x !== id) : c.length < MAX ? [...c, id] : c))

  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">Recettes à préparer</h3>
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
