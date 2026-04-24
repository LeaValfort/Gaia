import type { Todo } from '@/types'

/**
 * Regroupement côté client ou module sans `'use server'`.
 * Côté serveur, préfère `getTodosGroupesPourPlage` dans `@/lib/db/todo`.
 */
export function grouperTodosParDate(todos: Todo[]): Record<string, Todo[]> {
  const parDate: Record<string, Todo[]> = {}
  for (const t of todos) {
    if (!parDate[t.date]) parDate[t.date] = []
    parDate[t.date].push(t)
  }
  return parDate
}
