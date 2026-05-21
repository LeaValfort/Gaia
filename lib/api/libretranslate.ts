import type { MealDBResult } from '@/types'

interface LibreTranslateResponse {
  translatedText?: string
}

/** Traduit un texte anglais → français via LibreTranslate (gratuit). */
export async function translateToFr(text: string): Promise<string> {
  const source = text.trim()
  if (!source) return text

  try {
    const reponse = await fetch('https://libretranslate.com/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: source,
        source: 'en',
        target: 'fr',
        format: 'text',
      }),
      cache: 'no-store',
    })

    if (!reponse.ok) return text

    const json = (await reponse.json()) as LibreTranslateResponse
    return json.translatedText?.trim() || text
  } catch (erreur) {
    console.error('Erreur translateToFr:', erreur)
    return text
  }
}

/** Traduit nom, instructions et ingrédients d'une recette TheMealDB. */
export async function translateMeal(meal: MealDBResult): Promise<MealDBResult> {
  try {
    const taches: Promise<string | null>[] = [
      translateToFr(meal.nom),
      meal.instructions ? translateToFr(meal.instructions) : Promise.resolve(null),
      ...meal.ingredients.map((ing) => translateToFr(ing)),
    ]

    const resultats = await Promise.all(taches)
    const nom = resultats[0] ?? meal.nom
    const instructions = meal.instructions ? (resultats[1] ?? meal.instructions) : null
    const ingredients = meal.ingredients.map((ing, i) => resultats[i + 2] ?? ing)

    return {
      ...meal,
      nom,
      instructions,
      ingredients,
    }
  } catch (erreur) {
    console.error('Erreur translateMeal:', erreur)
    return meal
  }
}
