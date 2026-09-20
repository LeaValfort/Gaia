'use client'

import { useState } from 'react'
import { Bookmark, ShoppingCart, Check, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { saveRecette } from '@/lib/db/nutrition'
import { addShoppingItem } from '@/lib/db/courses'
import { devinerAssignation } from '@/lib/data/courses'
import { parserIngredientCourses } from '@/lib/db/shopping-items'
import type { RecetteGeneree } from '@/types'

interface RecetteGenereeCardProps {
  recette: RecetteGeneree
  userId: string
  weekStart: string
}

/** Étapes de préparation, une par ligne non vide. */
function decouperEtapes(instructions: string): string[] {
  return instructions.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
}

/** Carte pour une recette générée par l'IA, pas encore sauvegardée. Macros = CIQUAL uniquement :
 *  si un ingrédient n'a pas été reconnu, on l'affiche sans macros plutôt que d'en inventer.
 *  Un clic déplie la recette complète (tous les ingrédients + les étapes) sur place. */
export function RecetteGenereeCard({ recette, userId, weekStart }: RecetteGenereeCardProps) {
  const [saved, setSaved] = useState(false)
  const [added, setAdded] = useState(false)
  const [ouverte, setOuverte] = useState(false)

  const macrosDisponibles = recette.calories !== null
  const macros = macrosDisponibles
    ? [
        { label: `${recette.calories} kcal`, className: 'text-orange-600 dark:text-orange-400' },
        { label: `${recette.proteines}g P`, className: 'text-blue-600 dark:text-blue-400' },
        { label: `${recette.glucides}g G`, className: 'text-amber-600 dark:text-amber-400' },
        { label: `${recette.lipides}g L`, className: 'text-green-600 dark:text-green-400' },
      ]
    : []

  const ingredientsAffiches = ouverte ? recette.ingredients : recette.ingredients.slice(0, 4)
  const etapes = decouperEtapes(recette.instructions)

  async function handleSave() {
    await saveRecette(supabase, userId, {
      nom: recette.nom,
      ingredients: recette.ingredients,
      temps_min: recette.temps_min,
      phase: recette.phase,
      type_repas: recette.type_repas,
      raison: recette.raison || null,
      spoonacular_id: null,
      calories: recette.calories,
      proteines: recette.proteines,
      glucides: recette.glucides,
      lipides: recette.lipides,
      instructions: recette.instructions || null,
      portions: recette.portions,
      poids_total_g: recette.poids_total_g,
      nutrition_100g: recette.nutrition_100g,
    })
    setSaved(true)
  }

  async function handleAddCourses() {
    await Promise.all(
      recette.ingredients.map((ligne) => {
        const { nom, quantite } = parserIngredientCourses(ligne)
        const { rayon, enseigne } = devinerAssignation(nom)
        return addShoppingItem(supabase, userId, {
          week_start: weekStart,
          nom,
          quantite,
          enseigne,
          rayon,
          source: 'manuel',
        })
      })
    )
    setAdded(true)
  }

  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col">
      <div
        className="p-3 flex flex-col gap-2 flex-1 cursor-pointer"
        role="button"
        tabIndex={0}
        onClick={() => setOuverte((o) => !o)}
        onKeyDown={(e) => e.key === 'Enter' && setOuverte((o) => !o)}
      >
        <Badge variant="outline" className="text-xs w-fit">✨ Suggestion IA</Badge>
        <p className="font-semibold text-sm text-neutral-900 dark:text-neutral-50 leading-snug">{recette.nom}</p>

        {macrosDisponibles ? (
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap gap-1">
              {macros.map(({ label, className }) => (
                <Badge key={label} variant="outline" className={`text-xs ${className}`}>{label}</Badge>
              ))}
            </div>
            {recette.ingredients_approximes.length > 0 ? (
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 italic">
                Estimation (moyenne CIQUAL) pour : {recette.ingredients_approximes.join(', ')}
              </p>
            ) : null}
          </div>
        ) : (
          <p className="text-xs text-amber-600 dark:text-amber-400 flex items-start gap-1">
            <AlertTriangle size={12} className="shrink-0 mt-0.5" />
            Macros non disponibles ({recette.ingredients_non_reconnus.join(', ')} non reconnu
            {recette.ingredients_non_reconnus.length > 1 ? 's' : ''} dans la base nutritionnelle)
          </p>
        )}

        {recette.raison ? (
          <p className="text-xs text-muted-foreground italic">{recette.raison}</p>
        ) : null}

        {ingredientsAffiches.length > 0 ? (
          <ul className="flex flex-col gap-0.5">
            {ingredientsAffiches.map((ing) => {
              const { nom, quantite } = parserIngredientCourses(ing)
              return (
                <li key={ing} className={`text-xs text-muted-foreground ${ouverte ? 'flex justify-between gap-2' : 'truncate'}`}>
                  <span>{nom}</span>
                  {ouverte && quantite ? <span className="shrink-0">{quantite}</span> : null}
                </li>
              )
            })}
            {!ouverte && recette.ingredients.length > ingredientsAffiches.length ? (
              <li className="text-xs text-muted-foreground">
                +{recette.ingredients.length - ingredientsAffiches.length} ingrédient
                {recette.ingredients.length - ingredientsAffiches.length > 1 ? 's' : ''}
              </li>
            ) : null}
          </ul>
        ) : null}

        {ouverte && etapes.length > 0 ? (
          <ol className="flex flex-col gap-2 pt-1">
            {etapes.map((etape, i) => (
              <li key={i} className="flex gap-2 text-xs text-neutral-700 dark:text-neutral-300">
                <span className="shrink-0 w-4 h-4 rounded-full bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300 text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
                <span className="leading-relaxed">{etape}</span>
              </li>
            ))}
          </ol>
        ) : null}

        <p className="text-xs text-violet-600 dark:text-violet-400 flex items-center gap-1">
          {ouverte ? <><ChevronUp size={12} />Réduire</> : <><ChevronDown size={12} />Voir la recette complète</>}
        </p>

        <div className="flex gap-1.5 flex-wrap mt-auto pt-1" onClick={(e) => e.stopPropagation()}>
          <Button size="sm" variant="outline" onClick={handleSave} disabled={saved} className="text-xs h-7 px-2">
            {saved ? <><Check size={11} className="mr-1" />Sauvée</> : <><Bookmark size={11} className="mr-1" />Sauvegarder</>}
          </Button>
          <Button size="sm" variant="outline" onClick={handleAddCourses} disabled={added} className="text-xs h-7 px-2">
            {added ? <><Check size={11} className="mr-1" />Ajoutés</> : <><ShoppingCart size={11} className="mr-1" />Courses</>}
          </Button>
        </div>
      </div>
    </div>
  )
}
