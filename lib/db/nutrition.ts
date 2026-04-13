// Appels Supabase pour la table nutrition_logs.
// Ces fonctions reçoivent le client Supabase en paramètre
// pour pouvoir être appelées depuis un composant client.

import type { SupabaseClient } from '@supabase/supabase-js'
import type { NutritionLog } from '@/types'

/**
 * Récupère le log nutritionnel de la semaine donnée.
 * Retourne null si aucun log n'existe encore.
 */
export async function getNutritionLogSemaine(
  supabase: SupabaseClient,
  userId: string,
  weekStart: string
): Promise<NutritionLog | null> {
  try {
    const { data, error } = await supabase
      .from('nutrition_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('week_start', weekStart)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data ?? null
  } catch (erreur) {
    console.error('Erreur getNutritionLogSemaine:', erreur)
    return null
  }
}

/**
 * Crée ou met à jour le log nutritionnel de la semaine.
 * Utilise upsert sur la contrainte unique (user_id, week_start).
 */
export async function upsertNutritionLog(
  supabase: SupabaseClient,
  userId: string,
  weekStart: string,
  checklist: Record<string, boolean>,
  batchDone: boolean,
  notes: string | null
): Promise<void> {
  try {
    const { error } = await supabase
      .from('nutrition_logs')
      .upsert(
        { user_id: userId, week_start: weekStart, checklist, batch_done: batchDone, notes },
        { onConflict: 'user_id,week_start' }
      )

    if (error) throw error
  } catch (erreur) {
    console.error('Erreur upsertNutritionLog:', erreur)
    throw erreur
  }
}
