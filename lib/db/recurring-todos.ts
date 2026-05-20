'use server'

import { creerClientServeur } from '@/lib/supabase-server'
import type { FrequenceRecurrence, RecurringTodo } from '@/types'

export type RecurringTodoCreateData = {
  text: string
  frequency: FrequenceRecurrence
  week_days: number[] | null
  month_day: number | null
  active?: boolean
}

export type RecurringTodoUpdateData = Partial<{
  text: string
  frequency: FrequenceRecurrence
  week_days: number[] | null
  month_day: number | null
  active: boolean
}>

/**
 * Récupère les todos récurrents actifs et inactifs d'une utilisatrice.
 */
export async function getRecurringTodos(userId: string): Promise<RecurringTodo[]> {
  try {
    const supabase = await creerClientServeur()
    const { data, error } = await supabase
      .from('recurring_todos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return (data ?? []) as RecurringTodo[]
  } catch (erreur) {
    console.error('Erreur getRecurringTodos:', erreur)
    return []
  }
}

/**
 * Crée un todo récurrent.
 */
export async function createRecurringTodo(
  userId: string,
  data: RecurringTodoCreateData
): Promise<RecurringTodo> {
  try {
    const supabase = await creerClientServeur()
    const { data: row, error } = await supabase
      .from('recurring_todos')
      .insert({
        user_id: userId,
        text: data.text,
        frequency: data.frequency,
        week_days: data.week_days,
        month_day: data.month_day,
        active: data.active ?? true,
      })
      .select()
      .single()

    if (error) throw error
    if (!row) throw new Error('Création recurring todo sans retour')
    return row as RecurringTodo
  } catch (erreur) {
    console.error('Erreur createRecurringTodo:', erreur)
    throw erreur instanceof Error ? erreur : new Error('Erreur createRecurringTodo')
  }
}

/**
 * Met à jour un todo récurrent (champs partiels).
 */
export async function updateRecurringTodo(
  id: string,
  data: RecurringTodoUpdateData
): Promise<RecurringTodo> {
  try {
    const supabase = await creerClientServeur()
    const { data: row, error } = await supabase
      .from('recurring_todos')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    if (!row) throw new Error('Mise à jour recurring todo sans retour')
    return row as RecurringTodo
  } catch (erreur) {
    console.error('Erreur updateRecurringTodo:', erreur)
    throw erreur instanceof Error ? erreur : new Error('Erreur updateRecurringTodo')
  }
}

/**
 * Supprime un todo récurrent.
 */
export async function deleteRecurringTodo(id: string): Promise<void> {
  try {
    const supabase = await creerClientServeur()
    const { error } = await supabase.from('recurring_todos').delete().eq('id', id)

    if (error) throw error
  } catch (erreur) {
    console.error('Erreur deleteRecurringTodo:', erreur)
  }
}
