import type { SupabaseClient } from '@supabase/supabase-js'
import type { DerniereCharge } from '@/types'

function mapRow(row: Record<string, unknown>): DerniereCharge {
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    exercise_name: String(row.exercise_name),
    weight_kg: Number(row.weight_kg),
    reps: row.reps == null ? null : Number(row.reps),
    sets: row.sets == null ? null : Number(row.sets),
    date_seance: String(row.date_seance).slice(0, 10),
    updated_at: String(row.updated_at),
  }
}

export async function getDernieresCharges(
  supabase: SupabaseClient,
  userId: string
): Promise<DerniereCharge[]> {
  try {
    const { data, error } = await supabase
      .from('dernieres_charges')
      .select('*')
      .eq('user_id', userId)
      .order('exercise_name', { ascending: true })
    if (error) throw error
    if (!data?.length) return []
    return (data as Record<string, unknown>[]).map((r) => mapRow(r))
  } catch (e) {
    console.error('getDernieresCharges', e)
    return []
  }
}

export interface SaisieChargeSeance {
  exercise_name: string
  weight_kg: number
  reps: number
  /** Nombre de séries */
  sets: number
}

export async function updateChargesSeance(
  supabase: SupabaseClient,
  userId: string,
  series: SaisieChargeSeance[],
  dateSeance: string
): Promise<void> {
  try {
    for (const s of series) {
      const { error } = await supabase.from('dernieres_charges').upsert(
        {
          user_id: userId,
          exercise_name: s.exercise_name,
          weight_kg: s.weight_kg,
          reps: s.reps,
          sets: s.sets,
          date_seance: dateSeance,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,exercise_name' }
      )
      if (error) throw error
    }
  } catch (e) {
    console.error('updateChargesSeance', e)
    throw e
  }
}
