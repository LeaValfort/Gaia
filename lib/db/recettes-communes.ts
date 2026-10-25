import type { SupabaseClient } from '@supabase/supabase-js'
import { moisProches, normaliserNomRecette, type RecetteCommune } from '@/lib/recettes/bibliotheque'
import type { RecetteBase } from '@/lib/ia/recette-brute'
import type { IngredientRecette, Phase, TypeRepas } from '@/types'

/** Bibliothèque commune de recettes (table recettes_communes, lisible par toutes). */

function versRecette(r: Record<string, unknown>): RecetteCommune | null {
  const ingredients = Array.isArray(r.ingredients_structures) ? (r.ingredients_structures as IngredientRecette[]) : []
  if (!ingredients.length) return null
  return {
    id: String(r.id),
    nom: String(r.nom),
    phase: (r.phase as Phase | null) ?? null,
    temps_min: Number(r.temps_min) || 30,
    portions: Number(r.portions) || 1,
    ingredients_structures: ingredients,
    ingredients: ingredients.map((i) => `${i.grammes} g ${i.nom}`),
    instructions: String(r.instructions ?? ''),
    raison: String(r.raison ?? ''),
    conditions: Array.isArray(r.conditions) ? (r.conditions as string[]) : [],
  }
}

/** Candidates pour ce créneau, cette phase (ou sans phase), de saison et assez rapides. Liste vide si la table n'existe pas encore. */
export async function chercherRecettesCommunes(
  supabase: SupabaseClient,
  f: { typeRepas: TypeRepas; phase: Phase; tempsMax: number; mois: number }
): Promise<RecetteCommune[]> {
  const { data, error } = await supabase
    .from('recettes_communes')
    .select('*')
    .eq('type_repas', f.typeRepas)
    .eq('liee_batch', false)
    .or(`phase.eq.${f.phase},phase.is.null`)
    .lte('temps_min', f.tempsMax)
    .in('mois', moisProches(f.mois))
    .limit(200)
  if (error) {
    console.error('chercherRecettesCommunes', JSON.stringify({ message: error.message }))
    return []
  }
  return (data ?? []).flatMap((r) => versRecette(r as Record<string, unknown>) ?? [])
}

/** Ajoute des recettes générées ; les doublons (même nom normalisé) sont ignorés. Ne bloque jamais la réponse. */
export async function ajouterRecettesCommunes(
  supabase: SupabaseClient,
  userId: string,
  recettes: RecetteBase[],
  meta: { typeRepas: TypeRepas; mois: number; conditions: string[]; lieeBatch: boolean }
): Promise<void> {
  if (!recettes.length) return
  const lignes = recettes.map((r) => ({
    nom: r.nom,
    nom_normalise: normaliserNomRecette(r.nom),
    phase: r.phase,
    type_repas: meta.typeRepas,
    temps_min: r.temps_min,
    portions: r.portions,
    ingredients_structures: r.ingredients_structures,
    instructions: r.instructions,
    raison: r.raison,
    mois: meta.mois,
    conditions: meta.conditions,
    liee_batch: meta.lieeBatch,
    cree_par: userId,
  }))
  const { error } = await supabase.from('recettes_communes').upsert(lignes, { onConflict: 'nom_normalise', ignoreDuplicates: true })
  if (error) console.error('ajouterRecettesCommunes', JSON.stringify({ message: error.message }))
}
