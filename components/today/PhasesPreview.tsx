import type { CSSProperties } from 'react'
import Link from 'next/link'
import { PHASES_DESIGN } from '@/lib/data/phases-design'
import { getPhaseForDay } from '@/lib/cycle'
import type { Phase } from '@/types'
import { cn } from '@/lib/utils'

const ORDRE: Phase[] = ['menstruation', 'folliculaire', 'ovulation', 'luteale']

const CARD =
  'rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900'

function plageJours(ph: Phase, L: number): string {
  let min = L + 1
  let max = 0
  for (let day = 1; day <= L; day++) {
    if (getPhaseForDay(day, L) === ph) {
      min = Math.min(min, day)
      max = Math.max(max, day)
    }
  }
  if (min > L) return '—'
  return `J${min}–J${max}`
}

export interface PhasesPreviewProps {
  phase: Phase | null
  cycleLength: number
  visible: boolean
}

export function PhasesPreview({ phase, cycleLength, visible }: PhasesPreviewProps) {
  if (!visible) return null

  return (
    <div className={CARD}>
      <p className="text-[10px] font-medium uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
        Cycle — aperçu
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {ORDRE.map((ph) => {
          const d = PHASES_DESIGN[ph]
          const actif = phase === ph
          const style: CSSProperties = {
            backgroundColor: d.bgCard,
            boxShadow: actif ? `0 0 0 2px ${d.accent}, 0 4px 12px rgb(0 0 0 / 0.08)` : undefined,
          }
          return (
            <Link
              key={ph}
              href="/cycle"
              className={cn(
                'rounded-xl border p-2 text-center transition-all duration-200 hover:opacity-95',
                d.border,
                actif && 'scale-[1.02]'
              )}
              style={style}
            >
              <p className="text-lg">{d.emoji}</p>
              <p className="text-[10px] font-semibold leading-tight" style={{ color: d.texte }}>
                {d.label}
              </p>
              <p className="text-[9px] text-gray-500 dark:text-gray-400 mt-0.5">{plageJours(ph, cycleLength)}</p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
