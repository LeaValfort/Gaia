import type { CSSProperties } from 'react'
import { designPhaseAffichage, CITATION_HERO_PAR_PHASE } from '@/lib/cycle'
import type { Phase } from '@/types'
import { cn } from '@/lib/utils'

const CARD =
  'relative rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-950'

export interface HeroPhaseProps {
  phase: Phase | null
  sansCycle?: boolean
  jourDuCycle: number | null
  cycleLength: number | null
  prenom: string
  dateLabel: string
}

export function HeroPhase({
  phase,
  sansCycle,
  jourDuCycle,
  cycleLength,
  prenom,
  dateLabel,
}: HeroPhaseProps) {
  const d = designPhaseAffichage(phase, { sansCycle })
  const citation =
    phase && !sansCycle ? CITATION_HERO_PAR_PHASE[phase] : 'Une journée à ton rythme 🌿'
  const pct =
    jourDuCycle != null && cycleLength != null && cycleLength > 0
      ? Math.min(100, Math.round((jourDuCycle / cycleLength) * 100))
      : null

  const shellStyle: CSSProperties = {
    borderColor: `${d.accent}40`,
    background: `linear-gradient(145deg, ${d.bgCard} 0%, rgb(255 255 255) 50%)`,
  }

  return (
    <div className={cn(CARD, 'overflow-hidden')} style={shellStyle}>
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-white"
              style={{ backgroundColor: d.accent }}
            >
              {d.emoji} {d.label}
            </span>
            <p
              className="mt-2 text-lg font-semibold tracking-tight dark:text-gray-100"
              style={{ color: d.texte }}
            >
              {dateLabel}
            </p>
            <p className="text-sm opacity-90 dark:opacity-95" style={{ color: d.texteMuted }}>
              Bonjour {prenom} 👋
            </p>
          </div>
          {jourDuCycle != null && cycleLength != null ? (
            <div className="text-right">
              <p className="text-3xl font-bold tabular-nums" style={{ color: d.texte }}>
                {jourDuCycle}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">/ {cycleLength} jours</p>
            </div>
          ) : null}
        </div>
        {pct != null ? (
          <div className="space-y-1">
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${pct}%`, backgroundColor: d.accent }}
              />
            </div>
            <p className="text-[10px] font-medium uppercase tracking-widest text-gray-400 dark:text-gray-500">
              {pct}% du cycle
            </p>
          </div>
        ) : null}
        <p className="text-sm text-gray-600 dark:text-gray-300">{citation}</p>
      </div>
    </div>
  )
}
