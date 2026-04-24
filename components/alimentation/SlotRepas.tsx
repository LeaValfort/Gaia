'use client'

import { useState } from 'react'
import { Plus, Minus, X, UtensilsCrossed } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import type { TypeRepas, MealPlan, MealPlanComplet, Recipe, OptionPetitDej } from '@/types'
import { calculerMacrosAvecPortions } from '@/lib/mealplan'

const LABELS_REPAS: Record<TypeRepas, string> = {
  'petit-dej': '🌅 Petit-déj',
  'dejeuner':  '☀️ Déjeuner',
  'collation': '🍎 Collation',
  'diner':     '🌙 Dîner',
}

interface SlotRepasProps {
  typeRepas: TypeRepas
  plan: MealPlanComplet | null
  recettesDisponibles: Recipe[]
  optionsPetitDej: OptionPetitDej[]
  date: string
  weekStart: string
  onUpdate: (plan: Omit<MealPlan, 'id' | 'user_id' | 'created_at'>) => void
  onDelete: (planId: string) => void
}

export default function SlotRepas({
  typeRepas, plan, recettesDisponibles, optionsPetitDej, date, weekStart, onUpdate, onDelete,
}: SlotRepasProps) {
  const [ouvert, setOuvert] = useState(false)

  const recettesFiltrees = typeRepas === 'petit-dej'
    ? []
    : recettesDisponibles.filter((r) => r.type_repas === typeRepas || r.type_repas === null)

  const handleChoisirPetitDej = (pd: OptionPetitDej) => {
    onUpdate({ week_start: weekStart, date, type_repas: typeRepas, recette_id: null, petit_dej_id: pd.id, portions: 1, notes: null })
    setOuvert(false)
  }

  const handleChoisirRecette = (r: Recipe) => {
    onUpdate({ week_start: weekStart, date, type_repas: typeRepas, recette_id: r.id, petit_dej_id: null, portions: 1, notes: null })
    setOuvert(false)
  }

  const handlePortions = (delta: number) => {
    if (!plan) return
    const nouvPortions = Math.max(1, Math.min(4, plan.portions + delta))
    onUpdate({ week_start: weekStart, date, type_repas: typeRepas, recette_id: plan.recette_id, petit_dej_id: plan.petit_dej_id, portions: nouvPortions, notes: plan.notes })
  }

  // Slot rempli
  if (plan && (plan.recette || plan.petitDej)) {
    const nom    = plan.recette?.nom ?? plan.petitDej?.nom ?? ''
    const macros = plan.recette
      ? calculerMacrosAvecPortions(plan.recette, plan.portions)
      : plan.petitDej
        ? { calories: plan.petitDej.calories * plan.portions, proteines: plan.petitDej.proteines * plan.portions, glucides: 0, lipides: 0 }
        : null

    return (
      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-2 text-xs flex flex-col gap-1">
        <div className="flex items-start justify-between gap-1">
          <span className="font-medium text-neutral-800 dark:text-neutral-200 leading-tight line-clamp-2">
            {nom}
          </span>
          <button
            onClick={() => onDelete(plan.id)}
            className="text-neutral-400 hover:text-red-500 shrink-0 mt-0.5"
            aria-label="Supprimer"
          >
            <X size={12} />
          </button>
        </div>

        {macros && (
          <p className="text-neutral-400 text-xs">{macros.calories} kcal · {macros.proteines}g P</p>
        )}

        {/* Sélecteur portions */}
        <div className="flex items-center gap-1 mt-0.5">
          <button onClick={() => handlePortions(-1)} className="hover:text-neutral-700 dark:hover:text-neutral-200" aria-label="Moins">
            <Minus size={12} />
          </button>
          <span className="min-w-[20px] text-center">{plan.portions}p</span>
          <button onClick={() => handlePortions(1)} className="hover:text-neutral-700 dark:hover:text-neutral-200" aria-label="Plus">
            <Plus size={12} />
          </button>
        </div>
      </div>
    )
  }

  // Slot vide
  return (
    <Popover open={ouvert} onOpenChange={setOuvert}>
      <PopoverTrigger className="w-full rounded-lg border border-dashed border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500 p-2 flex items-center gap-1.5 text-xs text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-400 transition-colors">
        <Plus size={12} />
        <span>{LABELS_REPAS[typeRepas]}</span>
      </PopoverTrigger>

      <PopoverContent className="w-64 p-2 max-h-72 overflow-y-auto" align="start">
        <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-2 px-1">
          {LABELS_REPAS[typeRepas]}
        </p>

        {typeRepas === 'petit-dej' ? (
          optionsPetitDej.map((pd) => (
            <button
              key={pd.id}
              onClick={() => handleChoisirPetitDej(pd)}
              className="w-full text-left rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 p-2 text-xs flex flex-col gap-0.5"
            >
              <span className="font-medium">{pd.emoji} {pd.nom}</span>
              <span className="text-neutral-400">{pd.calories} kcal · {pd.proteines}g P · {pd.tempsMin} min</span>
            </button>
          ))
        ) : recettesFiltrees.length === 0 ? (
          <div className="text-xs text-neutral-400 py-4 text-center flex flex-col items-center gap-2">
            <UtensilsCrossed size={20} className="opacity-40" />
            <p>Aucune recette sauvegardée pour ce repas.</p>
            <Badge variant="outline" className="text-xs">Va dans l&apos;onglet Suggestions</Badge>
          </div>
        ) : (
          recettesFiltrees.map((r) => (
            <button
              key={r.id}
              onClick={() => handleChoisirRecette(r)}
              className="w-full text-left rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 p-2 text-xs flex flex-col gap-0.5"
            >
              <span className="font-medium">{r.nom}</span>
              {r.calories && (
                <span className="text-neutral-400">{r.calories} kcal{r.temps_min ? ` · ${r.temps_min} min` : ''}</span>
              )}
            </button>
          ))
        )}
      </PopoverContent>
    </Popover>
  )
}
