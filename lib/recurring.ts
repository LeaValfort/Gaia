import { format, getDate, getISODay } from 'date-fns'
import { getRecurringTodos } from '@/lib/db/recurring-todos'
import { insererTodoAuto, todoAutoExiste } from '@/lib/db/todo'
import type { RecurringTodo } from '@/types'

/**
 * Indique si une tâche récurrente doit apparaître à la date donnée.
 */
function doitApparaitreAujourdhui(tache: RecurringTodo, today: Date): boolean {
  switch (tache.frequency) {
    case 'daily':
      return true
    case 'weekly': {
      const jours = tache.week_days
      if (!jours?.length) return false
      return jours.includes(getISODay(today))
    }
    case 'monthly':
      if (tache.month_day == null) return false
      return getDate(today) === tache.month_day
    default:
      return false
  }
}

/**
 * Génère les todos du jour à partir des récurrences actives (sans doublon auto).
 */
export async function generateTodosForToday(userId: string, today: Date): Promise<void> {
  try {
    const dateStr = format(today, 'yyyy-MM-dd')
    const recurring = await getRecurringTodos(userId)
    const actives = recurring.filter((t) => t.active)

    for (const tache of actives) {
      if (!doitApparaitreAujourdhui(tache, today)) continue

      const existe = await todoAutoExiste(userId, dateStr, tache.text)
      if (existe) continue

      await insererTodoAuto(userId, dateStr, tache.text)
    }
  } catch (erreur) {
    console.error('Erreur generateTodosForToday:', erreur)
  }
}
