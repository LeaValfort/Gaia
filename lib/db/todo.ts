'use server'

import { creerClientServeur } from '@/lib/supabase-server'
import type { Todo } from '@/types'

/**
 * Récupère les todos du jour pour l'utilisatrice connectée.
 */
export async function getTodosPourPlage(dateDebut: string, dateFin: string): Promise<Todo[]> {
  try {
    const supabase = await creerClientServeur()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', dateDebut)
      .lte('date', dateFin)
      .order('date', { ascending: true })
      .order('created_at', { ascending: true })

    if (error) throw error
    return data ?? []
  } catch (erreur) {
    console.error('Erreur getTodosPourPlage:', erreur)
    return []
  }
}

/** Todos sur une plage de dates, regroupés par jour (calendrier cycle, etc.). */
export async function getTodosGroupesPourPlage(
  dateDebut: string,
  dateFin: string
): Promise<Record<string, Todo[]>> {
  const liste = await getTodosPourPlage(dateDebut, dateFin)
  const parDate: Record<string, Todo[]> = {}
  for (const t of liste) {
    if (!parDate[t.date]) parDate[t.date] = []
    parDate[t.date].push(t)
  }
  return parDate
}

export async function getTodosParDate(date: string): Promise<Todo[]> {
  try {
    const supabase = await creerClientServeur()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', date)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data ?? []
  } catch (erreur) {
    console.error('Erreur getTodosParDate:', erreur)
    return []
  }
}

/**
 * Crée un nouveau todo pour le jour donné.
 */
export async function creerTodo(date: string, text: string): Promise<Todo | null> {
  try {
    const supabase = await creerClientServeur()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Non connectée')

    const { data, error } = await supabase
      .from('todos')
      .insert({ user_id: user.id, date, text, done: false, auto: false })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (erreur) {
    console.error('Erreur creerTodo:', erreur)
    return null
  }
}

/**
 * Bascule l'état fait/pas fait d'un todo.
 */
export async function toggleTodo(id: string, done: boolean): Promise<void> {
  try {
    const supabase = await creerClientServeur()
    const { error } = await supabase
      .from('todos')
      .update({ done })
      .eq('id', id)

    if (error) throw error
  } catch (erreur) {
    console.error('Erreur toggleTodo:', erreur)
  }
}

/**
 * Supprime un todo.
 */
export async function supprimerTodo(id: string): Promise<void> {
  try {
    const supabase = await creerClientServeur()
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)

    if (error) throw error
  } catch (erreur) {
    console.error('Erreur supprimerTodo:', erreur)
  }
}
