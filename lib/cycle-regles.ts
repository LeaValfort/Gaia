import { addDays, differenceInCalendarDays, format, parseISO } from 'date-fns'
import type { Cycle } from '@/types'

/** Durée par défaut des règles quand le cycle ne la précise pas. */
const DUREE_DEFAUT = 4
/** Après la fin prévue, on laisse quelques jours pour dire « encore là ». */
const MARGE_APRES_FIN = 3

export interface EtatRegles {
  cycleId: string
  /** Jour des règles aujourd'hui (1 = premier jour). */
  jour: number
  duree: number
  enCours: boolean
  finPrevueISO: string
}

/**
 * Règles du dernier cycle autour d'aujourd'hui : pendant les règles, et jusqu'à
 * 3 jours après la fin prévue (pour pouvoir les prolonger). Sinon null.
 */
export function etatReglesAujourdhui(dernier: Cycle | undefined, auj: Date): EtatRegles | null {
  if (!dernier?.start_date) return null
  const jour = differenceInCalendarDays(auj, parseISO(dernier.start_date)) + 1
  const duree = dernier.period_length ?? DUREE_DEFAUT
  if (jour < 1 || jour > duree + MARGE_APRES_FIN) return null
  return {
    cycleId: dernier.id,
    jour,
    duree,
    enCours: jour <= duree,
    finPrevueISO: format(addDays(parseISO(dernier.start_date), duree - 1), 'yyyy-MM-dd'),
  }
}
