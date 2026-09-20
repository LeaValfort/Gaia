// Calcul des macros totales d'une recette à partir de ses ingrédients (nom + grammes) et de
// CIQUAL, ajustement des quantités pour coller à un objectif calorique, puis conversion en
// valeurs par portion / pour 100 g. Aucune valeur ici n'est inventée : tout vient de CIQUAL,
// ou la recette est marquée comme non chiffrable (macrosDisponibles = false).

import { trouverAlimentOuApproximation } from '@/lib/nutrition/ciqual'
import { CATEGORIES_FRUITS_LEGUMES } from '@/lib/data/ciqual-categories'
import type { IngredientRecette, Nutrition100g, ResultatCalculRecette } from '@/types'

function arrondi(v: number): number {
  return Math.round(v * 10) / 10
}

/**
 * Additionne les macros de tous les ingrédients. Pour chaque ingrédient, on tente d'abord une
 * correspondance CIQUAL exacte, puis la moyenne de sa catégorie (toujours sourcée CIQUAL) en
 * repli ; seul un ingrédient sans catégorie exploitable ('autre' sans données) reste vraiment
 * non chiffrable et bloque les macros de toute la recette (pas de total partiel trompeur).
 */
export function calculerMacrosRecette(ingredients: IngredientRecette[]): ResultatCalculRecette {
  const ingredientsNonReconnus: string[] = []
  const ingredientsApproximes: string[] = []
  let poidsTotalG = 0
  let totalKcal = 0
  let totalProteines = 0
  let totalGlucides = 0
  let totalLipides = 0
  let totalSucres = 0
  let totalAgs = 0
  let totalFibres = 0
  let totalSel = 0
  let totalFruitsLegumesG = 0

  for (const ing of ingredients) {
    poidsTotalG += ing.grammes
    const trouve = trouverAlimentOuApproximation(ing)
    const aliment = trouve?.entree
    const complet =
      aliment && aliment.kcal != null && aliment.proteines != null && aliment.glucides != null && aliment.lipides != null
    if (!complet) {
      ingredientsNonReconnus.push(ing.nom)
      continue
    }
    if (trouve!.approxime) ingredientsApproximes.push(ing.nom)
    const f = ing.grammes / 100
    totalKcal += aliment.kcal! * f
    totalProteines += aliment.proteines! * f
    totalGlucides += aliment.glucides! * f
    totalLipides += aliment.lipides! * f
    totalSucres += (aliment.sucres ?? 0) * f
    totalAgs += (aliment.ags ?? 0) * f
    totalFibres += (aliment.fibres ?? 0) * f
    totalSel += (aliment.sel ?? 0) * f
    if (CATEGORIES_FRUITS_LEGUMES.includes(ing.categorie)) totalFruitsLegumesG += ing.grammes
  }

  return {
    macrosDisponibles: ingredientsNonReconnus.length === 0 && ingredients.length > 0,
    ingredientsApproximes,
    ingredientsNonReconnus,
    poidsTotalG,
    totalKcal: arrondi(totalKcal),
    totalProteines: arrondi(totalProteines),
    totalGlucides: arrondi(totalGlucides),
    totalLipides: arrondi(totalLipides),
    totalSucres: arrondi(totalSucres),
    totalAgs: arrondi(totalAgs),
    totalFibres: arrondi(totalFibres),
    totalSel: arrondi(totalSel),
    totalFruitsLegumesG,
  }
}

/** Rescale uniformément les quantités pour que le plat entier atteigne `caloriesCiblesTotales`.
 *  Seules les calories sont garanties atteintes : la répartition P/G/L suit la composition
 *  naturelle de la recette (on ne trafique pas les proportions données par l'IA). */
export function ajusterPourCalories(
  ingredients: IngredientRecette[],
  caloriesCiblesTotales: number,
  resultat: ResultatCalculRecette
): IngredientRecette[] {
  if (!resultat.macrosDisponibles || resultat.totalKcal <= 0) return ingredients
  const facteur = caloriesCiblesTotales / resultat.totalKcal
  return ingredients.map((ing) => ({
    nom: ing.nom,
    grammes: Math.max(1, Math.round(ing.grammes * facteur)),
    categorie: ing.categorie,
  }))
}

export function versNutrition100g(resultat: ResultatCalculRecette): Nutrition100g | null {
  if (!resultat.macrosDisponibles || resultat.poidsTotalG <= 0) return null
  const f = 100 / resultat.poidsTotalG
  return {
    kcal: arrondi(resultat.totalKcal * f),
    proteines: arrondi(resultat.totalProteines * f),
    glucides: arrondi(resultat.totalGlucides * f),
    sucres: arrondi(resultat.totalSucres * f),
    lipides: arrondi(resultat.totalLipides * f),
    acides_gras_satures: arrondi(resultat.totalAgs * f),
    sel: arrondi(resultat.totalSel * f),
    fibres: arrondi(resultat.totalFibres * f),
    fruits_legumes_pct: Math.round((resultat.totalFruitsLegumesG / resultat.poidsTotalG) * 100),
  }
}

/** Macros par portion (arrondies à l'entier), ou `null` partout si non chiffrables. */
export function versMacrosParPortion(
  resultat: ResultatCalculRecette,
  portions: number
): { calories: number | null; proteines: number | null; glucides: number | null; lipides: number | null } {
  if (!resultat.macrosDisponibles) return { calories: null, proteines: null, glucides: null, lipides: null }
  const p = Math.max(1, Math.round(portions) || 1)
  return {
    calories: Math.round(resultat.totalKcal / p),
    proteines: Math.round(resultat.totalProteines / p),
    glucides: Math.round(resultat.totalGlucides / p),
    lipides: Math.round(resultat.totalLipides / p),
  }
}
