'use client'

import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { History } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HistoriqueSemainesProps {
  semaines: string[]
  active: string
  onChoisir: (weekStart: string) => void
}

/** Pastilles des semaines déjà planifiées, pour retrouver ce qui était prévu. */
export function HistoriqueSemaines({ semaines, active, onChoisir }: HistoriqueSemainesProps) {
  if (!semaines.length) return null
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
      <History className="size-4 shrink-0 text-muted-foreground" aria-label="Semaines planifiées" />
      {semaines.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChoisir(s)}
          className={cn(
            'shrink-0 rounded-full border px-2.5 py-1 text-xs',
            s === active
              ? 'border-amber-500 bg-amber-50 font-medium text-amber-900 dark:bg-amber-950/40 dark:text-amber-100'
              : 'border-neutral-200 text-neutral-600 dark:border-neutral-700 dark:text-neutral-300'
          )}
        >
          {format(parseISO(s), 'd MMM', { locale: fr })}
        </button>
      ))}
    </div>
  )
}
