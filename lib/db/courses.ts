// Appels Supabase dédiés à la liste de courses (shopping_items)
import type { SupabaseClient } from '@supabase/supabase-js'
import type { ShoppingItemComplet, Rayon } from '@/types'

export async function getShoppingItems(
  supabase: SupabaseClient,
  userId: string,
  weekStart: string
): Promise<ShoppingItemComplet[]> {
  try {
    const { data, error } = await supabase
      .from('shopping_items')
      .select('*')
      .eq('user_id', userId)
      .eq('week_start', weekStart)
      .order('created_at', { ascending: true })
    if (error) throw error
    return (data ?? []) as ShoppingItemComplet[]
  } catch (erreur) {
    console.error('Erreur getShoppingItems:', erreur)
    return []
  }
}

export async function addShoppingItem(
  supabase: SupabaseClient,
  userId: string,
  item: {
    week_start: string
    nom: string
    quantite: string | null
    enseigne: string | null
    rayon: Rayon | null
    source: 'manuel' | 'spoonacular' | 'open_food_facts' | 'themealdb'
    /** true = signalé "déjà dans le placard/frigo" à l'ajout (distinct de "fait"). */
    deja_en_stock?: boolean
  }
): Promise<ShoppingItemComplet | null> {
  try {
    const { data, error } = await supabase
      .from('shopping_items')
      .insert({ ...item, user_id: userId, fait: false, deja_en_stock: item.deja_en_stock ?? false })
      .select()
      .single()
    if (error) throw error
    return data as ShoppingItemComplet
  } catch (erreur) {
    console.error('Erreur addShoppingItem:', erreur)
    return null
  }
}

export async function toggleShoppingItem(
  supabase: SupabaseClient,
  itemId: string,
  fait: boolean
): Promise<void> {
  try {
    const { error } = await supabase
      .from('shopping_items')
      .update({ fait })
      .eq('id', itemId)
    if (error) throw error
  } catch (erreur) {
    console.error('Erreur toggleShoppingItem:', erreur)
  }
}

/** Coche/décoche un article comme "déjà dans le placard/frigo" (distinct de "fait"). */
export async function toggleDejaEnStock(
  supabase: SupabaseClient,
  itemId: string,
  dejaEnStock: boolean
): Promise<void> {
  try {
    const { error } = await supabase
      .from('shopping_items')
      .update({ deja_en_stock: dejaEnStock })
      .eq('id', itemId)
    if (error) throw error
  } catch (erreur) {
    console.error('Erreur toggleDejaEnStock:', erreur)
  }
}

export async function deleteShoppingItem(
  supabase: SupabaseClient,
  itemId: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('shopping_items')
      .delete()
      .eq('id', itemId)
    if (error) throw error
  } catch (erreur) {
    console.error('Erreur deleteShoppingItem:', erreur)
  }
}

/** Supprime tous les articles de la liste de courses pour une semaine. */
export async function deleteAllShoppingItemsForWeek(
  supabase: SupabaseClient,
  userId: string,
  weekStart: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('shopping_items')
      .delete()
      .eq('user_id', userId)
      .eq('week_start', weekStart)
    if (error) throw error
  } catch (erreur) {
    console.error('Erreur deleteAllShoppingItemsForWeek:', erreur)
  }
}
