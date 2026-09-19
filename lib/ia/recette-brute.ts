// Conversion de la réponse brute de l'IA (totaux pour le plat entier) vers une
// RecetteGeneree (par portion + pour 100g) — jamais de confiance dans l'arithmétique de l'IA.

import type { Nutrition100g, Phase, RecetteGeneree } from '@/types'

/** Réponse brute attendue de Claude : totaux pour le plat entier (pas par portion). */
export interface RecetteBrute {
  nom: string
  temps_min: number
  portions: number
  poids_total_g: number
  ingredients: string[]
  instructions: string
  raison: string
  total_calories: number
  total_proteines: number
  total_glucides: number
  total_lipides: number
  total_sucres: number
  total_acides_gras_satures: number
  total_sel: number
  total_fibres: number
  fruits_legumes_pct: number
}

function arrondi(v: number): number {
  return Math.round(v * 10) / 10
}

/** Convertit les totaux du plat en par-portion + pour 100g. Retourne null si données incomplètes. */
export function versRecetteGeneree(brut: RecetteBrute, phase: Phase): RecetteGeneree | null {
  const portions = Math.max(1, Math.round(brut.portions) || 1)
  const poidsTotal = Math.max(1, Math.round(brut.poids_total_g) || 0)
  if (!brut.nom?.trim() || brut.ingredients?.length === 0) return null

  const parPortion = (total: number) => Math.round(total / portions)
  const pour100g = (total: number) => arrondi((total / poidsTotal) * 100)

  const nutrition_100g: Nutrition100g = {
    kcal: pour100g(brut.total_calories),
    proteines: pour100g(brut.total_proteines),
    glucides: pour100g(brut.total_glucides),
    sucres: pour100g(brut.total_sucres),
    lipides: pour100g(brut.total_lipides),
    acides_gras_satures: pour100g(brut.total_acides_gras_satures),
    sel: pour100g(brut.total_sel),
    fibres: pour100g(brut.total_fibres),
    fruits_legumes_pct: Math.min(100, Math.max(0, Math.round(brut.fruits_legumes_pct))),
  }

  return {
    nom: brut.nom.trim(),
    phase,
    type_repas: null,
    temps_min: Math.round(brut.temps_min) || 30,
    portions,
    poids_total_g: poidsTotal,
    ingredients: brut.ingredients.filter((i) => i?.trim()),
    instructions: brut.instructions?.trim() || '',
    calories: parPortion(brut.total_calories),
    proteines: parPortion(brut.total_proteines),
    glucides: parPortion(brut.total_glucides),
    lipides: parPortion(brut.total_lipides),
    nutrition_100g,
    raison: brut.raison?.trim() || '',
  }
}
