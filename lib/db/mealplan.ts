import type { SupabaseClient } from '@supabase/supabase-js'
import type { MealPlan, Recipe } from '@/types'

export async function getMealPlanSemaine(
  supabase: SupabaseClient,
  userId: string,
  weekStart: string
): Promise<MealPlan[]> {
  try {
    const { data, error } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('user_id', userId)
      .eq('week_start', weekStart)
      .order('date', { ascending: true })

    if (error) throw error
    return data ?? []
  } catch (erreur) {
    console.error('Erreur getMealPlanSemaine:', erreur)
    return []
  }
}

export async function upsertMealPlan(
  supabase: SupabaseClient,
  userId: string,
  plan: Omit<MealPlan, 'id' | 'user_id' | 'created_at'>
): Promise<void> {
  try {
    // Supprimer l'entrée existante pour ce jour + type de repas
    await supabase
      .from('meal_plans')
      .delete()
      .eq('user_id', userId)
      .eq('date', plan.date)
      .eq('type_repas', plan.type_repas)

    // Insérer la nouvelle
    const { error } = await supabase
      .from('meal_plans')
      .insert({ ...plan, user_id: userId })

    if (error) throw error
  } catch (erreur) {
    console.error('Erreur upsertMealPlan:', erreur)
  }
}

export async function deleteMealPlan(
  supabase: SupabaseClient,
  planId: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('meal_plans')
      .delete()
      .eq('id', planId)

    if (error) throw error
  } catch (erreur) {
    console.error('Erreur deleteMealPlan:', erreur)
  }
}

export async function getRecettesPourPlanning(
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
    return data ?? []
  } catch (erreur) {
    console.error('Erreur getRecettesPourPlanning:', erreur)
    return []
  }
}
