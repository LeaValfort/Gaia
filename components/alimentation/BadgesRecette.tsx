'use client'

// Badges réutilisables sur les cartes recette (Chantier 5b) : temps de préparation,
// Nutri-score (si les valeurs pour 100g sont connues) et cœur favori (si la recette est
// déjà sauvegardée, donc togglable). Évite de dupliquer cette logique dans chaque carte.
import { Clock, Heart } from 'lucide-react'
import { calculerNutriScore } from '@/lib/nutrition/nutri-score'
import { cn } from '@/lib/utils'
import type { Nutrition100g } from '@/types'

const NUTRISCORE_STYLES: Record<string, string> = {
  A: 'bg-green-600 text-white',
  B: 'bg-lime-500 text-white',
  C: 'bg-amber-500 text-white',
  D: 'bg-orange-600 text-white',
  E: 'bg-red-600 text-white',
}

interface BadgesRecetteProps {
  tempsMin?: number | null
  nutrition100g?: Nutrition100g | null
  /** Omis pour une recette pas encore sauvegardée (pas d'id à basculer). */
  favori?: boolean
  onToggleFavori?: () => void
  className?: string
}

export function BadgesRecette({ tempsMin, nutrition100g, favori, onToggleFavori, className }: BadgesRecetteProps) {
  const nutriScore = nutrition100g ? calculerNutriScore(nutrition100g) : null

  if (!tempsMin && !nutriScore && !onToggleFavori) return null

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      {tempsMin ? (
        <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
          <Clock className="size-3" aria-hidden />
          {tempsMin} min
        </span>
      ) : null}

      {nutriScore ? (
        <span
          className={cn(
            'inline-flex size-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold',
            NUTRISCORE_STYLES[nutriScore]
          )}
          title="Nutri-score estimé à partir des valeurs pour 100 g"
        >
          {nutriScore}
        </span>
      ) : null}

      {onToggleFavori ? (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onToggleFavori()
          }}
          className="ml-auto text-muted-foreground transition-colors hover:text-rose-500"
          aria-label={favori ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          aria-pressed={favori}
        >
          <Heart className={cn('size-3.5', favori && 'fill-rose-500 text-rose-500')} aria-hidden />
        </button>
      ) : null}
    </div>
  )
}
