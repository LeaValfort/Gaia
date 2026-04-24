'use server'

import { creerClientServeur } from '@/lib/supabase-server'
import type { UserPreferences } from '@/types'
import { PLANNING_DEFAUT } from '@/lib/planning-sport'
import {
  DEFAULT_CYCLE_LENGTH,
  DEFAULT_COOK_TIME,
  DEFAULT_MODE_UTILISATEUR,
} from '@/types'

function mapPrefs(row: Record<string, unknown>): UserPreferences {
  const r = row as unknown as UserPreferences
  return {
    ...r,
    mode_utilisateur:
      r.mode_utilisateur === 'sans_cycle' ? 'sans_cycle' : DEFAULT_MODE_UTILISATEUR,
    google_calendar_enabled: r.google_calendar_enabled !== false,
  }
}

/** Préférences de l’utilisatrice connectée (null si non connectée ou aucune ligne). */
export async function getUserPreferences(): Promise<UserPreferences | null> {
  try {
    const supabase = await creerClientServeur()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data ? mapPrefs(data as Record<string, unknown>) : null
  } catch (erreur) {
    console.error('Erreur getUserPreferences:', erreur)
    return null
  }
}

/** Fusionne avec l’existant et upsert sur `user_id`. */
export async function updateUserPreferences(
  updates: Partial<Omit<UserPreferences, 'id' | 'user_id'>>
): Promise<boolean> {
  try {
    const supabase = await creerClientServeur()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Non connectée')

    const actuel = await getUserPreferences()
    const merged: Omit<UserPreferences, 'id' | 'user_id'> = {
      cycle_length: actuel?.cycle_length ?? DEFAULT_CYCLE_LENGTH,
      last_cycle_start: actuel?.last_cycle_start ?? null,
      food_likes: actuel?.food_likes ?? [],
      food_dislikes: actuel?.food_dislikes ?? [],
      food_allergies: actuel?.food_allergies ?? [],
      cook_time_minutes: actuel?.cook_time_minutes ?? DEFAULT_COOK_TIME,
      theme: actuel?.theme ?? 'system',
      notifications: actuel?.notifications ?? true,
      google_calendar_enabled: actuel?.google_calendar_enabled !== false,
      planning_sport: updates.planning_sport ?? actuel?.planning_sport ?? PLANNING_DEFAUT,
      ...updates,
      mode_utilisateur:
        updates.mode_utilisateur ?? actuel?.mode_utilisateur ?? DEFAULT_MODE_UTILISATEUR,
    }

    const row: Record<string, unknown> = { user_id: user.id, ...merged }
    if (actuel?.id) row.id = actuel.id

    const { error } = await supabase.from('user_preferences').upsert(row, { onConflict: 'user_id' })

    if (error) throw error
    return true
  } catch (erreur) {
    console.error('Erreur updateUserPreferences:', erreur)
    return false
  }
}

/** Crée une ligne par défaut si elle n’existe pas. */
export async function initUserPreferences(): Promise<void> {
  try {
    const supabase = await creerClientServeur()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const ex = await getUserPreferences()
    if (ex) return

    const { error } = await supabase.from('user_preferences').insert({
      user_id: user.id,
      mode_utilisateur: DEFAULT_MODE_UTILISATEUR,
      cycle_length: DEFAULT_CYCLE_LENGTH,
      last_cycle_start: null,
      food_likes: [],
      food_dislikes: [],
      food_allergies: [],
      cook_time_minutes: DEFAULT_COOK_TIME,
      theme: 'system',
      notifications: true,
      google_calendar_enabled: true,
    })

    if (error) throw error
  } catch (erreur) {
    console.error('Erreur initUserPreferences:', erreur)
  }
}
