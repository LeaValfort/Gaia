// Détail recette TheMealDB (traduite) — côté serveur uniquement.
import { translateMeal } from '@/lib/api/libretranslate'
import { getMealById } from '@/lib/api/themealdb'
import { estimerMacrosDepuisOff } from '@/lib/api/recettes-fr'
import type { MealDBResult, RecetteDetail } from '@/types'

function idNumerique(id: string): number {
  const parsed = Number.parseInt(id, 10)
  if (!Number.isNaN(parsed) && parsed > 0) return parsed
  let h = 0
  for (let i = 0; i < id.length; i++) {
    h = (Math.imul(31, h) + id.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

function decouperEtapes(instructions: string | null): { numero: number; instruction: string }[] {
  if (!instructions?.trim()) {
    return [{ numero: 1, instruction: 'Consulte la recette pour les étapes de préparation.' }]
  }

  const lignes = instructions
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)

  if (lignes.length <= 1) {
    return [{ numero: 1, instruction: instructions.trim() }]
  }

  return lignes.map((instruction, i) => ({ numero: i + 1, instruction }))
}

function mealVersRecetteDetail(
  meal: MealDBResult,
  macros: Awaited<ReturnType<typeof estimerMacrosDepuisOff>>
): RecetteDetail {
  return {
    id: idNumerique(meal.id),
    titre: meal.nom,
    image: meal.image_url ?? '',
    tempsMin: 30,
    portions: 4,
    calories: Math.round(macros.calories ?? 0),
    proteines: Math.round(macros.proteines ?? 0),
    glucides: Math.round(macros.glucides ?? 0),
    lipides: Math.round(macros.lipides ?? 0),
    ingredients: meal.ingredients.map((nom, i) => ({
      nom,
      quantite: meal.mesures[i]?.trim() || '—',
    })),
    etapes: decouperEtapes(meal.instructions),
    urlOriginale: `https://www.themealdb.com/meal/${meal.id}`,
    regimes: meal.categorie ? [meal.categorie] : [],
  }
}

/** Récupère le détail d'une recette TheMealDB par identifiant. */
export async function fetchRecetteDetail(mealId: string): Promise<RecetteDetail | null> {
  try {
    const meal = await getMealById(mealId)
    if (!meal) return null

    const traduit = await translateMeal(meal)
    const macros = await estimerMacrosDepuisOff(traduit.ingredients)

    return mealVersRecetteDetail(traduit, macros)
  } catch (erreur) {
    console.error('Erreur fetchRecetteDetail:', erreur)
    return null
  }
}

/** @deprecated Conservé pour compatibilité imports existants. */
export function traduireUnite(unit: string): string {
  return unit
}
