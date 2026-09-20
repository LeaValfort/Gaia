// Icône + couleur par catégorie d'ingrédient CIQUAL, pour donner un repère visuel rapide sur
// les cartes de recettes générées par IA — pas de vraie photo (coût + latence d'une image IA
// par recette), juste une approximation gratuite et instantanée.

import type { CategorieIngredient, IngredientRecette } from '@/types'

export const ICONE_CATEGORIE: Record<CategorieIngredient, string> = {
  legume: '🥦',
  fruit: '🍎',
  feculent: '🍚',
  legumineuse: '🫘',
  viande: '🍗',
  poisson: '🐟',
  oeuf: '🥚',
  produit_laitier: '🥛',
  fromage: '🧀',
  fruit_a_coque: '🥜',
  matiere_grasse: '🫒',
  sucre_sucrant: '🍯',
  autre: '🍽️',
}

export const COULEUR_CATEGORIE: Record<CategorieIngredient, string> = {
  legume: 'bg-green-100 dark:bg-green-900/40',
  fruit: 'bg-red-100 dark:bg-red-900/40',
  feculent: 'bg-amber-100 dark:bg-amber-900/40',
  legumineuse: 'bg-orange-100 dark:bg-orange-900/40',
  viande: 'bg-rose-100 dark:bg-rose-900/40',
  poisson: 'bg-sky-100 dark:bg-sky-900/40',
  oeuf: 'bg-yellow-100 dark:bg-yellow-900/40',
  produit_laitier: 'bg-blue-100 dark:bg-blue-900/40',
  fromage: 'bg-amber-100 dark:bg-amber-900/40',
  fruit_a_coque: 'bg-orange-100 dark:bg-orange-900/40',
  matiere_grasse: 'bg-lime-100 dark:bg-lime-900/40',
  sucre_sucrant: 'bg-pink-100 dark:bg-pink-900/40',
  autre: 'bg-neutral-100 dark:bg-neutral-800',
}

/** Catégorie dominante d'une recette = celle qui pèse le plus lourd en grammes. On ignore
 *  "autre" tant qu'une autre catégorie existe, pour privilégier l'ingrédient principal plutôt
 *  qu'un à-côté non reconnu par l'IA. */
export function categorieDominante(ingredients: IngredientRecette[]): CategorieIngredient {
  const poidsParCategorie = new Map<CategorieIngredient, number>()
  for (const ingredient of ingredients) {
    poidsParCategorie.set(
      ingredient.categorie,
      (poidsParCategorie.get(ingredient.categorie) ?? 0) + ingredient.grammes
    )
  }
  poidsParCategorie.delete('autre')

  let meilleureCategorie: CategorieIngredient = 'autre'
  let poidsMax = -1
  for (const [categorie, poids] of poidsParCategorie) {
    if (poids > poidsMax) {
      poidsMax = poids
      meilleureCategorie = categorie
    }
  }
  return meilleureCategorie
}
