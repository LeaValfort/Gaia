import type { SupabaseClient } from '@supabase/supabase-js'
import type { MealPlanComplet, MealPlan } from '@/types'
import { getLundiSemaine } from '@/lib/nutrition'
import { OPTIONS_PETIT_DEJ } from '@/lib/data/petitsdejeuners'

export async function getMealPlansJour(
  supabase: SupabaseClient,
  userId: string,
  date: string
): Promise<MealPlanComplet[]> {
  try {
    const weekStart = getLundiSemaine(new Date(date + 'T12:00:00'))
    const { data: plans, error } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .eq('week_start', weekStart)
      .order('type_repas', { ascending: true })

    if (error) throw error
    const rows = (plans ?? []) as MealPlan[]

    const ids = [...new Set(rows.map((r) => r.recette_id).filter(Boolean))] as string[]
    let recettes: Map<string, MealPlanComplet['recette']> = new Map()
    if (ids.length > 0) {
      const { data: recData, error: er } = await supabase.from('recipes').select('*').in('id', ids)
      if (!er && recData) {
        recettes = new Map(recData.map((r) => [r.id, r as MealPlanComplet['recette']]))
      }
    }

    return rows.map((p) => ({
      ...p,
      recette: p.recette_id ? recettes.get(p.recette_id) ?? null : null,
      petitDej: p.petit_dej_id ? OPTIONS_PETIT_DEJ.find((o) => o.id === p.petit_dej_id) ?? null : null,
    }))
  } catch (erreur) {
    console.error('Erreur getMealPlansJour:', erreur)
    return []
  }
}
