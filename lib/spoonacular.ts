// Appels directs à l'API Spoonacular (côté serveur uniquement)
import type { RecetteDetail } from '@/types'

// Unités métriques françaises — couvre les cas Spoonacular les plus fréquents
const UNITES_FR: Record<string, string> = {
  g: 'g', kg: 'kg', ml: 'ml', l: 'L', L: 'L',
  Tbsp: 'c. à s.', tbsp: 'c. à s.', Tbsps: 'c. à s.', tbsps: 'c. à s.',
  tsp: 'c. à c.', Tsp: 'c. à c.', tsps: 'c. à c.', Tsps: 'c. à c.',
  piece: 'pièce', pieces: 'pièces',
  clove: 'gousse', cloves: 'gousses',
  serving: 'portion', servings: 'portions',
  handful: 'poignée', bunch: 'bouquet', pinch: 'pincée',
  pinches: 'pincées', handfuls: 'poignées', bunches: 'bouquets',
  slice: 'tranche', slices: 'tranches',
  cup: 'tasse', cups: 'tasses',
  large: 'grand', medium: 'moyen', small: 'petit',
  head: 'tête', heads: 'têtes',
  stalk: 'tige', stalks: 'tiges',
  can: 'boîte', cans: 'boîtes',
}

export function traduireUnite(unit: string): string {
  return UNITES_FR[unit] ?? unit
}

interface MesureMetrique { amount: number; unitShort: string }
interface IngredientBrut {
  nameClean?: string
  name: string
  original?: string
  measures?: { metric?: MesureMetrique }
}
interface EtapeBrute { number: number; step: string }
interface InfoBrute {
  id: number; title: string; image?: string; readyInMinutes?: number; servings?: number
  sourceUrl?: string; diets?: string[]
  nutrition?: { nutrients: { name: string; amount: number }[] }
  extendedIngredients?: IngredientBrut[]
  analyzedInstructions?: { steps: EtapeBrute[] }[]
}

function trouverNutrient(nutrients: { name: string; amount: number }[], nom: string): number {
  return Math.round(nutrients.find((n) => n.name === nom)?.amount ?? 0)
}

/** Formate la quantité en métrique avec unité française. */
function formaterQuantite(ing: IngredientBrut): string {
  const metric = ing.measures?.metric
  if (metric && metric.amount > 0) {
    const montant = Math.round(metric.amount * 10) / 10
    const unite = metric.unitShort ? ` ${traduireUnite(metric.unitShort)}` : ''
    return `${montant}${unite}`.trim()
  }
  return ing.original ?? ''
}

/** Récupère le détail complet d'une recette depuis Spoonacular. Retourne null si erreur. */
export async function fetchRecetteDetail(id: string): Promise<RecetteDetail | null> {
  const apiKey = process.env.SPOONACULAR_API_KEY
  if (!apiKey) return null
  try {
    const url = `https://api.spoonacular.com/recipes/${id}/information?apiKey=${apiKey}&includeNutrition=true`
    const rep = await fetch(url, { cache: 'no-store' })
    if (!rep.ok) return null
    const raw: InfoBrute = await rep.json()

    const nutrients = raw.nutrition?.nutrients ?? []
    return {
      id: raw.id, titre: raw.title, image: raw.image ?? '',
      tempsMin: raw.readyInMinutes ?? 0, portions: raw.servings ?? 0,
      calories: trouverNutrient(nutrients, 'Calories'),
      proteines: trouverNutrient(nutrients, 'Protein'),
      glucides: trouverNutrient(nutrients, 'Carbohydrates'),
      lipides: trouverNutrient(nutrients, 'Fat'),
      ingredients: (raw.extendedIngredients ?? []).map((i) => ({
        nom: i.nameClean ?? i.name,
        quantite: formaterQuantite(i),
      })),
      etapes: (raw.analyzedInstructions?.[0]?.steps ?? []).map((s) => ({
        numero: s.number,
        instruction: s.step,
      })),
      urlOriginale: raw.sourceUrl ?? `https://spoonacular.com/recipes/${raw.id}`,
      regimes: raw.diets ?? [],
    }
  } catch {
    return null
  }
}
