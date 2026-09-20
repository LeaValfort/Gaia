'use client'

import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { VignetteRecette } from '@/components/alimentation/VignetteRecette'
import type { Recipe } from '@/types'

function macroAffichable(v: number): boolean {
  return v > 0
}

/** Carte pour une recette perso déjà sauvegardée (a un id, sa fiche détail existe déjà). */
export function RecettePersoCard({ recette }: { recette: Recipe }) {
  const macros = [
    macroAffichable(recette.calories ?? 0) ? { label: `${recette.calories} kcal`, className: 'text-orange-600 dark:text-orange-400' } : null,
    macroAffichable(recette.proteines ?? 0) ? { label: `${recette.proteines}g P`, className: 'text-blue-600 dark:text-blue-400' } : null,
  ].filter((m): m is { label: string; className: string } => m !== null)

  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col">
      <VignetteRecette imageUrl={recette.image_url} nom={recette.nom} className="h-24 w-full" />
      <div className="p-3 flex flex-col gap-2 flex-1">
        <Badge variant="outline" className="text-xs w-fit">📖 Ta recette</Badge>
        <p className="font-semibold text-sm text-neutral-900 dark:text-neutral-50 leading-snug">{recette.nom}</p>
        {macros.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {macros.map(({ label, className }) => (
              <Badge key={label} variant="outline" className={`text-xs ${className}`}>{label}</Badge>
            ))}
          </div>
        ) : null}
        <a href={`/alimentation/recette/${recette.id}`} className="mt-auto pt-1">
          <Button size="sm" variant="ghost" className="text-xs h-7 px-2">
            <ExternalLink size={11} className="mr-1" />Voir
          </Button>
        </a>
      </div>
    </div>
  )
}
