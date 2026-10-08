// Appels Supabase dédiés à la table recipes (recettes sauvegardées)
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Phase, Recipe, RecetteGeneree, TypeRepas } from '@/types'

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

/** Supprime une recette par son id. Renvoie false si la suppression n'a pas pu être confirmée
 *  (erreur, ou aucune ligne réellement supprimée côté serveur — ex. RLS qui bloque sans lever
 *  d'erreur), pour éviter de faire disparaître la recette de l'UI sans qu'elle le soit vraiment. */
export async function deleteRecette(
  supabase: SupabaseClient,
  userId: string,
  recetteId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', recetteId)
      .eq('user_id', userId)
      .select('id')
    if (error) throw error
    return (data?.length ?? 0) > 0
  } catch (erreur) {
    console.error('Erreur deleteRecette:', erreur)
    return false
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

export interface ChampsModifiablesRecette {
  nom: string
  ingredients: string[]
  temps_min: number | null
  phase: Phase | null
  type_repas: TypeRepas | null
  calories: number
  proteines: number
  glucides: number
  lipides: number
  instructions: string | null
  raison: string | null
  image_url: string | null
}

/** Met à jour une recette existante (formulaire « Modifier »). Renvoie false si la mise à jour
 *  n'a pas pu être confirmée (erreur, ou aucune ligne réellement modifiée côté serveur). */
export async function updateRecette(
  supabase: SupabaseClient,
  userId: string,
  recetteId: string,
  champs: ChampsModifiablesRecette
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('recipes')
      .update(champs)
      .eq('id', recetteId)
      .eq('user_id', userId)
      .select('id')
    if (error) throw error
    return (data?.length ?? 0) > 0
  } catch (erreur) {
    console.error('Erreur updateRecette:', erreur)
    return false
  }
}

/**
 * Sauvegarde une recette générée par l'IA (issue de `/api/recettes/generer`) et renvoie la
 * ligne créée (avec son id), pour pouvoir l'utiliser aussitôt — ex. la lier à une case du plan
 * de la semaine (Chantier « repas IA dans le plan de la semaine », 23/09). Contrairement à
 * `saveRecette` (lib/db/nutrition.ts), qui ne renvoie rien : ici l'appelant a besoin de l'id
 * tout de suite, sans recharger toute la liste des recettes.
 */
export async function insertRecetteGeneree(
  supabase: SupabaseClient,
  userId: string,
  recette: RecetteGeneree
): Promise<Recipe | null> {
  try {
    const { data, error } = await supabase
      .from('recipes')
      .insert({
        user_id: userId,
        nom: recette.nom,
        ingredients: recette.ingredients,
        temps_min: recette.temps_min,
        phase: recette.phase,
        type_repas: recette.type_repas,
        raison: recette.raison || null,
        spoonacular_id: null,
        calories: recette.calories,
        proteines: recette.proteines,
        glucides: recette.glucides,
        lipides: recette.lipides,
        instructions: recette.instructions || null,
        portions: recette.portions,
        poids_total_g: recette.poids_total_g,
        nutrition_100g: recette.nutrition_100g,
      })
      .select('*')
      .single()
    if (error) throw error
    return data as Recipe
  } catch (erreur) {
    console.error('Erreur insertRecetteGeneree:', erreur)
    return null
  }
}

/** Bascule le favori (cœur) d'une recette sauvegardée. Renvoie false si le changement n'a pas
 *  pu être confirmé côté serveur, pour permettre à l'appelant d'annuler la mise à jour optimiste. */
export async function toggleFavori(
  supabase: SupabaseClient,
  userId: string,
  recetteId: string,
  favori: boolean
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('recipes')
      .update({ favori })
      .eq('id', recetteId)
      .eq('user_id', userId)
      .select('id')
    if (error) throw error
    return (data?.length ?? 0) > 0
  } catch (erreur) {
    console.error('Erreur toggleFavori:', erreur)
    return false
  }
}
