'use client'

import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ModaleModifierRecette } from '@/components/alimentation/ModaleModifierRecette'
import type { Recipe } from '@/types'

interface EnTeteRecetteProps {
  recette: Recipe
  userId: string
  nutriScore: string | null
}

const NUTRISCORE_STYLES: Record<string, string> = {
  A: 'bg-green-600 text-white',
  B: 'bg-lime-500 text-white',
  C: 'bg-amber-500 text-white',
  D: 'bg-orange-600 text-white',
  E: 'bg-red-600 text-white',
}

/** En-tête de la fiche recette : photo en fond derrière le titre si une a été ajoutée (via
 *  Modifier), sinon titre simple sur fond neutre. Le bouton Modifier ouvre le formulaire
 *  d'édition complet (dont l'ajout/changement de photo). */
export function EnTeteRecette({ recette, userId, nutriScore }: EnTeteRecetteProps) {
  const [ouvert, setOuvert] = useState(false)

  const badgeScore = nutriScore ? (
    <span
      className={`shrink-0 rounded-full size-8 flex items-center justify-center text-sm font-bold ${NUTRISCORE_STYLES[nutriScore]}`}
      title="Nutri-score estimé à partir des valeurs pour 100 g"
    >
      {nutriScore}
    </span>
  ) : null

  return (
    <div className="flex flex-col gap-2">
      {recette.image_url ? (
        <div className="relative h-40 w-full rounded-2xl overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={recette.image_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-3 flex items-end justify-between gap-3">
            <h1 className="text-xl font-bold text-white leading-snug drop-shadow">{recette.nom}</h1>
            {badgeScore}
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-50 leading-snug">{recette.nom}</h1>
          {badgeScore}
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        {recette.phase ? (
          <Badge variant="secondary" className="text-xs capitalize w-fit">{recette.phase}</Badge>
        ) : <span />}
        <Button size="sm" variant="outline" className="text-xs h-7 px-2" onClick={() => setOuvert(true)}>
          <Pencil size={11} className="mr-1" />Modifier
        </Button>
      </div>

      <ModaleModifierRecette recette={recette} userId={userId} ouvert={ouvert} onOuvertChange={setOuvert} />
    </div>
  )
}
