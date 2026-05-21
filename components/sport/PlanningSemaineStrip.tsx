'use client'

import { addDays, format, isSameDay, startOfWeek } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  CLES_SEMAINE,
  emojiEtTypeCourt,
  JOURS_ABREGE,
} from '@/lib/sport-page'
import type { PlanningSport, TypePlanningJour } from '@/types'
import { cn } from '@/lib/utils'

interface PlanningSemaineStripProps {
  planning: PlanningSport
}

export function PlanningSemaineStrip({ planning }: PlanningSemaineStripProps) {
  const auj = new Date()
  const debutSemaine = startOfWeek(auj, { weekStartsOn: 1 })

  return (
    <div className="-mx-1 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]">
      <div className="flex w-max min-w-full gap-2">
        {CLES_SEMAINE.map((cle, idx) => {
          const type: TypePlanningJour = planning[cle]
          const { emoji, court } = emojiEtTypeCourt(type)
          const dateJour = addDays(debutSemaine, idx)
          const estAuj = isSameDay(dateJour, auj)
          const repos = type === 'repos'

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
                {court}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
