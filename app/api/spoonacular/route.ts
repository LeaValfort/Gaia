// Proxy serveur pour l'API Spoonacular.
// La clé API reste côté serveur (process.env.SPOONACULAR_API_KEY).

import { NextRequest, NextResponse } from 'next/server'
import { traduireUnite } from '@/lib/spoonacular'
import type { TypeJournee, RecetteSpoonacular, IngredientCarte } from '@/types'

// Typage minimal de la réponse Spoonacular
interface NutrientRaw    { name: string; amount: number }
interface IngredientRaw  {
  nameClean?: string
  name: string
  original?: string
  measures?: { metric?: { amount: number; unitShort: string } }
}
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

function formaterIngredient(i: IngredientRaw): IngredientCarte {
  const metric = i.measures?.metric
  let quantite: string | null = null
  if (metric && metric.amount > 0) {
    const montant = Math.round(metric.amount * 10) / 10
    const unite = metric.unitShort ? ` ${traduireUnite(metric.unitShort)}` : ''
    quantite = `${montant}${unite}`.trim()
  }
  return { nom: i.nameClean ?? i.name, quantite }
}

export async function GET(request: NextRequest) {
  console.log('=== SPOONACULAR DEBUG ===')
  console.log('API Key présente:', !!process.env.SPOONACULAR_API_KEY)
  console.log('API Key début:', process.env.SPOONACULAR_API_KEY?.slice(0, 6))

  const { searchParams } = new URL(request.url)
  const typeJournee = (searchParams.get('typeJournee') ?? 'repos') as TypeJournee
  const allergies   = searchParams.get('allergies') ?? ''
  const tempsMax    = parseInt(searchParams.get('tempsMax') ?? '30', 10)
  const offset      = parseInt(searchParams.get('offset') ?? '0', 10)
  const query       = searchParams.get('query') ?? ''

  const apiKey = process.env.SPOONACULAR_API_KEY
  if (!apiKey) return NextResponse.json({ erreur: 'Clé API manquante' }, { status: 500 })

  const params = new URLSearchParams({
    apiKey,
    number:             '6',
    offset:             String(offset),
    maxReadyTime:       String(tempsMax),
    addRecipeNutrition: 'true',
    fillIngredients:    'true',
    sort:               'healthiness',
    sortDirection:      'desc',
  })
  if (query)     params.set('query', query)
  if (allergies) params.set('intolerances', allergies)
  params.set('language', 'fr')

  try {
    const reponse = await fetch(
      `https://api.spoonacular.com/recipes/complexSearch?${params}`,
      { cache: 'no-store' }
    )

    const json = await reponse.json()
    console.log('Spoonacular status:', reponse.status)
    console.log('Spoonacular réponse:', JSON.stringify(json).slice(0, 500))

    if (!reponse.ok) throw new Error(`Spoonacular erreur ${reponse.status}: ${JSON.stringify(json)}`)

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
        ingredients: (r.extendedIngredients ?? []).map(formaterIngredient),
        urlOriginale: r.sourceUrl ?? `https://spoonacular.com/recipes/${r.id}`,
      }
    })

    return NextResponse.json({ recettes })
  } catch (erreur) {
    console.error('Erreur Spoonacular détaillée:', erreur)
    return NextResponse.json({ erreur: 'Erreur lors de la recherche de recettes' }, { status: 500 })
  }
}
