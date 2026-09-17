'use server'

import { creerClientServeur } from '@/lib/supabase-server'
import type { TypePlanningJour } from '@/types'

/** Substitution ponctuelle du planning hebdo pour une date précise (table `planning_overrides`). */
export async function getOverrideJour(date: string): Promise<TypePlanningJour | null> {
  try {
    const supabase = await creerClientServeur()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('planning_overrides')
      .select('type_planning')
      .eq('user_id', user.id)
      .eq('date', date)
      .maybeSingle()
    if (error) throw error
    return (data?.type_planning as TypePlanningJour | undefined) ?? null
  } catch (erreur) {
    console.error('Erreur getOverrideJour:', erreur)
    return null
  }
}

/** Remplace l'activité prévue pour une seule date, sans toucher au planning hebdo. */
export async function setOverrideJour(date: string, type: TypePlanningJour): Promise<boolean> {
  try {
    const supabase = await creerClientServeur()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Non connectée')

    const { error } = await supabase
      .from('planning_overrides')
      .upsert({ user_id: user.id, date, type_planning: type }, { onConflict: 'user_id,date' })
    if (error) throw error
    return true
  } catch (erreur) {
    console.error('Erreur setOverrideJour:', erreur)
    return false
  }
}

/** Retire la substitution : le jour revient au planning hebdo normal. */
export async function supprimerOverrideJour(date: string): Promise<boolean> {
  try {
    const supabase = await creerClientServeur()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Non connectée')

    const { error } = await supabase
      .from('planning_overrides')
      .delete()
      .eq('user_id', user.id)
      .eq('date', date)
    if (error) throw error
    return true
  } catch (erreur) {
    console.error('Erreur supprimerOverrideJour:', erreur)
    return false
  }
}
