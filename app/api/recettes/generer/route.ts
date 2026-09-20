// Recettes pour l'onglet Suggestions : recettes perso correspondantes + recettes générées par
// l'IA, macros calculées via CIQUAL (Chantier 5, refonte — remplace les macros inventées par l'IA).

import { NextRequest, NextResponse } from 'next/server'
import { genererRecettes } from '@/lib/ia/generation-recette'
import type { RecetteBase } from '@/lib/ia/recette-brute'
import { calculerMacrosRecette, ajusterPourCalories, versNutrition100g, versMacrosParPortion } from '@/lib/nutrition/calcul-recette'
import { objectifsRepasDefaut } from '@/lib/repartitionRepas'
import { getRecettes } from '@/lib/db/recettes'
import { creerClientServeur } from '@/lib/supabase-server'
import type { Phase, Recipe, RecetteGeneree, TypeJournee, TypeRepas } from '@/types'

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

/** Calcule les macros d'une recette générée, ajuste les quantités sur l'objectif calorique du
 *  créneau, puis reconstruit la recette finale avec ingrédients (et macros) à jour. */
function finaliserRecette(base: RecetteBase, typeRepas: TypeRepas, objectifCaloriesPortion: number): RecetteGeneree {
  const premierCalcul = calculerMacrosRecette(base.ingredients_structures)
  const ingredientsAjustes = ajusterPourCalories(
    base.ingredients_structures,
    objectifCaloriesPortion * base.portions,
    premierCalcul
  )
  const resultat = calculerMacrosRecette(ingredientsAjustes)
  const macros = versMacrosParPortion(resultat, base.portions)

  return {
    nom: base.nom,
    phase: base.phase,
    type_repas: typeRepas,
    temps_min: base.temps_min,
    portions: base.portions,
    poids_total_g: resultat.poidsTotalG,
    ingredients_structures: ingredientsAjustes,
    ingredients: ingredientsAjustes.map((i) => `${i.grammes} g ${i.nom}`),
    instructions: base.instructions,
    calories: macros.calories,
    proteines: macros.proteines,
    glucides: macros.glucides,
    lipides: macros.lipides,
    nutrition_100g: versNutrition100g(resultat),
    ingredients_non_reconnus: resultat.ingredientsNonReconnus,
    ingredients_approximes: resultat.ingredientsApproximes,
    raison: base.raison,
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query') ?? ''
  const phase = (searchParams.get('phase') ?? 'folliculaire') as Phase
  const typeJournee = (searchParams.get('typeJournee') ?? 'repos') as TypeJournee
  const typeRepas = (searchParams.get('typeRepas') ?? 'dejeuner') as TypeRepas
  const allergies = (searchParams.get('allergies') ?? '').split(',').map((a) => a.trim()).filter(Boolean)
  const tempsMax = Number(searchParams.get('tempsMax')) || 30
  // Désactivable depuis l'UI pour ne pas consommer de crédits IA quand on cherche juste
  // parmi ses propres recettes déjà enregistrées.
  const avecIA = searchParams.get('avecIA') !== 'false'

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

    const objectif = objectifsRepasDefaut(typeJournee, typeRepas)
    const bases = avecIA
      ? await genererRecettes({
          phase,
          typeJournee,
          typeRepas,
          objectif,
          allergies,
          tempsMax,
          recherche: query || undefined,
        })
      : []
    const generees = bases.map((b) => finaliserRecette(b, typeRepas, objectif.calories))

    return NextResponse.json({ perso, generees })
  } catch (erreur) {
    console.error('Erreur recherche recettes:', erreur)
    return NextResponse.json({ erreur: 'Erreur lors de la recherche de recettes' }, { status: 500 })
  }
}
