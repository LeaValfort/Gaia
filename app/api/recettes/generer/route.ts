// Recettes pour l'onglet Suggestions : recettes perso correspondantes + recettes
// générées par l'IA. Remplace /api/spoonacular (qui n'a jamais utilisé Spoonacular :
// il interrogeait TheMealDB, traduit via MyMemory — moteur retiré au Chantier 5).

import { NextRequest, NextResponse } from 'next/server'
import { genererRecettes } from '@/lib/ia/generation-recette'
import { getRecettes } from '@/lib/db/recettes'
import { creerClientServeur } from '@/lib/supabase-server'
import type { Phase, Recipe, TypeJournee } from '@/types'

function correspond(texte: string, query: string): boolean {
  return texte.toLowerCase().includes(query.toLowerCase())
}

/** Recettes perso pertinentes : filtrées par phase si pas de recherche, par texte sinon. */
function filtrerRecettesPersonnelles(recettes: Recipe[], query: string, phase: Phase): Recipe[] {
  const q = query.trim()
  return recettes.filter((r) => {
    if (!q) return r.phase === null || r.phase === phase
    if (correspond(r.nom, q)) return true
    return r.ingredients.some((ing) => correspond(ing, q))
  })
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query') ?? ''
  const phase = (searchParams.get('phase') ?? 'folliculaire') as Phase
  const typeJournee = (searchParams.get('typeJournee') ?? 'repos') as TypeJournee
  const allergies = (searchParams.get('allergies') ?? '').split(',').map((a) => a.trim()).filter(Boolean)
  const tempsMax = Number(searchParams.get('tempsMax')) || 30

  try {
    const supabase = await creerClientServeur()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ erreur: 'Non authentifiée' }, { status: 401 })
    }

    const toutesRecettes = await getRecettes(supabase, user.id)
    const perso = filtrerRecettesPersonnelles(toutesRecettes, query, phase)

    const generees = await genererRecettes({
      phase,
      typeJournee,
      allergies,
      tempsMax,
      recherche: query || undefined,
    })

    return NextResponse.json({ perso, generees })
  } catch (erreur) {
    console.error('Erreur recherche recettes:', erreur)
    return NextResponse.json({ erreur: 'Erreur lors de la recherche de recettes' }, { status: 500 })
  }
}
