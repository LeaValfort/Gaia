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

/** Semaines qui ont au moins un repas planifié, de la plus récente à la plus ancienne. */
export async function getSemainesPlanifiees(supabase: SupabaseClient, userId: string, limite = 12): Promise<string[]> {
  const { data, error } = await supabase
    .from('meal_plans')
    .select('week_start')
    .eq('user_id', userId)
    .order('week_start', { ascending: false })
    .limit(500)
  if (error) {
    console.error('getSemainesPlanifiees', JSON.stringify({ message: error.message, code: error.code }))
    return []
  }
  return [...new Set((data ?? []).map((r) => r.week_start as string))].slice(0, limite)
}

/** Repas planifiés d'une date, avec leur recette (pour l'accueil). */
export async function getMealPlanJour(supabase: SupabaseClient, userId: string, date: string): Promise<{ plans: MealPlan[]; recettes: Recipe[] }> {
  const { data, error } = await supabase.from('meal_plans').select('*').eq('user_id', userId).eq('date', date)
  if (error || !data?.length) return { plans: [], recettes: [] }
  const ids = [...new Set(data.map((p) => p.recette_id as string | null).filter((x): x is string => !!x))]
  if (!ids.length) return { plans: data as MealPlan[], recettes: [] }
  const r = await supabase.from('recipes').select('*').in('id', ids)
  return { plans: data as MealPlan[], recettes: (r.data ?? []) as Recipe[] }
}
