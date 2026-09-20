// Structuration de la réponse brute de l'IA : nom, ingrédients (grammes + catégorie),
// instructions, raison. L'IA n'invente plus aucune macro (Chantier 5, refonte) — seules CIQUAL
// et lib/nutrition/calcul-recette.ts calculent les valeurs nutritionnelles. Les champs bruts sont
// traités comme non fiables (types JSON d'un LLM) : on coerce plutôt que de faire confiance.

import type { CategorieIngredient, IngredientRecette, Phase } from '@/types'

const CATEGORIES_VALIDES: readonly CategorieIngredient[] = [
  'legume', 'fruit', 'feculent', 'legumineuse', 'viande', 'poisson', 'oeuf',
  'produit_laitier', 'fromage', 'fruit_a_coque', 'matiere_grasse', 'sucre_sucrant', 'autre',
]

/** Ingrédient tel que reçu du JSON de l'IA, avant toute validation de type. */
interface IngredientBrut {
  nom?: unknown
  grammes?: unknown
  categorie?: unknown
}

/** Réponse brute attendue de Claude pour une recette. */
export interface RecetteBrute {
  nom: string
  temps_min: number
  portions: number
  ingredients: IngredientBrut[]
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

function categorieValide(c: unknown): CategorieIngredient {
  return typeof c === 'string' && (CATEGORIES_VALIDES as readonly string[]).includes(c)
    ? (c as CategorieIngredient)
    : 'autre'
}

/** Coerce un ingrédient brut : `grammes` peut arriver en string ("120") côté LLM, on l'accepte
 *  quand même plutôt que de rejeter tout l'ingrédient pour une question de type JSON. */
function versIngredient(brut: IngredientBrut): IngredientRecette | null {
  const nom = typeof brut?.nom === 'string' ? brut.nom.trim() : ''
  const grammes = typeof brut?.grammes === 'number' ? brut.grammes : Number(brut?.grammes)
  if (!nom || !Number.isFinite(grammes) || grammes <= 0) return null
  return { nom, grammes: Math.round(grammes), categorie: categorieValide(brut?.categorie) }
}

function formaterLigneIngredient(ing: IngredientRecette): string {
  return `${ing.grammes} g ${ing.nom}`.trim()
}

/** Valide et structure une recette brute. Retourne `null` si les données sont incomplètes. */
export function versRecetteBase(brut: RecetteBrute, phase: Phase): RecetteBase | null {
  const nom = brut.nom?.trim()
  const ingredients = (brut.ingredients ?? [])
    .map(versIngredient)
    .filter((i): i is IngredientRecette => i !== null)
  if (!nom || ingredients.length === 0) return null

  return {
    nom,
    phase,
    temps_min: Math.round(brut.temps_min) || 30,
    portions: Math.max(1, Math.round(brut.portions) || 1),
    ingredients_structures: ingredients,
    ingredients: ingredients.map(formaterLigneIngredient),
    instructions: brut.instructions?.trim() || '',
    raison: brut.raison?.trim() || '',
  }
}
