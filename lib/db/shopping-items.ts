import type { SupabaseClient } from '@supabase/supabase-js'
import { devinerAssignation } from '@/lib/data/courses'
import { addShoppingItem } from '@/lib/db/courses'
import type { MealDBResult } from '@/types'

/** Sépare une liste d'ingrédients français (virgules, « et », point-virgule). */
export function extraireIngredientsTexte(texte: string | null): string[] {
  if (!texte?.trim()) return []

  return texte
    .split(/[,;]|(?:\bet\b)/gi)
    .map((partie) => nettoyerNomIngredient(partie))
    .filter((nom) => nom.length > 1)
}

/**
 * Retire quantités et unités au début (ex. « 200g de saumon » → « saumon »).
 */
export function nettoyerNomIngredient(fragment: string): string {
  let nom = fragment.trim().toLowerCase()

  nom = nom.replace(/^\d+([,.]\d+)?\s*(g|kg|mg|ml|cl|l|cm|mm|cup|cups|tbsp|tsp|oz|%)\b\.?\s*(de\s+|d'|of\s+)?/gi, '')
  nom = nom.replace(/^\d+([,.]\d+)?\s*(de\s+|d'|of\s+)/gi, '')
  nom = nom.replace(/^\d+\/\d+\s*(cup|cups|tbsp|tsp|oz|g|kg|ml|cl|l)?\s*(de\s+|d'|of\s+)?/gi, '')
  nom = nom.replace(/\*+/g, '')
  nom = nom.replace(/\([^)]*\)/g, '')
  nom = nom.replace(/\[[^\]]*\]/g, '')
  nom = nom.replace(/\s+/g, ' ').trim()

  if (!nom) return fragment.trim()

  return nom.charAt(0).toUpperCase() + nom.slice(1)
}

export interface IngredientCourses {
  nom: string
  quantite: string | null
}

/** Extrait nom nettoyé + quantité brute depuis un libellé d'ingrédient. */
export function parserIngredientCourses(fragment: string): IngredientCourses {
  const brut = fragment.trim()
  const match = brut.match(
    /^(\d+([,.]\d+)?(\s*\/\s*\d+([,.]\d+)?)?\s*(g|kg|mg|ml|cl|l|cup|cups|tbsp|tsp|oz|%)?)\s*(de\s+|d'|of\s+)?\s*(.+)$/i
  )
  if (match) {
    return {
      quantite: match[1].replace(/\s+/g, ' ').trim(),
      nom: nettoyerNomIngredient(match[7]),
    }
  }
  return { nom: nettoyerNomIngredient(brut), quantite: null }
}

/** Un ShoppingItem par ingrédient TheMealDB (déjà traduit en français). */
export async function ajouterIngredientsMealAuxCourses(
  supabase: SupabaseClient,
  userId: string,
  weekStart: string,
  meal: Pick<MealDBResult, 'ingredients' | 'mesures'>
): Promise<number> {
  if (meal.ingredients.length === 0) return 0

  let ajoutes = 0

  for (let i = 0; i < meal.ingredients.length; i++) {
    const brut = meal.ingredients[i]
    const mesure = meal.mesures[i]?.trim()
    const ligne = mesure ? `${mesure} ${brut}` : brut
    const { nom, quantite } = parserIngredientCourses(ligne)

    if (nom.length <= 1) continue

    const { rayon, enseigne } = devinerAssignation(nom)
    const row = await addShoppingItem(supabase, userId, {
      week_start: weekStart,
      nom,
      quantite,
      enseigne,
      rayon,
      source: 'themealdb',
    })
    if (row) ajoutes += 1
  }

  return ajoutes
}

/** @deprecated Utiliser ajouterIngredientsMealAuxCourses pour TheMealDB. */
export async function ajouterProduitOpenFoodAuxCourses(
  supabase: SupabaseClient,
  userId: string,
  weekStart: string,
  produit: { nom: string; ingredients: string | null }
): Promise<number> {
  const fragments = produit.ingredients
    ? extraireIngredientsTexte(produit.ingredients)
    : [produit.nom]

  let ajoutes = 0
  for (const frag of fragments) {
    const { nom, quantite } = parserIngredientCourses(frag)
    if (nom.length <= 1) continue

    const { rayon, enseigne } = devinerAssignation(nom)
    const row = await addShoppingItem(supabase, userId, {
      week_start: weekStart,
      nom,
      quantite,
      enseigne,
      rayon,
      source: 'open_food_facts',
    })
    if (row) ajoutes += 1
  }

  return ajoutes
}
