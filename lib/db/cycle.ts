'use server'

import { creerClientServeur } from '@/lib/supabase-server'
import type { UserPreferences } from '@/types'
import { DEFAULT_CYCLE_LENGTH, DEFAULT_COOK_TIME } from '@/types'

/**
 * Récupère les préférences de l'utilisatrice connectée.
 * Retourne null si non connectée ou si aucune préférence n'existe encore.
 */
export async function getPreferencesUtilisateur(): Promise<UserPreferences | null> {
  try {
    const supabase = await creerClientServeur()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // PGRST116 = aucune ligne trouvée (pas une vraie erreur)
    if (error && error.code !== 'PGRST116') throw error
    return data ?? null
  } catch (erreur) {
    console.error('Erreur getPreferencesUtilisateur:', erreur)
    return null
  }
}

/**
 * Sauvegarde les préférences (crée ou met à jour).
 */
export async function upsertPreferencesUtilisateur(
  prefs: Partial<Omit<UserPreferences, 'id' | 'user_id'>>
): Promise<void> {
  try {
    const supabase = await creerClientServeur()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Non connectée')

    const { error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        cycle_length: DEFAULT_CYCLE_LENGTH,
        cook_time_minutes: DEFAULT_COOK_TIME,
        ...prefs,
      })

    if (error) throw error
  } catch (erreur) {
    console.error('Erreur upsertPreferencesUtilisateur:', erreur)
  }
}
