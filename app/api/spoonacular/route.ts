// Proxy serveur pour l'API Spoonacular.
// La clé API reste côté serveur (process.env.SPOONACULAR_API_KEY).

import { NextRequest, NextResponse } from 'next/server'
import { MACROS_PAR_JOURNEE } from '@/lib/data/nutrition'
import type { TypeJournee, RecetteSpoonacular } from '@/types'

// Typage minimal de la réponse Spoonacular
interface NutrientRaw    { name: string; amount: number }
interface IngredientRaw  { original?: string; name: string }
interface RecetteRaw {
  id: number
  title: string
  image?: string
  readyInMinutes?: number
  sourceUrl?: string
  nutrition?: { nutrients: NutrientRaw[] }
  extendedIngredients?: IngredientRaw[]
}

function trouverNutrient(nutrients: NutrientRaw[], nom: string): number {
  return Math.round(nutrients.find((n) => n.name === nom)?.amount ?? 0)
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const typeJournee = (searchParams.get('typeJournee') ?? 'repos') as TypeJournee
  const allergies   = searchParams.get('allergies') ?? ''
  const tempsMax    = parseInt(searchParams.get('tempsMax') ?? '30', 10)

  const apiKey = process.env.SPOONACULAR_API_KEY
  if (!apiKey) return NextResponse.json({ erreur: 'Clé API manquante' }, { status: 500 })

  const macros = MACROS_PAR_JOURNEE[typeJournee]
  const minProtein = Math.round(macros.proteines * 0.25)

  const params = new URLSearchParams({
    apiKey,
    number:              '6',
    maxReadyTime:        String(tempsMax),
    minProtein:          String(minProtein),
    diet:                'whole30',
    addRecipeNutrition:  'true',
    fillIngredients:     'true',
  })
  if (allergies) params.set('intolerances', allergies)

  try {
    const reponse = await fetch(
      `https://api.spoonacular.com/recipes/complexSearch?${params}`,
      { next: { revalidate: 3600 } }  // cache 1h pour économiser le quota
    )
    if (!reponse.ok) throw new Error(`Spoonacular erreur ${reponse.status}`)

    const json = await reponse.json()
    const recettes: RecetteSpoonacular[] = (json.results ?? []).map((r: RecetteRaw) => {
      const nutrients = r.nutrition?.nutrients ?? []
      return {
        id:          r.id,
        titre:       r.title,
        image:       r.image ?? '',
        tempsMin:    r.readyInMinutes ?? 0,
        calories:    trouverNutrient(nutrients, 'Calories'),
        proteines:   trouverNutrient(nutrients, 'Protein'),
        glucides:    trouverNutrient(nutrients, 'Carbohydrates'),
        lipides:     trouverNutrient(nutrients, 'Fat'),
        ingredients: (r.extendedIngredients ?? []).map((i) => i.original ?? i.name),
        urlOriginale: r.sourceUrl ?? `https://spoonacular.com/recipes/${r.id}`,
      }
    })

    return NextResponse.json({ recettes })
  } catch (erreur) {
    console.error('Erreur Spoonacular:', erreur)
    return NextResponse.json({ erreur: 'Erreur lors de la recherche de recettes' }, { status: 500 })
  }
}
