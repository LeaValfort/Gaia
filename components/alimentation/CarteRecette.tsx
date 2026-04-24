'use client'

import { useState } from 'react'
import { Clock, Trash2, BookOpen } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Recipe } from '@/types'
import { formaterLigneIngredient } from '@/lib/nutrition'

// Couleurs des badges par phase
const PHASE_STYLES: Record<string, string> = {
  menstruation: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  folliculaire: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  ovulation:    'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
  luteale:      'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
}

const PHASE_LABELS: Record<string, string> = {
  menstruation: 'Menstruation',
  folliculaire:  'Folliculaire',
  ovulation:    'Ovulation',
  luteale:      'Lutéale',
}

const REPAS_LABELS: Record<string, string> = {
  'petit-dej': 'Petit-déj',
  dejeuner:    'Déjeuner',
  collation:   'Collation',
  diner:       'Dîner',
}

interface CarteRecetteProps {
  recette: Recipe
  onDelete: (id: string) => void
}

export function CarteRecette({ recette, onDelete }: CarteRecetteProps) {
  const [confirmation, setConfirmation] = useState(false)

  const MAX_INGREDIENTS_AFFICHES = 3
  const ingredientsAffiches = recette.ingredients.slice(0, MAX_INGREDIENTS_AFFICHES)
  const resteIngredients = recette.ingredients.length - MAX_INGREDIENTS_AFFICHES

  function handleDelete() {
    if (!confirmation) { setConfirmation(true); return }
    onDelete(recette.id)
  }

  const urlRecette = recette.spoonacular_id
    ? `/alimentation/recette/${recette.spoonacular_id}`
    : null

  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5">
        {recette.phase && (
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${PHASE_STYLES[recette.phase] ?? 'bg-neutral-100 text-neutral-600'}`}>
            {PHASE_LABELS[recette.phase] ?? recette.phase}
          </span>
        )}
        {recette.type_repas && (
          <Badge variant="outline" className="text-[10px] h-5">
            {REPAS_LABELS[recette.type_repas] ?? recette.type_repas}
          </Badge>
        )}
      </div>

      {/* Titre */}
      <p className="font-semibold text-sm text-neutral-900 dark:text-neutral-50 leading-snug">{recette.nom}</p>

      {/* Temps + raison */}
      <div className="flex flex-col gap-1">
        {recette.temps_min && (
          <span className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
            <Clock size={11} /> {recette.temps_min} min
          </span>
        )}
        {recette.raison && (
          <p className="text-xs text-neutral-400 dark:text-neutral-500 italic">{recette.raison}</p>
        )}
      </div>

      {/* Ingrédients */}
      {recette.ingredients.length > 0 && (
        <ul className="flex flex-col gap-0.5">
          {ingredientsAffiches.map((ing, i) => (
            <li key={i} className="text-xs text-neutral-600 dark:text-neutral-400 truncate">• {formaterLigneIngredient(ing)}</li>
          ))}
          {resteIngredients > 0 && (
            <li className="text-xs text-neutral-400 dark:text-neutral-500">et {resteIngredients} autre{resteIngredients > 1 ? 's' : ''}...</li>
          )}
        </ul>
      )}

      {/* Boutons */}
      <div className="flex gap-2 mt-auto pt-1">
        {urlRecette ? (
          <a href={urlRecette} target="_blank" rel="noopener noreferrer" className="flex-1">
            <Button size="sm" variant="outline" className="w-full text-xs h-7 gap-1">
              <BookOpen size={11} /> Voir la recette
            </Button>
          </a>
        ) : (
          <Button size="sm" variant="outline" className="flex-1 text-xs h-7 gap-1" disabled>
            <BookOpen size={11} /> Recette non liée
          </Button>
        )}
        <Button
          size="sm"
          variant={confirmation ? 'destructive' : 'ghost'}
          onClick={handleDelete}
          onBlur={() => setConfirmation(false)}
          className="text-xs h-7 gap-1 shrink-0"
        >
          <Trash2 size={11} />
          {confirmation ? 'Confirmer' : ''}
        </Button>
      </div>

    </div>
  )
}
