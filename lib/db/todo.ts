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
    return getTodosParDatePourUtilisateur(user.id, date)
  } catch (erreur) {
    console.error('Erreur getTodosParDate:', erreur)
    return []
  }
}

/** Todos du jour pour un user_id (page d'accueil serveur, après génération récurrente). */
export async function getTodosParDatePourUtilisateur(
  userId: string,
  date: string
): Promise<Todo[]> {
  try {
    const supabase = await creerClientServeur()
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data ?? []
  } catch (erreur) {
    console.error('Erreur getTodosParDatePourUtilisateur:', erreur)
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

/** Todo auto généré déjà présent pour ce jour et ce libellé. */
export async function todoAutoExiste(
  userId: string,
  date: string,
  text: string
): Promise<boolean> {
  try {
    const supabase = await creerClientServeur()
    const { data, error } = await supabase
      .from('todos')
      .select('id')
      .eq('user_id', userId)
      .eq('date', date)
      .eq('text', text)
      .eq('auto', true)
      .maybeSingle()

    if (error) throw error
    return data != null
  } catch (erreur) {
    console.error('Erreur todoAutoExiste:', erreur)
    return false
  }
}

/** Insère un todo généré automatiquement (récurrent). */
export async function insererTodoAuto(
  userId: string,
  date: string,
  text: string
): Promise<Todo | null> {
  try {
    const supabase = await creerClientServeur()
    const { data, error } = await supabase
      .from('todos')
      .insert({ user_id: userId, date, text, done: false, auto: true })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (erreur) {
    console.error('Erreur insererTodoAuto:', erreur)
    return null
  }
}
