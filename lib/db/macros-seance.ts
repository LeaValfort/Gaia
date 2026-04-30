import type { SupabaseClient } from '@supabase/supabase-js'
import type { MacrosSeance, TypePlanningJour } from '@/types'

function rowToMacro(r: Record<string, unknown>): MacrosSeance {
  return {
    id: r.id as string,
    user_id: r.user_id as string,
    type_seance: r.type_seance as TypePlanningJour,
    calories: (r.calories as number | null) ?? null,
    proteines: (r.proteines as number | null) ?? null,
    glucides: (r.glucides as number | null) ?? null,
    lipides: (r.lipides as number | null) ?? null,
    notes: (r.notes as string | null) ?? null,
    created_at: r.created_at as string,
  }
}

export async function getMacrosSeance(
  supabase: SupabaseClient,
  userId: string
): Promise<MacrosSeance[]> {
  try {
    const { data, error } = await supabase
      .from('macros_seance')
      .select('*')
      .eq('user_id', userId)
    if (error) {
      console.error('getMacrosSeance', error)
      return []
    }
    return (data ?? []).map((r) => rowToMacro(r as Record<string, unknown>))
  } catch (e) {
    console.error('getMacrosSeance', e)
    return []
  }
}

export async function saveMacrosSeance(
  supabase: SupabaseClient,
  userId: string,
  typeSeance: TypePlanningJour,
  macros: {
    calories: number | null
    proteines: number | null
    glucides: number | null
    lipides: number | null
    notes: string | null
  }
): Promise<void> {
  try {
    const { error } = await supabase.from('macros_seance').upsert(
      {
        user_id: userId,
        type_seance: typeSeance,
        calories: macros.calories,
        proteines: macros.proteines,
        glucides: macros.glucides,
        lipides: macros.lipides,
        notes: macros.notes,
      },
      { onConflict: 'user_id,type_seance' }
    )
    if (error) {
      console.error('saveMacrosSeance', error)
      throw error
    }
  } catch (e) {
    console.error('saveMacrosSeance', e)
    throw e
  }
}
