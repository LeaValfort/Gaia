'use server'

import { creerClientServeur } from '@/lib/supabase-server'
import { PROFILS_DEFAUT } from '@/types'
import type { ProfilEffort, SeanceProfil } from '@/types'

const SEANCE_TYPE_FALLBACK = 'repos'

function profilDefaut(seanceType: string): ProfilEffort {
  const defaut = PROFILS_DEFAUT[seanceType]
  if (defaut) return defaut
  return PROFILS_DEFAUT[SEANCE_TYPE_FALLBACK]
}

function profilEffortDepuisSeance(row: SeanceProfil): ProfilEffort {
  return {
    intensite: row.intensite,
    type_effort: row.type_effort,
    duree_min: row.duree_min,
  }
}

/**
 * Profils d'effort personnalisés par type de séance.
 */
export async function getSeanceProfils(userId: string): Promise<SeanceProfil[]> {
  try {
    const supabase = await creerClientServeur()
    const { data, error } = await supabase
      .from('seance_profils')
      .select('*')
      .eq('user_id', userId)
      .order('seance_type', { ascending: true })

    if (error) throw error
    return (data ?? []) as SeanceProfil[]
  } catch (erreur) {
    console.error('Erreur getSeanceProfils:', erreur)
    return []
  }
}

/**
 * Crée ou met à jour le profil d'effort pour un type de séance.
 */
export async function upsertSeanceProfil(
  userId: string,
  seanceType: string,
  profil: ProfilEffort
): Promise<SeanceProfil> {
  try {
    const supabase = await creerClientServeur()
    const { data: existant, error: erreurLecture } = await supabase
      .from('seance_profils')
      .select('id')
      .eq('user_id', userId)
      .eq('seance_type', seanceType)
      .maybeSingle()

    if (erreurLecture) throw erreurLecture

    const row: Record<string, unknown> = {
      user_id: userId,
      seance_type: seanceType,
      intensite: profil.intensite,
      type_effort: profil.type_effort,
      duree_min: profil.duree_min,
    }
    if (existant?.id) row.id = existant.id

    const { data: saved, error } = await supabase
      .from('seance_profils')
      .upsert(row, { onConflict: 'user_id,seance_type' })
      .select()
      .single()

    if (error) throw error
    if (!saved) throw new Error('Upsert seance profil sans retour')
    return saved as SeanceProfil
  } catch (erreur) {
    console.error('Erreur upsertSeanceProfil:', erreur)
    throw erreur instanceof Error ? erreur : new Error('Erreur upsertSeanceProfil')
  }
}

/**
 * Profil d'effort pour une séance : personnalisé ou défaut (repos si type inconnu).
 */
export async function getProfilPourSeance(
  userId: string,
  seanceType: string
): Promise<ProfilEffort> {
  try {
    const supabase = await creerClientServeur()
    const { data, error } = await supabase
      .from('seance_profils')
      .select('*')
      .eq('user_id', userId)
      .eq('seance_type', seanceType)
      .maybeSingle()

    if (error) throw error
    if (data) return profilEffortDepuisSeance(data as SeanceProfil)
    return profilDefaut(seanceType)
  } catch (erreur) {
    console.error('Erreur getProfilPourSeance:', erreur)
    return profilDefaut(seanceType)
  }
}

/**
 * Supprime le profil personnalisé d'un type de séance.
 */
export async function deleteSeanceProfil(userId: string, seanceType: string): Promise<void> {
  try {
    const supabase = await creerClientServeur()
    const { error } = await supabase
      .from('seance_profils')
      .delete()
      .eq('user_id', userId)
      .eq('seance_type', seanceType)

    if (error) throw error
  } catch (erreur) {
    console.error('Erreur deleteSeanceProfil:', erreur)
  }
}
