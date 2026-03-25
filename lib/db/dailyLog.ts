'use server'

import { creerClientServeur } from '@/lib/supabase-server'
import type { DailyLog } from '@/types'

/**
 * Récupère tous les logs d'un mois sous forme de dictionnaire date → log.
 * annee/mois : 1-indexé (mois 1 = janvier).
 */
export async function getDailyLogsParMois(
  annee: number,
  mois: number
): Promise<Record<string, DailyLog>> {
  try {
    const supabase = await creerClientServeur()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return {}

    const mm = String(mois).padStart(2, '0')
    const dernierJour = new Date(annee, mois, 0).getDate() // getDate sur le jour 0 du mois suivant
    const { data, error } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', `${annee}-${mm}-01`)
      .lte('date', `${annee}-${mm}-${dernierJour}`)

    if (error) throw error
    return (data ?? []).reduce<Record<string, DailyLog>>(
      (acc, log) => ({ ...acc, [log.date]: log }),
      {}
    )
  } catch (erreur) {
    console.error('Erreur getDailyLogsParMois:', erreur)
    return {}
  }
}

/**
 * Récupère le journal du jour pour l'utilisatrice connectée.
 * Retourne null si aucun log n'existe pour cette date.
 */
export async function getDailyLogParDate(date: string): Promise<DailyLog | null> {
  try {
    const supabase = await creerClientServeur()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', date)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data ?? null
  } catch (erreur) {
    console.error('Erreur getDailyLogParDate:', erreur)
    return null
  }
}

/**
 * Crée ou met à jour le journal du jour.
 */
export async function upsertDailyLog(
  log: Omit<DailyLog, 'id' | 'user_id' | 'created_at'>
): Promise<void> {
  try {
    const supabase = await creerClientServeur()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Non connectée')

    const { error } = await supabase
      .from('daily_logs')
      .upsert({ ...log, user_id: user.id }, { onConflict: 'user_id,date' })

    if (error) throw error
  } catch (erreur) {
    console.error('Erreur upsertDailyLog:', erreur)
    throw erreur
  }
}
