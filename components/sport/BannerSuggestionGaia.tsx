'use client'

import { PHASES_DESIGN } from '@/lib/data/phases-design'
import { Button } from '@/components/ui/button'
import type { Phase, SeanceAdaptee } from '@/types'
import { cn } from '@/lib/utils'

export interface BannerSuggestionGaiaProps {
  phase: Phase
  suggestion: SeanceAdaptee
  modeActif: 'normale' | 'gaia'
  onChangerMode: (mode: 'normale' | 'gaia') => void
}

export function BannerSuggestionGaia({
  phase,
  suggestion,
  modeActif,
  onChangerMode,
}: BannerSuggestionGaiaProps) {
  const d = PHASES_DESIGN[phase]
  return (
    <div
      className={cn(
        'rounded-xl border p-3 text-sm',
        'border-[#FDE68A] bg-[#FEF3C7] text-amber-950 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-100'
      )}
    >
      <p className="font-semibold">💡 Suggestion Gaia — Phase {d.label}</p>
      <p className="mt-1 text-amber-900/90 dark:text-amber-200/90">{suggestion.messageAdaptation}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className={modeActif === 'normale' ? 'ring-2 ring-neutral-400 ring-offset-1' : 'border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-900'}
          onClick={() => onChangerMode('normale')}
        >
          💪 Séance normale
        </Button>
        <Button
          type="button"
          size="sm"
          variant={modeActif === 'gaia' ? 'default' : 'outline'}
          onClick={() => onChangerMode('gaia')}
          className={modeActif === 'gaia' ? 'ring-2 ring-offset-2 ring-amber-300 text-white' : 'border-amber-300/80'}
          style={modeActif === 'gaia' ? { backgroundColor: d.accent } : undefined}
        >
          ✨ Séance Gaia
        </Button>
      </div>
    </div>
  )
}
