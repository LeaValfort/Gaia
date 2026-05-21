'use client'

import { useState, type MouseEvent } from 'react'
import Link from 'next/link'
import { ChevronRight, Clock, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Phase, Recipe } from '@/types'
import { cn } from '@/lib/utils'

const PHASE_STYLES: Record<string, string> = {
  menstruation: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  folliculaire: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  ovulation: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
  luteale: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
}

const PHASE_LABELS: Record<string, string> = {
  menstruation: 'Menstruation',
  folliculaire: 'Folliculaire',
  ovulation: 'Ovulation',
  luteale: 'Lutéale',
}

const PHASE_EMOJI: Record<Phase, string> = {
  menstruation: '🩸',
  folliculaire: '🌱',
  ovulation: '✨',
  luteale: '🍂',
}

interface CarteRecetteProps {
  recette: Recipe
  onDelete: (id: string) => void
}

export function CarteRecette({ recette, onDelete }: CarteRecetteProps) {
  const [confirmation, setConfirmation] = useState(false)

  const urlRecette = recette.spoonacular_id
    ? `/alimentation/recette/${recette.spoonacular_id}`
    : null

  const emoji = recette.phase ? PHASE_EMOJI[recette.phase] : '🍽️'

  function handleDelete(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault()
    e.stopPropagation()
    if (!confirmation) {
      setConfirmation(true)
      return
    }
    onDelete(recette.id)
  }

  const contenu = (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <div
        className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-xl dark:bg-neutral-800"
        aria-hidden
      >
        {emoji}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-50">
          {recette.nom}
        </p>
        <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
          {recette.phase ? (
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                PHASE_STYLES[recette.phase] ?? 'bg-neutral-100 text-neutral-600'
              )}
            >
              {PHASE_LABELS[recette.phase] ?? recette.phase}
            </span>
          ) : null}
          {recette.temps_min ? (
            <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <Clock className="size-3" aria-hidden />
              {recette.temps_min} min
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-0.5">
        <Button
          type="button"
          size="icon-sm"
          variant={confirmation ? 'destructive' : 'ghost'}
          onClick={handleDelete}
          onBlur={() => setConfirmation(false)}
          className="text-muted-foreground hover:text-destructive"
          aria-label={confirmation ? 'Confirmer la suppression' : 'Supprimer la recette'}
        >
          <Trash2 className="size-4" />
        </Button>
        {urlRecette ? (
          <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        ) : null}
      </div>
    </div>
  )

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white transition-colors hover:bg-neutral-50/80 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-900/80">
      {urlRecette ? (
        <Link href={urlRecette} className="block p-3">
          {contenu}
        </Link>
      ) : (
        <div className="p-3">{contenu}</div>
      )}
    </div>
  )
}
