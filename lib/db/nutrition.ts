// Appels Supabase pour la table nutrition_logs.
// Ces fonctions reçoivent le client Supabase en paramètre
// pour pouvoir être appelées depuis un composant client.

import type { SupabaseClient } from '@supabase/supabase-js'
import type { NutritionLog, Recipe, ShoppingItemComplet, UserPreferences } from '@/types'

/**
 * Récupère le log nutritionnel de la semaine donnée.
 * Retourne null si aucun log n'existe encore.
 */
export async function getNutritionLogSemaine(
  supabase: SupabaseClient,
  userId: string,
  weekStart: string
): Promise<NutritionLog | null> {
  try {
    const { data, error } = await supabase
      .from('nutrition_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('week_start', weekStart)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data ?? null
  } catch (erreur) {
    console.error('Erreur getNutritionLogSemaine:', erreur)
    return null
  }
}

// ── RECETTES (client-side) ────────────────────────────────────

export async function getRecettes(supabase: SupabaseClient, userId: string): Promise<Recipe[]> {
  try {
    const { data, error } = await supabase.from('recipes').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    if (error) throw error
    return data ?? []
  } catch (erreur) { console.error('Erreur getRecettes:', erreur); return [] }
}

export async function saveRecette(supabase: SupabaseClient, userId: string, recette: Omit<Recipe, 'id' | 'user_id' | 'created_at'>): Promise<void> {
  try {
    const { error } = await supabase.from('recipes').insert({ ...recette, user_id: userId })
    if (error) throw error
  } catch (erreur) { console.error('Erreur saveRecette:', erreur); throw erreur }
}

export async function deleteRecette(supabase: SupabaseClient, userId: string, recetteId: string): Promise<void> {
  try {
    const { error } = await supabase.from('recipes').delete().eq('id', recetteId).eq('user_id', userId)
    if (error) throw error
  } catch (erreur) { console.error('Erreur deleteRecette:', erreur); throw erreur }
}

// ── SHOPPING ITEMS (client-side) ─────────────────────────────

export async function getShoppingItems(supabase: SupabaseClient, userId: string, weekStart: string): Promise<ShoppingItemComplet[]> {
  try {
    const { data, error } = await supabase.from('shopping_items').select('*').eq('user_id', userId).eq('week_start', weekStart).order('created_at', { ascending: true })
    if (error) throw error
    return (data ?? []) as ShoppingItemComplet[]
  } catch (erreur) { console.error('Erreur getShoppingItems:', erreur); return [] }
}

export async function addShoppingItem(supabase: SupabaseClient, userId: string, item: Omit<ShoppingItemComplet, 'id' | 'user_id' | 'created_at'>): Promise<ShoppingItemComplet | null> {
  try {
    const { data, error } = await supabase.from('shopping_items').insert({ ...item, user_id: userId }).select().single()
    if (error) throw error
    return data as ShoppingItemComplet
  } catch (erreur) { console.error('Erreur addShoppingItem:', erreur); return null }
}

export async function toggleShoppingItem(supabase: SupabaseClient, userId: string, itemId: string, fait: boolean): Promise<void> {
  try {
    const { error } = await supabase.from('shopping_items').update({ fait }).eq('id', itemId).eq('user_id', userId)
    if (error) throw error
  } catch (erreur) { console.error('Erreur toggleShoppingItem:', erreur); throw erreur }
}

export async function deleteShoppingItem(supabase: SupabaseClient, userId: string, itemId: string): Promise<void> {
  try {
    const { error } = await supabase.from('shopping_items').delete().eq('id', itemId).eq('user_id', userId)
    if (error) throw error
  } catch (erreur) { console.error('Erreur deleteShoppingItem:', erreur); throw erreur }
}

// ── PRÉFÉRENCES UTILISATEUR ──────────────────────────────────

export async function getUserPreferences(supabase: SupabaseClient, userId: string): Promise<UserPreferences | null> {
  try {
    const { data, error } = await supabase.from('user_preferences').select('*').eq('user_id', userId).single()
    if (error && error.code !== 'PGRST116') throw error
    return data ?? null
  } catch (erreur) { console.error('Erreur getUserPreferences:', erreur); return null }
}

/**
 * Crée ou met à jour le log nutritionnel de la semaine.
 * Utilise upsert sur la contrainte unique (user_id, week_start).
 */
export async function upsertNutritionLog(
  supabase: SupabaseClient,
  userId: string,
  weekStart: string,
  checklist: Record<string, boolean>,
  batchDone: boolean,
  notes: string | null
): Promise<void> {
  try {
    const { error } = await supabase
      .from('nutrition_logs')
      .upsert(
        { user_id: userId, week_start: weekStart, checklist, batch_done: batchDone, notes },
        { onConflict: 'user_id,week_start' }
      )

    if (error) throw error
  } catch (erreur) {
    console.error('Erreur upsertNutritionLog:', erreur)
    throw erreur
  }
}
