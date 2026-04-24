'use server'

import type { UserPreferences } from '@/types'
import { getUserPreferences, updateUserPreferences } from '@/lib/db/parametres'

export async function getPreferencesUtilisateur(): Promise<UserPreferences | null> {
  return getUserPreferences()
}

export async function upsertPreferencesUtilisateur(
  prefs: Partial<Omit<UserPreferences, 'id' | 'user_id'>>
): Promise<void> {
  await updateUserPreferences(prefs)
}
