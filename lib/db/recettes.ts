// Appels Supabase dédiés à la table recipes (recettes sauvegardées)
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Recipe } from '@/types'

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
