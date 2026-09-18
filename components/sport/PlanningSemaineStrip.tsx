'use client'

import { addDays, format, isSameDay, startOfWeek } from 'date-fns'
import { fr } from 'date-fns/locale'
import { entreesActivesPourDate } from '@/lib/planning-sport-recurrence'
import { CLES_SEMAINE, emojiEtTypeCourt, JOURS_ABREGE } from '@/lib/sport-page'
import type { PlanningSportEntry } from '@/types'
import { cn } from '@/lib/utils'

interface PlanningSemaineStripProps {
  entrees: PlanningSportEntry[]
}

export function PlanningSemaineStrip({ entrees }: PlanningSemaineStripProps) {
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

          return (
            <div
              key={cle}
              title={format(dateJour, 'EEEE d MMMM', { locale: fr })}
              className={cn(
                'flex shrink-0 flex-col items-center gap-0.5 rounded-xl border px-3 py-2 text-center',
                estAuj
                  ? 'border-amber-400 bg-amber-50 dark:border-amber-600 dark:bg-amber-950/40'
                  : 'border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900/80',
                repos && !estAuj && 'opacity-45'
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
            </div>
          )
        })}
      </div>
    </div>
  )
}
