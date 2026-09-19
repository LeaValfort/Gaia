// Calcul du Nutri-score officiel (référentiel 2017, catégorie "aliments génériques").
// Source publique de l'algorithme : Santé publique France / Oqali.
// Ne couvre pas les catégories spécifiques (fromages, matières grasses ajoutées,
// boissons) : nos plats préparés relèvent tous de la catégorie générique.

import type { Nutrition100g, NutriScoreLettre } from '@/types'

/** Convertit une table de seuils croissants en nombre de points (0 à sa longueur). */
function pointsSelonSeuils(valeur: number, seuils: number[]): number {
  let points = 0
  for (const seuil of seuils) {
    if (valeur > seuil) points += 1
  }
  return points
}

const SEUILS_ENERGIE_KJ = [335, 670, 1005, 1340, 1675, 2010, 2345, 2680, 3015, 3350]
const SEUILS_SUCRES_G = [4.5, 9, 13.5, 18, 22.5, 27, 31, 36, 40, 45]
const SEUILS_AGS_G = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const SEUILS_SODIUM_MG = [90, 180, 270, 360, 450, 540, 630, 720, 810, 900]
const SEUILS_FIBRES_G = [0.9, 1.9, 2.8, 3.7, 4.7]
const SEUILS_PROTEINES_G = [1.6, 3.2, 4.8, 6.4, 8.0]

/** Barème spécifique fruits/légumes/légumineuses/oléagineux (pas un seuillage régulier). */
function pointsFruitsLegumes(pct: number): number {
  if (pct > 80) return 5
  if (pct > 60) return 2
  if (pct > 40) return 1
  return 0
}

function pointsNegatifs(v: Nutrition100g): number {
  const energieKj = v.kcal * 4.184
  const sodiumMg = (v.sel * 1000) / 2.5
  return (
    pointsSelonSeuils(energieKj, SEUILS_ENERGIE_KJ) +
    pointsSelonSeuils(v.sucres, SEUILS_SUCRES_G) +
    pointsSelonSeuils(v.acides_gras_satures, SEUILS_AGS_G) +
    pointsSelonSeuils(sodiumMg, SEUILS_SODIUM_MG)
  )
}

/** Score numérique brut (plus bas = meilleur). Exposé pour affichage/debug éventuel. */
export function calculerScoreNutritionnel(v: Nutrition100g): number {
  const n = pointsNegatifs(v)
  const pointsFruits = pointsFruitsLegumes(v.fruits_legumes_pct)
  const pointsFibres = pointsSelonSeuils(v.fibres, SEUILS_FIBRES_G)
  const pointsProteines = pointsSelonSeuils(v.proteines, SEUILS_PROTEINES_G)

  // Règle officielle : au-delà de 11 points négatifs, les protéines ne comptent
  // plus comme points positifs sauf si le plat est déjà riche en fruits/légumes.
  const proteinesComptent = n < 11 || pointsFruits === 5
  const p = pointsFibres + pointsFruits + (proteinesComptent ? pointsProteines : 0)

  return n - p
}

/** Convertit le score numérique en lettre A à E (barème "aliments génériques"). */
export function scoreVersLettre(score: number): NutriScoreLettre {
  if (score <= -1) return 'A'
  if (score <= 2) return 'B'
  if (score <= 10) return 'C'
  if (score <= 18) return 'D'
  return 'E'
}

/** Calcule directement la lettre Nutri-score à partir des valeurs pour 100 g. */
export function calculerNutriScore(valeurs100g: Nutrition100g): NutriScoreLettre {
  return scoreVersLettre(calculerScoreNutritionnel(valeurs100g))
}
