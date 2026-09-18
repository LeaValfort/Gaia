'use server'

import { creerClientServeur } from '@/lib/supabase-server'
import type { PlanningOverride, TypePlanningJour } from '@/types'

function parseOverride(row: Record<string, unknown>): PlanningOverride {
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    date: String(row.date),
    entree_id: typeof row.entree_id === 'string' ? row.entree_id : null,
    type_planning: row.type_planning as TypePlanningJour,
    created_at: String(row.created_at),
  }
}

/**
 * Toutes les substitutions ponctuelles actives pour une date (table
 * `planning_overrides`) : au plus une par séance ciblée (`entree_id`), plus au
 * maximum une substitution "libre" (`entree_id` null) si le jour n'a aucune
 * séance planifiée.
 */
export async function getOverridesJour(date: string): Promise<PlanningOverride[]> {
  try {
    const supabase = await creerClientServeur()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('planning_overrides')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', date)
    if (error) throw error
    return (data ?? []).map((r) => parseOverride(r as Record<string, unknown>))
  } catch (erreur) {
    console.error('Erreur getOverridesJour:', erreur)
    return []
  }
}

/**
 * Remplace l'activité prévue pour une séance précise (`entreeId`), ou pour le
 * jour entier si `entreeId` est `null` (jour sans aucune séance planifiée).
 */
export async function setOverrideJour(
  date: string,
  type: TypePlanningJour,
  entreeId: string | null
): Promise<boolean> {
  try {
    const supabase = await creerClientServeur()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Non connectée')

    await supprimerOverrideJour(date, entreeId)
    const { error } = await supabase
      .from('planning_overrides')
      .insert({ user_id: user.id, date, entree_id: entreeId, type_planning: type })
    if (error) throw error
    return true
  } catch (erreur) {
    console.error('Erreur setOverrideJour:', erreur)
    return false
  }
}

/** Retire une substitution : la séance ciblée (ou le jour entier) revient au planning normal. */
export async function supprimerOverrideJour(date: string, entreeId: string | null): Promise<boolean> {
  try {
    const supabase = await creerClientServeur()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Non connectée')

    const base = supabase.from('planning_overrides').delete().eq('user_id', user.id).eq('date', date)
    const { error } = entreeId ? await base.eq('entree_id', entreeId) : await base.is('entree_id', null)
    if (error) throw error
    return true
  } catch (erreur) {
    console.error('Erreur supprimerOverrideJour:', erreur)
    return false
  }
}
