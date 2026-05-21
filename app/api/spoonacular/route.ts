// Proxy serveur recettes : perso + TheMealDB + LibreTranslate + Open Food Facts.

import { NextRequest, NextResponse } from 'next/server'
import { searchRecettesFr } from '@/lib/api/recettes-fr'
import { creerClientServeur } from '@/lib/supabase-server'
import type { Phase, RecetteSpoonacular, RecetteSuggestion } from '@/types'

function idNumerique(id: string): number {
  const parsed = Number.parseInt(id, 10)
  if (!Number.isNaN(parsed) && parsed > 0) return parsed
  let h = 0
  for (let i = 0; i < id.length; i++) {
    h = (Math.imul(31, h) + id.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

function macroApi(v: number | null | undefined): number {
  if (v == null || v <= 0) return 0
  return Math.round(v)
}

function suggestionVersSpoonacular(s: RecetteSuggestion): RecetteSpoonacular {
  const ingredients = (s.ingredients ?? [s.nom]).map((nom, i) => {
    const mesure = s.mesures?.[i]?.trim()
    return {
      nom,
      quantite: mesure || (s.source === 'themealdb' ? null : null),
    }
  })

  return {
    id: idNumerique(s.id),
    titre: s.nom,
    image: s.image_url ?? '',
    tempsMin: s.temps_min ?? 0,
    calories: macroApi(s.calories),
    proteines: macroApi(s.proteines),
    glucides: macroApi(s.glucides),
    lipides: macroApi(s.lipides),
    ingredients,
    urlOriginale:
      s.source === 'themealdb'
        ? `https://www.themealdb.com/meal/${s.id}`
        : '#',
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query') ?? ''
  const phase = (searchParams.get('phase') ?? 'folliculaire') as Phase

  try {
    const supabase = await creerClientServeur()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ erreur: 'Non authentifiée' }, { status: 401 })
    }

    const suggestions = await searchRecettesFr(supabase, user.id, query, phase)
    const recettes = suggestions.map(suggestionVersSpoonacular)

    return NextResponse.json({ recettes })
  } catch (erreur) {
    console.error('Erreur recherche recettes:', erreur)
    return NextResponse.json({ erreur: 'Erreur lors de la recherche de recettes' }, { status: 500 })
  }
}
