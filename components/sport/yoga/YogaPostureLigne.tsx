'use client'

import { Check } from 'lucide-react'
import { YogaPoseImage } from '@/components/sport/yoga/YogaPoseImage'
import type { PostureYoga } from '@/types'
import { cn } from '@/lib/utils'

export function YogaPostureLigne({
  p,
  index,
  fait,
  onToggle,
}: {
  p: PostureYoga
  index: number
  fait: boolean
  onToggle: (i: number) => void
}) {
  const min = Math.round(p.dureeSec / 60)
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl border p-2',
        fait ? 'border-rose-300 bg-rose-50/60 opacity-80 dark:border-rose-800 dark:bg-rose-950/30' : 'border-violet-200 dark:border-violet-900/50'
      )}
    >
      <YogaPoseImage nomFr={p.nom} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{p.nom}</p>
        <p className="text-xs text-neutral-500">~{min} min · {p.benefice}</p>
      </div>
      <button
        type="button"
        onClick={() => onToggle(index)}
        className={cn(
          'mt-0.5 flex size-7 items-center justify-center rounded-full border-2',
          fait ? 'border-rose-600 bg-rose-600 text-white' : 'border-neutral-300'
        )}
        aria-label="Validée"
      >
        {fait ? <Check className="size-3.5" /> : null}
      </button>
    </div>
  )
}
