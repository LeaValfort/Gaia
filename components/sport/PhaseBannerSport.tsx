'use client'

import { getInfosPhase } from '@/lib/cycle'
import { PHASES_DESIGN } from '@/lib/data/phases-design'
import type { Phase } from '@/types'
import { cn } from '@/lib/utils'

export interface PhaseBannerSportProps {
  phase: Phase
  jourDuCycle: number
}

export function PhaseBannerSport({ phase, jourDuCycle }: PhaseBannerSportProps) {
  const d = PHASES_DESIGN[phase]
  const conseil = getInfosPhase(phase).conseilSport
  return (
    <div
      className={cn(
        'rounded-xl border px-3.5 py-2.5 text-sm dark:border-neutral-800',
        `bg-gradient-to-r ${d.gradient} ${d.border}`
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span
          className="inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-semibold"
          style={{ backgroundColor: d.bgCard, color: d.texte }}
        >
          {d.emoji} {d.label} · J{jourDuCycle}
        </span>
        <p className="min-w-0 flex-1 text-neutral-800 dark:text-neutral-200/95">{conseil}</p>
      </div>
    </div>
  )
}
