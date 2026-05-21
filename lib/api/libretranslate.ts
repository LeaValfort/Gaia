import type { MealDBResult } from '@/types'

interface MyMemoryResponse {
  responseData?: {
    translatedText?: string
  }
}

/** Traduit un texte anglais → français via MyMemory (gratuit, sans inscription). */
export async function translateToFr(text: string): Promise<string> {
  const source = text.trim()
  if (!source) return text

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(source)}&langpair=en|fr`
    const response = await fetch(url, { cache: 'no-store' })

    console.log('MyMemory response:', response.status)

    if (!response.ok) {
      const body = await response.text()
      console.log('MyMemory body:', body)
      return text
    }

    const data = (await response.json()) as MyMemoryResponse
    const traduit = data.responseData?.translatedText?.trim()

    if (!traduit || traduit.toUpperCase() === source.toUpperCase()) {
      return traduit || text
    }

    return traduit
  } catch (erreur) {
    console.error('Erreur translateToFr MyMemory:', erreur)
    return text
  }
}

/**
 * Traduit le nom et les ingrédients (pas les instructions — limite 500 mots / requête).
 */
export async function translateMeal(meal: MealDBResult): Promise<MealDBResult> {
  try {
    const [nom, ...ingredientsTraduits] = await Promise.all([
      translateToFr(meal.nom),
      ...meal.ingredients.map((ing) => translateToFr(ing)),
    ])

    return {
      ...meal,
      nom,
      ingredients: meal.ingredients.map((ing, i) => ingredientsTraduits[i] ?? ing),
    }
  } catch (erreur) {
    console.error('Erreur translateMeal:', erreur)
    return meal
  }
}
