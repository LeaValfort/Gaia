'use client'

import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface JournalExpandableCategoryProps {
  title: string
  /** Aperçu quand le panneau est replié (ex. valeur choisie) */
  hintReplie: string
  ouvert: boolean
  onBasculer: () => void
  children: React.ReactNode
}

export function JournalExpandableCategory({
  title,
  hintReplie,
  ouvert,
  onBasculer,
  children,
}: JournalExpandableCategoryProps) {
  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/60 overflow-hidden shadow-sm">
      <button
        type="button"
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left transition hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
        onClick={onBasculer}
        aria-expanded={ouvert}
      >
        <span className="min-w-0 flex-1">
          <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">{title}</span>
          {!ouvert ? (
            <span className="mt-0.5 block truncate text-xs text-neutral-500 dark:text-neutral-400">
              {hintReplie}
            </span>
          ) : null}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-neutral-400 transition-transform duration-200',
            ouvert && 'rotate-180',
          )}
          aria-hidden
        />
      </button>
      {ouvert ? (
        <div className="border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50/60 dark:bg-neutral-950/40 px-3 py-3">
          {children}
        </div>
      ) : null}
    </div>
  )
}
