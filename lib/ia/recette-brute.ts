// Structuration de la réponse brute de l'IA : nom, ingrédients (grammes), instructions, raison.
// L'IA n'invente plus aucune macro (Chantier 5, refonte) — seules CIQUAL et lib/nutrition/
// calcul-recette.ts calculent les valeurs nutritionnelles, à partir des grammages ici validés.

import type { IngredientRecette, Phase } from '@/types'

/** Réponse brute attendue de Claude pour une recette. */
export interface RecetteBrute {
  nom: string
  temps_min: number
  portions: number
  ingredients: IngredientRecette[]
  instructions: string
  raison: string
}

/** Recette structurée, sans macros : les macros sont calculées ensuite via CIQUAL. */
export interface RecetteBase {
  nom: string
  phase: Phase | null
  temps_min: number
  portions: number
  ingredients_structures: IngredientRecette[]
  /** Chaque élément au format "quantité nom", pour affichage et liste de courses */
  ingredients: string[]
  instructions: string
  raison: string
}

function formaterLigneIngredient(ing: IngredientRecette): string {
  return `${Math.round(ing.grammes)} g ${ing.nom}`.trim()
}

/** Valide et structure une recette brute. Retourne `null` si les données sont incomplètes. */
export function versRecetteBase(brut: RecetteBrute, phase: Phase): RecetteBase | null {
  const nom = brut.nom?.trim()
  const ingredients = (brut.ingredients ?? []).filter(
    (i): i is IngredientRecette => Boolean(i?.nom?.trim()) && Number.isFinite(i.grammes) && i.grammes > 0
  )
  if (!nom || ingredients.length === 0) return null

  return {
    nom,
    phase,
    temps_min: Math.round(brut.temps_min) || 30,
    portions: Math.max(1, Math.round(brut.portions) || 1),
    ingredients_structures: ingredients.map((i) => ({ nom: i.nom.trim(), grammes: Math.round(i.grammes) })),
    ingredients: ingredients.map(formaterLigneIngredient),
    instructions: brut.instructions?.trim() || '',
    raison: brut.raison?.trim() || '',
  }
}
