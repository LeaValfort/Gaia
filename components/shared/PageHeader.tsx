import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  subtitle?: string
  phaseBadge?: ReactNode
  className?: string
}

export function PageHeader({ title, subtitle, phaseBadge, className }: PageHeaderProps) {
  return (
    <header
      className={cn(
        'rounded-xl border border-neutral-200 dark:border-neutral-800',
        'bg-white dark:bg-neutral-900',
        'px-4 py-3 sm:px-5 sm:py-4',
        className
      )}
    >
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold text-neutral-900 dark:text-neutral-100 sm:text-xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 sm:text-sm">
              {subtitle}
            </p>
          ) : null}
        </div>
        {phaseBadge ? <div className="shrink-0">{phaseBadge}</div> : null}
      </div>
    </header>
  )
}
