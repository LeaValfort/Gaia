import type { SupabaseClient } from '@supabase/supabase-js'
import type { DailyMealIntake, TypeRepas } from '@/types'

export async function getDailyMealIntakesJour(
  supabase: SupabaseClient,
  userId: string,
  date: string
): Promise<DailyMealIntake[]> {
  try {
    const { data, error } = await supabase
      .from('daily_meal_intakes')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .order('type_repas', { ascending: true })
    if (error) throw error
    return (data ?? []) as DailyMealIntake[]
  } catch (erreur) {
    console.error('Erreur getDailyMealIntakesJour:', erreur)
    return []
  }
}

export type UpsertDailyMealIntakePayload = {
  date: string
  type_repas: TypeRepas
  quantite_realisee: number
  quantite_cible: number
  calories: number
  proteines: number
  glucides: number
  lipides: number
  nom_personnalise: string | null
  source_recipe_id: string | null
  objectif_calories: number | null
  objectif_proteines: number | null
  objectif_glucides: number | null
  objectif_lipides: number | null
}

/** Remplace la ligne du jour pour ce créneau (delete + insert : évite les soucis d’onConflict). */
export async function upsertDailyMealIntake(
  supabase: SupabaseClient,
  userId: string,
  payload: UpsertDailyMealIntakePayload
): Promise<{ ok: boolean; message?: string }> {
  try {
    await supabase
      .from('daily_meal_intakes')
      .delete()
      .eq('user_id', userId)
      .eq('date', payload.date)
      .eq('type_repas', payload.type_repas)

    const row = { user_id: userId, ...payload }
    let { error } = await supabase.from('daily_meal_intakes').insert(row)
    if (error && /objectif|column|schema|does not exist/i.test(error.message)) {
      const {
        objectif_calories: _oc,
        objectif_proteines: _op,
        objectif_glucides: _og,
        objectif_lipides: _ol,
        ...sansObjectifs
      } = row
      ;({ error } = await supabase.from('daily_meal_intakes').insert(sansObjectifs))
    }
    if (error) return { ok: false, message: error.message }
    return { ok: true }
  } catch (erreur) {
    const msg = erreur instanceof Error ? erreur.message : String(erreur)
    console.error('Erreur upsertDailyMealIntake:', erreur)
    return { ok: false, message: msg }
  }
}
