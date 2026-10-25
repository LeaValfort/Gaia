'use client'

import { addDays, format, isAfter, isSameDay, startOfDay, startOfWeek } from 'date-fns'
import { fr } from 'date-fns/locale'
import { entreesActivesPourDate } from '@/lib/planning-sport-recurrence'
import { CLES_SEMAINE, emojiEtTypeCourt, JOURS_ABREGE } from '@/lib/sport-page'
import type { PlanningSportEntry } from '@/types'
import { cn } from '@/lib/utils'

interface PlanningSemaineStripProps {
  entrees: PlanningSportEntry[]
  /** Jour de la séance en cours de saisie (yyyy-MM-dd). */
  dateSelectionnee: string
  /** Toucher un jour passé (ou aujourd'hui) pour logger sa séance. */
  onChoisirJour: (jour: Date) => void
}

/** Semaine en cours ; chaque jour jusqu'à aujourd'hui est cliquable pour logger sa séance. */
export function PlanningSemaineStrip({ entrees, dateSelectionnee, onChoisirJour }: PlanningSemaineStripProps) {
  const auj = new Date()
  const debutSemaine = startOfWeek(auj, { weekStartsOn: 1 })

  return (
    <div className="-mx-1 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]">
      <div className="flex w-max min-w-full gap-2">
        {CLES_SEMAINE.map((cle, idx) => {
          const dateJour = addDays(debutSemaine, idx)
          const seancesJour = entreesActivesPourDate(entrees, dateJour)
          const estAuj = isSameDay(dateJour, auj)
          const repos = seancesJour.length === 0
          const { emoji, court } = repos ? { emoji: '😴', court: 'Repos' } : emojiEtTypeCourt(seancesJour[0].type_seance)
          const label = !repos && seancesJour.length > 1 ? `+${seancesJour.length}` : court
          const futur = isAfter(startOfDay(dateJour), startOfDay(auj))
          const choisi = format(dateJour, 'yyyy-MM-dd') === dateSelectionnee

          return (
            <button
              type="button"
              key={cle}
              disabled={futur}
              onClick={() => onChoisirJour(dateJour)}
              title={format(dateJour, 'EEEE d MMMM', { locale: fr })}
              aria-pressed={choisi}
              className={cn(
                'flex shrink-0 flex-col items-center gap-0.5 rounded-xl border px-3 py-2 text-center transition-colors disabled:cursor-default',
                estAuj
                  ? 'border-amber-400 bg-amber-50 dark:border-amber-600 dark:bg-amber-950/40'
                  : 'border-neutral-200 bg-white hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/80',
                choisi && 'ring-2 ring-amber-500 ring-offset-1 dark:ring-offset-neutral-950',
                (repos || futur) && !estAuj && !choisi && 'opacity-45'
              )}
            >
              <span className="text-base leading-none" aria-hidden>
                {emoji}
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                {JOURS_ABREGE[cle]}
              </span>
              <span
                className={cn(
                  'text-xs font-medium',
                  estAuj
                    ? 'text-amber-900 dark:text-amber-100'
                    : 'text-neutral-800 dark:text-neutral-200'
                )}
              >
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
