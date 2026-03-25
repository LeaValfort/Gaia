'use server'

import { creerClientServeur } from '@/lib/supabase-server'
import { creerChecklistVide } from '@/lib/nutrition'
import type { NutritionLog } from '@/types'

/**
 * Récupère le log nutritionnel de la semaine donnée.
 * Si aucun log n'existe, retourne une structure vide (sans ID).
 */
export async function getNutritionLogSemaine(weekStart: string): Promise<NutritionLog | null> {
  try {
    const supabase = await creerClientServeur()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('nutrition_logs')
      .select('*')
      .eq('user_id', user.id)
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
 */
export async function upsertNutritionLog(params: {
  weekStart: string
  checklist: Record<string, boolean>
  batchDone: boolean
  notes?: string | null
}): Promise<void> {
  try {
    const supabase = await creerClientServeur()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Non connectée')

    const { error } = await supabase
      .from('nutrition_logs')
      .upsert(
        {
          user_id: user.id,
          week_start: params.weekStart,
          checklist: params.checklist,
          batch_done: params.batchDone,
          notes: params.notes ?? null,
        },
        { onConflict: 'user_id,week_start' }
      )

    if (error) throw error
  } catch (erreur) {
    console.error('Erreur upsertNutritionLog:', erreur)
    throw erreur
  }
}

/**
 * Bascule un item de la checklist et sauvegarde immédiatement.
 */
export async function toggleItemChecklist(
  weekStart: string,
  itemId: string,
  valeur: boolean,
  checklistActuelle: Record<string, boolean>,
  batchDone: boolean
): Promise<void> {
  const nouvelleChecklist = { ...checklistActuelle, [itemId]: valeur }
  await upsertNutritionLog({ weekStart, checklist: nouvelleChecklist, batchDone })
}
