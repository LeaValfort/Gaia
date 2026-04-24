'use client'

import { PHASES_DESIGN } from '@/lib/data/phases-design'
import type { Lieu, Phase, TypeSeanceMuscle } from '@/types'
import { cn } from '@/lib/utils'

const LABELS: Record<TypeSeanceMuscle, string> = { full_body: 'Full body', upper_lower: 'Upper / Lower' }

const BTN =
  'inline-flex shrink-0 items-center justify-center rounded-full border px-5 py-1.5 text-sm font-medium transition-all duration-200'

export function MuscuTypeLieu({
  type,
  lieu,
  phase,
  onType,
  onLieu,
}: {
  type: TypeSeanceMuscle | null
  lieu: Lieu
  phase: Phase | null
  onType: (t: TypeSeanceMuscle) => void
  onLieu: (l: Lieu) => void
}) {
  const d = phase ? PHASES_DESIGN[phase] : null
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">Type</p>
        <div className="flex flex-wrap gap-2">
          {(['full_body', 'upper_lower'] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => onType(k)}
              className={cn(
                BTN,
                type === k
                  ? !d && 'border-rose-400 bg-[#FFD6DA] text-[#9B1C1C] dark:border-rose-500 dark:bg-rose-900/30'
                  : 'border-neutral-200 text-neutral-600 dark:border-neutral-700 dark:text-neutral-400'
              )}
              style={d && type === k ? { borderColor: d.accent, backgroundColor: d.bgCard, color: d.texte } : undefined}
            >
              {LABELS[k]}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">Lieu</p>
        <div className="flex flex-wrap gap-2">
          {(['maison', 'salle'] as Lieu[]).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => onLieu(l)}
              className={cn(
                BTN,
                'capitalize',
                lieu === l
                  ? !d && 'border-neutral-700 bg-neutral-800 text-white dark:border-neutral-500 dark:bg-neutral-200 dark:text-neutral-900'
                  : 'border-neutral-200 bg-neutral-50 text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
              )}
              style={d && lieu === l ? { borderColor: d.accent, backgroundColor: d.bgCard, color: d.texte } : undefined}
            >
              {l === 'maison' ? '🏠 Maison' : '🏋️ Salle'}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
