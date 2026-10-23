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

/**
 * Remplace le repas prévu pour ce jour + type de repas. Renvoie le message
 * d'erreur réel (au lieu de l'ignorer) : un enregistrement refusé par la base
 * faisait disparaître la semaine générée sans aucune alerte.
 */
export async function upsertMealPlan(
  supabase: SupabaseClient,
  userId: string,
  plan: Omit<MealPlan, 'id' | 'user_id' | 'created_at'>
): Promise<{ ok: true } | { ok: false; message: string }> {
  const del = await supabase
    .from('meal_plans')
    .delete()
    .eq('user_id', userId)
    .eq('date', plan.date)
    .eq('type_repas', plan.type_repas)
  if (del.error) {
    console.error('upsertMealPlan delete', JSON.stringify({ message: del.error.message, code: del.error.code }))
    return { ok: false, message: del.error.message }
  }
  const { error } = await supabase.from('meal_plans').insert({ ...plan, user_id: userId })
  if (error) {
    console.error('upsertMealPlan insert', JSON.stringify({ message: error.message, code: error.code, details: error.details }))
    return { ok: false, message: error.message }
  }
  return { ok: true }
}

/** `.select('id')` : détecte une suppression bloquée silencieusement par RLS. */
export async function deleteMealPlan(supabase: SupabaseClient, planId: string): Promise<boolean> {
  const { data, error } = await supabase.from('meal_plans').delete().eq('id', planId).select('id')
  if (error) console.error('deleteMealPlan', JSON.stringify({ message: error.message, code: error.code }))
  return !error && (data?.length ?? 0) > 0
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
