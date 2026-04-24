import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function StatCardProgression({
  label,
  value,
  sub,
  icon,
  labelClass,
}: {
  label: string
  value: ReactNode
  sub: string
  icon?: ReactNode
  labelClass?: string
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 flex flex-col gap-1">
      <div
        className={cn(
          'flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wide font-semibold',
          labelClass
        )}
      >
        {icon}
        {label}
      </div>
      <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-50 tabular-nums">{value}</p>
      <p className="text-xs text-neutral-400 dark:text-neutral-500">{sub}</p>
    </div>
  )
}
