import { format, getDate, getISODay } from 'date-fns'
import { getRecurringTodos } from '@/lib/db/recurring-todos'
import { insererTodoAutoSiAbsent } from '@/lib/db/todo'
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
 * `insererTodoAutoSiAbsent` est protégé par une contrainte unique en base, donc
 * appeler cette fonction plusieurs fois pour la même journée (ex. plusieurs visites
 * de l'accueil) reste sans effet après la première insertion — voir sa doc.
 */
export async function generateTodosForToday(userId: string, today: Date): Promise<void> {
  try {
    const dateStr = format(today, 'yyyy-MM-dd')
    const recurring = await getRecurringTodos(userId)
    const actives = recurring.filter((t) => t.active)

    // En parallèle : l'index unique en base empêche déjà les doublons,
    // inutile d'attendre chaque insertion avant la suivante.
    await Promise.all(
      actives
        .filter((tache) => doitApparaitreAujourdhui(tache, today))
        .map((tache) => insererTodoAutoSiAbsent(userId, dateStr, tache.text))
    )
  } catch (erreur) {
    console.error('Erreur generateTodosForToday:', erreur)
  }
}
