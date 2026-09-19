// Appels Supabase pour la table nutrition_checklist_jour (checklist alimentation
// quotidienne — Chantier 6). Distincte de nutrition_logs (hebdomadaire, batch cooking).

import type { SupabaseClient } from '@supabase/supabase-js'
import type { NutritionChecklistJour } from '@/types'

/**
 * Récupère la checklist du jour donné. Retourne null si aucune ligne
 * n'existe encore (première ouverture de la journée).
 */
export async function getChecklistJour(
  supabase: SupabaseClient,
  userId: string,
  date: string
): Promise<NutritionChecklistJour | null> {
  try {
    const { data, error } = await supabase
      .from('nutrition_checklist_jour')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data ?? null
  } catch (erreur) {
    console.error('Erreur getChecklistJour:', erreur)
    return null
  }
}

/**
 * Crée ou met à jour la checklist du jour donné.
 * Utilise upsert sur la contrainte unique (user_id, date).
 */
export async function upsertChecklistJour(
  supabase: SupabaseClient,
  userId: string,
  date: string,
  checklist: Record<string, boolean>
): Promise<void> {
  try {
    const { error } = await supabase
      .from('nutrition_checklist_jour')
      .upsert(
        { user_id: userId, date, checklist },
        { onConflict: 'user_id,date' }
      )

    if (error) throw error
  } catch (erreur) {
    console.error('Erreur upsertChecklistJour:', erreur)
    throw erreur
  }
}
