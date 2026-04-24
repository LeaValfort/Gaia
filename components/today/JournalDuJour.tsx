'use client'

import type { CSSProperties } from 'react'
import { DailyLogForm } from '@/components/cycle/DailyLogForm'
import { designPhaseAffichage } from '@/lib/cycle'
import type { DailyLog, Phase } from '@/types'
import { cn } from '@/lib/utils'

const CARD =
  'rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900'

export interface JournalDuJourProps {
  phase: Phase
  sansCycle?: boolean
  date: string
  jourDuCycle: number
  logInitial: DailyLog | null
}

export function JournalDuJour({ phase, sansCycle, date, jourDuCycle, logInitial }: JournalDuJourProps) {
  const d = designPhaseAffichage(phase, { sansCycle })
  const vars: CSSProperties = {
    ['--phase-accent' as string]: d.accent,
    ['--phase-texte' as string]: d.texte,
  }

  return (
    <div className={cn(CARD, 'journal-du-jour')} style={{ ...vars, borderColor: `${d.accent}44` }}>
      <p className="text-[10px] font-medium uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
        Journal
      </p>
      <DailyLogForm date={date} phase={phase} jourDuCycle={jourDuCycle} logInitial={logInitial} />
    </div>
  )
}
