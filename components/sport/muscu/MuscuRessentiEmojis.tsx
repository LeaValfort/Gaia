'use client'

import { PHASES_DESIGN } from '@/lib/data/phases-design'
import type { Phase } from '@/types'
import { cn } from '@/lib/utils'

const EMOJIS = [
  { v: 1, c: '😴' },
  { v: 2, c: '😕' },
  { v: 3, c: '😊' },
  { v: 4, c: '⚡' },
  { v: 5, c: '🚀' },
] as const

export function MuscuRessentiEmojis({
  ressenti,
  onChange,
  phase,
}: {
  ressenti: number | null
  onChange: (n: number | null) => void
  phase?: Phase | null
}) {
  const d = phase ? PHASES_DESIGN[phase] : null
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">Ressenti</p>
      <div className="flex flex-wrap justify-center gap-2">
        {EMOJIS.map(({ v, c }) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v === ressenti ? null : v)}
            className={cn('rounded-full border-2 p-2 text-2xl', ressenti === v && !d && 'border-rose-500 bg-[#FFD6DA] dark:border-rose-500 dark:bg-rose-900/40', ressenti === v ? '' : 'border-transparent')}
            style={ressenti === v && d ? { borderColor: d.accent, background: d.bgCard } : undefined}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  )
}
