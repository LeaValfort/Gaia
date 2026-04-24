import type { SupabaseClient } from '@supabase/supabase-js'
import type { ExerciceCustom, Lieu, TypeSeanceMuscu } from '@/types'

function parseExercices(raw: unknown): ExerciceCustom[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((x) => {
      if (!x || typeof x !== 'object') return null
      const o = x as Record<string, unknown>
      if (typeof o.nom !== 'string') return null
      return {
        nom: o.nom,
        seriesDefaut: Number(o.seriesDefaut) || 1,
        repsDefaut: Number(o.repsDefaut) || 1,
        unite: o.unite === 'secondes' ? 'secondes' : 'reps',
        reposSecondes: Number(o.reposSecondes) || 0,
        ordre: Number(o.ordre) || 0,
      } satisfies ExerciceCustom
    })
    .filter((x): x is ExerciceCustom => x !== null)
}

export async function getSeanceCustom(
  supabase: SupabaseClient,
  userId: string,
  typeSeance: string,
  lieu: Lieu
): Promise<ExerciceCustom[] | null> {
  try {
    const { data, error } = await supabase
      .from('seances_custom')
      .select('exercices')
      .eq('user_id', userId)
      .eq('type_seance', typeSeance)
      .eq('lieu', lieu)
      .maybeSingle()
    if (error) throw error
    if (!data) return null
    const row = data as Record<string, unknown>
    return parseExercices(row.exercices)
  } catch (e) {
    console.error('getSeanceCustom', e)
    return null
  }
}

export async function saveSeanceCustom(
  supabase: SupabaseClient,
  userId: string,
  typeSeance: string,
  lieu: Lieu,
  exercices: ExerciceCustom[]
): Promise<void> {
  try {
    const ts = typeSeance as TypeSeanceMuscu
    const { error } = await supabase.from('seances_custom').upsert(
      {
        user_id: userId,
        type_seance: ts,
        lieu,
        exercices: exercices as unknown as Record<string, unknown>,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,type_seance,lieu' }
    )
    if (error) throw error
  } catch (e) {
    console.error('saveSeanceCustom', e)
    throw e
  }
}

export async function resetSeanceCustom(
  supabase: SupabaseClient,
  userId: string,
  typeSeance: string,
  lieu: Lieu
): Promise<void> {
  try {
    const { error } = await supabase
      .from('seances_custom')
      .delete()
      .eq('user_id', userId)
      .eq('type_seance', typeSeance)
      .eq('lieu', lieu)
    if (error) throw error
  } catch (e) {
    console.error('resetSeanceCustom', e)
    throw e
  }
}
