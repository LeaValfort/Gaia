import type { SupabaseClient } from '@supabase/supabase-js'
import { searchRecipes } from '@/lib/api/open-food-facts'
import { translateMeal, translateToEn } from '@/lib/api/libretranslate'
import { getMealById, getMealsByCategory, searchMeals } from '@/lib/api/themealdb'
import { nettoyerNomIngredient } from '@/lib/db/shopping-items'
import { getRecettes } from '@/lib/db/recettes'
import type { MealDBResult, Phase, RecetteSuggestion } from '@/types'

const CATEGORIES_PHASE: Record<Phase, string[]> = {
  menstruation: ['Seafood', 'Vegetarian'],
  folliculaire: ['Chicken', 'Seafood', 'Salad'],
  ovulation: ['Beef', 'Chicken', 'Pasta'],
  luteale: ['Vegetarian', 'Side', 'Dessert'],
}

const MAX_RECETTES_THEMEALDB = 8

function correspondRecherche(texte: string, query: string): boolean {
  return texte.toLowerCase().includes(query.toLowerCase())
}

function filtrerRecettesPerso(
  query: string,
  phase: Phase,
  recettes: Awaited<ReturnType<typeof getRecettes>>
): RecetteSuggestion[] {
  const q = query.trim()

  return recettes
    .filter((r) => {
      if (!q) {
        return r.phase === null || r.phase === phase
      }
      if (correspondRecherche(r.nom, q)) return true
      return r.ingredients.some((ing) => correspondRecherche(ing, q))
    })
    .map((r) => ({
      id: r.id,
      source: 'perso' as const,
      nom: r.nom,
      phase: r.phase,
      temps_min: r.temps_min,
      calories: r.calories,
      proteines: r.proteines,
      glucides: r.glucides,
      lipides: r.lipides,
      ingredients: r.ingredients.length > 0 ? r.ingredients : null,
      mesures: null,
      image_url: null,
    }))
}

async function chargerRepasTheMealDB(query: string, phase: Phase): Promise<MealDBResult[]> {
  const q = query.trim()

  if (q) {
    const queryEN = await translateToEn(q)
    console.log('Recherche TheMealDB:', q, '→', queryEN)
    const results = await searchMeals(queryEN)
    if (results.length > 0) return results
    return searchMeals(q)
  }

  try {
    const listes = await Promise.all(
      CATEGORIES_PHASE[phase].map((categorie) => getMealsByCategory(categorie))
    )

    const ids = new Set<string>()
    const apercus: MealDBResult[] = []

    for (const liste of listes) {
      for (const repas of liste) {
        if (ids.has(repas.id)) continue
        ids.add(repas.id)
        apercus.push(repas)
      }
    }

    const details = await Promise.all(
      apercus.slice(0, MAX_RECETTES_THEMEALDB).map((r) => getMealById(r.id))
    )

    return details.filter((m): m is MealDBResult => m !== null)
  } catch (erreur) {
    console.error('Erreur chargement catégories TheMealDB:', erreur)
    return []
  }
}

function macroOff(v: number | null | undefined): number | null {
  if (v == null || v <= 0) return null
  return Math.round(v)
}

/** Macros uniquement si Open Food Facts les retourne (pas d'estimation). */
export async function estimerMacrosDepuisOff(ingredients: string[]): Promise<{
  calories: number | null
  proteines: number | null
  glucides: number | null
  lipides: number | null
}> {
  const vide = { calories: null, proteines: null, glucides: null, lipides: null }
  const principaux = ingredients.slice(0, 3)
  if (principaux.length === 0) return vide

  try {
    for (const ing of principaux) {
      const produits = await searchRecipes(nettoyerNomIngredient(ing), 'fr')
      const p = produits[0]
      if (!p) continue

      const macros = {
        calories: macroOff(p.calories_100g),
        proteines: macroOff(p.proteines_100g),
        glucides: macroOff(p.glucides_100g),
        lipides: macroOff(p.lipides_100g),
      }

      if (macros.calories || macros.proteines || macros.glucides || macros.lipides) {
        return macros
      }
    }

    return vide
  } catch (erreur) {
    console.error('Erreur macros Open Food Facts:', erreur)
    return vide
  }
}

async function mealVersSuggestion(meal: MealDBResult, phase: Phase): Promise<RecetteSuggestion> {
  const traduit = await translateMeal(meal)
  const macros = await estimerMacrosDepuisOff(traduit.ingredients)

  return {
    id: traduit.id,
    source: 'themealdb',
    nom: traduit.nom,
    phase,
    temps_min: null,
    calories: macros.calories,
    proteines: macros.proteines,
    glucides: macros.glucides,
    lipides: macros.lipides,
    ingredients: traduit.ingredients.length > 0 ? traduit.ingredients : null,
    mesures: traduit.mesures.length > 0 ? traduit.mesures : null,
    image_url: traduit.image_url,
  }
}

/**
 * 1. Recettes perso (Supabase)
 * 2. TheMealDB (+ catégories par phase si query vide)
 * 3. Traduction MyMemory (FR ↔ EN)
 * 4. Macros Open Food Facts si trouvées (sinon null)
 */
export async function searchRecettesFr(
  supabase: SupabaseClient,
  userId: string,
  query: string,
  phase: Phase
): Promise<RecetteSuggestion[]> {
  try {
    const recettesPerso = await getRecettes(supabase, userId)
    const perso = filtrerRecettesPerso(query, phase, recettesPerso)

    let themealdb: RecetteSuggestion[] = []
    try {
      const repas = await chargerRepasTheMealDB(query, phase)
      themealdb = await Promise.all(repas.map((m) => mealVersSuggestion(m, phase)))
    } catch (erreur) {
      console.error('Erreur recherche TheMealDB dans searchRecettesFr:', erreur)
    }

    return [...perso, ...themealdb]
  } catch (erreur) {
    console.error('Erreur searchRecettesFr:', erreur)
    return []
  }
}
