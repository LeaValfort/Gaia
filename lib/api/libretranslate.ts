import type { MealDBResult } from '@/types'

interface MyMemoryResponse {
  responseData?: {
    translatedText?: string
  }
}

async function fetchMyMemory(text: string, langpair: 'en|fr' | 'fr|en'): Promise<string> {
  const source = text.trim()
  if (!source) return text

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(source)}&langpair=${langpair}`
    const response = await fetch(url, { cache: 'no-store' })

    console.log(`MyMemory ${langpair} response:`, response.status)

    if (!response.ok) {
      const body = await response.text()
      console.log(`MyMemory ${langpair} body:`, body)
      return text
    }

    const data = (await response.json()) as MyMemoryResponse
    return data.responseData?.translatedText?.trim() || text
  } catch (erreur) {
    console.error(`Erreur MyMemory ${langpair}:`, erreur)
    return text
  }
}

/** Traduit un texte anglais → français via MyMemory (gratuit, sans inscription). */
export async function translateToFr(text: string): Promise<string> {
  return fetchMyMemory(text, 'en|fr')
}

/** Traduit un texte français → anglais (requêtes TheMealDB). */
export async function translateToEn(text: string): Promise<string> {
  return fetchMyMemory(text, 'fr|en')
}

/**
 * Traduit le nom et les ingrédients (pas les instructions — limite 500 mots / requête).
 * En cas d'échec MyMemory → conserve le texte original.
 */
export async function translateMeal(meal: MealDBResult): Promise<MealDBResult> {
  try {
    const nomOriginal = meal.nom
    let nomTraduit = nomOriginal

    try {
      nomTraduit = await translateToFr(nomOriginal)
    } catch (erreur) {
      console.error('Erreur traduction nom recette:', erreur)
    }

    console.log('Traduction:', nomOriginal, '→', nomTraduit)

    const ingredients = await Promise.all(
      meal.ingredients.map(async (ing) => {
        try {
          return await translateToFr(ing)
        } catch (erreur) {
          console.error('Erreur traduction ingrédient:', ing, erreur)
          return ing
        }
      })
    )

    return {
      ...meal,
      nom: nomTraduit,
      ingredients,
    }
  } catch (erreur) {
    console.error('Erreur translateMeal:', erreur)
    return meal
  }
}
