import type { SupabaseClient } from '@supabase/supabase-js'
import type { TypeActivite } from '@/types'

/**
 * Types d'activités "Autre sport" déjà loggées au moins une fois par l'utilisatrice
 * (ex: escalade, danse...). Utilisé pour proposer un bouton par activité connue
 * dans le calendrier de planification, plutôt qu'un bouton générique "Autre sport".
 */
export async function getTypesActivitesLoggees(
  supabase: SupabaseClient,
  userId: string
): Promise<TypeActivite[]> {
  try {
    const { data, error } = await supabase.from('activity_logs').select('sport_type').eq('user_id', userId)
    if (error) throw error
    const types = new Set((data ?? []).map((r) => r.sport_type as TypeActivite))
    return Array.from(types)
  } catch (e) {
    console.error('getTypesActivitesLoggees', e)
    return []
  }
}
