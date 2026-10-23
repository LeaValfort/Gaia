'use client'

import { useMemo, useState } from 'react'
import { ShoppingBasket } from 'lucide-react'
import { ingredientsTotaux } from '@/lib/alimentation/ingredients-totaux'
import { cn } from '@/lib/utils'
import type { Recipe } from '@/types'

/**
 * Tous les ingrédients de la session, quantités totales additionnées : à sortir
 * avant de commencer. Cases à cocher locales (mise en place), non enregistrées.
 */
export function IngredientsBatch({ recettes }: { recettes: Recipe[] }) {
  const liste = useMemo(() => ingredientsTotaux(recettes), [recettes])
  const [sortis, setSortis] = useState<Set<string>>(new Set())
  if (!liste.length) return null

  const basculer = (nom: string) =>
    setSortis((s) => {
      const n = new Set(s)
      if (n.has(nom)) n.delete(nom)
      else n.add(nom)
      return n
    })

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 dark:border-amber-900/50 dark:bg-amber-950/20">
      <p className="mb-2 flex items-center justify-between gap-2 text-sm font-semibold text-amber-950 dark:text-amber-100">
        <span className="flex items-center gap-1.5">
          <ShoppingBasket className="size-4" aria-hidden /> Ingrédients pour toute la session
        </span>
        <span className="text-xs font-normal text-muted-foreground">
          {sortis.size}/{liste.length} sortis
        </span>
      </p>
      <ul className="grid gap-x-4 gap-y-1 sm:grid-cols-2">
        {liste.map((i) => (
          <li key={i.nom}>
            <button
              type="button"
              onClick={() => basculer(i.nom)}
              title={`Pour : ${i.recettes.join(', ')}`}
              className={cn('flex w-full items-baseline justify-between gap-2 text-left text-sm', sortis.has(i.nom) && 'text-muted-foreground line-through')}
            >
              <span className="min-w-0 truncate first-letter:uppercase">{i.nom}</span>
              <span className="shrink-0 font-medium tabular-nums">{i.quantite}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
