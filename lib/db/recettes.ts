// Appels Supabase dédiés à la table recipes (recettes sauvegardées)
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Phase, Recipe, TypeRepas } from '@/types'

/** Récupère toutes les recettes sauvegardées de l'utilisatrice, plus récentes en premier */
export async function getRecettes(
  supabase: SupabaseClient,
  userId: string
): Promise<Recipe[]> {
  try {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data ?? []) as Recipe[]
  } catch (erreur) {
    console.error('Erreur getRecettes:', erreur)
    return []
  }
}

/** Supprime une recette par son id */
export async function deleteRecette(
  supabase: SupabaseClient,
  userId: string,
  recetteId: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', recetteId)
      .eq('user_id', userId)
    if (error) throw error
  } catch (erreur) {
    console.error('Erreur deleteRecette:', erreur)
  }
}

/** Crée une recette manuelle (nom + macros + étapes optionnelles). Retourne l’id ou null. */
export async function insertRecetteManuelle(
  supabase: SupabaseClient,
  userId: string,
  data: {
    nom: string
    temps_min: number | null
    phase: Phase | null
    type_repas: TypeRepas | null
    ingredients: string[]
    calories: number
    proteines: number
    glucides: number
    lipides: number
    instructions: string | null
    raison: string | null
  }
): Promise<string | null> {
  const base = {
    user_id: userId,
    nom: data.nom,
    ingredients: data.ingredients,
    temps_min: data.temps_min,
    phase: data.phase,
    type_repas: data.type_repas,
    raison: data.raison,
    spoonacular_id: null as number | null,
    calories: data.calories,
    proteines: data.proteines,
    glucides: data.glucides,
    lipides: data.lipides,
  }
  try {
    let { data: row, error } = await supabase
      .from('recipes')
      .insert({ ...base, instructions: data.instructions })
      .select('id')
      .single()
    if (error && /instructions|column|schema/i.test(error.message)) {
      ;({ data: row, error } = await supabase.from('recipes').insert(base).select('id').single())
    }
    if (error) throw error
    return row?.id ?? null
  } catch (erreur) {
    console.error('Erreur insertRecetteManuelle:', erreur)
    return null
  }
}
