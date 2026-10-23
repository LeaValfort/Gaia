import { NextResponse, type NextRequest } from 'next/server'
import { creerClientServeur } from '@/lib/supabase-server'
import { genererDerouleBatch } from '@/lib/ia/batch-cooking'
import type { Recipe } from '@/types'

const MAX_RECETTES = 12

// Un déroulé pour 12 recettes peut prendre du temps à générer.
export const maxDuration = 60

/** POST { recetteIds: string[] } → déroulé commun de batch cooking généré par l'IA. */
export async function POST(request: NextRequest) {
  const supabase = await creerClientServeur()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ erreur: 'Non authentifiée' }, { status: 401 })

  const corps = (await request.json().catch(() => null)) as { recetteIds?: unknown } | null
  const ids = Array.isArray(corps?.recetteIds) ? corps.recetteIds.filter((x): x is string => typeof x === 'string').slice(0, MAX_RECETTES) : []
  if (ids.length < 1) return NextResponse.json({ erreur: 'Choisis au moins une recette.' }, { status: 400 })

  // RLS : seules les recettes de l'utilisatrice sont lisibles.
  const { data, error } = await supabase.from('recipes').select('*').in('id', ids)
  if (error || !data?.length) return NextResponse.json({ erreur: 'Recettes introuvables.' }, { status: 404 })

  const deroule = await genererDerouleBatch(data as Recipe[])
  if (!deroule) return NextResponse.json({ erreur: 'La génération du déroulé a échoué, réessaie.' }, { status: 502 })
  return NextResponse.json({ deroule })
}
