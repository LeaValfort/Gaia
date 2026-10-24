'use client'

import { PHASES_DESIGN } from '@/lib/data/phases-design'
import type { Lieu, Phase } from '@/types'
import { cn } from '@/lib/utils'

const BTN =
  'inline-flex shrink-0 items-center justify-center rounded-full border px-5 py-1.5 text-sm font-medium transition-all duration-200'

export const LIEUX_MUSCU: { id: Lieu; label: string }[] = [
  { id: 'maison', label: '🏠 Maison' },
  { id: 'salle', label: '🏋️ Salle' },
  { id: 'street', label: '🌳 Street' },
]

/** Choix du lieu de la séance de muscu (chaque lieu a ses propres programmes). */
export function MuscuTypeLieu({ lieu, phase, onLieu }: { lieu: Lieu; phase: Phase | null; onLieu: (l: Lieu) => void }) {
  const d = phase ? PHASES_DESIGN[phase] : null
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">Lieu</p>
      <div className="flex flex-wrap gap-2">
        {LIEUX_MUSCU.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => onLieu(id)}
            className={cn(
              BTN,
              lieu === id
                ? !d && 'border-neutral-700 bg-neutral-800 text-white dark:border-neutral-500 dark:bg-neutral-200 dark:text-neutral-900'
                : 'border-neutral-200 bg-neutral-50 text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
            )}
            style={d && lieu === id ? { borderColor: d.accent, backgroundColor: d.bgCard, color: d.texte } : undefined}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
