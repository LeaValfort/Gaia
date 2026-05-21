'use client'

import { getInfosPhase } from '@/lib/cycle'
import { PHASES_DESIGN } from '@/lib/data/phases-design'
import type { Phase } from '@/types'
import { cn } from '@/lib/utils'

interface ConseilPhaseAlimentationProps {
  phase: Phase
}

export function ConseilPhaseAlimentation({ phase }: ConseilPhaseAlimentationProps) {
  const design = PHASES_DESIGN[phase]
  const conseil = getInfosPhase(phase).conseilAlimentation

  return (
    <p
      className={cn(
        'rounded-lg border px-3 py-2 text-sm leading-snug',
        design.border,
        design.bg,
        'text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-100'
      )}
    >
      {conseil}
    </p>
  )
}
