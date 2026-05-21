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

export async function estimerMacrosDepuisOff(ingredients: string[]): Promise<{
  calories: number | null
  proteines: number | null
  glucides: number | null
  lipides: number | null
}> {
  const principaux = ingredients.slice(0, 3)
  if (principaux.length === 0) {
    return { calories: null, proteines: null, glucides: null, lipides: null }
  }

  try {
    const recherches = await Promise.all(
      principaux.map((ing) => searchRecipes(nettoyerNomIngredient(ing), 'fr'))
    )

    const produits = recherches
      .map((liste) => liste[0])
      .filter((p): p is NonNullable<(typeof recherches)[number][number]> => p != null)

    if (produits.length === 0) {
      return { calories: null, proteines: null, glucides: null, lipides: null }
    }

    const n = produits.length
    const somme = produits.reduce(
      (acc, p) => ({
        calories: acc.calories + (p.calories_100g ?? 0),
        proteines: acc.proteines + (p.proteines_100g ?? 0),
        glucides: acc.glucides + (p.glucides_100g ?? 0),
        lipides: acc.lipides + (p.lipides_100g ?? 0),
      }),
      { calories: 0, proteines: 0, glucides: 0, lipides: 0 }
    )

    return {
      calories: Math.round(somme.calories / n),
      proteines: Math.round(somme.proteines / n),
      glucides: Math.round(somme.glucides / n),
      lipides: Math.round(somme.lipides / n),
    }
  } catch (erreur) {
    console.error('Erreur estimation macros Open Food Facts:', erreur)
    return { calories: null, proteines: null, glucides: null, lipides: null }
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
 * 4. Macros estimées via Open Food Facts (3 ingrédients max)
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
