'use client'

import { ChevronRight, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AccordeonSectionProps {
  id: string
  titre: string
  icone: LucideIcon
  ouvert: boolean
  onToggle: () => void
  children: React.ReactNode
}

export function AccordeonSection({
  id,
  titre,
  icone: Icon,
  ouvert,
  onToggle,
  children,
}: AccordeonSectionProps) {
  return (
    <div className="border-b border-neutral-200 dark:border-neutral-800 last:border-b-0">
      <button
        type="button"
        id={`accordeon-${id}`}
        aria-expanded={ouvert}
        aria-controls={`accordeon-panel-${id}`}
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-1 py-4 text-left transition-colors hover:bg-neutral-50/80 dark:hover:bg-neutral-900/40"
      >
        <Icon className="size-5 shrink-0 text-neutral-500 dark:text-neutral-400" aria-hidden />
        <span className="flex-1 text-base font-medium text-neutral-900 dark:text-neutral-50">{titre}</span>
        <ChevronRight
          className={cn(
            'size-5 shrink-0 text-neutral-400 transition-transform duration-200',
            ouvert && 'rotate-90'
          )}
          aria-hidden
        />
      </button>
      <div
        id={`accordeon-panel-${id}`}
        role="region"
        aria-labelledby={`accordeon-${id}`}
        hidden={!ouvert}
        className={cn(
          'grid transition-all duration-200 ease-in-out',
          ouvert ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        )}
      >
        <div className="overflow-hidden">
          <div className="space-y-5 px-1 pb-6 pt-1">{children}</div>
        </div>
      </div>
    </div>
  )
}
