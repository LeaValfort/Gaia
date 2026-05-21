import type { MealDBResult } from '@/types'

type IngredientIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20

interface MealDBRawBase {
  idMeal?: string
  strMeal?: string
  strCategory?: string
  strInstructions?: string
  strMealThumb?: string
}

type MealDBRaw = MealDBRawBase &
  Partial<Record<`strIngredient${IngredientIndex}`, string>> &
  Partial<Record<`strMeasure${IngredientIndex}`, string>>

interface MealDBSearchResponse {
  meals?: MealDBRaw[] | null
}

interface MealDBFilterResponse {
  meals?: Pick<MealDBRaw, 'idMeal' | 'strMeal' | 'strMealThumb'>[] | null
}

const INDICES: IngredientIndex[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]

function extraireIngredientsEtMesures(raw: MealDBRaw): { ingredients: string[]; mesures: string[] } {
  const ingredients: string[] = []
  const mesures: string[] = []

  for (const i of INDICES) {
    const ing = raw[`strIngredient${i}`]?.trim()
    if (!ing) continue
    ingredients.push(ing)
    mesures.push(raw[`strMeasure${i}`]?.trim() ?? '')
  }

  return { ingredients, mesures }
}

function mapperRepas(raw: MealDBRaw): MealDBResult | null {
  const id = raw.idMeal?.trim()
  const nom = raw.strMeal?.trim()
  if (!id || !nom) return null

  const { ingredients, mesures } = extraireIngredientsEtMesures(raw)

  return {
    id,
    nom,
    categorie: raw.strCategory?.trim() || null,
    instructions: raw.strInstructions?.trim() || null,
    image_url: raw.strMealThumb?.trim() || null,
    ingredients,
    mesures,
  }
}

/** Recherche de recettes par nom sur TheMealDB. */
export async function searchMeals(query: string): Promise<MealDBResult[]> {
  const q = query.trim()
  if (!q) return []

  try {
    const url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(q)}`
    const reponse = await fetch(url, { cache: 'no-store' })
    if (!reponse.ok) {
      throw new Error(`TheMealDB search : HTTP ${reponse.status}`)
    }

    const json = (await reponse.json()) as MealDBSearchResponse
    return (json.meals ?? [])
      .map(mapperRepas)
      .filter((m): m is MealDBResult => m !== null)
  } catch (erreur) {
    console.error('Erreur searchMeals TheMealDB:', erreur)
    return []
  }
}

/** Détail d'une recette par identifiant TheMealDB. */
export async function getMealById(id: string): Promise<MealDBResult | null> {
  const mealId = id.trim()
  if (!mealId) return null

  try {
    const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${encodeURIComponent(mealId)}`
    const reponse = await fetch(url, { cache: 'no-store' })
    if (!reponse.ok) {
      throw new Error(`TheMealDB lookup : HTTP ${reponse.status}`)
    }

    const json = (await reponse.json()) as MealDBSearchResponse
    const raw = json.meals?.[0]
    if (!raw) return null

    return mapperRepas(raw)
  } catch (erreur) {
    console.error('Erreur getMealById TheMealDB:', erreur)
    return null
  }
}

/** Liste de recettes par catégorie (aperçu — ingrédients via getMealById). */
export async function getMealsByCategory(category: string): Promise<MealDBResult[]> {
  const cat = category.trim()
  if (!cat) return []

  try {
    const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(cat)}`
    const reponse = await fetch(url, { cache: 'no-store' })
    if (!reponse.ok) {
      throw new Error(`TheMealDB filter : HTTP ${reponse.status}`)
    }

    const json = (await reponse.json()) as MealDBFilterResponse
    return (json.meals ?? [])
      .map((m) =>
        mapperRepas({
          idMeal: m.idMeal,
          strMeal: m.strMeal,
          strMealThumb: m.strMealThumb,
        })
      )
      .filter((m): m is MealDBResult => m !== null)
  } catch (erreur) {
    console.error('Erreur getMealsByCategory TheMealDB:', erreur)
    return []
  }
}
