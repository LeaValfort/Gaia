import { differenceInCalendarDays, format, getISODay, parseISO } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import type { JourSemaine, PlanningSportEntry } from '@/types'

const CLES_JOUR: JourSemaine[] = [
  'lundi',
  'mardi',
  'mercredi',
  'jeudi',
  'vendredi',
  'samedi',
  'dimanche',
]

// Lundi de référence arbitraire pour numéroter les semaines (évite les soucis
// de semaine ISO à cheval sur deux années civiles) — peu importe la date
// choisie tant qu'elle reste fixe et tombe un lundi.
const LUNDI_REFERENCE = new Date(2024, 0, 1)

const TZ_JOUR = process.env.NEXT_PUBLIC_CALENDAR_TZ ?? 'Europe/Paris'

/**
 * Date calendaire stable en fuseau utilisateur (évite qu'un serveur Vercel en
 * UTC calcule le mauvais jour de la semaine près de minuit heure de Paris).
 * Point d'entrée unique pour toute date utilisée par le planning sport —
 * utilisé aussi par `lib/macros-du-jour.ts` pour rester cohérent.
 */
export function datePourPlanningSport(date: Date): Date {
  const zoned = toZonedTime(date, TZ_JOUR)
  const iso = format(zoned, 'yyyy-MM-dd')
  return parseISO(`${iso}T12:00:00`)
}

export function getJourSemaineDe(date: Date): JourSemaine {
  const idx = getISODay(datePourPlanningSport(date)) - 1
  return CLES_JOUR[idx] ?? 'lundi'
}

/** Numéro de semaine (entier, peut être négatif) depuis le lundi de référence. */
export function numeroSemaine(date: Date): number {
  return Math.floor(differenceInCalendarDays(datePourPlanningSport(date), LUNDI_REFERENCE) / 7)
}

/** Une entrée récurrente est-elle active la semaine de `date` ? */
export function recurrenceActiveCetteSemaine(entree: PlanningSportEntry, date: Date): boolean {
  const semaine = numeroSemaine(date)
  const intervalle = Math.max(1, entree.intervalle_semaines)
  const modulo = ((semaine % intervalle) + intervalle) % intervalle
  return modulo === entree.decalage_semaine
}

/** Séances actives pour une date précise : bon jour de la semaine + récurrence active. */
export function entreesActivesPourDate(
  entrees: PlanningSportEntry[],
  date: Date
): PlanningSportEntry[] {
  const jour = getJourSemaineDe(date)
  return entrees.filter((e) => e.jour_semaine === jour && recurrenceActiveCetteSemaine(e, date))
}

/**
 * Regroupe toutes les entrées par jour de la semaine, pour l'affichage du
 * calendrier (indépendamment de la récurrence : on veut voir toutes les
 * séances planifiées, même celles qui ne tombent pas cette semaine-ci).
 */
export function grouperEntreesParJour(
  entrees: PlanningSportEntry[]
): Record<JourSemaine, PlanningSportEntry[]> {
  const groupes: Record<JourSemaine, PlanningSportEntry[]> = {
    lundi: [],
    mardi: [],
    mercredi: [],
    jeudi: [],
    vendredi: [],
    samedi: [],
    dimanche: [],
  }
  for (const e of entrees) {
    groupes[e.jour_semaine].push(e)
  }
  return groupes
}

/** Libellé court d'une récurrence, ex. "sem. 1/2" — vide si toutes les semaines. */
export function libelleRecurrence(entree: PlanningSportEntry): string {
  if (entree.intervalle_semaines <= 1) return ''
  return `sem. ${entree.decalage_semaine + 1}/${entree.intervalle_semaines}`
}
