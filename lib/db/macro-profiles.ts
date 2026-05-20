'use server'

import { creerClientServeur } from '@/lib/supabase-server'
import type { MacroProfile, MacrosManuelsParSeance, NiveauActivite, Objectif } from '@/types'

/** Données enregistrables (création ou upsert complet). */
export type MacroProfileSaveData = {
  poids_kg: number
  poids_cible_kg: number | null
  delai_mois: number | null
  taille_cm: number
  age: number
  objectif: Objectif
  activite: NiveauActivite
  sommeil_heures: number
  pas_quotidiens: number
  mb: number | null
  tdee: number | null
  kcal_base: number | null
  proteines_g: number | null
  glucides_g: number | null
  lipides_g: number | null
  kcal_sport: number | null
  proteines_sport_g: number | null
  glucides_sport_g: number | null
  lipides_sport_g: number | null
  kcal_repos: number | null
  proteines_repos_g: number | null
  glucides_repos_g: number | null
  lipides_repos_g: number | null
  macros_manuels?: MacrosManuelsParSeance | null
}

export type MacroProfileUpdateData = Partial<MacroProfileSaveData>

/**
 * Profil macros de l'utilisatrice (une ligne par user_id).
 */
export async function getMacroProfile(userId: string): Promise<MacroProfile | null> {
  try {
    const supabase = await creerClientServeur()
    const { data, error } = await supabase
      .from('macro_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) throw error
    return data ? (data as MacroProfile) : null
  } catch (erreur) {
    console.error('Erreur getMacroProfile:', erreur)
    return null
  }
}

/**
 * Crée ou remplace le profil macros (upsert sur user_id).
 */
export async function saveMacroProfile(
  userId: string,
  data: MacroProfileSaveData
): Promise<MacroProfile> {
  try {
    const supabase = await creerClientServeur()
    const actuel = await getMacroProfile(userId)

    const row: Record<string, unknown> = {
      user_id: userId,
      ...data,
      updated_at: new Date().toISOString(),
    }
    if (actuel?.id) row.id = actuel.id

    const { data: saved, error } = await supabase
      .from('macro_profiles')
      .upsert(row, { onConflict: 'user_id' })
      .select()
      .single()

    if (error) throw error
    if (!saved) throw new Error('Enregistrement macro profile sans retour')
    return saved as MacroProfile
  } catch (erreur) {
    console.error('Erreur saveMacroProfile:', erreur)
    throw erreur instanceof Error ? erreur : new Error('Erreur saveMacroProfile')
  }
}

/**
 * Met à jour partiellement le profil macros existant.
 */
export async function updateMacroProfile(
  userId: string,
  data: MacroProfileUpdateData
): Promise<MacroProfile> {
  try {
    const supabase = await creerClientServeur()
    const { data: row, error } = await supabase
      .from('macro_profiles')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    if (!row) throw new Error('Mise à jour macro profile sans retour')
    return row as MacroProfile
  } catch (erreur) {
    console.error('Erreur updateMacroProfile:', erreur)
    throw erreur instanceof Error ? erreur : new Error('Erreur updateMacroProfile')
  }
}

/**
 * Supprime le profil macros de l'utilisatrice.
 */
export async function deleteMacroProfile(userId: string): Promise<void> {
  try {
    const supabase = await creerClientServeur()
    const { error } = await supabase.from('macro_profiles').delete().eq('user_id', userId)

    if (error) throw error
  } catch (erreur) {
    console.error('Erreur deleteMacroProfile:', erreur)
  }
}
